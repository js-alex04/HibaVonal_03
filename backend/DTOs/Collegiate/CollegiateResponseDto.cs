namespace HibaVonal_03.DTOs
{
    public class CollegiateResponseDto : UserResponseDto
    {
        public int DormRoomId { get; set; }
        public List<int> ReportedFaultIds { get; set; } = new List<int>();
        public List<int> FeedbackIds { get; set; } = new List<int>();
    }
}