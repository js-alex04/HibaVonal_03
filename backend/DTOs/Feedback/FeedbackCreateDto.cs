using HibaVonal_03.Entities;

namespace HibaVonal_03.DTOs.Feedback
{
    public class FeedbackCreateDto
    {
        public int FaultId { get; set; }
        public string Text { get; set; } = null!;
    }
}