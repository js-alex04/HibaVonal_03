using AutoMapper;
using Microsoft.EntityFrameworkCore;
using AutoMapper.QueryableExtensions;
using HibaVonal_03.DTOs;
using HibaVonal_03.Entities;
using HibaVonal_03.Interfaces;
using HibaVonal_03.Repositories;

namespace HibaVonal_03.Services
{
    public class PremiseService : IPremiseService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public PremiseService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        // Create
        public async Task<PremiseResponseDto> CreatePremiseAsync(PremiseCreateDto premise)
        {
            // 1. lépés: Ellenőrizzük, hogy a név/szám egyedi-e (SQL szintű szűréssel)
            var existingPremises = await _unitOfWork.PremiseRepository.GetAsync(
                p => p.NameOrNumber.ToLower() == premise.NameOrNumber.Trim().ToLower());

            if (existingPremises.Any())
            {
                throw new InvalidOperationException($"A helyiség a megadott névvel/számmal ({premise.NameOrNumber}) már létezik.");
            }

            // 2. lépés: Mappeljük a DTO-t az entitásra
            var newPremise = _mapper.Map<Entities.Premise>(premise);

            // 3. lépés: Hozzáadjuk az új helyiséget az adatbázishoz
            await _unitOfWork.PremiseRepository.AddAsync(newPremise);
            await _unitOfWork.SaveChangesAsync();

            // 4. lépés: Visszamappeljük a létrehozott entitást a response DTO-ra
            return _mapper.Map<PremiseResponseDto>(newPremise);
        }

        // Read
        public async Task<List<PremiseResponseDto>> GetAllPremisesAsync()
        {
            return await _unitOfWork.PremiseRepository.GetQueryable()
                .ProjectTo<PremiseResponseDto>(_mapper.ConfigurationProvider)
                .ToListAsync();
        }

        // Read by ID
        public async Task<PremiseResponseDto> GetPremiseByIdAsync(int premiseId)
        {
            var premiseDto = await _unitOfWork.PremiseRepository.GetQueryable()
                .Where(p => p.Id == premiseId)
                .ProjectTo<PremiseResponseDto>(_mapper.ConfigurationProvider)
                .SingleOrDefaultAsync()
                ?? throw new KeyNotFoundException($"A helyiség a megadott azonosítóval ({premiseId}) nem található.");

            return premiseDto;
        }

        // Update
        public async Task<PremiseResponseDto> UpdatePremiseAsync(int premiseId, PremiseUpdateDto premise)
        {
            // 1. lépés: Lekérjük a meglévő premise-t az adatbázisból az ID alapján
            var existingPremise = await _unitOfWork.PremiseRepository.GetQueryable()
                .Include(p => p.Residents)
                .FirstOrDefaultAsync(p => p.Id == premiseId)
                ?? throw new KeyNotFoundException($"A helyiség a megadott azonosítóval ({premiseId}) nem található.");

            if (existingPremise.Residents != null && existingPremise.Residents.Any())
            {
                throw new InvalidOperationException(
                    $"A helyiség nem módosítható, mert {existingPremise.Residents.Count} lakó van hozzárendelve. Előbb költöztesse át őket!");
            }

            // 3. lépés: Mappeljük a DTO-t a meglévő entitásra
            _mapper.Map(premise, existingPremise);

            _unitOfWork.PremiseRepository.Update(existingPremise);

            await _unitOfWork.SaveChangesAsync();

            return _mapper.Map<PremiseResponseDto>(existingPremise);
        }

        public async Task DeletePremiseAsync(int premiseId)
        {
            // 1. lépés: Lekérjük a törlendő helyiséget az adatbázisból az ID alapján
            var premiseToDelete = await _unitOfWork.PremiseRepository.GetQueryable()
                .Include(p => p.Residents)
                .Include(p => p.Appliances)
                .FirstOrDefaultAsync(p => p.Id == premiseId)
                ?? throw new KeyNotFoundException($"A helyiség a megadott azonosítóval ({premiseId}) nem található.");

            // Lakók ellenőrzése
            if (premiseToDelete.Residents != null && premiseToDelete.Residents.Any())
            {
                throw new InvalidOperationException(
                    $"A helyiség nem törölhető, mert {premiseToDelete.Residents.Count} lakó van hozzárendelve. Előbb költöztesse át őket!");
            }

            // Berendezések ellenőrzése
            if (premiseToDelete.Appliances != null && premiseToDelete.Appliances.Any())
            {
                throw new InvalidOperationException(
                    $"A helyiség nem törölhető, mert {premiseToDelete.Appliances.Count} berendezés van hozzárendelve. Előbb törölje vagy helyezze át őket!");
            }

            // Hibajelentések ellenőrzése
            bool hasFaults = await _unitOfWork.FaultRepository.GetQueryable()
                .AnyAsync(f => f.PremiseId == premiseId);

            if (hasFaults)
            {
                throw new InvalidOperationException("A helyiség nem törölhető, mert már korábban bejelentettek ide egy vagy több hibát!");
            }

            // 2. lépés: Ha minden tiszta, töröljük a helyiséget az adatbázisból
            _unitOfWork.PremiseRepository.Delete(premiseToDelete);
            await _unitOfWork.SaveChangesAsync();
        }


        public async Task<PremiseResponseDto> AddApplianceToPremiseAsync(int premiseId, int applianceId)
        {
            // 1. Lekérjük mindkét entitást, hogy megbizonyosodjunk a létezésükről
            var existingPremise = await _unitOfWork.PremiseRepository.GetByIdAsync(premiseId)
                ?? throw new KeyNotFoundException($"A helyiség a megadott azonosítóval ({premiseId}) nem található.");

            var existingAppliance = await _unitOfWork.ApplianceRepository.GetByIdAsync(applianceId)
                ?? throw new KeyNotFoundException($"A berendezés a megadott azonosítóval ({applianceId}) nem található.");

            // 3. Összerendeljük őket (a berendezés helyiségét beállítjuk)
            existingAppliance.PremiseId = existingPremise.Id;

            // 4. Frissítjük és mentjük az adatbázisba
            _unitOfWork.ApplianceRepository.Update(existingAppliance);

            await _unitOfWork.SaveChangesAsync();

            return await GetPremiseByIdAsync(premiseId);
        }

        public async Task DeleteApplianceFromPremiseAsync(int premiseId, int applianceId)
        {
            // 1. Lekérjük a berendezést, helyiséget
            var existingPremise = await _unitOfWork.PremiseRepository.GetByIdAsync(premiseId)
                ?? throw new KeyNotFoundException($"A helyiség a megadott azonosítóval ({premiseId}) nem található.");

            var existingAppliance = await _unitOfWork.ApplianceRepository.GetByIdAsync(applianceId)
                ?? throw new KeyNotFoundException($"A berendezés a megadott azonosítóval ({applianceId}) nem található.");

            

            // 2. Ellenőrizzük, hogy létezik-e, és tényleg abban a helyiségben van-e
            if (existingAppliance.PremiseId != premiseId)
            {
                throw new InvalidOperationException($"A berendezés a megadott helyiségben ({premiseId}) nem található.");
            }

            // 3. Eltávolítjuk a helyiségből (null-ra állítjuk a hivatkozást)
            existingAppliance.PremiseId = null;

            // 4. Frissítjük és mentjük
            _unitOfWork.ApplianceRepository.Update(existingAppliance);
            await _unitOfWork.SaveChangesAsync();
        }
    }
}
