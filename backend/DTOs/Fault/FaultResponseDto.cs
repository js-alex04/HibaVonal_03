using HibaVonal_03.Entities;

namespace HibaVonal_03.DTOs.Fault
{
    public class FaultResponseDto
    {
        public int Id { get; set; }
        public string Description { get; set; } = null!;
        public DateTime Date { get; set; }
        public string Attachments { get; set; } = null!;
        public string CollegiateEmail { get; set; } = null!;
        public string Premise { get; set; } 
        public string? Appliance { get; set; }
        public FaultStatus Status { get; set; } = FaultStatus.Pending;
        public string? Specialization { get; set; }
        public string? AssignedMaintenance { get; set; }
        public ICollection<Entities.Feedback>? Feedbacks { get; set; }
        public ICollection<Entities.ToolOrder>? ToolOrders { get; set; }
    }
}
