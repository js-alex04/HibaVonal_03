using HibaVonal_03.DTOs;

namespace HibaVonal_03.Interfaces
{
    public interface IPremiseService
    {
        Task<PremiseResponseDto> CreatePremiseAsync(PremiseCreateDto premise);
        Task<List<PremiseResponseDto>> GetAllPremisesAsync();
        Task<PremiseResponseDto> GetPremiseByIdAsync(int premiseId);
        Task<PremiseResponseDto> UpdatePremiseAsync(int premiseId, PremiseUpdateDto premise);
        Task DeletePremiseAsync(int premiseId);
        Task<PremiseResponseDto> AddApplianceToPremiseAsync(int premiseId, int applianceId); // Berendezés (pl. mosógép) hozzárendelése a szobához
        Task DeleteApplianceFromPremiseAsync(int premiseId, int applianceId); // Berendezés eltávolítása a szobából
    }
}