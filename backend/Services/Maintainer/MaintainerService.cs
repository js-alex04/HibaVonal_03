using AutoMapper;
using HibaVonal_03.DTOs.Auth;
using HibaVonal_03.Entities;
using HibaVonal_03.Interfaces.Maintainer;
using HibaVonal_03.Repositories;

namespace HibaVonal_03.Services.Maintainer
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

        public async Task<List<UserDto>> GetAllMaintainersAsync()
        {
            // Lekérjük az összes felhasználót
            var allUsers = await _unitOfWork.UserRepository.GetAllAsync();

            // Csak azokat tartjuk meg, akik Karbantartók
            var maintainers = allUsers.Where(u => u.Role == Role.Maintainer).ToList();

            return _mapper.Map<List<UserDto>>(maintainers);
        }

        public async Task<UserDto?> GetMaintainerByIdAsync(int maintainerId)
        {
            var user = await _unitOfWork.UserRepository.GetByIdAsync(maintainerId);

            // Ellenőrizzük, hogy létezik-e, és tényleg karbantartó-e
            if (user == null || user.Role != Role.Maintainer)
            {
                return null;
            }

            return _mapper.Map<UserDto>(user);
        }

        public async Task<List<UserDto>> GetMaintainersBySpecialisationIdAsync(int specialisationId)
        {
            var allUsers = await _unitOfWork.UserRepository.GetAllAsync(includeProperties: "MaintenanceSpecialisation");

            var maintainers = allUsers
                .Where(u => u.Role == Role.Maintainer)
                .Cast<Entities.Maintainer>() 
                .Where(m => m.MaintenanceSpecialisation.Any(ms => ms.Id == specialisationId))
                .ToList();

            return _mapper.Map<List<UserDto>>(maintainers);
        }

        public async Task<bool> UpdateAvailabilityAsync(int maintainerId, bool isAvailable)
        {
            var user = await _unitOfWork.UserRepository.GetByIdAsync(maintainerId);

            if (user == null || user.Role != Role.Maintainer)
            {
                return false;
            }

            var maintainer = (Entities.Maintainer)user;
            maintainer.IsAvailable = isAvailable;

            _unitOfWork.UserRepository.Update(maintainer);
            await _unitOfWork.SaveChangesAsync();

            return true;
        }
    }
}
