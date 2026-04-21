using System.Linq.Expressions;

namespace HibaVonal_03.Repositories
{
    public interface IRepository<T> where T : class
    {
        Task<T?> GetByIdAsync(int id);
        Task<IEnumerable<T>> GetAllAsync();
        Task<IEnumerable<T>> GetAsync(Expression<Func<T, bool>>? filter = null, string includeProperties = "");
        Task AddAsync(T entity);
        void Update(T entity);
        void Delete(T entity);
        
    }
}