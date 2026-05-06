using AutoMapper;
using Microsoft.EntityFrameworkCore;
using AutoMapper.QueryableExtensions;
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
            return await _unitOfWork.MaintainerRepository.GetQueryable()
                .ProjectTo<MaintainerResponseDto>(_mapper.ConfigurationProvider)
                .ToListAsync();
        }

        public async Task<MaintainerResponseDto> GetMaintainerByIdAsync(int maintainerId)
        {
            var maintainerDto = await _unitOfWork.MaintainerRepository.GetQueryable()
                .Where(m => m.Id == maintainerId)
                .ProjectTo<MaintainerResponseDto>(_mapper.ConfigurationProvider)
                .SingleOrDefaultAsync()
                ?? throw new KeyNotFoundException($"A karbantartó a megadott azonosítóval ({maintainerId}) nem található.");

            return maintainerDto;
        }

        public async Task<List<MaintainerResponseDto>> GetMaintainersBySpecialisationIdAsync(int specialisationId)
        {
            return await _unitOfWork.MaintainerRepository.GetQueryable()
                .Where(m => m.MaintenanceSpecialisation.Any(s => s.Id == specialisationId))
                .ProjectTo<MaintainerResponseDto>(_mapper.ConfigurationProvider)
                .ToListAsync();
        }

        public async Task<MaintainerResponseDto> UpdateAvailabilityAsync(int maintainerId, bool isAvailable)
        {
            var maintainer = await _unitOfWork.MaintainerRepository.GetByIdAsync(maintainerId)
                ?? throw new KeyNotFoundException($"A karbantartó a megadott azonosítóval ({maintainerId}) nem található.");

            if (maintainer.IsAvailable == isAvailable)
                throw new InvalidOperationException($"A karbantartó elérhetősége már {(isAvailable ? "elérhető" : "nem elérhető")} állapotban van.");

            maintainer.IsAvailable = isAvailable;

            _unitOfWork.MaintainerRepository.Update(maintainer);

            await _unitOfWork.SaveChangesAsync();

            return _mapper.Map<MaintainerResponseDto>(maintainer);
        }
    }
}
