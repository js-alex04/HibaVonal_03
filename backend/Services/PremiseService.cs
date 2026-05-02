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
    }
}
