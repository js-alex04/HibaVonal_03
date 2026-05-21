using HibaVonal_03.Context;
using HibaVonal_03.Entities;

namespace HibaVonal_03.Data
{
    public static class DbInitializer
    {
        public static void Seed(HibaVonalDbContext context)
        {
            // Sorrendben hívjuk meg a seeding metódusokat
            SeedPremises(context);
            SeedMaintainerSpecialisations(context);
            SeedUsers(context);
            SeedAppliances(context);
            SeedFaults(context);
            SeedFeedbacks(context);
            SeedToolOrders(context);
        }

        private static void SeedPremises(HibaVonalDbContext context)
        {
            if (context.Premises.Any()) return;

            var premises = new List<Premise>
            {
                new Premise(0, 0, PremiseType.CommonPlace, "Aula"),
                new Premise(0, 0, PremiseType.CommonPlace, "Mosókonyha"),
                new Premise(0, 0, PremiseType.CommonPlace, "Földszinti mosdó"),
                new Premise(0, 1, PremiseType.PrivateRoom, "101"),
                new Premise(0, 1, PremiseType.PrivateRoom, "102"),
                new Premise(0, 1, PremiseType.PrivateRoom, "103"),
                new Premise(0, 1, PremiseType.PrivateRoom, "104"),
                new Premise(0, 1, PremiseType.PrivateRoom, "105"),
                new Premise(0, 1, PremiseType.CommonPlace, "1. emeleti mosdó"),
                new Premise(0, 1, PremiseType.CommonPlace, "1. emeleti közösségi tér"),
                new Premise(0, 2, PremiseType.PrivateRoom, "201"),
                new Premise(0, 2, PremiseType.PrivateRoom, "202"),
                new Premise(0, 2, PremiseType.PrivateRoom, "203"),
                new Premise(0, 2, PremiseType.PrivateRoom, "204"),
                new Premise(0, 2, PremiseType.PrivateRoom, "205"),
                new Premise(0, 2, PremiseType.CommonPlace, "2. emeleti mosdó"),
                new Premise(0, 2, PremiseType.CommonPlace, "2. emeleti közösségi tér"),
                new Premise(0, 3, PremiseType.PrivateRoom, "301"),
                new Premise(0, 3, PremiseType.PrivateRoom, "302"),
                new Premise(0, 3, PremiseType.PrivateRoom, "303"),
                new Premise(0, 3, PremiseType.PrivateRoom, "304"),
                new Premise(0, 3, PremiseType.CommonPlace, "3. emeleti mosdó"),
                new Premise(0, 3, PremiseType.CommonPlace, "3. emeleti közösségi tér"),
            };

            context.Premises.AddRange(premises);
            context.SaveChanges();
        }

        private static void SeedMaintainerSpecialisations(HibaVonalDbContext context)
        {
            if (context.MaintainerSpecialisations.Any()) return;

            var specialisations = new List<MaintainerSpecialisation>
            {
                new MaintainerSpecialisation { Name = "Vízvezeték-szerelő"     },
                new MaintainerSpecialisation { Name = "Villanyszerelő"         },
                new MaintainerSpecialisation { Name = "Fűtésszerelő"           },
                new MaintainerSpecialisation { Name = "Festő"                  },
                new MaintainerSpecialisation { Name = "Asztalos"               },
                new MaintainerSpecialisation { Name = "Általános karbantartó"  },
            };

            context.MaintainerSpecialisations.AddRange(specialisations);
            context.SaveChanges();
        }

        private static void SeedUsers(HibaVonalDbContext context)
        {
            if (context.Users.Any()) return;

            var premises = context.Premises.ToList();
            var specialisations = context.MaintainerSpecialisations.ToList();

            if (!premises.Any() || !specialisations.Any()) return;

            var rooms = premises.Where(p => p.Type == PremiseType.PrivateRoom).ToList();

            string defaultPasswordHash = BCrypt.Net.BCrypt.HashPassword("pass123");

            var users = new List<User>
            {
                new Administrator(0, "Kovács Béla",  "admin@hibavonal.hu",  defaultPasswordHash),
                new Administrator(0, "Szabó Mária",  "admin2@hibavonal.hu",  defaultPasswordHash),
                new MaintenanceManager(0, "Horváth László", "manager@hibavonal.hu", defaultPasswordHash),

                new Maintainer(0, "Nagy Péter", "nagy.peter@hibavonal.hu", defaultPasswordHash, true,
                    new List<MaintainerSpecialisation>
                    {
                        specialisations.First(s => s.Name == "Vízvezeték-szerelő"),
                        specialisations.First(s => s.Name == "Általános karbantartó")
                    }),
                new Maintainer(0, "Tóth Gábor", "toth.gabor@hibavonal.hu", defaultPasswordHash, true,
                    new List<MaintainerSpecialisation>
                    {
                        specialisations.First(s => s.Name == "Villanyszerelő")
                    }),
                new Maintainer(0, "Kiss Zoltán", "kiss.zoltan@hibavonal.hu", defaultPasswordHash, false,
                    new List<MaintainerSpecialisation>
                    {
                        specialisations.First(s => s.Name == "Fűtésszerelő"),
                        specialisations.First(s => s.Name == "Vízvezeték-szerelő")
                    }),
                new Maintainer(0, "Fekete András", "fekete.andras@hibavonal.hu", defaultPasswordHash, true,
                    new List<MaintainerSpecialisation>
                    {
                        specialisations.First(s => s.Name == "Festő"),
                        specialisations.First(s => s.Name == "Asztalos")
                    }),
            };

            string[] lastNames = { "Nagy", "Kovács", "Tóth", "Szabó", "Horváth", "Varga", "Kiss", "Molnár", "Németh", "Farkas" };
            string[] firstNames = { "Bence", "Máté", "Balázs", "Dávid", "Anna", "Réka", "Zsófia", "Péter", "Tamás", "Lilla" };

            for (int i = 1; i < Math.Min(21, rooms.Count); i++)
            {
                string randomLast = lastNames[Random.Shared.Next(lastNames.Length)];
                string randomFirst = firstNames[Random.Shared.Next(firstNames.Length)];

                users.Add(new Collegiate(0, $"{randomLast} {randomFirst}", $"hallgato{i}@hibavonal.hu", defaultPasswordHash, rooms[i]));
            }

            context.Users.AddRange(users);
            context.SaveChanges();
        }

        private static void SeedAppliances(HibaVonalDbContext context)
        {
            if (context.Appliances.Any()) return;

            var premises = context.Premises.ToList();
            if (!premises.Any()) return;

            var rooms = premises.Where(p => p.Type == PremiseType.PrivateRoom).ToList();
            var commonPlaces = premises.Where(p => p.Type == PremiseType.CommonPlace).ToList();

            var appliances = new List<Appliance>();

            foreach (var room in rooms)
            {
                appliances.Add(new Appliance(0, "Radiátor") { PremiseId = room.Id });
                appliances.Add(new Appliance(0, "Villanykapcsoló") { PremiseId = room.Id });
                appliances.Add(new Appliance(0, "Ablak") { PremiseId = room.Id });
            }

            foreach (var place in commonPlaces)
            {
                if (place.NameOrNumber.Contains("mosdó"))
                {
                    appliances.Add(new Appliance(0, "Zuhanyzó") { PremiseId = place.Id });
                    appliances.Add(new Appliance(0, "Mosdókagyló") { PremiseId = place.Id });
                    appliances.Add(new Appliance(0, "WC") { PremiseId = place.Id });
                    appliances.Add(new Appliance(0, "Bojler") { PremiseId = place.Id });
                }
                else if (place.NameOrNumber.Contains("Mosókonyha"))
                {
                    appliances.Add(new Appliance(0, "Mosógép") { PremiseId = place.Id });
                    appliances.Add(new Appliance(0, "Hűtőszekrény") { PremiseId = place.Id });
                    appliances.Add(new Appliance(0, "Tűzhely") { PremiseId = place.Id });
                }
                else if (place.NameOrNumber.Contains("közösségi") || place.NameOrNumber == "Aula")
                {
                    appliances.Add(new Appliance(0, "Projektor") { PremiseId = place.Id });
                    appliances.Add(new Appliance(0, "Klímaberendezés") { PremiseId = place.Id });
                }
            }

            context.Appliances.AddRange(appliances);
            context.SaveChanges();
        }

        private static void SeedFaults(HibaVonalDbContext context)
        {
            if (context.Faults.Any()) return;

            var collegiates = context.Users.OfType<Collegiate>().ToList();
            var maintainers = context.Users.OfType<Maintainer>().ToList();
            var premises = context.Premises.ToList();
            var appliances = context.Appliances.ToList();
            var specialisations = context.MaintainerSpecialisations.ToList();

            if (!collegiates.Any() || !premises.Any()) return;

            // ÚJ SZABÁLY: A hallgatók csak a saját szobájukban vagy a közösségi terekben észlelt hibákat jelenthetik be
            int GetCollegiateIdForPremise(Premise p)
            {
                if (p.Type == PremiseType.CommonPlace)
                    return collegiates[Random.Shared.Next(collegiates.Count)].Id;

                var resident = collegiates.FirstOrDefault(c => c.DormRoomId == p.Id);
                return resident != null ? resident.Id : collegiates.First().Id;
            }

            // Helyszínek kinyerése a pontos párosításhoz
            var p101_mosdo = premises.First(p => p.NameOrNumber == "1. emeleti mosdó");
            var p102 = premises.First(p => p.NameOrNumber == "102");
            var p103 = premises.First(p => p.NameOrNumber == "103");
            var p201 = premises.First(p => p.NameOrNumber == "201");
            var p301 = premises.First(p => p.NameOrNumber == "301");
            var pMosokonyha = premises.First(p => p.NameOrNumber == "Mosókonyha");
            var pAula = premises.First(p => p.NameOrNumber == "Aula");
            var p2_mosdo = premises.First(p => p.NameOrNumber == "2. emeleti mosdó");
            var p202 = premises.First(p => p.NameOrNumber == "202");
            var p3_kozossegi = premises.First(p => p.NameOrNumber == "3. emeleti közösségi tér");

            var faults = new List<Fault>
            {
                // [0] Lezárt, kész (Kivétel a szabályok alól, mivel már történelmi, befejezett adat)
                new Fault
                {
                    Name                  = "Csöpög a csap",
                    Description           = "A 101-es szobához tartozó mosdóban a csap folyamatosan csöpög.",
                    Attachment            = "",
                    Date                  = DateTime.Now.AddDays(-14),
                    CollegiateId          = GetCollegiateIdForPremise(p101_mosdo),
                    PremiseId             = p101_mosdo.Id,
                    ApplianceId           = appliances.FirstOrDefault(a => a.Name == "Mosdókagyló" && a.PremiseId == p101_mosdo.Id)?.Id,
                    SpecializationId      = specialisations.First(s => s.Name == "Vízvezeték-szerelő").Id,
                    AssignedMaintenanceId = maintainers.First(m => m.Name == "Nagy Péter").Id,
                    Status                = FaultStatus.Repaired
                },
                // [1] ÚJ SZABÁLY: Rendelés van -> AwaitingParts
                new Fault
                {
                    Name             = "Nem működik a radiátor",
                    Description      = "A 102-es szobában a radiátor nem melegít, a szoba nagyon hideg.",
                    Attachment       = "",
                    Date             = DateTime.Now.AddDays(-10),
                    CollegiateId     = GetCollegiateIdForPremise(p102),
                    PremiseId        = p102.Id,
                    ApplianceId      = appliances.FirstOrDefault(a => a.Name == "Radiátor" && a.PremiseId == p102.Id)?.Id,
                    SpecializationId = specialisations.First(s => s.Name == "Fűtésszerelő").Id,
                    AssignedMaintenanceId = maintainers.First(m => m.Name == "Kiss Zoltán").Id,
                    Status           = FaultStatus.AwaitingParts
                },
                // [2] ÚJ SZABÁLY: Rendelés van -> AwaitingParts
                new Fault
                {
                    Name                  = "Villanykapcsoló szikrázik",
                    Description           = "A 103-as szobában a villanykapcsoló szikrázik, cserét igényel.",
                    Attachment            = "",
                    Date                  = DateTime.Now.AddDays(-7),
                    CollegiateId          = GetCollegiateIdForPremise(p103),
                    PremiseId             = p103.Id,
                    ApplianceId           = appliances.FirstOrDefault(a => a.Name == "Villanykapcsoló" && a.PremiseId == p103.Id)?.Id,
                    SpecializationId      = specialisations.First(s => s.Name == "Villanyszerelő").Id,
                    AssignedMaintenanceId = maintainers.First(m => m.Name == "Tóth Gábor").Id,
                    Status                = FaultStatus.AwaitingParts
                },
                // [3] ÚJ SZABÁLY: Nincs karbantartó -> Pending
                new Fault
                {
                    Name             = "Repedt fal",
                    Description      = "A 201-es szobában a falon repedés látható, festést igényel.",
                    Attachment       = "",
                    Date             = DateTime.Now.AddDays(-5),
                    CollegiateId     = GetCollegiateIdForPremise(p201),
                    PremiseId        = p201.Id,
                    SpecializationId = specialisations.First(s => s.Name == "Festő").Id,
                    AssignedMaintenanceId = null,
                    Status           = FaultStatus.Pending
                },
                // [4] ÚJ SZABÁLY: Rendelés van -> AwaitingParts (korábban InProgress volt)
                new Fault
                {
                    Name             = "Eltömődött lefolyó",
                    Description      = "Az 1. emeleti mosdóban a lefolyó eltömődött.",
                    Attachment       = "",
                    Date             = DateTime.Now.AddDays(-3),
                    CollegiateId     = GetCollegiateIdForPremise(p101_mosdo),
                    PremiseId        = p101_mosdo.Id,
                    ApplianceId      = appliances.FirstOrDefault(a => a.Name == "Zuhanyzó" && a.PremiseId == p101_mosdo.Id)?.Id,
                    SpecializationId = specialisations.First(s => s.Name == "Vízvezeték-szerelő").Id,
                    AssignedMaintenanceId = maintainers.First(m => m.Name == "Nagy Péter").Id,
                    Status           = FaultStatus.AwaitingParts
                },
                // [5] Lezárt, kész (Történelmi adat)
                new Fault
                {
                    Name                  = "Törött ablak",
                    Description           = "A 301-es szobában az ablak üvege megrepedt.",
                    Attachment            = "",
                    Date                  = DateTime.Now.AddDays(-20),
                    CollegiateId          = GetCollegiateIdForPremise(p301),
                    PremiseId             = p301.Id,
                    ApplianceId           = appliances.FirstOrDefault(a => a.Name == "Ablak" && a.PremiseId == p301.Id)?.Id,
                    SpecializationId      = specialisations.First(s => s.Name == "Általános karbantartó").Id,
                    AssignedMaintenanceId = maintainers.First(m => m.Name == "Fekete András").Id,
                    Status                = FaultStatus.Repaired
                },
                // [6] ÚJ SZABÁLY: Rendelés van -> AwaitingParts (Hozzárendeltünk egy karbantartót is, mert alkatrészre várni csak megbízással lehet)
                new Fault
                {
                    Name             = "Mosógép nem indul",
                    Description      = "A mosókonyhában az egyik mosógép nem kapcsol be.",
                    Attachment       = "",
                    Date             = DateTime.Now.AddDays(-2),
                    CollegiateId     = GetCollegiateIdForPremise(pMosokonyha),
                    PremiseId        = pMosokonyha.Id,
                    ApplianceId      = appliances.FirstOrDefault(a => a.Name == "Mosógép")?.Id,
                    SpecializationId = specialisations.First(s => s.Name == "Villanyszerelő").Id,
                    AssignedMaintenanceId = maintainers.First(m => m.Name == "Tóth Gábor").Id,
                    Status           = FaultStatus.AwaitingParts
                },
                // [7] ÚJ SZABÁLY: Van karbantartó, de nincs rendelés -> InProgress
                new Fault
                {
                    Name             = "Projektor képe elmosódott",
                    Description      = "Az aulában lévő projektor képe elmosódott, beállítás szükséges.",
                    Attachment       = "",
                    Date             = DateTime.Now.AddDays(-8),
                    CollegiateId     = GetCollegiateIdForPremise(pAula),
                    PremiseId        = pAula.Id,
                    ApplianceId      = appliances.FirstOrDefault(a => a.Name == "Projektor")?.Id,
                    SpecializationId = specialisations.First(s => s.Name == "Általános karbantartó").Id,
                    AssignedMaintenanceId = maintainers.First(m => m.Name == "Nagy Péter").Id,
                    Status           = FaultStatus.InProgress
                },
                // [8] ÚJ SZABÁLY: Rendelés van -> AwaitingParts (Itt is hozzárendeltünk egy karbantartót az állapothoz)
                new Fault
                {
                    Name             = "Bojler nem melegít",
                    Description      = "A 2. emeleti mosdóban a bojler hideg vizet ad.",
                    Attachment       = "",
                    Date             = DateTime.Now.AddDays(-1),
                    CollegiateId     = GetCollegiateIdForPremise(p2_mosdo),
                    PremiseId        = p2_mosdo.Id,
                    ApplianceId      = appliances.FirstOrDefault(a => a.Name == "Bojler" && a.PremiseId == p2_mosdo.Id)?.Id,
                    SpecializationId = specialisations.First(s => s.Name == "Fűtésszerelő").Id,
                    AssignedMaintenanceId = maintainers.First(m => m.Name == "Kiss Zoltán").Id,
                    Status           = FaultStatus.AwaitingParts
                },
                // [9] Lezárt, kész (Történelmi adat)
                new Fault
                {
                    Name                  = "Ajtózár elromlott",
                    Description           = "A 202-es szoba ajtózárja nem zár rendesen.",
                    Attachment            = "",
                    Date                  = DateTime.Now.AddDays(-4),
                    CollegiateId          = GetCollegiateIdForPremise(p202),
                    PremiseId             = p202.Id,
                    SpecializationId      = specialisations.First(s => s.Name == "Asztalos").Id,
                    AssignedMaintenanceId = maintainers.First(m => m.Name == "Fekete András").Id,
                    Status                = FaultStatus.Repaired
                },
                // [10] ÚJ SZABÁLY: Rendelés van -> AwaitingParts (korábban Javíthatatlan volt)
                new Fault
                {
                    Name             = "Klíma nem hűt",
                    Description      = "A 3. emeleti közösségi térben a klímaberendezés nem hűt megfelelően.",
                    Attachment       = "",
                    Date             = DateTime.Now.AddDays(-6),
                    CollegiateId     = GetCollegiateIdForPremise(p3_kozossegi),
                    PremiseId        = p3_kozossegi.Id,
                    ApplianceId      = appliances.FirstOrDefault(a => a.Name == "Klímaberendezés" && a.PremiseId == p3_kozossegi.Id)?.Id,
                    SpecializationId = specialisations.First(s => s.Name == "Általános karbantartó").Id,
                    AssignedMaintenanceId = maintainers.First(m => m.Name == "Nagy Péter").Id,
                    Status           = FaultStatus.AwaitingParts
                },
            };

            context.Faults.AddRange(faults);
            context.SaveChanges();
        }

        private static void SeedFeedbacks(HibaVonalDbContext context)
        {
            if (context.Feedbacks.Any()) return;

            var faults = context.Faults.ToList();
            if (!faults.Any()) return;

            var feedbacks = new List<Feedback>
            {
                new Feedback { FaultId = faults[0].Id, Date = faults[0].Date.AddDays(2), Text = "Szuper gyorsan kicserélték a tömítést, már nem csöpög! Köszönöm!" },
                new Feedback { FaultId = faults[5].Id, Date = faults[5].Date.AddDays(2), Text = "Tökéletes lett az új ablak, végre nem jön be a hideg." },
                new Feedback { FaultId = faults[5].Id, Date = faults[5].Date.AddDays(3), Text = "A takarítást is nagyon köszönöm a munka után!" },
                new Feedback { FaultId = faults[9].Id, Date = faults[9].Date.AddDays(1), Text = "Kicsit nehezen nyílik az új zár, de legalább biztonságos. Köszi a gyors cserét!" }
            };

            context.Feedbacks.AddRange(feedbacks);
            context.SaveChanges();
        }

        private static void SeedToolOrders(HibaVonalDbContext context)
        {
            if (context.ToolOrders.Any()) return;

            var faults = context.Faults.ToList();
            if (!faults.Any()) return;

            var toolOrders = new List<ToolOrder>
            {
                // [0] Kész (Eszközök mind megjöttek)
                new ToolOrder { FaultId = faults[0].Id,  ToolName = "Csaptömítés készlet",               Quantity = 2, Date = faults[0].Date.AddDays(1),  IsDelivered = true  },
                
                // [1] Alkatrészre vár (Még NEM jött meg)
                new ToolOrder { FaultId = faults[1].Id,  ToolName = "Radiátor termosztát",               Quantity = 1, Date = faults[1].Date.AddDays(2),  IsDelivered = false },
                
                // [2] Alkatrészre vár (Még NEM jött meg)
                new ToolOrder { FaultId = faults[2].Id,  ToolName = "Villanykapcsoló (10A)",              Quantity = 1, Date = faults[2].Date.AddDays(1),  IsDelivered = false },
                
                // [4] Folyamatban (Van szakember, a rendelés MEGJÖTT)
                new ToolOrder { FaultId = faults[4].Id,  ToolName = "Lefolyótisztító szett",             Quantity = 3, Date = faults[4].Date.AddDays(1),  IsDelivered = true  },
                
                // [5] Kész (Eszközök megjöttek)
                new ToolOrder { FaultId = faults[5].Id,  ToolName = "Dupla üvegezésű ablak (120x90 cm)", Quantity = 1, Date = faults[5].Date.AddDays(1),  IsDelivered = true  },
                
                // [8] Függőben KIVÉTEL! (A fűtőbetét hiába JÖTT MEG, nincs kijelölve hozzá szakember, ezért Függőben marad)
                new ToolOrder { FaultId = faults[8].Id,  ToolName = "Bojler fűtőbetét",                  Quantity = 1, Date = faults[8].Date.AddDays(1),  IsDelivered = true  },
                
                // [9] Kész (Eszközök megjöttek)
                new ToolOrder { FaultId = faults[9].Id,  ToolName = "Ajtózár szerkezet",                 Quantity = 1, Date = faults[9].Date.AddDays(1),  IsDelivered = true  },
            };

            context.ToolOrders.AddRange(toolOrders);
            context.SaveChanges();
        }
    }
}