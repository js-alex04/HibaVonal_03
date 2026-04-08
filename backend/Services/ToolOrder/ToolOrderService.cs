using HibaVonal_03.DTOs.ToolOrder;
using HibaVonal_03.Interfaces.ToolOrder;
using HibaVonal_03.Repositories;

namespace HibaVonal_03.Services.ToolOrder
{
    public class ToolOrderService : IToolOrderService
    {
        private readonly IUnitOfWork _unitOfWork;

        public ToolOrderService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        //CRUD operations for ToolOrder
        //Create
        public async Task<ToolOrderResponseDto> CreateToolOrderAsync(ToolOrderCreateDto toolOrder)
        {
            if (await _unitOfWork.FaultRepository.GetByIdAsync(toolOrder.FaultId) == null)
            {
                throw new ArgumentException($"Fault with ID {toolOrder.FaultId} does not exist.");
            }

            var newOrder = new Entities.ToolOrder
            {
                FaultId = toolOrder.FaultId,
                ToolName = toolOrder.ToolName,
                Quantity = toolOrder.Quantity,
                Date = DateTime.UtcNow,
                IsDelivered = false
            };

            await _unitOfWork.ToolOrderRepository.AddAsync(newOrder);
            await _unitOfWork.SaveChangesAsync();

            return new ToolOrderResponseDto
            {
                Id = newOrder.Id,
                FaultId = toolOrder.FaultId,
                ToolName = newOrder.ToolName,
                Quantity = newOrder.Quantity,
                Date = newOrder.Date,
                IsDelivered = newOrder.IsDelivered
            };
        }

        //Read
        public async Task<List<ToolOrderResponseDto>> GetAllToolOrdersAsync()
        {
            var allOrders = await _unitOfWork.ToolOrderRepository.GetAllAsync();

            return allOrders.Select(order => new ToolOrderResponseDto
            {
                Id = order.Id,
                FaultId = order.FaultId,
                ToolName = order.ToolName,
                Quantity = order.Quantity,
                Date = order.Date,
                IsDelivered = order.IsDelivered
            }).ToList();
        }

        public async Task<ToolOrderResponseDto> GetToolOrderByIdAsync(int id)
        {
            var orderById = await _unitOfWork.ToolOrderRepository.GetByIdAsync(id);

            if (orderById == null)
            {
                return null;
            }

            return new ToolOrderResponseDto
            {
                Id = orderById.Id,
                FaultId = orderById.FaultId,
                ToolName = orderById.ToolName,
                Quantity = orderById.Quantity,
                Date = orderById.Date,
                IsDelivered = orderById.IsDelivered
            };
        }

        //Update
        public async Task<bool> UpdateToolOrderAsync(int id, ToolOrderUpdateDto toolOrder)
        {
            var existingOrder = await _unitOfWork.ToolOrderRepository.GetByIdAsync(id);
            
            if (existingOrder == null)
            {
                return false;
            }
            else
            {
                existingOrder.ToolName = toolOrder.ToolName;
                existingOrder.Quantity = toolOrder.Quantity;
                _unitOfWork.ToolOrderRepository.Update(existingOrder);
                await _unitOfWork.SaveChangesAsync();
                return true;
            }
        }

        //Delete
        public async Task<bool> DeleteToolOrderAsync(int id)
        {
            var orderToDelete = await _unitOfWork.ToolOrderRepository.GetByIdAsync(id);

            if (orderToDelete == null)
            {
                return false; 
            }
            else
            {
                _unitOfWork.ToolOrderRepository.Delete(orderToDelete);
                await _unitOfWork.SaveChangesAsync();
                return true;
            }
        }


        // Specific operations for ToolOrder      
        public async Task<bool> UpdateDeliveryStatusAsync(int id, bool isDelivered)
        {
            var existingOrder = await _unitOfWork.ToolOrderRepository.GetByIdAsync(id);

            if (existingOrder == null)
            {
                return false;
            }
            else
            {
                existingOrder.IsDelivered = isDelivered;
                _unitOfWork.ToolOrderRepository.Update(existingOrder);
                await _unitOfWork.SaveChangesAsync();
                return true;
            }
        }

        public async Task<List<ToolOrderResponseDto>> GetToolOrdersByFaultIdAsync(int faultId)
        {
            var allOrders = await _unitOfWork.ToolOrderRepository.GetAllAsync();
            var ordersByFaultId = allOrders.Where(order => order.FaultId == faultId);

            return ordersByFaultId.Select(order => new ToolOrderResponseDto
            {
                Id = order.Id,
                FaultId = order.FaultId,
                ToolName = order.ToolName,
                Quantity = order.Quantity,
                Date = order.Date,
                IsDelivered = order.IsDelivered
            }).ToList();
        }

        public async Task<List<ToolOrderResponseDto>> GetPendingOrdersAsync()
        {
            var allOrders = await _unitOfWork.ToolOrderRepository.GetAllAsync();
            var pendingOrders = allOrders.Where(order => !order.IsDelivered);

            return pendingOrders.Select(order => new ToolOrderResponseDto
            {
                Id = order.Id,
                FaultId = order.FaultId,
                ToolName = order.ToolName,
                Quantity = order.Quantity,
                Date = order.Date,
                IsDelivered = order.IsDelivered
            }).ToList();
        }
    }
}
