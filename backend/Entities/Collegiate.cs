namespace HibaVonal_03.Entities
{
    public class Collegiate : User
    {
        public int DormRoomId { get; set; }
        public Premise DormRoom { get; set; } // the dorm room where the collegiate lives

        public ICollection<Fault> ReportedFaults { get; set; } = new List<Fault>();
        public ICollection<Feedback> Feedbacks { get; set; } = new List<Feedback>();

        protected Collegiate() : base() { } // Parameterless constructor for EF Core

        public Collegiate(int id, string name, string email, string password, Premise room)
            : base(id, name, email, password, Role.Collegiate)
        {
            DormRoomId = room.Id;
            DormRoom = room;
        }
    }
}