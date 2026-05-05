using HibaVonal_03.Entities;

namespace HibaVonal_03.DTOs
{
    public class FaultCreateDto
    {
        public string Description { get; set; } = null!;
        public string Attachment { get; set; } = null!;
        public int PremiseId { get; set; }
        public int? ApplianceId { get; set; }
    }
}