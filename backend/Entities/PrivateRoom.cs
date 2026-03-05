namespace HibaVonal_03.Entities
{
    public class PrivateRoom : Premises
    {
        public int Door { get; set; }
        public PrivateRoom(int id, int floor, int door) : base(id, floor)
        {
            Door = door;
        }
    }
}
