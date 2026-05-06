import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/Login.css';

const Login = () => {
  const { login, register, ROLES } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState(ROLES.EGYETEMISTA);
  const [specialization, setSpecialization] = useState('');
  const SPECIALIZATIONS = ['Vízvezeték-szerelő', 'Villanyszerelő', 'Asztalos', 'Lakatos', 'Informatikus', 'Egyéb'];
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
      if (isLogin) {
        await login(email, password);
        setSuccess('Sikeres bejelentkezés!');
      } else {
        // Registration validation
        if (!name || name.trim().length === 0) {
          setError('Kérjük, add meg a nevedet!');
          return;
        }

        if (name.length < 2 || !/[a-zA-Z0-9]/.test(name)) {
          setError('A névnek legalább 2 karakternek kell lennie, és tartalmaznia kell betűket vagy számokat!');
          return;
        }

        await register(email, password, name.trim(), role, specialization);
        setSuccess('Sikeres regisztráció! Kérlek, jelentkezz be.');
        setIsLogin(true);
        setEmail('');
        setPassword('');
        setName('');
        setRole(ROLES.EGYETEMISTA);
      }
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

  // Sanitize name - allowed letters, numbers, spaces, hyphens only
  const sanitizeName = (input) => {
    return input.replace(/[^a-zA-Z0-9\s\-áéíóöőúüűÁÉÍÓÖŐÚÜŰ.,]/g, '');
  };

  // Demo credentials
  const setDemoCredentials = (demoRole) => {
    const demoAccounts = {
      [ROLES.EGYETEMISTA]: { email: 'egyetemista@test.com', password: 'test123' },
      [ROLES.KARBANTARTAS]: { email: 'karbantarto@test.com', password: 'test123' },
      [ROLES.KARBANTARTAS_VEZETO]: { email: 'vezeto@test.com', password: 'test123' },
      [ROLES.ADMINISZTRATOR]: { email: 'admin@test.com', password: 'test123' }
    };

    const demo = demoAccounts[demoRole];
    setEmail(demo.email);
    setPassword(demo.password);
    setRole(demoRole);
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
              placeholder="pelda@email.hu"
              required
            />
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
            <small className="form-hint">Minimum 4 karakter (speciális karakterek, pl. !@#$%^&* engedélyezettek)</small>
          </div>

          {!isLogin && (
            <>
              <div className="form-group">
                <label>Név</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(sanitizeName(e.target.value))}
                  placeholder="pl., Kovács János"
                  required
                />
              </div>

              <div className="form-group">
                <label>Szerepkör</label>
                <select value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value={ROLES.EGYETEMISTA}>{ROLES.EGYETEMISTA}</option>
                  <option value={ROLES.KARBANTARTAS}>{ROLES.KARBANTARTAS}</option>
                  <option value={ROLES.KARBANTARTAS_VEZETO}>{ROLES.KARBANTARTAS_VEZETO}</option>
                  <option value={ROLES.ADMINISZTRATOR}>{ROLES.ADMINISZTRATOR}</option>
                </select>
              </div>
              {role === ROLES.KARBANTARTAS && (
                <div className="form-group">
                  <label>Szakterület</label>
                  <select value={specialization} onChange={(e) => setSpecialization(e.target.value)} required>
                    <option value="">-- válassz --</option>
                    {SPECIALIZATIONS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <button type="submit" className="btn-primary">
            {isLogin ? 'Bejelentkezés' : 'Regisztráció'}
          </button>
        </form>

        <div className="toggle-auth">
          <p>
            {isLogin ? "Nincs még fiókod? " : 'Már van fiókod? '}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setSuccess('');
              }}
              className="toggle-btn"
            >
              {isLogin ? 'Regisztráció' : 'Bejelentkezés'}
            </button>
          </p>
        </div>

        {isLogin && (
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
        )}
      </div>
    </div>
  );
};

export default Login;
