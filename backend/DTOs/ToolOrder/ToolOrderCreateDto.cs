namespace HibaVonal_03.DTOs.ToolOrder
{
    public class ToolOrderCreateDto
    {
        public int FaultId { get; set; }
        public string ToolName { get; set; } = null!;
        public int Quantity { get; set; }
    }
}
