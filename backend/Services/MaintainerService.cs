using AutoMapper;
using HibaVonal_03.DTOs;
using HibaVonal_03.Entities;
using HibaVonal_03.Interfaces;
using HibaVonal_03.Repositories;

namespace HibaVonal_03.Services
{
    public class MaintainerService : IMaintainerService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public MaintainerService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<List<MaintainerResponseDto>> GetAllMaintainersAsync()
        {
            var maintainers = await _unitOfWork.MaintainerRepository.GetAsync(null, "MaintenanceSpecialisation");

            return _mapper.Map<List<MaintainerResponseDto>>(maintainers);
        }

        public async Task<MaintainerResponseDto> GetMaintainerByIdAsync(int maintainerId)
        {
            var maintainer = await _unitOfWork.MaintainerRepository.GetByIdAsync(maintainerId, "MaintenanceSpecialisation")
                ?? throw new KeyNotFoundException($"A karbantartó a megadott azonosítóval ({maintainerId}) nem található.");

            return _mapper.Map<MaintainerResponseDto>(maintainer);
        }

        public async Task<List<MaintainerResponseDto>> GetMaintainersBySpecialisationIdAsync(int specialisationId)
        {
            var maintainers = await _unitOfWork.MaintainerRepository.GetAsync(
                m => m.MaintenanceSpecialisation.Any(s => s.Id == specialisationId),
                "MaintenanceSpecialisation"
            );

            return _mapper.Map<List<MaintainerResponseDto>>(maintainers);
        }

        public async Task<MaintainerResponseDto> UpdateAvailabilityAsync(int maintainerId, bool isAvailable)
        {
            var maintainer = await _unitOfWork.MaintainerRepository.GetByIdAsync(maintainerId)
                ?? throw new KeyNotFoundException($"A karbantartó a megadott azonosítóval ({maintainerId}) nem található.");

            if (maintainer.IsAvailable == isAvailable)
                throw new InvalidOperationException($"A karbantartó elérhetősége már {(isAvailable ? "elérhető" : "nem elérhető")} állapotban van.");

            maintainer.IsAvailable = isAvailable;

            await _unitOfWork.SaveChangesAsync();

            return _mapper.Map<MaintainerResponseDto>(maintainer);
        }
    }
}
