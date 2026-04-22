namespace HibaVonal_03.DTOs.Maintainer
{
    public class MaintainerCreateDto
    {
        public string Name { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!;
        public List<int> SpecialisationIds { get; set; } = new List<int>();
    }
}
