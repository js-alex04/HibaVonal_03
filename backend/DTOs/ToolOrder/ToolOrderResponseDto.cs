namespace HibaVonal_03.DTOs.ToolOrder
{
    public class ToolOrderResponseDto
    {
        public int Id { get; set; }
        public int FaultId { get; set; }
        public string ToolName { get; set; } = null!;
        public int Quantity { get; set; }
        public DateTime Date { get; set; }
        public bool IsDelivered { get; set; }
    }
}
