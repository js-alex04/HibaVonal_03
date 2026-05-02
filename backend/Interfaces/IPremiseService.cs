using HibaVonal_03.DTOs.Premise;

namespace HibaVonal_03.Interfaces.Premise
{
    public interface IPremiseService
    {
        // CRUD négy alapművelet a Premise entitásra vonatkozóan
        Task<PremiseResponseDto> CreatePremiseAsync(PremiseCreateDto premise);
        Task<List<PremiseResponseDto>> GetAllPremisesAsync();
        Task<PremiseResponseDto> GetPremiseByIdAsync(int id);
        Task<bool> UpdatePremiseAsync(int id, PremiseUpdateDto premise);
        Task<bool> DeletePremiseAsync(int id);
    }
}
