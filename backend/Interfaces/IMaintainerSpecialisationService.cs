using HibaVonal_03.DTOs.MaintainerSpecialisation;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HibaVonal_03.Interfaces.MaintainerSpecialisation
{
    public interface IMaintainerSpecialisationService
    {
        // CRUD négy alapművelet a MaintainerSpecialisation entitásra vonatkozóan
        Task<MaintainerSpecialisationResponseDto> CreateMaintainerSpecialisationAsync(MaintainerSpecialisationCreateDto maintainerSpecialisation);
        Task<List<MaintainerSpecialisationResponseDto>> GetAllMaintainerSpecialisationsAsync();
        Task<MaintainerSpecialisationResponseDto> GetMaintainerSpecialisationByIdAsync(int id);
        Task<List<MaintainerSpecialisationResponseDto>> GetSpecialisationsByMaintainerIdAsync(int maintainerId);
        Task<bool> UpdateMaintainerSpecialisationAsync(int id, MaintainerSpecialisationUpdateDto maintainerSpecialisation);
        Task<bool> DeleteMaintainerSpecialisationAsync(int id);
    }
}
