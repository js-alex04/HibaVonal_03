namespace HibaVonal_03.Repositories
{
    // the IDisposable interface is implemented to allow the UnitOfWork to be used in a using statement,
    // which ensures that the resources (e.g., database connection) are properly disposed of when the unit of work is no longer needed
    public interface IUnitOfWork : IDisposable
    {
        Task<int> SaveChangesAsync();
    }
}