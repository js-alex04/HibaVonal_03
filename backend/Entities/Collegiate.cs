namespace HibaVonal_03.Entities
{
    public class Collegiate : User
    {
        public int DormRoomId { get; set; }
        public Premise DormRoom { get; set; } // the dorm room where the collegiate lives
        public ICollection<Fault> ReportedFaults { get; set; } = new List<Fault>(); // the faults that the collegiate has reported
        public ICollection<Feedback> Feedbacks { get; set; } = new List<Feedback>(); // the feedbacks that the collegiate has submitted

        protected Collegiate() : base() { } // Parameterless constructor for EF Core
        public Collegiate(int id, string name, string email, string password, Premise room): base(id, name, email, password, Role.Collegiate)
        {
            DormRoomId = room.Id;
            DormRoom = room;
        }
        public void EditFault(Fault fault)
        {

        }
        public FaultStatus? ShowFaultStatus()
        {
            return null; // for now
        }
        public void SubmitFeedback(Fault fault, Feedback feedback)
        {

        }
        public List<Fault> ListFaults()
        {
            return null;
        }
        public List<Fault> FilterFaults(string param)
        {
            return null;
        }
    }
}
