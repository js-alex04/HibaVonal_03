using HibaVonal_03.DTOs.Fault;
using HibaVonal_03.DTOs.Feedback;
using HibaVonal_03.Entities;

namespace HibaVonal_03.Interfaces.Fault
{
    public interface IFaultService
    {
        Task<int> CreateFaultAsync(FaultCreateDto fault, int collegiateId);
        Task<List<FaultResponseDto>> GetAllFaultsAsync();
        Task<FaultResponseDto> GetFaultByIdAsync(int faultId);
        Task<bool> UpdateFault(int faultId, FaultUpdateDto fault);
        Task<bool> DeleteFault(int faultId);
        Task<bool> NewFeedback(int id, FeedbackCreateDto dto);
        Task<bool> UpdateFaultStatusAsync(int faultId, FaultStatus status);
        Task<bool> SetFaultSpecialisationAsync(int faultId, int specialisationId);
        Task<bool> AssignMaintainerAsync(int faultId, int maintainerId);
        Task<List<FaultResponseDto>> GetFaultsByStatusAsync(FaultStatus status);

    }
}
