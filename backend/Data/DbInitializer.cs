using HibaVonal_03.Context;
using HibaVonal_03.Entities;

namespace HibaVonal_03.Data
{
    // AI által generált osztály, amely az adatbázis kezdeti feltöltéséért felelős
    public static class DbInitializer
    {
        public static void Initialize(HibaVonalDbContext context)
        {
            context.Database.EnsureCreated();

            if (context.Faults.Count() >= 100) return; // Ha már van elég adat, ne fusson le újra

            var random = new Random();

            // 1. Szakterületek
            var specialisations = new List<MaintainerSpecialisation>
    {
        new() { Name = "Vízvezeték-szerelő" },
        new() { Name = "Villanyszerelő" },
        new() { Name = "Asztalos" },
        new() { Name = "Lakatos" },
        new() { Name = "Informatikus" }
    };
            context.MaintainerSpecialisations.AddRange(specialisations);
            context.SaveChanges();

            // 2. Helyszínek (20 szoba)
            var premises = new List<Premise>();
            for (int i = 1; i <= 20; i++)
            {
                premises.Add(new Premise(0, (i / 10) + 1, PremiseType.PrivateRoom, $"{100 + i}"));
            }
            context.Premises.AddRange(premises);
            context.SaveChanges();

            // 3. Felhasználók
            var maintainers = new List<Maintainer>();
            for (int i = 1; i <= 5; i++)
            {
                maintainers.Add(new Maintainer(0, $"Karbantartó {i}", $"szaki{i}@hibavonal.hu", "pass", true, new List<MaintainerSpecialisation> { specialisations[random.Next(specialisations.Count)] }));
            }

            var collegiates = new List<Collegiate>();
            for (int i = 1; i <= 30; i++)
            {
                collegiates.Add(new Collegiate(0, $"Hallgató {i}", $"hallgato{i}@hibavonal.hu", "pass", premises[random.Next(premises.Count)]));
            }

            context.Maintainers.AddRange(maintainers);
            context.Collegiates.AddRange(collegiates);
            context.SaveChanges();

            // 4. Hibák generálása (100 darab)
            var faults = new List<Fault>();
            var descriptions = new[] { "Csöpög a csap", "Nem ég a lámpa", "Törött ablak", "Dugulás", "Nem csukódik az ajtó", "Hangos a hűtő" };

            for (int i = 1; i <= 100; i++)
            {
                var collegiate = collegiates[random.Next(collegiates.Count)];
                faults.Add(new Fault
                {
                    Description = descriptions[random.Next(descriptions.Length)] + $" (#{i})",
                    Attachment = "nincs_kep.jpg",
                    Date = DateTime.Now.AddDays(-random.Next(1, 30)),
                    CollegiateId = collegiate.Id,
                    PremiseId = collegiate.DormRoomId,
                    SpecializationId = specialisations[random.Next(specialisations.Count)].Id,
                    Status = (FaultStatus)random.Next(0, 5),
                    AssignedMaintenanceId = random.Next(0, 2) == 1 ? maintainers[random.Next(maintainers.Count)].Id : null
                });
            }
            context.Faults.AddRange(faults);
            context.SaveChanges();
        }
    }
}