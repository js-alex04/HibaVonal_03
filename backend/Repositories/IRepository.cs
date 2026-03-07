namespace HibaVonal_03.Repositories
{
    public interface IRepository<T> where T : class // the T is a class, which means it can be any reference type (e.g., User, Fault, etc.)
    {
        Task<T?> GetByIdAsync(int id);
        Task<IEnumerable<T>> GetAllAsync();
        Task AddAsync(T entity);
        void Update(T entity);
        void Delete(T entity);
    }
}