using HibaVonal_03.Context;

namespace HibaVonal_03.Repositories
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly HibaVonalDbContext _context;

        public UnitOfWork(HibaVonalDbContext context)
        {
            _context = context;
        }

        public async Task<int> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync(); // this method will save all the changes made to the entities in the context to the database, and return the number of state entries written to the database
        }

        public void Dispose()
        {
            _context.Dispose(); // this will dispose of the context and release any resources it holds (e.g., database connection), which is important to prevent memory leaks and ensure that connections are properly closed when the unit of work is no longer needed
        }
    }
}