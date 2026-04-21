namespace HibaVonal_03.Interfaces.MaintainerSpecialisation
{
    internal interface IMaintainerSpecialisationService
    {
        Task<MaintainerSpecialisationResponseDto> CreateMaintainerSpecialisationAsync(MaintainerSpecialisationCreateDto maintainerSpecialisation);
        Task<List<MaintainerSpecialisationResponseDto>> GetAllMaintainerSpecialisationAsync();
        Task<MaintainerSpecialisationResponseDto> GetMaintainerSpecialisationByIdAsync(int id);
        Task<bool> UpdateMaintainerSpecialisationAsync(int id, MaintainerSpecialisationUpdateDto maintainerSpecialisation);        
        Task<bool> DeleteMaintainerSpecialisationAsync(int id);
    }
}
