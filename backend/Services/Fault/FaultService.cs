using HibaVonal_03.DTOs.Fault;
using HibaVonal_03.Interfaces.Fault;
using HibaVonal_03.Repositories;

namespace HibaVonal_03.Services.Fault
{
    public class FaultService : IFaultService
    {
        private readonly IUnitOfWork _unitOfWork;

        public FaultService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        //CRUD operations for Fault



        // Specific operations for Fault
        public async Task<bool> UpdateFaultStatusAsync(int id, FaultStatusUpdateDto faultStatus)
        {
            var existingFault = await _unitOfWork.FaultRepository.GetByIdAsync(id);

            if (existingFault != null)
            {
                existingFault.Status = faultStatus.Status;
                _unitOfWork.FaultRepository.Update(existingFault);
                await _unitOfWork.SaveChangesAsync();
                return true;
            }
            else 
            {
                return false;
            }
        }
    }
}
