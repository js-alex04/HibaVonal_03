using HibaVonal_03.Entities;

namespace HibaVonal_03.DTOs.Fault
{
    public class FaultCreateDto
    {
        public string Description { get; set; } = null!;
        public string Attachments { get; set; } = null!;
        public int PremiseId { get; set; }
        public int? ApplianceId { get; set; }
    }
}
