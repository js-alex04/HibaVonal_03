namespace HibaVonal_03.Entities
{
    public class Appliance
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public int PremiseId { get; set; }
        public Premise Premise { get; set; }
        public ICollection<Fault> Faults { get; set; } = new List<Fault>();

        protected Appliance() { } // Parameterless constructor for EF Core
        public Appliance(int id, string name)
        {
            Id = id;
            Name = name;
        }
    }
}
