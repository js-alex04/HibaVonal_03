namespace HibaVonal_03.DTOs
{
    public class MaintainerResponseDto : UserResponseDto
    {
        public bool IsAvailable { get; set; }
        public List<string> Specialisations { get; set; } = new List<string>();
    }
}