namespace HibaVonal_03.Entities
{
    public class Collegiate : User
    {
        public PrivateRoom DormRoom { get; set; }
        public List<Fault> ReportedFaults { get; set; } = new();
        public List<Feedback> Feedbacks { get; set; } = new();
        public Collegiate(int id, string name, string email, string password, PrivateRoom room) : base(id, name, email, password)
        {
            DormRoom = room;
        }

        public void ReportFault()
        {

        }
        public void EditFault(Fault fault)
        {

        }
        public FaultStatus ShowFaultStatus()
        {
            return null;
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
