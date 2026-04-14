using HibaVonal_03.DTOs.Fault;

namespace HibaVonal_03.Interfaces.Fault
{
    public interface IFaultService
    {
        // CRUD operations for Fault


        // Specific operations for Fault
        Task<bool> UpdateFaultStatusAsync(int id, FaultStatusUpdateDto faultStatus);
    }
}
