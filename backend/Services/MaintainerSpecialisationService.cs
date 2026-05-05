using AutoMapper;
using HibaVonal_03.DTOs;
using HibaVonal_03.Entities;
using HibaVonal_03.Interfaces;
using HibaVonal_03.Repositories;

namespace HibaVonal_03.Services
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

        // Create
        public async Task<MaintainerSpecialisationResponseDto> CreateMaintainerSpecialisationAsync(MaintainerSpecialisationCreateDto maintainerSpecialisation)
        {
            // 1. lépés: Ellenőrizzük, hogy a név egyedi-e
            var existingSpecialisations = await _unitOfWork.MaintainerSpecialisationRepository.GetAsync(
                ms => ms.Name.ToLower() == maintainerSpecialisation.Name.Trim().ToLower());


            if (existingSpecialisations.Any())
            {
                throw new InvalidOperationException($"A karbantartói szakterület a megadott névvel ({maintainerSpecialisation.Name}) már létezik.");
            }

            // 2. lépés: Létrehozzuk a MaintainerSpecialisation entitást a DTO alapján
            var newSpecialisation = _mapper.Map<MaintainerSpecialisation>(maintainerSpecialisation);

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
        public async Task<MaintainerSpecialisationResponseDto> GetMaintainerSpecialisationByIdAsync(int maintainerSpecialisationId)
        {
            // 1. lépés: Lekérjük a szakterületet az adatbázisból az ID alapján
            var specialisationById = await _unitOfWork.MaintainerSpecialisationRepository.GetByIdAsync(maintainerSpecialisationId)
                ?? throw new KeyNotFoundException($"A karbantartói szakterület a megadott azonosítóval ({maintainerSpecialisationId}) nem található.");

            // 2. lépés: Visszaadjuk a szakterületet DTO formában
            return _mapper.Map<MaintainerSpecialisationResponseDto>(specialisationById);
        }

        public async Task<List<MaintainerSpecialisationResponseDto>> GetSpecialisationsByMaintainerIdAsync(int maintainerId)
        {
            var maintainer = await _unitOfWork.MaintainerRepository.GetByIdAsync(maintainerId)
                ?? throw new KeyNotFoundException($"A karbantartó a megadott azonosítóval ({maintainerId}) nem található.");

            var specialisations = await _unitOfWork.MaintainerSpecialisationRepository.GetAsync(
                s => s.Maintainers.Any(m => m.Id == maintainerId));

            // DTO listává alakítjuk és visszaadjuk
            return _mapper.Map<List<MaintainerSpecialisationResponseDto>>(specialisations);
        }

        // Update
        public async Task<MaintainerSpecialisationResponseDto> UpdateMaintainerSpecialisationAsync(int maintainerSpecialisationId, MaintainerSpecialisationUpdateDto maintainerSpecialisation)
        {
            // 1. lépés: Lekérjük a szakterületet az adatbázisból az ID alapján
            var existingSpecialisation = await _unitOfWork.MaintainerSpecialisationRepository.GetByIdAsync(maintainerSpecialisationId)
                ?? throw new KeyNotFoundException($"A karbantartói szakterület a megadott azonosítóval ({maintainerSpecialisationId}) nem található.");

            // 2. lépés: Frissítjük a szakterület adatait a DTO alapján
            _mapper.Map(maintainerSpecialisation, existingSpecialisation);

            _unitOfWork.MaintainerSpecialisationRepository.Update(existingSpecialisation);

            await _unitOfWork.SaveChangesAsync();

            return _mapper.Map<MaintainerSpecialisationResponseDto>(existingSpecialisation);
        }

        // Delete
        public async Task DeleteMaintainerSpecialisationAsync(int maintainerSpecialisationId)
        {
            // 1. lépés: Lekérjük a szakterületet az adatbázisból az ID alapján
            var existingSpecialisation = await _unitOfWork.MaintainerSpecialisationRepository.GetByIdAsync(maintainerSpecialisationId)
                ?? throw new KeyNotFoundException($"A karbantartói szakterület a megadott azonosítóval ({maintainerSpecialisationId}) nem található.");

            // 2. lépés: Töröljük a szakterületet az adatbázisból
            _unitOfWork.MaintainerSpecialisationRepository.Delete(existingSpecialisation);
            await _unitOfWork.SaveChangesAsync();
        }
    }
}
