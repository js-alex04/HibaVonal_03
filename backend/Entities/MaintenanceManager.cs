namespace HibaVonal_03.Entities
{
    public class MaintenanceManager : User
    {
        public List<Fault> CheckFaultFeedbacks()
        {
            return null;
        }
        public List<Maintenance> ListMaintenance()
        {
            return null;
        }
        public void AssignFaultToMaintenance(Fault fault, Maintenance maintenance)
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
