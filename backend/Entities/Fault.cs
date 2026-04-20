using System;

namespace HibaVonal_03.Entities
{
    public enum FaultStatus
    {
        Pending,
        InProgress, // The fault is currently being worked on.
        Repaired, // The fault has been repaired successfully.
        Unrepairable, // The fault cannot be repaired and may require replacement or further assessment.
        AwaitingParts // The repair is on hold until necessary parts are available.
    }

    public class Fault
    {
        public int Id { get; set; }
        public string Description { get; set; } = null!;
        public DateTime Date { get; set; }
        public string Attachments { get; set; } = null!; // description of the problem
        public Collegiate Collegiate { get; set; } = null!; //the person who reported the problem, cannot be null as every fault must be reported by a person
        public int CollegiateId { get; set; }
        public int PremiseId { get; set; }
        public Premise Premise { get; set; } = null!; // where the problem occurred (e.g., dorm room, common area, etc.)
        public int? ApplianceId { get; set; } // foreign key to Appliance, can be null if the fault is not related to a specific appliance
        public Appliance? Appliance { get; set; } // the appliance can be null if the fault is not related to a specific appliance (e.g., a plumbing issue in a common area)
        public FaultStatus Status { get; set; } = FaultStatus.Pending; // default to InProgress when a fault is created
        public int? SpecializationId { get; set; }
        public MaintainerSpecialisation? Specialization { get; set; } = null!; // required specialist (e.g., fűtés, viz-gáz, villany)
        public int? AssignedMaintenanceId { get; set; } // foreign key to Maintainer, can be null because when a fault is first reported, it may not be assigned to a maintainer yet
        public Maintainer? AssignedMaintenance { get; set; } // the maintainer assigned to fix the problem, can be null because when a fault is first reported, it may not be assigned to a maintainer yet
        public ICollection<Feedback> Feedbacks { get; set; } = new List<Feedback>(); // multiple feedbacks can be associated with a single fault, because multiple tries can be made to fix the problem, and each try can have its own feedback
        public ICollection<ToolOrder> ToolOrders { get; set; } = new List<ToolOrder>(); // Navigációs tulajdonság az Eszközrendelés entitásra, amely egy gyűjtemény, mert egy hiba több eszközrendelést is tartalmazhat (pl. különböző eszközök rendelése a javítás során)
    }
}
