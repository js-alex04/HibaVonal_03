using HibaVonal_03.DTOs.Auth;
using HibaVonal_03.DTOs.Collegiate;
using HibaVonal_03.DTOs.Maintainer;
using HibaVonal_03.DTOs.User;

namespace HibaVonal_03.Interfaces.User
{
    public interface IUserService
    {
        // CRUD négy alapművelet
        Task<UserDto> CreateCollegiateAsync(CollegiateCreateDto dto);
        Task<UserDto> CreateMaintainerAsync(MaintainerCreateDto dto);
        Task<UserDto> CreateManagementAdminAsync(UserCreateDto dto, string role);
        Task<List<UserDto>> GetAllUsersAsync();
        Task<UserDto?> GetUserByIdAsync(int id);
        Task<bool> UpdateUserRoleAsync(int id, string newRole);
        Task<bool> DeleteUserAsync(int id); 
    }
}