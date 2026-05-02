using HibaVonal_03.DTOs.ToolOrder;

namespace HibaVonal_03.Interfaces.ToolOrder
{
    public interface IToolOrderService
    {
        // CRUD operations for ToolOrder
        Task<ToolOrderResponseDto> CreateToolOrderAsync(ToolOrderCreateDto toolOrder);
        Task<List<ToolOrderResponseDto>> GetAllToolOrdersAsync();
        Task<ToolOrderResponseDto> GetToolOrderByIdAsync(int id);
        Task<bool> UpdateToolOrderAsync(int id, ToolOrderUpdateDto toolOrder);
        Task<bool> DeleteToolOrderAsync(int id);


        // Specific operations for ToolOrder
        Task<bool> UpdateDeliveryStatusAsync(int id, bool isDelivered);
        Task<List<ToolOrderResponseDto>> GetToolOrdersByFaultIdAsync(int faultId);
        Task<List<ToolOrderResponseDto>> GetPendingOrdersAsync();
    }
}
