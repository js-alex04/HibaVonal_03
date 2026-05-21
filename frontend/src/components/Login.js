import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "../styles/Login.css";

const Login = () => {
  const { login, ROLES } = useAuth();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Modal and Form state
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const demoAccounts = {
    [ROLES.EGYETEMISTA]: {
      email: "hallgato1@hibavonal.hu",
      password: "pass123",
      icon: "🎓",
      description:
        "Jelentsd be a kollégiumban észlelt hibákat, és kövesd nyomon a javításukat.",
    },
    [ROLES.KARBANTARTAS]: {
      email: "nagy.peter@hibavonal.hu",
      password: "pass123",
      icon: "🔧",
      description:
        "Tekintsd meg a neked kiosztott feladatokat és igényelj alkatrészeket vagy eszközöket a javításhoz.",
    },
    [ROLES.KARBANTARTAS_VEZETO]: {
      email: "manager@hibavonal.hu",
      password: "pass123",
      icon: "👷",
      description:
        "Oszd ki a feladatokat a karbantartóknak, és igazold vissza a megrendelt alkatrészek vagy eszközök beérkezését.",
    },
    [ROLES.ADMINISZTRATOR]: {
      email: "admin@hibavonal.hu",
      password: "pass123",
      icon: "👑",
      description:
        "Felügyeld a teljes rendszert, kezelj felhasználókat, berendezéseket, helyiségeket, szakterületeket, igényléseket, bejelentéseket és jogosultságokat.",
    },
  };

  const handleDemoLogin = async (email, password) => {
    setError("");
    setSuccess("");
    try {
      await login(email, password);
      setSuccess("Sikeres bejelentkezés! Átirányítás...");
      setShowModal(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    let finalEmail = email.trim();
    if (finalEmail && !finalEmail.includes("@")) {
      finalEmail += "@hibavonal.hu";
    }

    try {
      await login(finalEmail, password);
      setSuccess("Sikeres bejelentkezés! Átirányítás...");
      setShowModal(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const openModal = () => {
    setShowModal(true);
    setError("");
    setSuccess("");
    setEmail("");
    setPassword("");
  };

  return (
    <div className="login-container">
      <div className="login-header">
        <h1>Hibavonal Feladatkezelő</h1>
        <p className="subtitle">Válassz egy szerepkört a bejelentkezéshez!</p>
        {error && !showModal && <div className="error-message">{error}</div>}
        {success && !showModal && (
          <div className="success-message">{success}</div>
        )}
      </div>

      <div className="login-split-layout">
        {/* Manual Login/Register Card First */}
        <div
          className="login-card"
          onClick={openModal}
          tabIndex="0"
          onKeyPress={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              openModal();
            }
          }}
        >
          <div className="login-card-icon">👤</div>
          <div className="login-card-body">
            <h2 className="login-card-title">Egyéni bejelentkezés</h2>
            <p className="login-card-description">
              Jelentkezz be a saját fiókoddal, vagy regisztrálj egy újat.
            </p>
          </div>
          <div className="login-card-arrow">→</div>
        </div>

        <div className="login-divider-vertical">
          <span>VAGY</span>
        </div>

        {[
          ROLES.EGYETEMISTA,
          ROLES.KARBANTARTAS,
          ROLES.KARBANTARTAS_VEZETO,
          ROLES.ADMINISZTRATOR,
        ].map((role) => {
          const data = demoAccounts[role];
          return (
            <div
              key={role}
              className="login-card"
              onClick={() => handleDemoLogin(data.email, data.password)}
              tabIndex="0"
              onKeyPress={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleDemoLogin(data.email, data.password);
                }
              }}
            >
              <div className="login-card-icon">{data.icon}</div>
              <div className="login-card-body">
                <h2 className="login-card-title">{role}</h2>
                <p className="login-card-description">{data.description}</p>
              </div>
              <div className="login-card-arrow">→</div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="login-box">
            <button
              className="close-modal-btn"
              onClick={() => setShowModal(false)}
            >
              &times;
            </button>
            <h2>Bejelentkezés</h2>
            <form onSubmit={handleFormSubmit}>
              {error && <div className="error-message">{error}</div>}
              {success && <div className="success-message">{success}</div>}

              <div className="form-group">
                <label>Felhasználónév vagy E-mail cím</label>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="pl. admin vagy admin@hibavonal.hu"
                  required
                />
              </div>

              <div className="form-group">
                <label>Jelszó</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="toggle-password-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Elrejt" : "Mutat"}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn-primary">
                Bejelentkezés
              </button>
            </form>
            <div className="toggle-auth">
              Nincs még fiókod?
              <br></br>Új fiók igényléséhez keresd fel az adminisztrátort.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
