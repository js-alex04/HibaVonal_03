# 🛠️ HibaVonal - Kollégiumi Hibakezelő Rendszer

A **HibaVonal** egy modern, backend alapú (ASP.NET Core Web API) megoldás, amelyet a kollégiumi infrastruktúra meghibásodásainak kezelésére fejlesztettünk. A rendszer a teljes munkafolyamatot lefedi: a hiba bejelentésétől kezdve a szakember kijelölésén és az alkatrészrendelésen át egészen a javításig és a visszajelzésig.

## 🚀 Főbb funkciók

### 👤 Szerepkör alapú munkafolyamatok
- **Kollégista:** Hibák bejelentése (saját szoba vagy közösségi helyiségek), státusz követése és visszajelzés küldése a javítás minőségéről.
- **Karbantartó:** Saját feladatok kezelése, hiba állapotának frissítése (pl. alkatrészre vár, folyamatban), és eszközigények jelzése a vezetés felé.
- **Karbantartási vezető:** Bejelentések koordinálása, feladatok kiosztása a szakterületnek megfelelő karbantartónak, eszközrendelések jóváhagyása és menedzselése.
- **Adminisztrátor:** Felhasználók kezelése, helyiségek (szobák, szintek) és berendezések (leltár) karbantartása, valamint a rendszer strukturális adatainak módosítása.

### 📋 Rendszerjellemzők
- **Hiba életciklus:** A hibák kezelése több állapoton keresztül (`Függőben`, `Folyamatban`, `Alkatrészre vár`, `Javítva`, `Javíthatatlan`).
- **Infrastruktúra nyilvántartás:** Szintek, szobák és az ott található eszközök (pl. mosógépek, hűtők) hierarchikus kezelése.
- **Eszközrendelés:** Integrált folyamat a javításhoz szükséges alkatrészek igénylésére és azok szállítási állapotának követésére.
- **Visszajelzéskezelés:** Minőségbiztosítás a hallgatói vélemények alapján.

## 💻 Technológiai stack

- **Keretrendszer:** ASP.NET Core Web API (.NET 10)
- **Adatbázis:** Microsoft SQL Server
- **ORM:** Entity Framework Core
- **Architektúra:** 
  - Repository Pattern & Unit of Work (az adatkezelés tisztaságáért)
  - TPT (Table-per-Type) öröklődés a felhasználói típusok kezelésére
  - Szolgáltatás-alapú (Service Layer) üzleti logika
- **Biztonság:** 
  - JWT (JSON Web Token) alapú hitelesítés
  - Szerepkör alapú (Role-based) jogosultságkezelés
  - BCrypt jelszótitkosítás
- **Egyéb:** AutoMapper (DTO-Entity leképezés), Swagger (API dokumentáció)

## 🏗️ Adatbázis és Architektúra

A rendszer tiszta, relációs adatbázis-struktúrát használ:
- **Felhasználók:** Absztrakt bázisosztály, amelyből a négy specifikus szerepkör származik le (TPT).
- **Hibák (Faults):** Központi entitás, amely összeköti a bejelentőt, a karbantartót, a helyiséget és az érintett berendezést.
- **Karbantartói szakterületek:** Sok-a-sokhoz kapcsolat a szakemberek és kompetenciáik (pl. villanyszerelő, vízszerelő) között.

## 🛠️ Telepítés és használat

1. **Klónozd a repository-t:**
   ```bash
   git clone https://github.com/felhasznalonev/HibaVonal.git
   ```

2. **Adatbázis beállítása:**
   Módosítsd az `appsettings.json` fájlban a kapcsolati karakterláncot:
   ```json
   "ConnectionStrings": {
     "DefaultConnection": "Server=SAJAT_SERVER;Database=HibaVonalDb;Trusted_Connection=True;TrustServerCertificate=True"
   }
   ```

3. **JWT beállítások:**
   Ellenőrizd a `JwtSettings` szekciót a titkos kulccsal és az érvényességi időkkel.

4. **Adatbázis inicializálása:**
   A rendszer az első indításkor automatikusan létrehozza az adatbázist (`EnsureCreated`) és feltölti tesztadatokkal a `DbInitializer` segítségével.

5. **Futtatás:**
   ```bash
   dotnet run
   ```
   A Swagger dokumentáció alapértelmezés szerint a `/swagger` útvonalon érhető el.

## 🧪 Teszt felhasználók (Alapértelmezett)
A telepítés után az alábbi adatokkal jelentkezhetsz be teszteléshez:
- **Admin:** `admin@hibavonal.hu` / `pass123`
- **Vezető:** `manager@hibavonal.hu` / `pass123`
- **Hallgató:** `hallgato1@hibavonal.hu` / `pass123`

---
*Készült a HibaVonal projekt keretében.*
