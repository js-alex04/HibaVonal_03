using HibaVonal_03.Entities;

namespace HibaVonal_03.DTOs.Premise
{
    public class PremiseCreateDto
    {
        public int Floor { get; set; }
        public PremiseType Type { get; set; }
        public string NameOrNumber { get; set; } = null!;
    }
}
