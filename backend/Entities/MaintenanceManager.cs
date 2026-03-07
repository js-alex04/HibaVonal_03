namespace HibaVonal_03.Entities
{
    public class MaintenanceManager : User
    {
        protected MaintenanceManager() : base() { } // Parameterless constructor for EF Core
        public MaintenanceManager(int id, string name, string email, string password) : base(id, name, email, password, Role.MaintenanceManager)
        {
        }

        public List<Fault> CheckFaultFeedbacks()
        {
            return null;
        }
        public List<Maintainer> ListMaintenance()
        {
            return null;
        }
        public void AssignFaultToMaintenance(Fault fault, Maintainer maintenance)
        {

        }
        public void ModifyFaultStatus(Fault fault, FaultStatus newStatus)
        {

        }
        public List<ToolOrder> CheckToolOrder()
        {
            return null;
        }
    }
}
