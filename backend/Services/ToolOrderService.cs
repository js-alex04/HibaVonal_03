using AutoMapper;
using Microsoft.EntityFrameworkCore;
using AutoMapper.QueryableExtensions;
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
            return await _unitOfWork.ToolOrderRepository.GetQueryable()
                .ProjectTo<ToolOrderResponseDto>(_mapper.ConfigurationProvider)
                .ToListAsync();
        }

        public async Task<ToolOrderResponseDto> GetToolOrderByIdAsync(int toolOrderId)
        {
            var orderDto = await _unitOfWork.ToolOrderRepository.GetQueryable()
                .Where(o => o.Id == toolOrderId)
                .ProjectTo<ToolOrderResponseDto>(_mapper.ConfigurationProvider)
                .SingleOrDefaultAsync()
                ?? throw new KeyNotFoundException($"Az eszközrendelés a megadott azonosítóval ({toolOrderId}) nem található.");

            return orderDto;
        }

        // Egy adott hiba alapján lekérdezzük a hozzá tartozó rendeléseket
        public async Task<List<ToolOrderResponseDto>> GetToolOrdersByFaultIdAsync(int faultId)
        {
            if (await _unitOfWork.FaultRepository.GetByIdAsync(faultId) == null)
                throw new KeyNotFoundException($"A hiba a megadott azonosítóval ({faultId}) nem található.");

            return await _unitOfWork.ToolOrderRepository.GetQueryable()
                .Where(order => order.FaultId == faultId)
                .ProjectTo<ToolOrderResponseDto>(_mapper.ConfigurationProvider)
                .ToListAsync();
        }

        // Egy adott karbantartóhoz tartozó rendeléseket lekérdezzük
        public async Task<List<ToolOrderResponseDto>> GetToolOrdersByMaintainerIdAsync(int maintainerId)
        {
            if (await _unitOfWork.MaintainerRepository.GetByIdAsync(maintainerId) == null)
                throw new KeyNotFoundException($"A karbantartó a megadott azonosítóval ({maintainerId}) nem található.");

            return await _unitOfWork.ToolOrderRepository.GetQueryable()
                .Where(order => order.Fault.AssignedMaintenanceId == maintainerId)
                .ProjectTo<ToolOrderResponseDto>(_mapper.ConfigurationProvider)
                .ToListAsync();
        }

        // Minden olyan rendelés lekérdezése, amely még nem került kiszállításra
        public async Task<List<ToolOrderResponseDto>> GetPendingToolOrdersAsync()
        {
            return await _unitOfWork.ToolOrderRepository.GetQueryable()
                .Where(order => !order.IsDelivered)
                .ProjectTo<ToolOrderResponseDto>(_mapper.ConfigurationProvider)
                .ToListAsync();
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