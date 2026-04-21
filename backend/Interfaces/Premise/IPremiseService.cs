using System;
using System.Collections.Generic;
using System.Text;
using HibaVonal_03.DTOs;

namespace HibaVonal_03.Interfaces.Premise
{
    internal interface IPremiseService
    {
        Task<PremiseResponseDto> CreatePremiseAsync(PremiseCreateDto premise);
        Task<List<PremiseResponseDto>> GetAllPremiseAsync();
        Task<PremiseResponseDto> GetPremiseByIdAsync(int id);
        Task<bool> UpdatePremiseAsync(int id, PremiseUpdateDto premise);        
        Task<bool> DeletePremiseAsync(int id);
    }
}
