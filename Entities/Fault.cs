namespace HibaVonal_03.Entities
{
    public class Fault
    {
        public int Id { get; set; }
        public string Place { get; set; } = null!;
        public string Description { get; set; } = null!;
        public DateTime Date { get; set; }
        public FaultStatus Status { get; set; }
        public Maintenance AssignedMaintenance { get; set; }
    }
}
