using HibaVonal_03.Context;
using HibaVonal_03.Entities;

namespace HibaVonal_03.Repositories
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly HibaVonalDbContext _context;
        private IRepository<Appliance>? _applianceRepository;
        private IRepository<Fault>? _faultRepository;
        private IRepository<MaintainerSpecialisation>? _maintainerSpecialisationRepository;
        private IRepository<Premise>? _premiseRepository;
        private IRepository<ToolOrder>? _toolOrderRepository;
        private IRepository<User>? _userRepository;

        public UnitOfWork(HibaVonalDbContext context)
        {
            _context = context;
        }
        
        public IRepository<Appliance> ApplianceRepository => _applianceRepository ??= new Repository<Appliance>(_context);
        public IRepository<Fault> FaultRepository => _faultRepository ??= new Repository<Fault>(_context);
        public IRepository<ToolOrder> ToolOrderRepository => _toolOrderRepository ??= new Repository<ToolOrder>(_context);
        public IRepository<User> UserRepository => _userRepository ??= new Repository<User>(_context);

        public IRepository<MaintainerSpecialisation> MaintainerSpecialisationRepository => new Repository<MaintainerSpecialisation>(_context);

        public IRepository<Premise> PremiseRepository => new Repository<Premise>(_context);

        public async Task<int> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync();
        }

        public void Dispose()
        {
            _context.Dispose();
        }
    }
}