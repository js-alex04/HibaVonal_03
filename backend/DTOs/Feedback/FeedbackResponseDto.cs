using HibaVonal_03.Entities;

namespace HibaVonal_03.DTOs.Feedback
{
    public class FeedbackResponseDto
    {
        public int Id { get; set; }
        public int FaultId { get; set; }
        public DateTime Date { get; set; }
        public string Text { get; set; } = null!;
        public string CollegiateEmail { get; set; }
    }
}
