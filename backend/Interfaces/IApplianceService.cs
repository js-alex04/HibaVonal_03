using HibaVonal_03.DTOs;

namespace HibaVonal_03.Interfaces
{
    public interface IApplianceService
    {
        Task<ApplianceResponseDto> CreateApplianceAsync(ApplianceCreateDto appliance);
        Task<List<ApplianceResponseDto>> GetAllAppliancesAsync();
        Task<ApplianceResponseDto> GetApplianceByIdAsync(int applianceId);
        Task<ApplianceResponseDto> UpdateApplianceAsync(int applianceId, ApplianceUpdateDto appliance);
        Task DeleteApplianceAsync(int applianceId);
    }
}
