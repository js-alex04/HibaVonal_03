namespace HibaVonal_03.Entities
{
    public enum PremiseType
    {
        CommonPlace,
        PrivateRoom
    }
    public abstract class Premise
    {
        public int Id { get; set; }
        public int Floor { get; set; }
        public PremiseType Type { get; set; }
        public ICollection<Appliance> Appliances { get; set; } = new List<Appliance>();
        public ICollection<Fault> OccurredFaults { get; set; } = new List<Fault>();

        protected Premise() { } // Parameterless constructor for EF Core
        public Premise(int id, int floor, PremiseType type)
        {
            Id = id;
            Floor = floor;
            Type = type;
        }
    }
}
