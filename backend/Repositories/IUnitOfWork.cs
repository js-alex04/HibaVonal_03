using HibaVonal_03.Entities;

namespace HibaVonal_03.Repositories
{
    // the IDisposable interface is implemented to allow the UnitOfWork to be used in a using statement,
    // which ensures that the resources (e.g., database connection) are properly disposed of when the unit of work is no longer needed
    public interface IUnitOfWork : IDisposable
    {
        IRepository<Appliance> ApplianceRepository { get; }
        IRepository<Fault> FaultRepository { get; }
        IRepository<MaintainerSpecialisation> MaintainerSpecialisationRepository { get; }

        IRepository<Premise> PremiseRepository { get; }
        IRepository<ToolOrder> ToolOrderRepository { get; }
        IRepository<User> UserRepository { get; }

        Task<int> SaveChangesAsync();
    }
}