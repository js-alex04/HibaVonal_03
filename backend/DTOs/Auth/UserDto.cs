namespace HibaVonal_03.DTOs.Auth
{
    public class UserDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Role { get; set; } = null!;

        public List<string>? Specialisations { get; set; }
    }
}