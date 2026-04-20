using HibaVonal_03.Context;
using HibaVonal_03.Entities;

namespace HibaVonal_03.Repositories
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly HibaVonalDbContext _context;
        private IRepository<Fault>? _faultRepository;
        private IRepository<ToolOrder>? _toolOrderRepository;
        private IRepository<User>? _userRepository;
        private IRepository<Feedback>? _feedbackRepository;
        private IRepository<MaintainerSpecialisation> _maintainerSpecialisationRepository;
        private IRepository<Maintainer> _maintainerRepository;

        public UnitOfWork(HibaVonalDbContext context)
        {
            _context = context;
        }

        public IRepository<Fault> FaultRepository => _faultRepository ??= new Repository<Fault>(_context);
        public IRepository<ToolOrder> ToolOrderRepository => _toolOrderRepository ??= new Repository<ToolOrder>(_context);
        public IRepository<User> UserRepository => _userRepository ??= new Repository<User>(_context);
        public IRepository<Feedback> FeedbackRepository => _feedbackRepository ??= new Repository<Feedback>(_context);
        public IRepository<MaintainerSpecialisation> MaintainerSpecialisationRepository => _maintainerSpecialisationRepository ??= new Repository<MaintainerSpecialisation>(_context);
        public IRepository<Maintainer> MaintainerRepository => _maintainerRepository ??= new Repository<Maintainer>(_context);

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