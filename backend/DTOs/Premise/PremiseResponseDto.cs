namespace HibaVonal_03.DTOs.Premise
{
    public class PremiseResponseDto
    {
        public int Id { get; set; }
        public int Floor { get; set; }
        public string Type { get; set; } = null!; // Enumot stringként küldjük a válaszban, hogy könnyebben kezelhető legyen a frontend számára
        public string NameOrNumber { get; set; } = null!;
    }
}
