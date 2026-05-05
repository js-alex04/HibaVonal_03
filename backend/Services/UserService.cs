using AutoMapper;
using HibaVonal_03.DTOs;
using HibaVonal_03.Entities;
using HibaVonal_03.Interfaces;
using HibaVonal_03.Repositories;

namespace HibaVonal_03.Services
{
    public class UserService : IUserService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public UserService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<UserResponseDto> CreateAdministratorAsync(UserCreateDto dto)
        {
            var existingUsers = await _unitOfWork.UserRepository.GetAsync(u => u.Email == dto.Email);
            if (existingUsers.Any()) throw new InvalidOperationException("Ez az email cím már foglalt!");

            var admin = _mapper.Map<User>(dto);
            admin.Role = Role.Administrator;
            admin.Password = dto.Password;

            await _unitOfWork.UserRepository.AddAsync(admin);
            await _unitOfWork.SaveChangesAsync();

            return _mapper.Map<UserResponseDto>(admin);
        }

        public async Task<UserResponseDto> CreateMaintenanceManagerAsync(UserCreateDto dto)
        {
            var existingUsers = await _unitOfWork.UserRepository.GetAsync(filter: u => u.Email == dto.Email);
            if (existingUsers.Any()) throw new InvalidOperationException("Ez az email cím már foglalt!");

            var manager = _mapper.Map<User>(dto);
            manager.Role = Role.MaintenanceManager;
            manager.Password = dto.Password;

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


            // 3. Mapelés és adatok beállítása
            var collegiate = _mapper.Map<Collegiate>(dto);
            collegiate.Role = Role.Collegiate;

            // 4. Jelszó
            collegiate.Password = dto.Password;

            await _unitOfWork.UserRepository.AddAsync(collegiate);
            await _unitOfWork.SaveChangesAsync();

            return _mapper.Map<UserResponseDto>(collegiate);
        }

        public async Task<UserResponseDto> CreateMaintainerAsync(MaintainerCreateDto dto)
        {
            var existingUsers = await _unitOfWork.UserRepository.GetAsync(filter: u => u.Email == dto.Email);
            if (existingUsers.Any()) throw new InvalidOperationException("Ez az email cím már foglalt!");

            var maintainer = _mapper.Map<Entities.Maintainer>(dto);
            maintainer.Role = Role.Maintainer;
            maintainer.Password = dto.Password;
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
            var users = await _unitOfWork.UserRepository.GetAsync(null, 
                "MaintenanceSpecialisation,DormRoom,ReportedFaults,Feedbacks");

            return _mapper.Map<List<UserResponseDto>>(users);
        }

        public async Task<UserResponseDto> GetUserByIdAsync(int userId)
        {
            var user = await _unitOfWork.UserRepository.GetByIdAsync(userId,
                "MaintenanceSpecialisation,DormRoom,ReportedFaults,Feedbacks")
                ?? throw new KeyNotFoundException($"A felhasználó a megadott azonosítóval ({userId}) nem található.");

            return _mapper.Map<UserResponseDto>(user);
        }

        public async Task<UserResponseDto> LoginAsync(UserLoginRequestDto request)
        {
            var user = (await _unitOfWork.UserRepository.GetAsync(
                u => u.Email == request.Email)).FirstOrDefault()
                ?? throw new InvalidOperationException("Érvénytelen email cím vagy jelszó.");

            if (user.Password != request.Password)
                throw new InvalidOperationException("Érvénytelen email cím vagy jelszó.");

            return _mapper.Map<UserResponseDto>(user);
        }

        public async Task<UserResponseDto> UpdateUserProfileAsync(int userId, UserUpdateDto dto)
        {
            var existingUser = await _unitOfWork.UserRepository.GetByIdAsync(userId)
                ?? throw new KeyNotFoundException($"A felhasználó a megadott azonosítóval ({userId}) nem található.");

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

            if (user.Password != dto.CurrentPassword)
                throw new InvalidOperationException("The current password is incorrect.");

            user.Password = dto.NewPassword;

            _unitOfWork.UserRepository.Update(user);
            await _unitOfWork.SaveChangesAsync();
        }

        public async Task ChangeUserRoleAsync(int userId, Role newRole)
        {
            var user = await _unitOfWork.UserRepository.GetByIdAsync(userId)
                ?? throw new KeyNotFoundException($"A felhasználó a megadott azonosítóval ({userId}) nem található.");

            if (user.Role == newRole)
                throw new InvalidOperationException($"A felhasználó már rendelkezik a megadott szerepkörrel ({newRole}).");

            user.Role = newRole;
            _unitOfWork.UserRepository.Update(user);
            await _unitOfWork.SaveChangesAsync();
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