namespace HibaVonal_03.Entities
{
    public class MaintenanceManager : User
    {
        protected MaintenanceManager() : base() { }
        public MaintenanceManager(int id, string name, string email, string password)
            : base(id, name, email, password, Role.MaintenanceManager) { }
    }
}