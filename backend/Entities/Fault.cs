namespace HibaVonal_03.Entities
{
    public class Fault
    {
        public int Id { get; set; }
        public string Description { get; set; } = null!;
        public DateTime Date { get; set; }
        public string Documentation { get; set; }
        public Collegiate collegiate { get; set; }
        public Premises premise { get; set; } = null!; // where the problem occurred (room/location)
        public Appliance appliance { get; set; }
        public FaultStatus Status { get; set; }
        public MaintainerSpecialisation Specialization { get; set; } // required specialist (e.g., fűtés, viz-gáz, villany)
        public Maintainer AssignedMaintenance { get; set; } = null!;
        public Feedback Feedback { get; set; } = null!;
    }
}
