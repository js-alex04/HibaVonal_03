using HibaVonal_03.Entities;

namespace HibaVonal_03.Repositories
{
    // the IDisposable interface is implemented to allow the UnitOfWork to be used in a using statement,
    // which ensures that the resources (e.g., database connection) are properly disposed of when the unit of work is no longer needed
    public interface IUnitOfWork : IDisposable
    {
        IRepository<Fault> FaultRepository { get; }
        IRepository<ToolOrder> ToolOrderRepository { get; }
        IRepository<User> UserRepository { get; }
        IRepository<Feedback> FeedbackRepository {  get; }
        IRepository<MaintainerSpecialisation> MaintainerSpecialisationRepository { get; }
        IRepository<Maintainer> MaintainerRepository { get; }

        Task<int> SaveChangesAsync();
    }
}