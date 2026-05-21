import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "../styles/RoleDashboards.css";

const ProfileDashboard = ({ onBack }) => {
  const { user, users, updateProfile, changePassword } = useAuth();

  const [profileName, setProfileName] = useState(user?.name || "");
  const [profileUsername, setProfileUsername] = useState(
    user?.email ? user.email.replace("@hibavonal.hu", "") : "",
  );
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [toastMessage, setToastMessage] = useState(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const showToast = (msg, type = "success") => {
    setToastMessage({ text: msg, type });
    setTimeout(() => setToastMessage(null), 5000);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    const finalEmail = profileUsername.trim() + "@hibavonal.hu";

    // Ellenőrizzük a felhasználónév foglaltságát lokálisan
    const isOccupied = users.some(
      (u) =>
        String(u.id) !== String(user.id) &&
        u.email.toLowerCase() === finalEmail.toLowerCase(),
    );

    if (isOccupied) {
      showToast("Ez a felhasználónév már foglalt!", "error");
      return;
    }

    try {
      await updateProfile(profileName, finalEmail);
      showToast("Profil sikeresen frissítve!", "success");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmNewPassword) {
      showToast("A két új jelszó nem egyezik!", "error");
      return;
    }

    try {
      await changePassword(currentPassword, newPassword);
      showToast("Jelszó sikeresen frissítve!", "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const computedEmail = profileUsername.trim() + "@hibavonal.hu";

  // Ellenőrizzük, hogy volt-e változás a profilban
  const isProfileChanged =
    profileName !== (user?.name || "") || computedEmail !== (user?.email || "");

  // Ellenőrizzük, hogy a profil mezők ki vannak-e töltve
  const isProfileFilled =
    profileName.trim().length > 0 && profileUsername.trim().length > 0;

  // Ellenőrizzük, hogy mindhárom jelszó mező ki van-e töltve
  const isPasswordFilled =
    currentPassword.trim().length > 0 &&
    newPassword.trim().length > 0 &&
    confirmNewPassword.trim().length > 0;

  return (
    <div
      className="role-dashboard"
      style={{ maxWidth: "1000px", margin: "0 auto" }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "20px",
          flexWrap: "wrap",
          gap: "15px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={{ fontSize: "1.8rem", marginRight: "10px" }}>⚙️</span>
          <h2 className="modern-gradient-text" style={{ margin: 0 }}>
            Saját profil beállítások
          </h2>
        </div>
        <button
          className="btn-secondary"
          onClick={onBack}
          style={{
            padding: "10px 20px",
            background: "white",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            fontWeight: "600",
            color: "#4a5568",
            cursor: "pointer",
            transition: "all 0.2s",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
          }}
          onMouseOver={(e) => {
            e.target.style.background = "#f8fafc";
            e.target.style.transform = "translateY(-2px)";
            e.target.style.boxShadow = "0 4px 6px rgba(0,0,0,0.05)";
          }}
          onMouseOut={(e) => {
            e.target.style.background = "white";
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "0 2px 4px rgba(0,0,0,0.05)";
          }}
        >
          ⬅ Vissza a Dashboardra
        </button>
      </div>

      <div className="profile-layout">
        {/* Oszlop 1: Profil mentése */}
        <div
          className="modern-card"
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <h3
            style={{
              margin: "0 0 15px 0",
              color: "#2d3748",
              borderBottom: "1px solid #e2e8f0",
              paddingBottom: "10px",
              minHeight: "40px",
            }}
          >
            Személyes adatok
          </h3>
          <form
            onSubmit={handleUpdateProfile}
            className="form modern-form tasks-list"
            style={{
              height: "calc(100vh - 250px)",
              minHeight: "400px",
              overflowY: "auto",
              paddingRight: "10px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div className="form-group">
              <label>Név</label>
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                required
                maxLength={35}
              />
              <small
                style={{
                  display: "block",
                  textAlign: "right",
                  color: "#a0aec0",
                  fontSize: "0.8em",
                  marginTop: "5px",
                }}
              >
                {profileName.length} / 35
              </small>
            </div>
            <div className="form-group">
              <label>Felhasználónév</label>
              <input
                type="text"
                value={profileUsername}
                onChange={(e) => setProfileUsername(e.target.value)}
                placeholder="pl. nev"
                required
                maxLength={20}
              />
              <small
                style={{
                  display: "block",
                  textAlign: "right",
                  color: "#a0aec0",
                  fontSize: "0.8em",
                  marginTop: "5px",
                }}
              >
                {profileUsername.length} / 20
              </small>
            </div>
            <button
              type="submit"
              className="btn-primary"
              style={{ marginTop: "auto" }}
              disabled={!isProfileFilled || !isProfileChanged}
            >
              Profil mentése
            </button>
          </form>
        </div>

        {/* Oszlop 2: Jelszó módosítása */}
        <div
          className="modern-card"
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <h3
            style={{
              margin: "0 0 15px 0",
              color: "#2d3748",
              borderBottom: "1px solid #e2e8f0",
              paddingBottom: "10px",
              minHeight: "40px",
            }}
          >
            Jelszó módosítása
          </h3>
          <form
            onSubmit={handleChangePassword}
            className="form modern-form tasks-list"
            style={{
              height: "calc(100vh - 250px)",
              minHeight: "400px",
              overflowY: "auto",
              paddingRight: "10px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div className="form-group">
              <label>Jelenlegi jelszó</label>
              <div className="password-input-wrapper">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  maxLength={24}
                />
                <button
                  type="button"
                  className="toggle-password-btn"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  title={
                    showCurrentPassword ? "Jelszó elrejtése" : "Jelszó mutatása"
                  }
                >
                  {showCurrentPassword ? "Elrejt" : "Mutat"}
                </button>
              </div>
              <small
                style={{
                  display: "block",
                  textAlign: "right",
                  color: "#a0aec0",
                  fontSize: "0.8em",
                  marginTop: "5px",
                }}
              >
                {currentPassword.length} / 24
              </small>
            </div>
            <div className="form-group">
              <label>Új jelszó</label>
              <div className="password-input-wrapper">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  maxLength={24}
                />
                <button
                  type="button"
                  className="toggle-password-btn"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  title={
                    showNewPassword ? "Jelszó elrejtése" : "Jelszó mutatása"
                  }
                >
                  {showNewPassword ? "Elrejt" : "Mutat"}
                </button>
              </div>
              <small
                style={{
                  display: "block",
                  textAlign: "right",
                  color: "#a0aec0",
                  fontSize: "0.8em",
                  marginTop: "5px",
                }}
              >
                {newPassword.length} / 24
              </small>
            </div>
            <div className="form-group">
              <label>Új jelszó újra</label>
              <div className="password-input-wrapper">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  required
                  maxLength={24}
                />
                <button
                  type="button"
                  className="toggle-password-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  title={
                    showConfirmPassword ? "Jelszó elrejtése" : "Jelszó mutatása"
                  }
                >
                  {showConfirmPassword ? "Elrejt" : "Mutat"}
                </button>
              </div>
              <small
                style={{
                  display: "block",
                  textAlign: "right",
                  color: "#a0aec0",
                  fontSize: "0.8em",
                  marginTop: "5px",
                }}
              >
                {confirmNewPassword.length} / 24
              </small>
            </div>
            <button
              type="submit"
              className="btn-primary"
              style={{ marginTop: "auto" }}
              disabled={!isPasswordFilled}
            >
              Jelszó módosítása
            </button>
          </form>
        </div>
      </div>

      {toastMessage && (
        <div
          className={`toast-message ${toastMessage.type === "error" ? "toast-error" : ""}`}
        >
          {toastMessage.text}
        </div>
      )}
    </div>
  );
};

export default ProfileDashboard;
