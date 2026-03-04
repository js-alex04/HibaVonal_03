namespace HibaVonal_03.Entities
{
    public class Fault
    {
        public int Id { get; set; }
        public string Place { get; set; } = null!; // where the problem occurred (room/location)
        public string Description { get; set; } = null!;
        public string? Specialization { get; set; } // required specialist (e.g., fűtés, viz-gáz, villany)
        public DateTime Date { get; set; }
        public FaultStatus Status { get; set; }
        public Maintenance AssignedMaintenance { get; set; }
    }
}
