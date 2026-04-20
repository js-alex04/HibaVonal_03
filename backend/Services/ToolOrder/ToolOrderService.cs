using AutoMapper;
using HibaVonal_03.DTOs.ToolOrder;
using HibaVonal_03.Interfaces.ToolOrder;
using HibaVonal_03.Repositories;

namespace HibaVonal_03.Services.ToolOrder
{
    public class ToolOrderService : IToolOrderService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public ToolOrderService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        //CRUD operations for ToolOrder
        //Create
        public async Task<ToolOrderResponseDto> CreateToolOrderAsync(ToolOrderCreateDto toolOrder)
        {
            if (await _unitOfWork.FaultRepository.GetByIdAsync(toolOrder.FaultId) == null)
            {
                throw new ArgumentException($"Fault with ID {toolOrder.FaultId} does not exist.");
            }

            var newOrder = _mapper.Map<Entities.ToolOrder>(toolOrder);
            newOrder.Date = DateTime.UtcNow;
            newOrder.IsDelivered = false;

            await _unitOfWork.ToolOrderRepository.AddAsync(newOrder);
            await _unitOfWork.SaveChangesAsync();

            return _mapper.Map<ToolOrderResponseDto>(newOrder);
        }

        //Read
        public async Task<List<ToolOrderResponseDto>> GetAllToolOrdersAsync()
        {
            var allOrders = await _unitOfWork.ToolOrderRepository.GetAllAsync();

            return _mapper.Map<List<ToolOrderResponseDto>>(allOrders);
        }

        public async Task<ToolOrderResponseDto> GetToolOrderByIdAsync(int id)
        {
            var orderById = await _unitOfWork.ToolOrderRepository.GetByIdAsync(id);

            if (orderById == null)
            {
                return null;
            }

            return _mapper.Map<ToolOrderResponseDto>(orderById);
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
                _mapper.Map(toolOrder, existingOrder);
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
            var ordersByFaultId = allOrders.Where(order => order.FaultId == faultId).ToList();

            return _mapper.Map<List<ToolOrderResponseDto>>(ordersByFaultId);
        }

        public async Task<List<ToolOrderResponseDto>> GetPendingOrdersAsync()
        {
            var allOrders = await _unitOfWork.ToolOrderRepository.GetAllAsync();
            var pendingOrders = allOrders.Where(order => !order.IsDelivered).ToList();

            return _mapper.Map<List<ToolOrderResponseDto>>(pendingOrders);
        }
    }
}