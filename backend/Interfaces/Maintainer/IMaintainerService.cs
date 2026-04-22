using HibaVonal_03.DTOs.Auth;

namespace HibaVonal_03.Interfaces.Maintainer
{
    public interface IMaintainerService
    {
        Task<List<UserDto>> GetAllMaintainersAsync();
        Task<UserDto?> GetMaintainerByIdAsync(int maintainerId);
        Task<List<UserDto>> GetMaintainersBySpecialisationIdAsync(int specialisationId);
        Task<bool> UpdateAvailabilityAsync(int maintainerId, bool isAvailable);
    }
}