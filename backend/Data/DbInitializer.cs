using HibaVonal_03.Context;
using HibaVonal_03.Entities;
using BCrypt.Net;

namespace HibaVonal_03.Data
{
    public static class DbInitializer
    {
        public static void Initialize(HibaVonalDbContext context)
        {
            context.Database.EnsureCreated();

            // Ha már vannak adatok, nem futtatjuk újra
            if (context.Users.Any()) return;

            var random = new Random(42);
            string passwordHash = BCrypt.Net.BCrypt.HashPassword("pass123");

            // 1. SZAKTERÜLETEK (MaintainerSpecialisation)
            var specs = new List<MaintainerSpecialisation>
            {
                new() { Name = "Vízvezeték-szerelő" },
                new() { Name = "Villanyszerelő" },
                new() { Name = "Asztalos" },
                new() { Name = "Lakatos" },
                new() { Name = "Informatikus/Hálózat" },
                new() { Name = "Kőműves/Festő" }
            };
            context.MaintainerSpecialisations.AddRange(specs);
            context.SaveChanges();

            // 2. HELYISÉGEK (Premise)
            var premises = new List<Premise>();
            // Magánszobák (PrivateRoom)
            for (int i = 1; i <= 20; i++)
            {
                premises.Add(new Premise(0, (i / 10) + 1, PremiseType.PrivateRoom, $"{((i / 10) + 1) * 100 + (i % 10)}"));
            }
            // Közös helyiségek (CommonPlace - az enum neve a Premise.cs-ben CommonPlace!)
            var laundry = new Premise(0, 0, PremiseType.CommonPlace, "Mosókonyha");
            var kitchen = new Premise(0, 1, PremiseType.CommonPlace, "Közösségi Konyha");
            var gym = new Premise(0, 0, PremiseType.CommonPlace, "Kondi terem");

            premises.AddRange(new[] { laundry, kitchen, gym });
            context.Premises.AddRange(premises);
            context.SaveChanges();

            // 3. BERENDEZÉSEK (Appliance)
            var appliances = new List<Appliance>
            {
                new(0, "Mosógép A") { PremiseId = laundry.Id },
                new(0, "Mosógép B") { PremiseId = laundry.Id },
                new(0, "Szárítógép") { PremiseId = laundry.Id },
                new(0, "Elektromos Sütő") { PremiseId = kitchen.Id },
                new(0, "Mikrohullámú sütő") { PremiseId = kitchen.Id },
                new(0, "Futópad") { PremiseId = gym.Id }
            };
            // Néhány szobába is teszünk hűtőt teszteléshez
            for (int i = 0; i < 5; i++)
            {
                appliances.Add(new Appliance(0, "Mini hűtő") { PremiseId = premises[i].Id });
            }
            context.Appliances.AddRange(appliances);
            context.SaveChanges();

            // 4. FELHASZNÁLÓK (User - TPH)

            // Adminisztrátorok
            var admin = new Administrator(0, "Fő Admin", "admin@hibavonal.hu", passwordHash);
            context.Users.Add(admin);

            // Karbantartási vezetők
            var manager = new MaintenanceManager(0, "Nagy Főnök", "manager@hibavonal.hu", passwordHash);
            context.Users.Add(manager);

            // Karbantartók (Speciális hozzárendelésekkel)
            var m1 = new Maintainer(0, "Vizes Vince", "vince@hibavonal.hu", passwordHash, true, new List<MaintainerSpecialisation> { specs[0] });
            var m2 = new Maintainer(0, "Szikra Sanyi", "sanyi@hibavonal.hu", passwordHash, true, new List<MaintainerSpecialisation> { specs[1], specs[4] });
            var m3 = new Maintainer(0, "Fúró Ferenc", "ferenc@hibavonal.hu", passwordHash, false, new List<MaintainerSpecialisation> { specs[2], specs[3] });

            context.Maintainers.AddRange(m1, m2, m3);

            // Kollégisták (Hozzárendelve a szobákhoz)
            var privateRooms = premises.Where(p => p.Type == PremiseType.PrivateRoom).ToList();
            var collegiates = new List<Collegiate>();
            for (int i = 0; i < privateRooms.Count; i++)
            {
                collegiates.Add(new Collegiate(0, $"Hallgató {i + 1}", $"hallgato{i + 1}@hibavonal.hu", passwordHash, privateRooms[i]));
            }
            context.Collegiates.AddRange(collegiates);
            context.SaveChanges();

            // 5. HIBÁK (Fault)
            var faults = new List<Fault>();

            // 1. hiba: Folyamatban lévő, eszközhöz kötött, karbantartóhoz rendelve
            var f1 = new Fault
            {
                Description = "Nem centrifugáz a mosógép",
                Attachment = "wash_error.jpg",
                Date = DateTime.Now.AddDays(-2),
                CollegiateId = collegiates[0].Id,
                PremiseId = laundry.Id,
                ApplianceId = appliances[0].Id,
                SpecializationId = specs[0].Id,
                Status = FaultStatus.InProgress,
                AssignedMaintenanceId = m1.Id
            };

            // 2. hiba: Alkatrészre vár, szobában történt
            var f2 = new Fault
            {
                Description = "Csöpög a radiátor",
                Attachment = "radiator.png",
                Date = DateTime.Now.AddDays(-5),
                CollegiateId = collegiates[1].Id,
                PremiseId = collegiates[1].DormRoomId,
                SpecializationId = specs[0].Id,
                Status = FaultStatus.AwaitingParts,
                AssignedMaintenanceId = m1.Id
            };

            // 3. hiba: Új bejelentés, nincs még rendelve senkihez
            var f3 = new Fault
            {
                Description = "Nincs net a szobában",
                Attachment = "no_internet.jpg",
                Date = DateTime.Now,
                CollegiateId = collegiates[2].Id,
                PremiseId = collegiates[2].DormRoomId,
                SpecializationId = specs[4].Id,
                Status = FaultStatus.Pending
            };

            // 4. hiba: Javított hiba (visszajelzéshez)
            var f4 = new Fault
            {
                Description = "Kiégett izzó a konyhában",
                Attachment = "dark.jpg",
                Date = DateTime.Now.AddDays(-10),
                CollegiateId = collegiates[3].Id,
                PremiseId = kitchen.Id,
                SpecializationId = specs[1].Id,
                Status = FaultStatus.Repaired,
                AssignedMaintenanceId = m2.Id
            };

            context.Faults.AddRange(f1, f2, f3, f4);
            context.SaveChanges();

            // 6. VISSZAJELZÉSEK (Feedback)
            var feedback = new Feedback
            {
                FaultId = f4.Id,
                Date = DateTime.Now.AddDays(-9),
                Text = "Nagyon gyorsan kicserélték, köszi!"
            };
            context.Feedbacks.Add(feedback);

            // 7. ESZKÖZRENDELÉSEK (ToolOrder)
            var order1 = new ToolOrder
            {
                FaultId = f1.Id,
                ToolName = "Mosógép ékszíj",
                Quantity = 1,
                Date = DateTime.Now.AddDays(-1),
                IsDelivered = false
            };

            var order2 = new ToolOrder
            {
                FaultId = f2.Id,
                ToolName = "Radiátor szelep 1/2",
                Quantity = 2,
                Date = DateTime.Now.AddDays(-4),
                IsDelivered = true
            };

            context.ToolOrders.AddRange(order1, order2);
            context.SaveChanges();
        }
    }
}