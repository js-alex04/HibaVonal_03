using AutoMapper;
using HibaVonal_03.DTOs.Fault;
using HibaVonal_03.DTOs.Feedback;
using HibaVonal_03.Entities;
using HibaVonal_03.Interfaces.Fault;
using HibaVonal_03.Repositories;

namespace HibaVonal_03.Services.Fault
{
    public class FaultService : IFaultService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public FaultService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;

        }

        //CRUD operations for Fault
        //Create
        public async Task<int> CreateFaultAsync(FaultCreateDto fault, int collegiateId)
        {
            var newFault = new Entities.Fault
            {
                Description = fault.Description,
                Date = DateTime.UtcNow,
                Attachment = fault.Attachment,
                CollegiateId = collegiateId,
                PremiseId = fault.PremiseId,
                ApplianceId = fault.ApplianceId,
                Status = FaultStatus.Pending,
                SpecializationId = null,
                AssignedMaintenanceId = null,
                Feedbacks = new List<Entities.Feedback>(),
                ToolOrders = new List<Entities.ToolOrder>()
            };

            await _unitOfWork.FaultRepository.AddAsync(newFault);
            await _unitOfWork.SaveChangesAsync();

            return newFault.Id;
        }

        //Read
        public async Task<List<FaultResponseDto>> GetAllFaultsAsync()
        {
            var faults = await _unitOfWork.FaultRepository.GetAsync(
                null,
                "Collegiate,Premise,Appliance,Specialization,AssignedMaintenance"
                );

            return _mapper.Map<List<FaultResponseDto>>(faults);
        }

        public async Task<FaultResponseDto> GetFaultByIdAsync(int faultId)
        {
            var fault = (await _unitOfWork.FaultRepository.GetAsync(
                f => f.Id == faultId,
                "Collegiate,Premise,Appliance,Specialization,AssignedMaintenance"
                )).FirstOrDefault();

            if (fault == null)
            {
                return null;
            }

            return _mapper.Map<FaultResponseDto>(fault);
        }

        //Update
        public async Task<bool> UpdateFaultAsync(int faultId, FaultUpdateDto fault)
        {
            var existingFault = await _unitOfWork.FaultRepository.GetByIdAsync(faultId);

            if (existingFault == null)
            {
                return false;
            }
            else
            {
                existingFault.Description = fault.Description;
                existingFault.Attachment = fault.Attachment;
                _unitOfWork.FaultRepository.Update(existingFault);
                await _unitOfWork.SaveChangesAsync();
                return true;
            }
        }

        //Delete
        public async Task<bool> DeleteFaultAsync(int faultId)
        {
            var existingFault = await _unitOfWork.FaultRepository.GetByIdAsync(faultId);

            if (existingFault == null)
            {
                return false;
            }
            else
            {
                _unitOfWork.FaultRepository.Delete(existingFault);
                await _unitOfWork.SaveChangesAsync();
                return true;
            }
        }


        // Specific operations for Fault
        public async Task<bool> NewFeedbackAsync(int id, FeedbackCreateDto dto)
        {
            var fault = await _unitOfWork.FaultRepository.GetByIdAsync(id);

            if (fault == null)
            {
                throw new ArgumentException($"Fault with Id {id} does not exist.");
            }
            else if (fault.Status is not FaultStatus.Repaired)
            {
                throw new ArgumentException($"Fault with Id {id} is not yet finished");
            }

            Entities.Feedback @feedback = _mapper.Map<Entities.Feedback>(dto);

            var newFeedback = new Entities.Feedback
            {
                FaultId = feedback.FaultId,
                Date = DateTime.UtcNow,
                Text = feedback.Text,
                CollegiateId = fault.CollegiateId,
            };

            await _unitOfWork.FeedbackRepository.AddAsync(newFeedback);
            fault.Feedbacks.Add(@feedback);
            await _unitOfWork.SaveChangesAsync();

            return true;
        }

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

        public async Task<bool> SetFaultSpecialisationAsync(int faultId, int specialisationId)
        {

            var existingFault = await _unitOfWork.FaultRepository.GetByIdAsync(faultId);
            var existingSpecialisation = await _unitOfWork.MaintainerSpecialisationRepository.GetByIdAsync(specialisationId);

            if (existingFault == null || existingSpecialisation == null)
            {
                return false;
            }
            else
            {
                existingFault.SpecializationId = specialisationId;
                _unitOfWork.FaultRepository.Update(existingFault);
                await _unitOfWork.SaveChangesAsync();
                return true;
            }
        }

        public async Task<bool> AssignMaintainerAsync(int faultId, int maintainerId)
        {
            var existingFault = await _unitOfWork.FaultRepository.GetByIdAsync(faultId);
            var existingMaintainer = await _unitOfWork.MaintainerRepository.GetByIdAsync(maintainerId);

            if (existingFault == null || existingMaintainer == null)
            {
                return false;
            }
            else
            {
                existingFault.AssignedMaintenanceId = maintainerId;
                _unitOfWork.FaultRepository.Update(existingFault);
                await _unitOfWork.SaveChangesAsync();
                return true;
            }
        }

        public async Task<List<FaultResponseDto>> GetFaultsByStatusAsync(FaultStatus status)
        {
            var faults = await _unitOfWork.FaultRepository.GetAsync(
                null,
                "Collegiate,Premise,Appliance,Specialization,AssignedMaintenance"
            );
            var faultsByStatus = faults.Where(fault => fault.Status == status);

            return _mapper.Map<List<FaultResponseDto>>(faultsByStatus);
        }
    }
}
