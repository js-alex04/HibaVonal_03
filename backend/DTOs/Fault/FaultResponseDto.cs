using HibaVonal_03.DTOs.Feedback;
using HibaVonal_03.DTOs.ToolOrder;
using HibaVonal_03.Entities;

namespace HibaVonal_03.DTOs.Fault
{
    public class FaultResponseDto
    {
        public int Id { get; set; }
        public string Description { get; set; } = null!;
        public string Attachment { get; set; } = null!;
        public DateTime Date { get; set; }
        public int CollegiateId { get; set; }
        public string CollegiateEmail { get; set; } = null!;
        public int PremiseId { get; set; }
        public string PremiseName { get; set; } = null!;
        public int? ApplianceId { get; set; }
        public string? ApplianceName { get; set; }
        public int? SpecializationId { get; set; }
        public string? SpecializationName { get; set; }
        public int? AssignedMaintenanceId { get; set; }
        public string? AssignedMaintenanceEmail { get; set; }
        public FaultStatus Status { get; set; }
        public List<FeedbackResponseDto>? Feedbacks { get; set; }
        public List<ToolOrderResponseDto>? ToolOrders { get; set; }
    }
}