import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/Login.css';

const Login = () => {
  const { login, ROLES } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate email
    if (!email || !validateEmail(email)) {
      setError('Kérjük, adj meg egy érvényes e-mail címet!');
      return;
    }

    // Validate password length
    if (!password || password.length < 4) {
      setError('A jelszónak legalább 4 karakterből kell állnia!');
      return;
    }

    try {
      await login(email, password);
      setSuccess('Sikeres bejelentkezés!');
    } catch (err) {
      setError(err.message);
    }
  };

  // Email validation
  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  // Sanitize email - only allow alphanumeric, @, ., -, _
  const sanitizeEmail = (input) => {
    return input.replace(/[^a-zA-Z0-9@.\-_]/g, '').trim();
  };

  // Demo bejelentkezési adatok (Ezeket kell létrehoznod az adatbázisban az Admin felületen)
  const setDemoCredentials = (demoRole) => {
    const demoAccounts = {
      [ROLES.EGYETEMISTA]: { email: 'hallgato1@hibavonal.hu', password: 'pass123' },
      [ROLES.KARBANTARTAS]: { email: 'sanyi@hibavonal.hu', password: 'pass123' },
      [ROLES.KARBANTARTAS_VEZETO]: { email: 'manager@hibavonal.hu', password: 'pass123' },
      [ROLES.ADMINISZTRATOR]: { email: 'admin@hibavonal.hu', password: 'pass123' } // A JWT tokened alapján ez a létező adminod
    };

    const demo = demoAccounts[demoRole];
    setEmail(demo.email);
    setPassword(demo.password);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Hibavonal Feladatkezelő</h1>
        <p className="subtitle">Szerepkör-alapú hozzáférés-kezelő rendszer</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>E-mail cím</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(sanitizeEmail(e.target.value))}
              placeholder="pelda@hibavonal.hu"
              required
              maxLength={50}
            />
            <small style={{ display: 'block', textAlign: 'right', color: '#a0aec0', fontSize: '0.8em', marginTop: '5px' }}>{email.length} / 50</small>
          </div>

          <div className="form-group">
            <label>Jelszó</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="pl., Titkos@123! vagy Jelszo1"
                required
                maxLength={50}
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Jelszó elrejtése' : 'Jelszó mutatása'}
              >
                {showPassword ? '◡ Elrejtés' : '👁️ Mutatás'}
              </button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <small className="form-hint" style={{ marginTop: '5px' }}>Minimum 4 karakter</small>
              <small style={{ color: '#a0aec0', fontSize: '0.8em', marginTop: '5px' }}>{password.length} / 50</small>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <button type="submit" className="btn-primary">
            Bejelentkezés
          </button>
        </form>

        <div className="demo-section">
          <p className="demo-title">Demo Fiókok (kattints az automatikus kitöltéshez):</p>
          <div className="demo-buttons">
            <button
              type="button"
              onClick={() => setDemoCredentials(ROLES.EGYETEMISTA)}
              className="demo-btn"
            >
              Egyetemista
            </button>
            <button
              type="button"
              onClick={() => setDemoCredentials(ROLES.KARBANTARTAS)}
              className="demo-btn"
            >
              Karbantartó
            </button>
            <button
              type="button"
              onClick={() => setDemoCredentials(ROLES.KARBANTARTAS_VEZETO)}
              className="demo-btn"
            >
              Vezető
            </button>
            <button
              type="button"
              onClick={() => setDemoCredentials(ROLES.ADMINISZTRATOR)}
              className="demo-btn"
            >
              Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
