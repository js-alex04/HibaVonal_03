namespace HibaVonal_03.Entities
{
    public class PrivateRoom : Premise
    {
        public int RoomNumber { get; set; }
        public ICollection<Collegiate> Residents { get; set; } = new List<Collegiate>(); // the collegiates who live in this private room, a private room can have multiple collegiates (e.g., roommates), but a collegiate can only live in one private room

        protected PrivateRoom() : base() { } // Parameterless constructor for EF Core
        public PrivateRoom(int id, int floor, int roomNumber) : base(id, floor, PremiseType.PrivateRoom)
        {
            RoomNumber = roomNumber;
        }
    }
}
