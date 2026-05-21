import React from "react";
import { useAuth } from "../context/AuthContext";
import "../styles/RoleDashboards.css"; // Reuse styles

const PermissionsInfoModal = ({ role, onClose }) => {
  const { ROLES } = useAuth();

  const renderPermissions = () => {
    switch (role) {
      case ROLES.ADMINISZTRATOR:
        return (
          <>
            <p>
              Te vagy a rendszer ura. A szakmai (karbantartási) folyamatokba
              csak korlátozottan szólsz bele, de a rendszert és az adatbázist te
              építed fel:
            </p>
            <ul className="permissions-list">
              <li>
                <strong>Felhasználókezelés:</strong> Új Adminisztrátort,
                Karbantartási vezetőt, Karbantartót és Kollégistát tudsz
                regisztrálni a rendszerbe.
              </li>
              <li>
                Bármikor felülbírálhatod egy felhasználó szerepkörét (pl.
                előléptethetsz valakit), és véglegesen törölhetsz is fiókokat.
              </li>
              <li>
                <strong>Infrastruktúra:</strong> Új helyszíneket és szobákat
                tudsz létrehozni, adataikat módosíthatod, vagy törölheted őket.
              </li>
              <li>
                Új berendezéseket vehetsz fel a leltárba, módosíthatod és
                törölheted azokat.
              </li>
              <li>
                A berendezéseket te tudod "betenni" egy adott helyiségbe, vagy
                eltávolítani onnan.
              </li>
              <li>
                <strong>Karbantartási háttér:</strong> Új szakterületeket
                hozhatsz létre a szerelőknek, módosíthatod a nevüket, vagy
                törölheted azokat.
              </li>
              <li>
                Te tudod beállítani, hogy egy adott Karbantartónak mik legyenek
                a szakterületei.
              </li>
              <li>
                <strong>Moderálás és felügyelet:</strong> Rálátsz az összes
                karbantartóra, minden eszközrendelésre, hibára és
                visszajelzésre.
              </li>
              <li>
                Jogod van téves hibabejelentéseket és nem megfelelő
                visszajelzéseket (Feedback) törölni a rendszerből.
              </li>
            </ul>
          </>
        );
      case ROLES.KARBANTARTAS_VEZETO:
        return (
          <>
            <p>
              Te koordinálod a napi munkát. A hibák kiosztása és az alkatrészek
              logisztikája a te feladatod:
            </p>
            <ul className="permissions-list">
              <li>
                <strong>Hibák kezelése:</strong> Rálátsz a kollégium összes
                hibájára, szűrheted őket státusz, kollégista vagy karbantartó
                szerint.
              </li>
              <li>
                Te döntöd el, hogy egy bejelentett hiba milyen szakterületet
                igényel (pl. "Villanyszerelő" kell hozzá).
              </li>
              <li>
                Te jelölöd ki (rendeled hozzá) a konkrét Karbantartót a hibához.
              </li>
              <li>
                Átállíthatod bármelyik hiba státuszát, és szükség esetén
                törölheted is a bejelentést.
              </li>
              <li>
                <strong>Karbantartók:</strong> Rálátsz a szerelőidre, szűrheted
                őket szakterület szerint, és te tudod átállítani az
                elérhetőségüket (pl. ha valaki lebetegszik).
              </li>
              <li>
                <strong>Eszközök (Rendelések):</strong> Szabadon hozhatsz létre
                új alkatrészrendeléseket bármelyik hibához.
              </li>
              <li>
                Lekérdezheted a függőben lévő (pending) vagy már leadott
                rendeléseket.
              </li>
              <li>
                Frissítheted a rendeléseket, törölheted őket, és a legfontosabb:{" "}
                <strong>
                  te pipálhatod ki, ha egy alkatrész megérkezett (szállítási
                  státusz frissítése)
                </strong>
                .
              </li>
              <li>
                Végigolvashatod a hallgatók által beküldött összes
                visszajelzést.
              </li>
            </ul>
          </>
        );
      case ROLES.KARBANTARTAS:
        return (
          <>
            <p>
              A te feladatod a terepi munka elvégzése és a rendszerben a hibák
              állapotának követése:
            </p>
            <ul className="permissions-list">
              <li>
                <strong>Saját munka:</strong> Lekérdezheted azokat a hibákat,
                amiket a Vezető kifejezetten hozzád rendelt.
              </li>
              <li>
                Amikor dolgozol egy hibán, te is át tudod állítani a hiba
                státuszát (pl. "Folyamatban", vagy ha végeztél: "Kész").
              </li>
              <li>
                <strong>Eszközök:</strong> Ha a javításhoz alkatrész kell,
                leadhatsz egy új eszközrendelést a rendszerbe.
              </li>
              <li>
                Nyomon követheted a saját hibáidhoz tartozó leadott
                eszközrendeléseket.
              </li>
            </ul>
          </>
        );
      case ROLES.EGYETEMISTA:
        return (
          <>
            <p>
              Te vagy a szolgáltatás megrendelője, aki a hibákat tapasztalja a
              szobában vagy a közös terekben:
            </p>
            <ul className="permissions-list">
              <li>
                <strong>Hibabejelentés:</strong> Új hibát tudsz bejelenteni a
                rendszerben a saját nevedben.
              </li>
              <li>
                Lekérdezheted az összes általad korábban bejelentett hiba
                listáját és státuszát.
              </li>
              <li>
                Ha elírtál valamit, módosíthatod a már beküldött, függőben lévő
                hibád adatait.
              </li>
              <li>
                <strong>Visszajelzés:</strong> Ha a karbantartó befejezett egy
                munkát (a hiba lezárult), visszajelzést (Feedback-et) tudsz írni
                a javítás minőségéről.
              </li>
              <li>
                Később bármikor szerkesztheted és megváltoztathatod a már
                leadott visszajelzésed szövegét.
              </li>
            </ul>
          </>
        );
      default:
        return <p>Nincsenek jogosultságok definiálva ehhez a szerepkörhöz.</p>;
    }
  };

  return (
    <div className="modal-overlay">
      <div
        className="modal-content modern-card"
        style={{
          width: "90%",
          maxWidth: "600px",
          display: "flex",
          flexDirection: "column",
          padding: "35px",
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          className="close-modal-btn"
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            zIndex: 100,
            backgroundColor: "#fff",
            borderRadius: "50%",
            width: "40px",
            height: "40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
            border: "1px solid #e2e8f0",
          }}
        >
          &times;
        </button>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "25px",
            paddingRight: "40px",
            minHeight: "70px",
          }}
        >
          <span style={{ fontSize: "1.8rem", marginRight: "10px" }}>ℹ️</span>
          <h2 className="modern-gradient-text" style={{ margin: 0 }}>
            Jogosultságaid
          </h2>
        </div>
        <div
          className="info-section tasks-list"
          style={{
            marginTop: 0,
            background: "none",
            padding: 0,
            border: "none",
            overflowY: "auto",
            paddingRight: "10px",
            height: "calc(100vh - 250px)",
            minHeight: "400px",
          }}
        >
          {renderPermissions()}
        </div>
      </div>
    </div>
  );
};

export default PermissionsInfoModal;
