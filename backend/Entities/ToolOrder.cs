namespace HibaVonal_03.Entities
{
    public class ToolOrder
    {
        public int Id { get; set; } // Azonosító, elsődleges kulcs
        public int FaultId { get; set; } // Idegen kulcs a Hiba entitásra
        public Fault Fault { get; set; } = null!; // Navigációs tulajdonság a Hiba entitásra
        public string ToolName { get; set; } = null!; // A rendelni kívánt eszköz neve, nem lehet üres
        public int Quantity { get; set; } // A rendelni kívánt eszköz mennyisége
        public DateTime Date { get; set; } // A rendelés dátuma
        public bool IsDelivered { get; set; } // A rendelés állapota, hogy megérkezett-e már
    }
}
