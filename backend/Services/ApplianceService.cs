using AutoMapper;
using HibaVonal_03.DTOs;
using HibaVonal_03.Interfaces;
using HibaVonal_03.Repositories;

namespace HibaVonal_03.Services
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

        public async Task<ApplianceResponseDto> CreateApplianceAsync(ApplianceCreateDto appliance)
        {
            // 1. lépés: Ellenőrizzük, hogy a megadott helyiség létezik-e
            var premiseExists = await _unitOfWork.PremiseRepository.GetByIdAsync(appliance.PremiseId) 
                ?? throw new KeyNotFoundException($"A helyiség a megadott azonosítóval ({appliance.PremiseId}) nem létezik.");

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
        public async Task<ApplianceResponseDto> GetApplianceByIdAsync(int applianceId)
        {
            // 1. lépés: Lekérjük a berendezést az adatbázisból az ID alapján
            var applianceById = await _unitOfWork.ApplianceRepository.GetByIdAsync(applianceId, includeProperties: "Premise")
                ?? throw new KeyNotFoundException($"A berendezés a megadott azonosítóval ({applianceId}) nem létezik.");

            // 2. lépés: Leképezzük az entitást DTO-ra és visszaadjuk
            return _mapper.Map<ApplianceResponseDto>(applianceById);
        }

        // Update
        public async Task<ApplianceResponseDto> UpdateApplianceAsync(int applianceId, ApplianceUpdateDto appliance)
        {
            // 1. lépés: Lekérjük a berendezést az adatbázisból az ID alapján
            var existingAppliance = await _unitOfWork.ApplianceRepository.GetByIdAsync(applianceId)
                ?? throw new KeyNotFoundException($"A berendezés a megadott azonosítóval ({applianceId}) nem létezik.");

            // 2. lépés: Mappeljük a DTO-t a meglévő entitásra
            _mapper.Map(appliance, existingAppliance);
            _unitOfWork.ApplianceRepository.Update(existingAppliance);
            await _unitOfWork.SaveChangesAsync();

            //3. lépés: Visszaadjuk a frissített berendezést DTO formátumban
            return _mapper.Map<ApplianceResponseDto>(existingAppliance);
        }

        // Delete
        public async Task DeleteApplianceAsync(int applianceId)
        {
            // 1. lépés: Lekérjük a berendezést az adatbázisból az ID alapján
            var applianceToDelete = await _unitOfWork.ApplianceRepository.GetByIdAsync(applianceId)
                ?? throw new KeyNotFoundException($"A berendezés a megadott azonosítóval ({applianceId}) nem létezik.");

            // 2. lépés: Töröljük a berendezést az adatbázisból
            _unitOfWork.ApplianceRepository.Delete(applianceToDelete);
            await _unitOfWork.SaveChangesAsync();
        }
    }
}
