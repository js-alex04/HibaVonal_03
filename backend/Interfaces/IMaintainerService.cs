using HibaVonal_03.DTOs;

namespace HibaVonal_03.Interfaces
{
    public interface IMaintainerService
    {
        Task<List<MaintainerResponseDto>> GetAllMaintainersAsync();
        Task<MaintainerResponseDto> GetMaintainerByIdAsync(int maintainerId);
        Task<List<MaintainerResponseDto>> GetMaintainersBySpecialisationIdAsync(int specialisationId);
        Task<MaintainerResponseDto> UpdateAvailabilityAsync(int maintainerId, bool isAvailable);
    }
}