using HibaVonal_03.DTOs.Fault;
using HibaVonal_03.DTOs.Feedback;
using HibaVonal_03.Entities;

namespace HibaVonal_03.Interfaces.Fault
{
    public interface IFaultService
    {
        // CRUD operations for Fault
        Task<int> CreateFaultAsync(FaultCreateDto fault, int collegiateId);
        Task<List<FaultResponseDto>> GetAllFaultsAsync();
        Task<FaultResponseDto> GetFaultByIdAsync(int faultId);
        Task<bool> UpdateFaultAsync(int faultId, FaultUpdateDto fault);
        Task<bool> DeleteFaultAsync(int faultId);
        Task<bool> NewFeedbackAsync(int id, FeedbackCreateDto dto);
        Task<bool> SetFaultSpecialisationAsync(int faultId, int specialisationId);
        Task<bool> AssignMaintainerAsync(int faultId, int maintainerId);
        Task<List<FaultResponseDto>> GetFaultsByStatusAsync(FaultStatus status);


        // Specific operations for Fault
        Task<bool> UpdateFaultStatusAsync(int id, FaultStatusUpdateDto faultStatus);
    }
}
