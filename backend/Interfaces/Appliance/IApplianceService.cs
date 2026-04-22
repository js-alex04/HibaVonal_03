using HibaVonal_03.DTOs.Appliance;

namespace HibaVonal_03.Interfaces.Appliance
{
    public interface IApplianceService
    {
        // CRUD négy alapművelet az Appliance entitásra vonatkozóan
        Task<ApplianceResponseDto> CreateApplianceAsync(ApplianceCreateDto appliance);
        Task<List<ApplianceResponseDto>> GetAllAppliancesAsync();
        Task<ApplianceResponseDto> GetApplianceByIdAsync(int id);
        Task<bool> UpdateApplianceAsync(int id, ApplianceUpdateDto appliance);
        Task<bool> DeleteApplianceAsync(int id);
    }
}
