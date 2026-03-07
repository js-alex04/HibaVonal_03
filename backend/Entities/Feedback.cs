namespace HibaVonal_03.Entities
{
    public class Feedback
    {
        public int Id { get; set; }
        public int FaultId { get; set; }
        public Fault Fault { get; set; } = null!; // which fault the feedback is related to
        public DateTime Date { get; set; } // when the feedback was submitted
        public string Text { get; set; } = null!; // the content of the feedback
        public int CollegiateId { get; set; }
        public Collegiate Collegiate { get; set; } = null!; // which collegiate submitted the feedback
    }
}
