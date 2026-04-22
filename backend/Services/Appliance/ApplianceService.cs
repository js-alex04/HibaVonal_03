using AutoMapper;
using HibaVonal_03.DTOs.Appliance;
using HibaVonal_03.Interfaces.Appliance;
using HibaVonal_03.Repositories;

namespace HibaVonal_03.Services.Appliance
{
    public class ApplianceService : IApplianceService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public ApplianceService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        // CRUD négy alapművelet implementációja az Appliance entitásra
        // Create
        public async Task<ApplianceResponseDto> CreateApplianceAsync(ApplianceCreateDto appliance)
        {
            // 1. lépés: Ellenőrizzük, hogy a megadott helyiség létezik-e
            var premiseExists = await _unitOfWork.PremiseRepository.GetByIdAsync(appliance.PremiseId);
            if (premiseExists == null)
            {
                throw new ArgumentException($"A premise with ID {appliance.PremiseId} does not exist.");
            }

            // 2. lépés: Leképezzük a DTO-t az Appliance entitásra
            var newAppliance = _mapper.Map<Entities.Appliance>(appliance);

            // 3. lépés: Hozzáadjuk az új berendezést az adatbázishoz
            await _unitOfWork.ApplianceRepository.AddAsync(newAppliance);
            await _unitOfWork.SaveChangesAsync();

            // 4. lépés: Visszaadjuk a létrehozott berendezést DTO formátumban
            return _mapper.Map<ApplianceResponseDto>(newAppliance);
        }

        // Read
        public async Task<List<ApplianceResponseDto>> GetAllAppliancesAsync()
        {
            // 1. lépés: Lekérjük az összes berendezést az adatbázisból
            var allAppliances = await _unitOfWork.ApplianceRepository.GetAllAsync(includeProperties: "Premise");

            // 2. lépés: Leképezzük az entitásokat DTO-kra és visszaadjuk a listát
            return _mapper.Map<List<ApplianceResponseDto>>(allAppliances);
        }

        // Read by ID
        public async Task<ApplianceResponseDto> GetApplianceByIdAsync(int id)
        {
            // 1. lépés: Lekérjük a berendezést az adatbázisból az ID alapján
            var applianceById = await _unitOfWork.ApplianceRepository.GetByIdAsync(id, includeProperties: "Premise");

            // Opcionális: Ellenőrizzük, hogy a berendezés létezik-e
            if (applianceById == null)
            {
                throw new KeyNotFoundException($"An appliance with ID {id} was not found.");
            }

            // 2. lépés: Leképezzük az entitást DTO-ra és visszaadjuk
            return _mapper.Map<ApplianceResponseDto>(applianceById);
        }

        // Update
        public async Task<bool> UpdateApplianceAsync(int id, ApplianceUpdateDto appliance)
        {
            // 1. lépés: Lekérjük a berendezést az adatbázisból az ID alapján
            var existingAppliance = await _unitOfWork.ApplianceRepository.GetByIdAsync(id);

            // Opcionális: Ellenőrizzük, hogy a berendezés létezik-e
            if (existingAppliance == null)
            {
                return false;
            }

            // 2. lépés: Mappeljük a DTO-t a meglévő entitásra
            _mapper.Map(appliance, existingAppliance);
            _unitOfWork.ApplianceRepository.Update(existingAppliance);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        // Delete
        public async Task<bool> DeleteApplianceAsync(int id)
        {
            // 1. lépés: Lekérjük a berendezést az adatbázisból az ID alapján
            var applianceToDelete = await _unitOfWork.ApplianceRepository.GetByIdAsync(id);

            // Opcionális: Ellenőrizzük, hogy a berendezés létezik-e
            if (applianceToDelete == null)
            {
                return false;
            }

            // 2. lépés: Töröljük a berendezést az adatbázisból
            _unitOfWork.ApplianceRepository.Delete(applianceToDelete);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }
    }

}
