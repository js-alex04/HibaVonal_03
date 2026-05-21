using HibaVonal_03.DTOs;
using HibaVonal_03.Entities;

namespace HibaVonal_03.Interfaces
{
    public interface IUserService
    {
        Task<UserResponseDto> CreateAdministratorAsync(UserCreateDto dto); // adminisztrátor
        Task<UserResponseDto> CreateMaintenanceManagerAsync(UserCreateDto dto); // karbantartási vezető
        Task<UserResponseDto> CreateCollegiateAsync(CollegiateCreateDto dto); // kollegista
        Task<UserResponseDto> CreateMaintainerAsync(MaintainerCreateDto dto); // karbantartó
        Task<List<UserResponseDto>> GetAllUsersAsync();
        Task<UserResponseDto> GetUserByIdAsync(int userId);
        Task<UserLoginResponseDto> LoginAsync(UserLoginRequestDto request);
        Task<UserResponseDto> UpdateUserProfileAsync(int userId, UserUpdateDto dto); // Alap adatok (Név, Email)
        Task ChangePasswordAsync(int userId, ChangePasswordDto dto); // Jelszó csere
        Task ChangeUserRoleAsync(int userId, Role newRole, int? dormRoomId); // Adminisztrátori jogkör módosítás
        Task DeleteUserAsync(int userId);
    }
}