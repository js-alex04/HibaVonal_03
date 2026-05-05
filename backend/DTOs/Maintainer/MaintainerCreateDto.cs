namespace HibaVonal_03.DTOs
{
    public class MaintainerCreateDto : UserCreateDto
    {
        public List<int> SpecialisationIds { get; set; } = new List<int>();
    }
}
