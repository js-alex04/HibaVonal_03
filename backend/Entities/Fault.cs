using System;

namespace HibaVonal_03.Entities
{
    public enum FaultStatus
    {
        Pending, // A hiba bejelentése megtörtént, de még nem kezdődött meg a javítási folyamat.
        InProgress, // A hiba jelenleg javítás alatt áll, és a folyamat még nem fejeződött be.
        AwaitingParts, // A javítás szünetel, amíg a szükséges alkatrészek rendelkezésre nem állnak.
        Repaired, // A hiba sikeresen javítva lett, és a probléma megoldódott.
        Unrepairable // A hiba nem javítható, és cserét vagy további visszajelzést igényelhet.
    }

    public class Fault
    {
        public int Id { get; set; } // Azonosító, elsődleges kulcs
        public string Description { get; set; } = null!; // A hiba részletes leírása, amely segít a karbantartónak megérteni a problémát és annak 
        public string Documentation { get; set; } = null!; // Dokumentáció a hiba részleteiről, például fényképek vagy egyéb fájlok hivatkozása, amelyek segíthetnek a karbantartónak megérteni a problémát
        public DateTime Date { get; set; } // A hiba bejelentésének dátuma
        public int CollegiateId { get; set; } // Idegen kulcs a Kollégista entitásra
        public Collegiate Collegiate { get; set; } = null!; // Navigációs tulajdonság a Kollégista entitásra
        public int PremiseId { get; set; } // Idegen kulcs a Helyiség entitásra, ahol a hiba előfordult
        public Premise Premise { get; set; } = null!; // Navigációs tulajdonság a Helyiség entitásra, ahol a hiba előfordult
        public int? ApplianceId { get; set; } // Opcionális idegen kulcs a Berendezés entitásra, amely érintett lehet a hiba szempontjából (nem minden hiba kapcsolódik berendezéshez, de ha igen, akkor megadható)
        public Appliance? Appliance { get; set; } // Navigációs tulajdonság a Berendezés entitásra, amely érintett lehet a hiba szempontjából (nem minden hiba kapcsolódik berendezéshez, de ha igen, akkor megadható)
        public int SpecializationId { get; set; } // Idegen kulcs a Karbantartói szakterület entitásra
        public MaintainerSpecialisation Specialization { get; set; } = null!; // Navigációs tulajdonság a Karbantartói szakterület entitásra, amely meghatározza, hogy milyen típusú karbantartó szakértelme szükséges a hiba javításához
        public int? AssignedMaintenanceId { get; set; } // Opcionális idegen kulcs a Karbantartó entitásra, amelyhez a hiba jelenleg rendelve van (nem minden hiba van azonnal karbantartóhoz rendelve, de ha igen, akkor megadható)
        public Maintainer? AssignedMaintenance { get; set; } // Navigációs tulajdonság a Karbantartó entitásra, amelyhez a hiba jelenleg rendelve van (nem minden hiba van azonnal karbantartóhoz rendelve, de ha igen, akkor megadható)
        public FaultStatus Status { get; set; } = FaultStatus.Pending; // A hiba kezdeti állapota, alapértelmezés szerint "Pending"
        public ICollection<Feedback> Feedbacks { get; set; } = new List<Feedback>(); // Navigációs tulajdonság a Visszajelzés entitásra, amely egy gyűjtemény, mert egy hiba több visszajelzést tartalmazhat
        public ICollection<ToolOrder> ToolOrders { get; set; } = new List<ToolOrder>(); // Navigációs tulajdonság az Eszközrendelés entitásra, amely egy gyűjtemény, mert egy hiba több eszközrendelést is tartalmazhat (pl. különböző eszközök rendelése a javítás során)
    }
}
