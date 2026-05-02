using AutoMapper;
using HibaVonal_03.DTOs.MaintainerSpecialisation;
using HibaVonal_03.Interfaces.MaintainerSpecialisation;
using HibaVonal_03.Repositories;

namespace HibaVonal_03.Services.MaintainerSpecialisation
{
    public class MaintainerSpecialisationService : IMaintainerSpecialisationService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public MaintainerSpecialisationService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        // CRUD négy alapművelet implementációja a MaintainerSpecialisation entitásra
        // Create
        public async Task<MaintainerSpecialisationResponseDto> CreateMaintainerSpecialisationAsync(MaintainerSpecialisationCreateDto maintainerSpecialisation)
        {
            // 1. lépés: Ellenőrizzük, hogy a név egyedi-e
            var allSpecialisations = await _unitOfWork.MaintainerSpecialisationRepository.GetAllAsync();
            if (allSpecialisations.Any(ms => ms.Name.Equals(maintainerSpecialisation.Name, StringComparison.OrdinalIgnoreCase)))
            {
                throw new ArgumentException($"Maintainer specialisation with name '{maintainerSpecialisation.Name}' already exists.");
            }

            // 2. lépés: Létrehozzuk a MaintainerSpecialisation entitást a DTO alapján
            var newSpecialisation = _mapper.Map<Entities.MaintainerSpecialisation>(maintainerSpecialisation);

            // 3. lépés: Hozzáadjuk az új szakterületet az adatbázishoz
            await _unitOfWork.MaintainerSpecialisationRepository.AddAsync(newSpecialisation);
            await _unitOfWork.SaveChangesAsync();

            // 4. lépés: Visszaadjuk a létrehozott szakterületet DTO formában
            return _mapper.Map<MaintainerSpecialisationResponseDto>(newSpecialisation);
        }

        // Read
        public async Task<List<MaintainerSpecialisationResponseDto>> GetAllMaintainerSpecialisationsAsync()
        {
            // 1. lépés: Lekérjük az összes szakterületet az adatbázisból
            var allSpecialisations = await _unitOfWork.MaintainerSpecialisationRepository.GetAllAsync();

            // 2. lépés: Visszaadjuk a szakterületeket DTO formában
            return _mapper.Map<List<MaintainerSpecialisationResponseDto>>(allSpecialisations);
        }

        // Read by ID
        public async Task<MaintainerSpecialisationResponseDto> GetMaintainerSpecialisationByIdAsync(int id)
        {
            // 1. lépés: Lekérjük a szakterületet az adatbázisból az ID alapján
            var specialisationById = await _unitOfWork.MaintainerSpecialisationRepository.GetByIdAsync(id);

            // Opcionális: Ellenőrizzük, hogy a szakterület létezik-e
            if (specialisationById == null)
            {
                throw new KeyNotFoundException($"Maintainer specialisation with ID '{id}' not found.");
            }

            // 2. lépés: Visszaadjuk a szakterületet DTO formában
            return _mapper.Map<MaintainerSpecialisationResponseDto>(specialisationById);
        }

        // Update
        public async Task<bool> UpdateMaintainerSpecialisationAsync(int id, MaintainerSpecialisationUpdateDto maintainerSpecialisation)
        {
            // 1. lépés: Lekérjük a szakterületet az adatbázisból az ID alapján
            var existingSpecialisation = await _unitOfWork.MaintainerSpecialisationRepository.GetByIdAsync(id);

            // Opcionális: Ellenőrizzük, hogy a szakterület létezik-e
            if (existingSpecialisation == null)
            {
                return false;
            }

            // 2. lépés: Frissítjük a szakterület adatait a DTO alapján
            _mapper.Map(maintainerSpecialisation, existingSpecialisation);
            _unitOfWork.MaintainerSpecialisationRepository.Update(existingSpecialisation);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        // Delete
        public async Task<bool> DeleteMaintainerSpecialisationAsync(int id)
        {
            // 1. lépés: Lekérjük a szakterületet az adatbázisból az ID alapján
            var existingSpecialisation = await _unitOfWork.MaintainerSpecialisationRepository.GetByIdAsync(id);

            // Opcionális: Ellenőrizzük, hogy a szakterület létezik-e
            if (existingSpecialisation == null)
            {
                return false;
            }

            // 2. lépés: Töröljük a szakterületet az adatbázisból
            _unitOfWork.MaintainerSpecialisationRepository.Delete(existingSpecialisation);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }
    }
}
