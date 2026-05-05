using AutoMapper;
using HibaVonal_03.DTOs;
using HibaVonal_03.Entities;
using HibaVonal_03.Interfaces;
using HibaVonal_03.Repositories;

namespace HibaVonal_03.Services
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

        //Create
        public async Task<FaultResponseDto> CreateFaultAsync(FaultCreateDto fault, int collegiateId)
        {
            var newFault = _mapper.Map<Fault>(fault);

            await _unitOfWork.FaultRepository.AddAsync(newFault);
            await _unitOfWork.SaveChangesAsync();

            return _mapper.Map<FaultResponseDto>(newFault);
        }

        // Read
        public async Task<List<FaultResponseDto>> GetAllFaultsAsync()
        {
            var faults = await _unitOfWork.FaultRepository.GetAsync(null, "Feedbacks,Collegiate,AssignedMaintenance,Appliance,Premise,ToolOrders");

            return _mapper.Map<List<FaultResponseDto>>(faults);
        }

        // Read by ID
        public async Task<FaultResponseDto> GetFaultByIdAsync(int faultId)
        {
            // Szűrés a FaultId alapján, és a kapcsolódó entitások betöltése a DTO számára
            var fault = await _unitOfWork.FaultRepository.GetByIdAsync(
                faultId,
                "Feedbacks,Collegiate,AssignedMaintenance,Appliance,Premise,ToolOrders"
            )
            ?? throw new KeyNotFoundException($"A hiba a megadott azonosítóval ({faultId}) nem található.");

            return _mapper.Map<FaultResponseDto>(fault);
        }

        public async Task<List<FaultResponseDto>> GetFaultsByCollegiateIdAsync(int collegiateId)
        {
            if ((await _unitOfWork.UserRepository.GetByIdAsync(collegiateId)) is null)
                throw new KeyNotFoundException($"A kollégista a megadott azonosítóval ({collegiateId}) nem található.");

            // Szűrés a CollegiateId alapján, és a kapcsolódó entitások betöltése a DTO számára
            var faults = await _unitOfWork.FaultRepository.GetAsync(
                filter: f => f.CollegiateId == collegiateId,
                includeProperties: "Feedbacks,Collegiate,AssignedMaintenance,Appliance,Premise,ToolOrders"
            );

            return _mapper.Map<List<FaultResponseDto>>(faults);
        }

        public async Task<List<FaultResponseDto>> GetFaultsByMaintainerIdAsync(int maintainerId)
        {
            if ((await _unitOfWork.MaintainerRepository.GetByIdAsync(maintainerId)) is null)
                throw new KeyNotFoundException($"A karbantartó a megadott azonosítóval ({maintainerId}) nem található.");

            // Szűrés a AssignedMaintenanceId alapján, és a kapcsolódó entitások betöltése a DTO számára
            var faults = await _unitOfWork.FaultRepository.GetAsync(
                filter: f => f.AssignedMaintenanceId == maintainerId,
                includeProperties: "Feedbacks,Collegiate,AssignedMaintenance,Appliance,Premise,ToolOrders"
            );

            // Visszatérés a DTO listává alakított eredménnyel
            return _mapper.Map<List<FaultResponseDto>>(faults);
        }

        public async Task<List<FaultResponseDto>> GetFaultsByStatusAsync(FaultStatus faultStatus)
        {
            var faults = await _unitOfWork.FaultRepository.GetAsync(
                null,
                "Collegiate,Premise,Appliance,Specialization,AssignedMaintenance"
            );
            var faultsByStatus = faults.Where(fault => fault.Status == faultStatus);

            return _mapper.Map<List<FaultResponseDto>>(faultsByStatus);
        }

        //Update
        public async Task<FaultResponseDto> UpdateFaultAsync(int faultId, FaultUpdateDto fault)
        {
            var faultToUpdate = await _unitOfWork.FaultRepository.GetByIdAsync(faultId)
                ?? throw new KeyNotFoundException($"A hiba a megadott azonosítóval ({faultId}) nem található.");

            _mapper.Map(fault, faultToUpdate);

            await _unitOfWork.SaveChangesAsync();

            return _mapper.Map<FaultResponseDto>(faultToUpdate);
        }

        public async Task<FaultResponseDto> SetFaultSpecialisationAsync(int faultId, int specialisationId)
        {
            var existingFault = await _unitOfWork.FaultRepository.GetByIdAsync(faultId)
                ?? throw new KeyNotFoundException($"A hiba a megadott azonosítóval ({faultId}) nem található.");

            var existingSpecialisation = await _unitOfWork.MaintainerSpecialisationRepository.GetByIdAsync(specialisationId)
                ?? throw new KeyNotFoundException($"A szakterület a megadott azonosítóval ({specialisationId}) nem található.");

            existingFault.SpecializationId = specialisationId;

            await _unitOfWork.SaveChangesAsync();

            return _mapper.Map<FaultResponseDto>(existingFault);
        }

        public async Task<FaultResponseDto> AssignMaintainerAsync(int faultId, int maintainerId)
        {
            var existingFault = await _unitOfWork.FaultRepository.GetByIdAsync(faultId)
                ?? throw new KeyNotFoundException($"A hiba a megadott azonosítóval ({faultId}) nem található.");

            var existingMaintainer = await _unitOfWork.MaintainerRepository.GetByIdAsync(maintainerId)
                ?? throw new KeyNotFoundException($"A karbantartó a megadott azonosítóval ({maintainerId}) nem található.");

            existingFault.AssignedMaintenanceId = maintainerId;

            await _unitOfWork.SaveChangesAsync();

            return _mapper.Map<FaultResponseDto>(existingFault);
        }

        public async Task<FaultResponseDto> UpdateFaultStatusAsync(int id, FaultStatus faultStatus)
        {
            var existingFault = await _unitOfWork.FaultRepository.GetByIdAsync(id)
                ?? throw new KeyNotFoundException($"A hiba a megadott azonosítóval ({id}) nem található.");

            existingFault.Status = faultStatus;

            await _unitOfWork.SaveChangesAsync();

            return _mapper.Map<FaultResponseDto>(existingFault);
        }

        //Delete
        public async Task DeleteFaultAsync(int faultId)
        {
            var existingFault = await _unitOfWork.FaultRepository.GetByIdAsync(faultId)
                ?? throw new KeyNotFoundException($"A hiba a megadott azonosítóval ({faultId}) nem található.");

            _unitOfWork.FaultRepository.Delete(existingFault);
            await _unitOfWork.SaveChangesAsync();
        }

        public async Task<FeedbackResponseDto> NewFeedbackAsync(int faultId, FeedbackCreateDto feedbackCreateDto)
        {
            var fault = await _unitOfWork.FaultRepository.GetByIdAsync(faultId)
                ?? throw new KeyNotFoundException($"A hiba a megadott azonosítóval ({faultId}) nem található.");

            if (fault.Status != FaultStatus.Repaired)
                throw new InvalidOperationException("Csak a javított hibákhoz lehet visszajelzést írni.");

            var feedback = _mapper.Map<Feedback>(feedbackCreateDto);

            feedback.FaultId = faultId;

            await _unitOfWork.FeedbackRepository.AddAsync(feedback);
            await _unitOfWork.SaveChangesAsync();

            return _mapper.Map<FeedbackResponseDto>(feedback);
        }
    }
}
