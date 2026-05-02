using HibaVonal_03.Entities;
using Microsoft.EntityFrameworkCore;

namespace HibaVonal_03.Context
{
    public class HibaVonalDbContext : DbContext
    {
        public DbSet<Appliance> Appliances { get; set; } // Berendezések táblája
        public DbSet<Collegiate> Collegiates { get; set; } // Kollégisták táblája
        public DbSet<Fault> Faults { get; set; } // Hibák táblája
        public DbSet<Feedback> Feedbacks { get; set; } // Visszajelzések táblája
        public DbSet<Maintainer> Maintainers { get; set; } // Karbantartók táblája
        public DbSet<MaintainerSpecialisation> MaintainerSpecialisations { get; set; } // Karbantartói szakterületek táblája
        public DbSet<Premise> Premises { get; set; } // Helyiségek táblája 
        public DbSet<ToolOrder> ToolOrders { get; set; } // Eszközrendelések táblája
        public DbSet<User> Users { get; set; } // Felhasználók táblája (a User osztály lesz a bázisosztály a TPT öröklődéshez, így minden felhasználó típus itt lesz tárolva, a Role oszlop segítségével megkülönböztetve)
        public HibaVonalDbContext(DbContextOptions<HibaVonalDbContext> options) : base(options) { }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // A Berendezés és a Helyiség közötti kapcsolat (egy-a-sokhoz)
            modelBuilder.Entity<Appliance>()
                .HasOne<Premise>(a => a.Premise) // egy berendezés egy helyiséghez tartozik
                .WithMany(p => p.Appliances) // egy helyiségben több berendezés is lehet
                .HasForeignKey(a => a.PremiseId); // a kulcs a két tábla között

            // A Kollégista és a Saját Szobája közötti kapcsolat (egy-a-sokhoz)
            modelBuilder.Entity<Collegiate>()
                .HasOne(c => c.DormRoom) // egy kollégista egy szobához tartozik
                .WithMany(r => r.Residents) // egy szobában több kollégista is lakhat
                .HasForeignKey(c => c.DormRoomId); // a kulcs a két tábla között

            // A Hiba és a Berendezés közötti kapcsolat (egy-a-sokhoz)
            modelBuilder.Entity<Fault>()
                .HasOne<Appliance>(f => f.Appliance) // egy hiba egy berendezéshez tartozik
                .WithMany(a => a.Faults) // egy berendezéshez több hiba is tartozhat
                .HasForeignKey(f => f.ApplianceId); // a kulcs a két tábla között

            // A Hiba és a Kollégista közötti kapcsolat (egy-a-sokhoz)
            modelBuilder.Entity<Fault>()
                .HasOne<Collegiate>(f => f.Collegiate) // egy hiba egy kollégistához tartozik
                .WithMany(c => c.ReportedFaults) // egy kollégistához több hiba is tartozhat
                .HasForeignKey(f => f.CollegiateId) // a kulcs a két tábla között
                .OnDelete(DeleteBehavior.Restrict); // ha egy kollégista törlésre kerül, a hozzá tartozó hibák nem törlődnek (a korábbi hibák megőrzése érdekében)

            // A Hiba és a Karbantartó közötti kapcsolat (egy-a-sokhoz)
            modelBuilder.Entity<Fault>()
                .HasOne<Maintainer>(f => f.AssignedMaintenance) // egy hiba egy karbantartóhoz van rendelve
                .WithMany(am => am.AssignedFaults) // egy karbantartóhoz több hiba is lehet rendelve, de egy hiba csak egy karbantartóhoz lehet rendelve
                .HasForeignKey(f => f.AssignedMaintenanceId); // a kulcs a két tábla között

            // A Hiba és a Szakterület közötti kapcsolat (egy-a-sokhoz)
            modelBuilder.Entity<Fault>()
                .HasOne<MaintainerSpecialisation>(f => f.Specialization) // egy hiba egy szakterülethez tartozik
                .WithMany(ms => ms.AssignedFaults) // egy szakterülethez több hiba is tartozhat
                .HasForeignKey(f => f.SpecializationId); // a kulcs a két tábla között

            // A Hiba és a Helyiség közötti kapcsolat (egy-a-sokhoz)
            modelBuilder.Entity<Fault>()
                .HasOne<Premise>(f => f.Premise) // egy hiba egy helyiséghez tartozik (pl. kollégiumi szoba, közös helyiség stb.)
                .WithMany(p => p.OccurredFaults) // egy helyiséghez több hiba is tartozhat, de egy hiba csak egy helyiségben fordulhat elő
                .HasForeignKey(f => f.PremiseId) // a kulcs a két tábla között
                .OnDelete(DeleteBehavior.ClientSetNull); // ha egy helyiség törlésre kerül, a hozzá tartozó hibák nem törlődnek, de a PremiseId értéke null lesz (a korábbi hibák megőrzése érdekében)

            // A Visszajelzés és a Kollégista közötti kapcsolat (egy-a-sokhoz)
            modelBuilder.Entity<Feedback>()
                .HasOne<Collegiate>(c => c.Collegiate) // egy visszajelzés egy konkrét kollégistához tartozik
                .WithMany(c => c.Feedbacks) // egy kollégista több visszajelzést is adhat
                .HasForeignKey(f => f.CollegiateId) // a kulcs a két tábla között
                .OnDelete(DeleteBehavior.Restrict); // ha egy kollégista törlésre kerül, a hozzá tartozó visszajelzések nem törlődnek (a korábbi visszajelzések megőrzése érdekében)

            // A Visszajelzés és a Hiba közötti kapcsolat (egy-a-sokhoz)
            modelBuilder.Entity<Feedback>()
                .HasOne<Fault>(fe => fe.Fault) // egy visszajelzés egy konkrét hibához tartozik
                .WithMany(fa => fa.Feedbacks) // egy hibához több visszajelzés is tartozhat
                .HasForeignKey(fe => fe.FaultId); // a kulcs a két tábla között 

            // A Karbantartó és a Szakterület közötti kapcsolat (sok-a-sokhoz)
            modelBuilder.Entity<Maintainer>()
                .HasMany(m => m.MaintenanceSpecialisation) // egy karbantartó több szakterülettel is rendelkezhet
                .WithMany(ms => ms.Maintainers) // egy szakterület több karbantartóhoz is tartozhat
                .UsingEntity(j => j.ToTable("MaintainerSpecialisationAssignments")); // a sok-a-sokhoz kapcsolat köztes táblájának neve   

            // Az Eszközrendelés és a Hiba közötti kapcsolat (egy-a-sokhoz)
            modelBuilder.Entity<ToolOrder>()
                .HasOne<Fault>(to => to.Fault) // egy eszközrendelés egy konkrét hibához tartozik
                .WithMany(f => f.ToolOrders) // egy hibához több eszközrendelés is tartozhat, de egy eszközrendelés csak egy hibához tartozhat
                .HasForeignKey(to => to.FaultId) // a kulcs a két tábla között
                .OnDelete(DeleteBehavior.Cascade); // ha egy hiba törlésre kerül, a hozzá tartozó eszközrendelések is törlődnek (az adatintegritás megőrzése érdekében, mivel egy eszközrendelés nem létezhet kapcsolódó hiba nélkül)

            // A Felhasználó és a Szerepkörök közötti kapcsolat TPT öröklődés használatával
            modelBuilder.Entity<User>()
                .HasDiscriminator(u => u.Role) // a Role oszlop fogja megkülönböztetni a különböző típusú felhasználókat
                .HasValue<Collegiate>(Role.Collegiate) // a Kollégista felhasználók Role = Collegiate értéket kapnak
                .HasValue<Maintainer>(Role.Maintainer) // a Karbantartó felhasználók Role = Maintainer értéket kapnak
                .HasValue<MaintenanceManager>(Role.MaintenanceManager) // a Karbantartásvezető felhasználók Role = MaintenanceManager értéket kapnak
                .HasValue<Administrator>(Role.Administrator); // az Adminisztrátor felhasználók Role = Administrator értéket kapnak
        }
    }
}
