using HibaVonal_03.Context;
using HibaVonal_03.Entities;

namespace HibaVonal_03.Repositories
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly HibaVonalDbContext _context;
        private IRepository<User>? _userRepository;
        private IRepository<Fault>? _faultRepository;

        public UnitOfWork(HibaVonalDbContext context)
        {
            _context = context;
        }

        public IRepository<User> UserRepository => _userRepository ??= new Repository<User>(_context);
        public IRepository<Fault> FaultRepository => _faultRepository ??= new Repository<Fault>(_context);

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