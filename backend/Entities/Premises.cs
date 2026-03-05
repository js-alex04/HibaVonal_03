namespace HibaVonal_03.Entities
{
    public abstract class Premises
    {
        public int Id { get; set; }
        public int Floor { get; set; }
        public List<Appliance> appliances { get; set; } = new();
        public Premises(int id, int floor)
        {
            Id = id;
            Floor = floor;
        }
    }
}
