namespace HibaVonal_03.Entities
{
    public class Maintainer : User
    {
        public bool IsAvailable { get; set; }
        public List<MaintainerSpecialisation> MaintenanceProfessions { get; set; }

        public Maintainer(int id, string name, string email, string password, bool isAvailable, List<MaintainerSpecialisation> maintenanceProfessions) : base(id, name, email, password)
        {
            IsAvailable = isAvailable;
            MaintenanceProfessions = maintenanceProfessions;
        }
    }
}
