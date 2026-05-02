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

        //CRUD négy alapművelet implementációja a ToolOrder entitásra
        //Create
        public async Task<ToolOrderResponseDto> CreateToolOrderAsync(ToolOrderCreateDto toolOrder)
        {
            // 1. lépés: Ellenőrizzük, hogy a megadott hiba létezik-e a rendszerben
            if (await _unitOfWork.FaultRepository.GetByIdAsync(toolOrder.FaultId) == null)
            {
                throw new ArgumentException($"Fault with ID {toolOrder.FaultId} does not exist.");
            }

            // 2. lépés: Létrehozzuk a ToolOrder entitást a DTO alapján, beállítva a szükséges mezőket
            var newOrder = _mapper.Map<Entities.ToolOrder>(toolOrder);
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

        public async Task<ToolOrderResponseDto> GetToolOrderByIdAsync(int id)
        {
            // 1. lépés: Lekérjük a rendelést az adatbázisból az ID alapján
            var orderById = await _unitOfWork.ToolOrderRepository.GetByIdAsync(id);

            // Opcionális: Ellenőrizzük, hogy a rendelés létezik-e
            if (orderById == null)
            {
                throw new KeyNotFoundException($"No tool order found with ID {id}.");
            }

            // 2. lépés: Visszamappeljük a rendelést egy response DTO-ra
            return _mapper.Map<ToolOrderResponseDto>(orderById);
        }

        //Update
        public async Task<bool> UpdateToolOrderAsync(int id, ToolOrderUpdateDto toolOrder)
        {
            // 1. lépés: Ellenőrizzük, hogy a rendelés létezik-e
            var existingOrder = await _unitOfWork.ToolOrderRepository.GetByIdAsync(id);

            // Opcionális: Ellenőrizzük, hogy a megadott hiba létezik-e a rendszerben
            if (existingOrder == null)
            {
                return false;
            }

            // 2. lépés: Frissítjük a rendelést a DTO alapján
            _mapper.Map(toolOrder, existingOrder);
            _unitOfWork.ToolOrderRepository.Update(existingOrder);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        //Delete
        public async Task<bool> DeleteToolOrderAsync(int id)
        {
            // 1. lépés: Ellenőrizzük, hogy a rendelés létezik-e
            var orderToDelete = await _unitOfWork.ToolOrderRepository.GetByIdAsync(id);

            // Opcionális: Ellenőrizzük, hogy a rendelés létezik-e
            if (orderToDelete == null)
            {
                return false;
            }

            // 2. lépés: Töröljük a rendelést az adatbázisból
            _unitOfWork.ToolOrderRepository.Delete(orderToDelete);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }


        // Feladat specifikáció alapján további metódusok implementációja
        // Egy rendelés szállítási státuszának frissítése
        public async Task<bool> UpdateDeliveryStatusAsync(int id, bool isDelivered)
        {
            // 1. lépés: Ellenőrizzük, hogy a rendelés létezik-e
            var existingOrder = await _unitOfWork.ToolOrderRepository.GetByIdAsync(id);

            // Opcionális: Ellenőrizzük, hogy a rendelés létezik-e
            if (existingOrder == null)
            {
                return false;
            }

            // 2. lépés: Frissítjük a rendelés szállítási státuszát
            existingOrder.IsDelivered = isDelivered;
            _unitOfWork.ToolOrderRepository.Update(existingOrder);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        // Egy adott hiba alapján lekérdezzük a hozzá tartozó rendeléseket
        public async Task<List<ToolOrderResponseDto>> GetToolOrdersByFaultIdAsync(int faultId)
        {
            // 1. lépés: Lekérjük az összes rendelést az adatbázisból
            var allOrders = await _unitOfWork.ToolOrderRepository.GetAllAsync();
            var ordersByFaultId = allOrders.Where(order => order.FaultId == faultId).ToList();

            // 2. lépés: Visszamappeljük a rendeléseket egy listára a response DTO-kból
            return _mapper.Map<List<ToolOrderResponseDto>>(ordersByFaultId);
        }

        // Minden olyan rendelés lekérdezése, amely még nem került kiszállításra
        public async Task<List<ToolOrderResponseDto>> GetPendingOrdersAsync()
        {
            // 1. lépés: Lekérjük az összes rendelést az adatbázisból
            var allOrders = await _unitOfWork.ToolOrderRepository.GetAllAsync();
            var pendingOrders = allOrders.Where(order => !order.IsDelivered).ToList();

            // 2. lépés: Visszamappeljük a rendeléseket egy listára a response DTO-kból
            return _mapper.Map<List<ToolOrderResponseDto>>(pendingOrders);
        }
    }
}