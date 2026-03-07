using HibaVonal_03.Entities;
using Microsoft.EntityFrameworkCore;

namespace HibaVonal_03.Context
{
    public class HibaVonalDbContext : DbContext
    {
        public DbSet<Administrator> Administrators { get; set; }
        public DbSet<Appliance> Appliances { get; set; }
        public DbSet<Collegiate> Collegiates { get; set; }
        public DbSet<CommonPlace> CommonPlaces { get; set; }
        public DbSet<Fault> Faults { get; set; }
        public DbSet<Feedback> Feedbacks { get; set; }
        public DbSet<Maintainer> Maintainers { get; set; }
        public DbSet<MaintainerSpecialisation> MaintainerSpecialisations { get; set; }
        public DbSet<MaintenanceManager> MaintenanceManagers { get; set; }
        public DbSet<Premise> Premises { get; set; }
        public DbSet<PrivateRoom> PrivateRooms { get; set; }
        public DbSet<ToolOrder> ToolOrders { get; set; }
        public DbSet<User> Users { get; set; }

        public HibaVonalDbContext(DbContextOptions<HibaVonalDbContext> options) : base(options) { }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Configure the User entity to use Table-Per-Hierarchy (TPH) inheritance
            modelBuilder.Entity<User>()
                .HasDiscriminator(u => u.Role) // Use the Role property to determine the type of user
                .HasValue<Collegiate>(Role.Collegiate) // Collegiate users will have Role = Collegiate
                .HasValue<Maintainer>(Role.Maintainer) // Maintainer users will have Role = Maintainer
                .HasValue<MaintenanceManager>(Role.MaintenanceManager) // Maintenance Manager users will have Role = MaintenanceManager
                .HasValue<Administrator>(Role.Administrator); // Administrator users will have Role = Administrator

            modelBuilder.Entity<Collegiate>()
                .HasOne(c => c.DormRoom) // a collegiate has one dorm room
                .WithMany(r => r.Residents) // a dorm room can have multiple residents (collegiates)
                .HasForeignKey(c => c.DormRoomId); // the key between the two tables

            // Configure the Premise entity to use Table-Per-Hierarchy (TPH) inheritance
            modelBuilder.Entity<Premise>()
                .HasDiscriminator(p => p.Type) // Use the Type property to determine the type of premise
                .HasValue<PrivateRoom>(PremiseType.PrivateRoom) // Private rooms will have Type = PrivateRoom
                .HasValue<CommonPlace>(PremiseType.CommonPlace); // Common places will have Type = CommonPlace

            //Collegiate and Fault one-to-many relationship
            modelBuilder.Entity<Fault>()
                .HasOne<Collegiate>(f => f.Collegiate) // the person who reported the problem
                .WithMany(c => c.ReportedFaults) // a person can have multiple reported problems
                .HasForeignKey(f => f.CollegiateId) // the key between the two tables
                .OnDelete(DeleteBehavior.Restrict); // if a collegiate is deleted, their reported faults will not be deleted (to preserve historical data)

            //Maintainer and Fault one-to-many relationship
            modelBuilder.Entity<Fault>()
                .HasOne<Maintainer>(f => f.AssignedMaintenance)
                .WithMany(am => am.AssignedFaults) // a maintainer can have multiple assigned faults, but a fault can only be assigned to one maintainer
                .HasForeignKey(f => f.AssignedMaintenanceId); // the key between the two tables

            // Premises and Fault one-to-many relationship
            modelBuilder.Entity<Fault>()
                .HasOne<Premise>(f => f.Premise) // where the problem occurred (e.g., dorm room, common area, etc.)
                .WithMany(p => p.OccurredFaults) // a premise can have multiple occurred faults, but a fault can only occur in one premise
                .HasForeignKey(f => f.PremiseId) // the key between the two tables
                .OnDelete(DeleteBehavior.ClientSetNull); // if a premise is deleted, the associated faults will not be deleted, but their PremiseId will be set to null (to preserve historical data)

            // Appliance and Fault one-to-many relationship (optional)
            modelBuilder.Entity<Fault>()
                .HasOne<Appliance>(f => f.Appliance) // a fault can have an associated appliance
                .WithMany(a => a.Faults) // an appliance can have multiple faults
                .HasForeignKey(f => f.ApplianceId); // the key between the two tables

            // MaintainerSpecialisation and Fault one-to-many relationship
            modelBuilder.Entity<Fault>()
                .HasOne<MaintainerSpecialisation>(f => f.Specialization) // a fault requires a specialization who can fix it
                .WithMany(ms => ms.AssignedFaults) // a specialization can be associated with multiple faults
                .HasForeignKey(f => f.SpecializationId); // the key between the two tables

            modelBuilder.Entity<Feedback>()
                .HasOne<Collegiate>(c => c.Collegiate) // feedback is provided by a specific collegiate
                .WithMany(c => c.Feedbacks) // a collegiate can provide multiple feedback entries
                .HasForeignKey(f => f.CollegiateId) // the key between the two tables
                .OnDelete(DeleteBehavior.Restrict); // if a collegiate is deleted, their feedback will not be deleted (to preserve historical data)

            // Fault and Feedback one-to-many relationship
            modelBuilder.Entity<Feedback>()
                .HasOne<Fault>(fe => fe.Fault) // feedback is associated with a specific fault
                .WithMany(fa => fa.Feedbacks) // a fault can have multiple feedback entries
                .HasForeignKey(fe => fe.FaultId); // the key between the two tables

            // Premise and Appliance one-to-many relationship
            modelBuilder.Entity<Appliance>()
                .HasOne<Premise>(a => a.Premise) // an appliance belongs to a premise
                .WithMany(p => p.Appliances) // a premise can have multiple appliances
                .HasForeignKey(a => a.PremiseId); // the key between the two tables

            // Maintainer and MaintainerSpecialisation many-to-many relationship
            modelBuilder.Entity<Maintainer>()
                .HasMany(m => m.MaintenanceProfessions) // a maintainer can have multiple specializations
                .WithMany(ms => ms.Maintainers) // a specialization can be associated with multiple maintainers
                .UsingEntity(j => j.ToTable("MaintainerProfessions")); // specify the name of the join table for the many-to-many relationship
        }
    }
}
