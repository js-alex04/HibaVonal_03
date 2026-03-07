namespace HibaVonal_03.Entities
{
    public class Maintainer : User
    {
        public bool IsAvailable { get; set; }
        public ICollection<MaintainerSpecialisation> MaintenanceProfessions { get; set; } = new List<MaintainerSpecialisation>(); // a maintainer can have multiple specializations, but a specialization can be associated with multiple maintainers
        public ICollection<Fault> AssignedFaults { get; set; } = new List<Fault>(); // a maintainer can have multiple assigned faults, but a fault can only be assigned to one maintainer

        protected Maintainer() : base() { } // Parameterless constructor for EF Core
        public Maintainer(int id, string name, string email, string password, bool isAvailable, List<MaintainerSpecialisation> maintenanceProfessions) : base(id, name, email, password, Role.Maintainer)
        {
            IsAvailable = isAvailable;
            MaintenanceProfessions = maintenanceProfessions;
        }
    }
}
