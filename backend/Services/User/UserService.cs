using AutoMapper;
using HibaVonal_03.DTOs.Auth;
using HibaVonal_03.DTOs.Collegiate;
using HibaVonal_03.DTOs.Maintainer;
using HibaVonal_03.DTOs.User;
using HibaVonal_03.Entities;
using HibaVonal_03.Interfaces.User;
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

        public async Task<UserDto> CreateCollegiateAsync(CollegiateCreateDto dto)
        {
            // 1. Ellenőrizzük, hogy az email foglalt-e már
            var allUsers = await _unitOfWork.UserRepository.GetAllAsync();
            if (allUsers.Any(u => u.Email == dto.Email))
            {
                throw new ArgumentException("Ez az email cím már foglalt!");
            }

            // 2. Ellenőrizzük, hogy létezik-e a megadott szoba
            if (await _unitOfWork.PremiseRepository.GetByIdAsync(dto.DormRoomId) == null)
            {
                throw new ArgumentException($"A {dto.DormRoomId} azonosítójú szoba nem található.");
            }

            // 3. Mapelés és adatok beállítása
            var collegiate = _mapper.Map<Entities.Collegiate>(dto);
            collegiate.Role = Role.Collegiate;

            // 4. Jelszó
            collegiate.Password = dto.Password;

            await _unitOfWork.UserRepository.AddAsync(collegiate);
            await _unitOfWork.SaveChangesAsync();

            return _mapper.Map<UserDto>(collegiate);
        }

        public async Task<UserDto> CreateMaintainerAsync(MaintainerCreateDto dto)
        {
            var allUsers = await _unitOfWork.UserRepository.GetAllAsync();

            if (allUsers.Any(u => u.Email == dto.Email))
            {
                throw new ArgumentException($"EMail is already taken: {dto.Email}");
            }

            var maintainer = _mapper.Map<Entities.Maintainer>(dto);
            maintainer.Role = Role.Maintainer;
            maintainer.Password = dto.Password;
            maintainer.IsAvailable = true;

            if (dto.SpecialisationIds != null && dto.SpecialisationIds.Any())
            {
                foreach (var specId in dto.SpecialisationIds)
                {
                    var spec = await _unitOfWork.MaintainerSpecialisationRepository.GetByIdAsync(specId);
                    if (spec != null)
                    {
                        maintainer.MaintenanceSpecialisation.Add(spec);
                    }
                }
            }

            await _unitOfWork.UserRepository.AddAsync(maintainer);
            await _unitOfWork.SaveChangesAsync();

            return _mapper.Map<UserDto>(maintainer);
        }

        public async Task<UserDto> CreateManagementAdminAsync(UserCreateDto dto, string role)
        {
            var allUsers = await _unitOfWork.UserRepository.GetAllAsync();
            if (allUsers.Any(u => u.Email == dto.Email))
            {
                throw new ArgumentException("Ez az email cím már foglalt!");
            }

            if (!Enum.TryParse<Role>(role, true, out var parsedRole))
            {
                throw new ArgumentException("Érvénytelen szerepkör!");
            }

            var admin = _mapper.Map<User>(dto);
            admin.Role = parsedRole;
            admin.Password = dto.Password;

            await _unitOfWork.UserRepository.AddAsync(admin);
            await _unitOfWork.SaveChangesAsync();

            return _mapper.Map<UserDto>(admin);
        }

        public async Task<List<UserDto>> GetAllUsersAsync()
        {
            var users = await _unitOfWork.UserRepository.GetAllAsync();

            return _mapper.Map<List<UserDto>>(users);
        }

        public async Task<UserDto?> GetUserByIdAsync(int id)
        {
            var user = await _unitOfWork.UserRepository.GetByIdAsync(id);

            if (user == null)
            {
                return null;
            }

            return _mapper.Map<UserDto>(user);
        }

        public async Task<bool> UpdateUserRoleAsync(int id, string newRole)
        {
            var user = await _unitOfWork.UserRepository.GetByIdAsync(id);

            if (user == null)
            {
                return false;
            }

            if (Enum.TryParse<Role>(newRole, true, out var parsedRole))
            {
                user.Role = parsedRole;
                _unitOfWork.UserRepository.Update(user);
                await _unitOfWork.SaveChangesAsync();
                return true;
            }
            else
            {
                throw new ArgumentException($"Invalid role: {newRole}");
            }
        }

        public async Task<bool> DeleteUserAsync(int id)
        {
            var user = await _unitOfWork.UserRepository.GetByIdAsync(id);

            if (user == null)
            {
                return false;
            }

            _unitOfWork.UserRepository.Delete(user);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }
    }
}