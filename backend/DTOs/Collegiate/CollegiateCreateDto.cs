namespace HibaVonal_03.DTOs.Collegiate
{
    public class CollegiateCreateDto
    {
        public string Name { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!;
        public int DormRoomId { get; set; }
    }
}
