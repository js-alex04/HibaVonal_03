using HibaVonal_03.Context;
using HibaVonal_03.Entities;

namespace HibaVonal_03.Data
{
    // AI által generált osztály, amely az adatbázis kezdeti feltöltéséért felelős
    public static class DbInitializer
    {
        public static void Initialize(HibaVonalDbContext context)
        {
            // Biztonsági lépés: Garantálja, hogy az adatbázis létezik
            context.Database.EnsureCreated();

            // Nézzük meg, van-e már bármilyen felhasználó. Ha igen, az adatbázis már fel van töltve (Seedelve).
            if (context.Users.Any())
            {
                return;
            }

            // --- 1. Szakterületek létrehozása ---
            var vizvezetekSzerelo = new MaintainerSpecialisation { Name = "Vízvezeték-szerelő" };
            var villanyszerelo = new MaintainerSpecialisation { Name = "Villanyszerelő" };
            var asztalos = new MaintainerSpecialisation { Name = "Asztalos" };

            context.MaintainerSpecialisations.AddRange(vizvezetekSzerelo, villanyszerelo, asztalos);

            // --- 2. Helyszínek (Szobák és Közös helyiségek) ---
            // ID-nak nullát adunk, mert a SQL Server IDENTITY oszlopa automatikusan ad majd neki számot
            var room101 = new PrivateRoom(0, 1, 101);
            var room102 = new PrivateRoom(0, 1, 102);
            var kitchen = new CommonPlace(0, 1, "Földszinti Közösségi Konyha");

            context.Premises.AddRange(room101, room102, kitchen);

            // --- 3. Felhasználók (Admin, Karbantartó, Kollégista) ---
            var admin = new Administrator(0, "Fő Admin", "admin@hibavonal.hu", "admin123");

            var maintainer = new Maintainer(0, "Kovács Szaki", "szaki@hibavonal.hu", "szaki123", true, new List<MaintainerSpecialisation> { vizvezetekSzerelo, villanyszerelo });

            var collegiate = new Collegiate(0, "Teszt Hallgató", "hallgato@hibavonal.hu", "hallgato123", room101);

            context.Users.AddRange(admin, maintainer, collegiate);

            // --- 4. Változások mentése az adatbázisba ---
            context.SaveChanges();
        }
    }
}