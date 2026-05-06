using HibaVonal_03.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HibaVonal_03.Interfaces
{
    public interface IMaintainerSpecialisationService
    {
        Task<MaintainerSpecialisationResponseDto> CreateMaintainerSpecialisationAsync(MaintainerSpecialisationCreateDto maintainerSpecialisation);
        Task<List<MaintainerSpecialisationResponseDto>> GetAllMaintainerSpecialisationsAsync();
        Task<MaintainerSpecialisationResponseDto> GetMaintainerSpecialisationByIdAsync(int maintainerSpecialisationId);
        Task<List<MaintainerSpecialisationResponseDto>> GetSpecialisationsByMaintainerIdAsync(int maintainerId); // Mikhez ért egy adott szakember?
        Task<MaintainerSpecialisationResponseDto> UpdateMaintainerSpecialisationAsync(int maintainerSpecialisationId, MaintainerSpecialisationUpdateDto maintainerSpecialisation);
        Task DeleteMaintainerSpecialisationAsync(int maintainerSpecialisationId);
    }
}