using AutoMapper;
using AutoMapper.QueryableExtensions;
using BCrypt.Net;
using HibaVonal_03.Context;
using HibaVonal_03.DTOs;
using HibaVonal_03.Entities;
using HibaVonal_03.Interfaces;
using HibaVonal_03.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace HibaVonal_03.Services
{
    public class UserService : IUserService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IConfiguration _configuration;
        private readonly HibaVonalDbContext _context;

        public UserService(IUnitOfWork unitOfWork, IMapper mapper, IConfiguration configuration, HibaVonalDbContext context)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _configuration = configuration;
            _context = context;
        }

        public async Task<UserResponseDto> CreateAdministratorAsync(UserCreateDto dto)
        {
            var existingUsers = await _unitOfWork.UserRepository.GetAsync(u => u.Email == dto.Email);
            if (existingUsers.Any()) throw new InvalidOperationException("Ez az email cím már foglalt!");

            dto.Password = BCrypt.Net.BCrypt.HashPassword(dto.Password);

            var admin = _mapper.Map<Administrator>(dto);
            admin.Role = Role.Administrator;

            await _unitOfWork.UserRepository.AddAsync(admin);
            await _unitOfWork.SaveChangesAsync();

            return _mapper.Map<UserResponseDto>(admin);
        }

        public async Task<UserResponseDto> CreateMaintenanceManagerAsync(UserCreateDto dto)
        {
            var existingUsers = await _unitOfWork.UserRepository.GetAsync(filter: u => u.Email == dto.Email);
            if (existingUsers.Any()) throw new InvalidOperationException("Ez az email cím már foglalt!");

            dto.Password = BCrypt.Net.BCrypt.HashPassword(dto.Password);

            var manager = _mapper.Map<MaintenanceManager>(dto);
            manager.Role = Role.MaintenanceManager;

            await _unitOfWork.UserRepository.AddAsync(manager);
            await _unitOfWork.SaveChangesAsync();

            return _mapper.Map<UserResponseDto>(manager);
        }

        public async Task<UserResponseDto> CreateCollegiateAsync(CollegiateCreateDto dto)
        {
            // 1. Ellenőrizzük, hogy az email foglalt-e már
            var existingUsers = await _unitOfWork.UserRepository.GetAsync(filter: u => u.Email == dto.Email);
            if (existingUsers.Any()) throw new InvalidOperationException("Ez az email cím már foglalt!");

            // 2. Ellenőrizzük, hogy létezik-e a megadott szoba
            if (await _unitOfWork.PremiseRepository.GetByIdAsync(dto.DormRoomId) == null)
                throw new InvalidOperationException($"A {dto.DormRoomId} azonosítójú szoba nem található.");

            // 3. Jelszó
            dto.Password = BCrypt.Net.BCrypt.HashPassword(dto.Password);

            // 4. Mapelés és adatok beállítása
            var collegiate = _mapper.Map<Collegiate>(dto);
            collegiate.Role = Role.Collegiate;

           

            await _unitOfWork.UserRepository.AddAsync(collegiate);
            await _unitOfWork.SaveChangesAsync();

            return _mapper.Map<UserResponseDto>(collegiate);
        }

        public async Task<UserResponseDto> CreateMaintainerAsync(MaintainerCreateDto dto)
        {
            var existingUsers = await _unitOfWork.UserRepository.GetAsync(filter: u => u.Email == dto.Email);
            if (existingUsers.Any()) throw new InvalidOperationException("Ez az email cím már foglalt!");

            dto.Password = BCrypt.Net.BCrypt.HashPassword(dto.Password);

            var maintainer = _mapper.Map<Maintainer>(dto);
            maintainer.Role = Role.Maintainer;
            maintainer.IsAvailable = true;

            if (dto.SpecialisationIds != null && dto.SpecialisationIds.Any())
            {
                foreach (var specId in dto.SpecialisationIds)
                {
                    var spec = await _unitOfWork.MaintainerSpecialisationRepository.GetByIdAsync(specId)
                        ?? throw new InvalidOperationException($"A {specId} azonosítójú szakterület nem található.");

                    maintainer.MaintenanceSpecialisation.Add(spec);
                }
            }
            else
            {
                throw new InvalidOperationException("Legalább egy szakterületet meg kell adni!");
            }

            await _unitOfWork.UserRepository.AddAsync(maintainer);
            await _unitOfWork.SaveChangesAsync();

            return _mapper.Map<UserResponseDto>(maintainer);
        }

        public async Task<List<UserResponseDto>> GetAllUsersAsync()
        {
            return await _unitOfWork.UserRepository.GetQueryable().ProjectTo<UserResponseDto>(_mapper.ConfigurationProvider).ToListAsync();
        }

        public async Task<UserResponseDto> GetUserByIdAsync(int userId)
        {
            var userDto = await _unitOfWork.UserRepository.GetQueryable()
                .Where(u => u.Id == userId)
                .ProjectTo<UserResponseDto>(_mapper.ConfigurationProvider)
                .SingleOrDefaultAsync()
                ?? throw new KeyNotFoundException($"A felhasználó a megadott azonosítóval ({userId}) nem található.");

            return userDto;
        }

        public async Task<UserLoginResponseDto> LoginAsync(UserLoginRequestDto request)
        {
            var user = await _unitOfWork.UserRepository.GetQueryable()
                .SingleOrDefaultAsync(u => u.Email == request.Email)
                ?? throw new InvalidOperationException("Érvénytelen email cím vagy jelszó.");

            if (!BCrypt.Net.BCrypt.Verify(request.Password, user.Password))
                throw new InvalidOperationException("Érvénytelen email cím vagy jelszó.");

            // JWT token generálása
            var tokenHandler = new JwtSecurityTokenHandler();

            // Kiolvassuk az appsettings.json-ből a beállításokat
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var key = Encoding.ASCII.GetBytes(jwtSettings["Secret"]);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email), // Itt adjuk át az emailt is, hogy a tokenből elérhető legyen
                new Claim(ClaimTypes.Role, user.Role.ToString()) // Itt adjuk át a szerepkört
            }),
                Expires = DateTime.UtcNow.AddMinutes(double.Parse(jwtSettings["ExpirationInMinutes"])),
                Issuer = jwtSettings["Issuer"],
                Audience = jwtSettings["Audience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);

            var response = _mapper.Map<UserLoginResponseDto>(user);

            response.Token = tokenHandler.WriteToken(token);

            return response;
        }

        public async Task<UserResponseDto> UpdateUserProfileAsync(int userId, UserUpdateDto dto)
        {
            var existingUser = await _unitOfWork.UserRepository.GetByIdAsync(userId)
                ?? throw new KeyNotFoundException($"A felhasználó a megadott azonosítóval ({userId}) nem található.");

            var existingEmail = await _unitOfWork.UserRepository.GetQueryable()
                .Where(u => u.Email == dto.Email && u.Id != userId)
                .SingleOrDefaultAsync();

            if (existingEmail != null)
                throw new InvalidOperationException("Ez az email cím már foglalt!");

            existingUser.Name = dto.Name;
            existingUser.Email = dto.Email;

            _unitOfWork.UserRepository.Update(existingUser);
            await _unitOfWork.SaveChangesAsync();

            return _mapper.Map<UserResponseDto>(existingUser);
        }

        public async Task ChangePasswordAsync(int userId, ChangePasswordDto dto)
        {
            var user = await _unitOfWork.UserRepository.GetByIdAsync(userId)
                ?? throw new KeyNotFoundException($"A felhasználó a megadott azonosítóval ({userId}) nem található.");

            if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.Password))
                throw new InvalidOperationException("A jelenlegi jelszó helytelen.");

            user.Password = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);

            _unitOfWork.UserRepository.Update(user);
            await _unitOfWork.SaveChangesAsync();
        }

        public async Task ChangeUserRoleAsync(int userId, Role newRole, int? dormRoomId = null)
        {
            var user = await _unitOfWork.UserRepository.GetByIdAsync(userId)
                ?? throw new KeyNotFoundException($"A felhasználó a megadott azonosítóval ({userId}) nem található.");

            if (user.Role == newRole && newRole != Role.Collegiate)
                throw new InvalidOperationException($"A felhasználó már rendelkezik a megadott szerepkörrel ({newRole}).");

            // --- 1. SZOBA MEGHATÁROZÁSA (Ha kollégista lesz) ---
            int? targetRoomId = null;
            if (newRole == Role.Collegiate)
            {
                // Ha jött a frontendről szoba azonosító, azt használjuk, különben az alapértelmezettet keressük
                if (dormRoomId.HasValue)
                {
                    targetRoomId = dormRoomId.Value;
                }
                else
                {
                    var defaultRoom = await _context.Premises
                        .Where(p => p.Type == PremiseType.PrivateRoom)
                        .FirstOrDefaultAsync()
                        ?? throw new InvalidOperationException("Nem hozható létre kollégista, mert még nincs egyetlen privát szoba sem az adatbázisban!");

                    targetRoomId = defaultRoom.Id;
                }
            }

            bool? isAvailable = newRole == Role.Maintainer ? true : null;

            // --- TRANZAKCIÓ INDÍTÁSA ---
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // --- 2. KAPCSOLATOK TAKARÍTÁSA (Ha korábban karbantartó volt) ---
                if (user.Role == Role.Maintainer && newRole != Role.Maintainer)
                {
                    await _context.Database.ExecuteSqlRawAsync(
                        "DELETE FROM MaintainerSpecialisationAssignments WHERE MaintainersId = {0}", userId);

                    await _context.Database.ExecuteSqlRawAsync(
                        "UPDATE Faults SET AssignedMaintenanceId = NULL WHERE AssignedMaintenanceId = {0}", userId);
                }

                // --- 3. USERS TÁBLA FRISSÍTÉSE --- 
                string updateSql = 
                    @"UPDATE Users SET Role = {0}, DormRoomId = {2}, IsAvailable = {3} WHERE Id = {1}";

                await _context.Database.ExecuteSqlRawAsync(updateSql, (int)newRole, userId, targetRoomId, isAvailable);

                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }



        public async Task DeleteUserAsync(int userId)
        {
            var user = await _unitOfWork.UserRepository.GetByIdAsync(userId)
                ?? throw new KeyNotFoundException($"A felhasználó a megadott azonosítóval ({userId}) nem található.");

            _unitOfWork.UserRepository.Delete(user);
            await _unitOfWork.SaveChangesAsync();
        }
    }
}