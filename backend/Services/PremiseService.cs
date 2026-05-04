using AutoMapper;
using HibaVonal_03.DTOs.Premise;
using HibaVonal_03.Entities;
using HibaVonal_03.Interfaces.Premise;
using HibaVonal_03.Repositories;

namespace HibaVonal_03.Services.Premise
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

        // CRUD négy alapművelet implementációja a Premise entitásra
        // Create
        public async Task<PremiseResponseDto> CreatePremiseAsync(PremiseCreateDto premise)
        {
            // 1. lépés: Ellenőrizzük, hogy a név/szám egyedi-e
            var allPremises = await _unitOfWork.PremiseRepository.GetAllAsync();
            if (allPremises.Any(p => p.NameOrNumber == premise.NameOrNumber))
            {
                throw new ArgumentException($"A premise with the name/number '{premise.NameOrNumber}' already exists.");
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
            // 1. lépés: Lekérjük az összes helyiséget az adatbázisból
            var allPremises = _unitOfWork.PremiseRepository.GetAllAsync();

            // 2. lépés: Mappeljük az entitásokat a response DTO-kra
            return _mapper.Map<List<PremiseResponseDto>>(await allPremises);
        }

        // Read by ID
        public async Task<PremiseResponseDto> GetPremiseByIdAsync(int id)
        {
            // 1. lépés: Lekérjük a premise-t az adatbázisból az ID alapján
            var premiseById = _unitOfWork.PremiseRepository.GetByIdAsync(id);

            // Opcionális: Ellenőrizzük, hogy a premise létezik-e
            if (premiseById == null)
            {
                throw new KeyNotFoundException($"No premise found with ID {id}.");
            }    

            // 2. lépés: Mappeljük az entitást a response DTO-ra
            return _mapper.Map<PremiseResponseDto>(await premiseById);
        }

        // Update
        public async Task<bool> UpdatePremiseAsync(int id, PremiseUpdateDto premise)
        {
            // 1. lépés: Lekérjük a meglévő premise-t az adatbázisból az ID alapján
            var existingPremise = await _unitOfWork.PremiseRepository.GetByIdAsync(id);

            // Opcionális: Ellenőrizzük, hogy a premise létezik-e
            if (existingPremise == null)
            {
                return false;
            }

            // 2. lépés: Mappeljük a DTO-t a meglévő entitásra
            _mapper.Map(premise, existingPremise);
            _unitOfWork.PremiseRepository.Update(existingPremise);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeletePremiseAsync(int id)
        {
            // 1. lépés: Lekérjük a törlendő helyiséget az adatbázisból az ID alapján
            var premiseToDelete = await _unitOfWork.PremiseRepository.GetByIdAsync(id);

            // Opcionális: Ellenőrizzük, hogy a helyiség létezik-e
            if (premiseToDelete == null)
            {
                return false;
            }

            // 2. lépés: Töröljük a helyiséget az adatbázisból
            _unitOfWork.PremiseRepository.Delete(premiseToDelete);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<bool> AddApplianceToPremiseAsync(int premiseId, int applianceId)
        {
            // 1. Lekérjük mindkét entitást, hogy megbizonyosodjunk a létezésükről
            var existingPremise = await _unitOfWork.PremiseRepository.GetByIdAsync(premiseId);
            var existingAppliance = await _unitOfWork.ApplianceRepository.GetByIdAsync(applianceId);

            // 2. Ha valamelyik nem létezik, visszatérünk hamis értékkel
            if (existingPremise == null || existingAppliance == null)
            {
                return false;
            }

            // 3. Összerendeljük őket (a berendezés helyiségét beállítjuk)
            existingAppliance.PremiseId = premiseId;

            // 4. Frissítjük és mentjük az adatbázisba
            _unitOfWork.ApplianceRepository.Update(existingAppliance);
            await _unitOfWork.SaveChangesAsync();

            return true;
        }

        public async Task<bool> DeleteApplianceFromPremiseAsync(int premiseId, int applianceId)
        {
            // 1. Lekérjük a berendezést
            var existingAppliance = await _unitOfWork.ApplianceRepository.GetByIdAsync(applianceId);

            // 2. Ellenőrizzük, hogy létezik-e, és tényleg abban a helyiségben van-e
            if (existingAppliance == null || existingAppliance.PremiseId != premiseId)
            {
                return false;
            }

            // 3. Eltávolítjuk a helyiségből (null-ra állítjuk a hivatkozást)
            // Megjegyzés: Ez csak akkor működik, ha a PremiseId az entitásodban nullable (int?).
            existingAppliance.PremiseId = null;

            // 4. Frissítjük és mentjük
            _unitOfWork.ApplianceRepository.Update(existingAppliance);
            await _unitOfWork.SaveChangesAsync();

            return true;
        }
    }
}
