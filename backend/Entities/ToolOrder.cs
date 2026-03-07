namespace HibaVonal_03.Entities
{
    public class ToolOrder
    {
        public int Id { get; set; }
        public DateTime Date { get; set; }
        public string ToolName { get; set; } = null!;
        public int Quantity { get; set; }
        public bool IsDelivered { get; set; }
    }
}
