namespace HibaVonal_03.Entities
{
    public enum PremiseType
    {
        CommonPlace,
        PrivateRoom
    }
    public class Premise
    {
        public int Id { get; set; }
        public int Floor { get; set; }
        public PremiseType Type { get; set; }
        public string NameOrNumber { get; set; } = null!;
        public ICollection<Appliance> Appliances { get; set; } = new List<Appliance>();
        public ICollection<Fault> OccurredFaults { get; set; } = new List<Fault>();
        public ICollection<Collegiate> Residents { get; set; } = new List<Collegiate>(); // Residents of the premise, only applicable if the premise is a private room (Type == PrivateRoom), a private room can have multiple residents (e.g., roommates), but a collegiate can only live in one private room
        protected Premise() { } // Parameterless constructor for EF Core
        public Premise(int id, int floor, PremiseType type, string nameOrNumber)
        {
            Id = id;
            Floor = floor;
            Type = type;
            NameOrNumber = nameOrNumber;
        }
    }
}
