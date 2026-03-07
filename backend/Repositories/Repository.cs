using HibaVonal_03.Context;
using Microsoft.EntityFrameworkCore;

namespace HibaVonal_03.Repositories
{
    public class Repository<T> : IRepository<T> where T : class
    {
        // protected because we want to allow derived classes (specific repositories) to access the context and dbSet, but not outside of the repository layer
        protected readonly HibaVonalDbContext _context;
        protected readonly DbSet<T> _dbSet;

        public Repository(HibaVonalDbContext context)
        {
            _context = context;
            _dbSet = context.Set<T>(); // this allows us to get the DbSet for the specific entity type T, so we can perform CRUD operations on it without needing to know the specific DbSet property in the context (e.g., _context.Users, _context.Faults, etc.)
        }

        public async Task<T?> GetByIdAsync(int id)
        {
            return await _dbSet.FindAsync(id);
        }

        public async Task<IEnumerable<T>> GetAllAsync()
        {
            return await _dbSet.ToListAsync();
        }

        public async Task AddAsync(T entity)
        {
            await _dbSet.AddAsync(entity);
        }

        public void Update(T entity)
        {
            _dbSet.Update(entity);
        }

        public void Delete(T entity)
        {
            _dbSet.Remove(entity);
        }
    }
}