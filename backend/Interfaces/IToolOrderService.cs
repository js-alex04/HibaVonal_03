using HibaVonal_03.DTOs;

namespace HibaVonal_03.Interfaces
{
    public interface IToolOrderService
    {
        Task<ToolOrderResponseDto> CreateToolOrderAsync(int faultId, ToolOrderCreateDto toolOrder); // Rendelés leadása egy konkrét hibához
        Task<List<ToolOrderResponseDto>> GetAllToolOrdersAsync();
        Task<ToolOrderResponseDto> GetToolOrderByIdAsync(int toolOrderId);
        Task<List<ToolOrderResponseDto>> GetToolOrdersByFaultIdAsync(int faultId); // Egy adott hibához tartozó összes alkatrész
        Task<List<ToolOrderResponseDto>> GetToolOrdersByMaintainerIdAsync(int maintainerId);
        Task<List<ToolOrderResponseDto>> GetPendingToolOrdersAsync(); // Még meg nem érkezett (függőben lévő) rendelések listája
        Task<ToolOrderResponseDto> UpdateToolOrderAsync(int toolOrderId, ToolOrderUpdateDto toolOrder); // Rendelés adatainak (pl. mennyiség) módosítása
        Task<ToolOrderResponseDto> UpdateDeliveryStatusAsync(int toolOrderId, bool isDelivered); // Kiszállítási státusz (megérkezett/nem) frissítése
        Task DeleteToolOrderAsync(int toolOrderId); // Téves rendelés törlése
    }
}