using AutoMapper;
using HibaVonal_03.DTOs;
using HibaVonal_03.Interfaces;
using HibaVonal_03.Repositories;

namespace HibaVonal_03.Services
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

        //Create
        public async Task<ToolOrderResponseDto> CreateToolOrderAsync(int faultId, ToolOrderCreateDto toolOrder)
        {
            // 1. lépés: Ellenőrizzük, hogy a megadott hiba létezik-e a rendszerben
            var existingFault = await _unitOfWork.FaultRepository.GetByIdAsync(faultId)
                ?? throw new KeyNotFoundException($"A hiba a megadott azonosítóval ({faultId}) nem található.");

            // 2. lépés: Létrehozzuk a ToolOrder entitást a DTO alapján, beállítva a szükséges mezőket
            var newOrder = _mapper.Map<Entities.ToolOrder>(toolOrder);

            newOrder.FaultId = faultId;
            newOrder.Date = DateTime.UtcNow;
            newOrder.IsDelivered = false;

            // 3. lépés: Elmentjük az új rendelést az adatbázisba
            await _unitOfWork.ToolOrderRepository.AddAsync(newOrder);
            await _unitOfWork.SaveChangesAsync();

            // 4. lépés: Visszamappeljük a létrehozott rendelést egy response DTO-ra
            return _mapper.Map<ToolOrderResponseDto>(newOrder);
        }

        //Read
        public async Task<List<ToolOrderResponseDto>> GetAllToolOrdersAsync()
        {
            // 1. lépés: Lekérjük az összes rendelést az adatbázisból
            var allOrders = await _unitOfWork.ToolOrderRepository.GetAllAsync();

            // 2. lépés: Visszamappeljük a rendeléseket egy listára a response DTO-kból
            return _mapper.Map<List<ToolOrderResponseDto>>(allOrders);
        }

        public async Task<ToolOrderResponseDto> GetToolOrderByIdAsync(int toolOrderId)
        {
            // 1. lépés: Lekérjük a rendelést az adatbázisból az ID alapján
            var orderById = await _unitOfWork.ToolOrderRepository.GetByIdAsync(toolOrderId)
                ?? throw new KeyNotFoundException($"Az eszközrendelés a megadott azonosítóval ({toolOrderId}) nem található.");

            // 2. lépés: Visszamappeljük a rendelést egy response DTO-ra
            return _mapper.Map<ToolOrderResponseDto>(orderById);
        }

        // Egy adott hiba alapján lekérdezzük a hozzá tartozó rendeléseket
        public async Task<List<ToolOrderResponseDto>> GetToolOrdersByFaultIdAsync(int faultId)
        {
            // 1. lépés: Lekérjük a megadott hibát
            var existingFault = await _unitOfWork.FaultRepository.GetByIdAsync(faultId)
                ?? throw new KeyNotFoundException($"A hiba a megadott azonosítóval ({faultId}) nem található.");

            var ordersByFaultId = await _unitOfWork.ToolOrderRepository.GetAsync(order => order.FaultId == faultId);

            // 2. lépés: Visszamappeljük a rendeléseket egy listára a response DTO-kból
            return _mapper.Map<List<ToolOrderResponseDto>>(ordersByFaultId);
        }

        // Minden olyan rendelés lekérdezése, amely még nem került kiszállításra
        public async Task<List<ToolOrderResponseDto>> GetPendingToolOrdersAsync()
        {
            var pendingOrders = await _unitOfWork.ToolOrderRepository.GetAsync(order => !order.IsDelivered);

            return _mapper.Map<List<ToolOrderResponseDto>>(pendingOrders);
        }

        //Update
        public async Task<ToolOrderResponseDto> UpdateToolOrderAsync(int toolOrderId, ToolOrderUpdateDto toolOrder)
        {
            // 1. lépés: Ellenőrizzük, hogy a rendelés létezik-e
            var existingOrder = await _unitOfWork.ToolOrderRepository.GetByIdAsync(toolOrderId)
                ?? throw new KeyNotFoundException($"Az eszközrendelés a megadott azonosítóval ({toolOrderId}) nem található.");

            // 2. lépés: Frissítjük a rendelést a DTO alapján
            _mapper.Map(toolOrder, existingOrder);

            _unitOfWork.ToolOrderRepository.Update(existingOrder);

            await _unitOfWork.SaveChangesAsync();

            return _mapper.Map<ToolOrderResponseDto>(existingOrder);
        }

        // Egy rendelés szállítási státuszának frissítése
        public async Task<ToolOrderResponseDto> UpdateDeliveryStatusAsync(int toolOrderId, bool isDelivered)
        {
            // 1. lépés: Ellenőrizzük, hogy a rendelés létezik-e
            var existingOrder = await _unitOfWork.ToolOrderRepository.GetByIdAsync(toolOrderId)
                ?? throw new KeyNotFoundException($"Az eszközrendelés a megadott azonosítóval ({toolOrderId}) nem található.");

            if (existingOrder.IsDelivered == isDelivered)
                throw new InvalidOperationException($"A rendelés szállítási státusza már {(isDelivered ? "'kiszállítva'" : "'nem kiszállítva'")} értékű.");

            // 2. lépés: Frissítjük a rendelés szállítási státuszát
            existingOrder.IsDelivered = isDelivered;

            _unitOfWork.ToolOrderRepository.Update(existingOrder);

            await _unitOfWork.SaveChangesAsync();

            return _mapper.Map<ToolOrderResponseDto>(existingOrder);
        }

        //Delete
        public async Task DeleteToolOrderAsync(int toolOrderId)
        {
            // 1. lépés: Ellenőrizzük, hogy a rendelés létezik-e
            var orderToDelete = await _unitOfWork.ToolOrderRepository.GetByIdAsync(toolOrderId)
                ?? throw new KeyNotFoundException($"Az eszközrendelés a megadott azonosítóval ({toolOrderId}) nem található.");

            // 2. lépés: Töröljük a rendelést az adatbázisból
            _unitOfWork.ToolOrderRepository.Delete(orderToDelete);

            await _unitOfWork.SaveChangesAsync();
        }
    }
}