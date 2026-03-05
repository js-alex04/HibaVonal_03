namespace HibaVonal_03.Entities
{
    public class Appliance
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public Appliance(int id, string name)
        {
            Id = id;
            Name = name;
        }
    }
}
