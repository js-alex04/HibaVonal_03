namespace HibaVonal_03.DTOs.Appliance
{
    public class ApplianceResponseDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public int PremiseId { get; set; }
        public string PremiseNameOrNumber { get; set; } = null!;
    }
}
