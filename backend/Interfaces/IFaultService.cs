using HibaVonal_03.DTOs;
using HibaVonal_03.Entities;

namespace HibaVonal_03.Interfaces
{
    public interface IFaultService
    {
        Task<FaultResponseDto> CreateFaultAsync(FaultCreateDto fault, int collegiateId); // Hibajegy beküldése
        Task<List<FaultResponseDto>> GetAllFaultsAsync();
        Task<List<FaultResponseDto>> GetFaultsByCollegiateIdAsync(int collegiateId); // Diák saját hibái
        Task<List<FaultResponseDto>> GetFaultsByMaintainerIdAsync(int maintainerId);  // Karbantartó feladatai
        Task<List<FaultResponseDto>> GetFaultsByStatusAsync(FaultStatus faultStatus);      // Szűrés státusz szerint
        Task<FaultResponseDto> UpdateFaultAsync(int faultId, FaultUpdateDto fault); // Alap adatok (leírás, kép) szerkesztése
        Task<FaultResponseDto> SetFaultSpecialisationAsync(int faultId, int specialisationId); // Szakterület besorolása
        Task<FaultResponseDto> AssignMaintainerAsync(int faultId, int maintainerId); // Karbantartó kijelölése
        Task<FaultResponseDto> UpdateFaultStatusAsync(int faultId, FaultStatus faultStatus); // Státusz (folyamatban, kész) frissítése
        Task DeleteFaultAsync(int faultId);
        Task<FeedbackResponseDto> NewFeedbackAsync(int faultId, FeedbackCreateDto dto); // Visszajelzés írása a lezárt hibára
    }
}