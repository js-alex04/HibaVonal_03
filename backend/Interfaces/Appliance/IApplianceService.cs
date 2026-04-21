using System;
using HibaVonal_03.DTOs;

namespace HibaVonal_03.Interfaces.Appliance
{
    public interface IApplianceService
    {
        Task<ApplianceResponseDto> CreateAppilanceAsync(ApplianceCreateDto appliance);
        Task<List<ApplianceResponseDto>> GetAllApplianceAsync();
        Task<ApplianceResponseDto> GetApplianceByIdAsync(int id);
        Task<bool> UpdateApplianceAsync(int id, ApplianceUpdateDto appliance);        
        Task<bool> DeleteApplianceAsync(int id);
        
    }
}