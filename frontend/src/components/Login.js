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
  const SPECIALIZATIONS = ['Fűtés', 'Viz-Gáz', 'Villany', 'Egyéb'];
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate email
    if (!email || !validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Validate password length
    if (!password || password.length < 4) {
      setError('Password must be at least 4 characters long');
      return;
    }

    try {
      if (isLogin) {
        login(email, password);
        setSuccess('Login successful!');
      } else {
        // Registration validation
        if (!name || name.trim().length === 0) {
          setError('Please enter your name');
          return;
        }

        if (name.length < 2 || !/[a-zA-Z0-9]/.test(name)) {
          setError('Name must be at least 2 characters long and include letters or numbers');
          return;
        }

        register(email, password, name.trim(), role, specialization);
        setSuccess('Registration successful! Please login.');
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
    return input.replace(/[^a-zA-Z0-9\s\-]/g, '');
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
        <h1>Hibavonal Task Management</h1>
        <p className="subtitle">Role-based Access Control System</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(sanitizeEmail(e.target.value))}
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="e.g., Pass@123! or myP@ss"
                required
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '🙈 Hide' : '👁️ Show'}
              </button>
            </div>
            <small className="form-hint">Min 4 characters (special characters like !@#$%^&* allowed)</small>
          </div>

          {!isLogin && (
            <>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(sanitizeName(e.target.value))}
                  placeholder="e.g., John Doe"
                  required
                />
              </div>

              <div className="form-group">
                <label>Role</label>
                <select value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value={ROLES.EGYETEMISTA}>{ROLES.EGYETEMISTA}</option>
                  <option value={ROLES.KARBANTARTAS}>{ROLES.KARBANTARTAS}</option>
                  <option value={ROLES.KARBANTARTAS_VEZETO}>{ROLES.KARBANTARTAS_VEZETO}</option>
                  <option value={ROLES.ADMINISZTRATOR}>{ROLES.ADMINISZTRATOR}</option>
                </select>
              </div>
              {role === ROLES.KARBANTARTAS && (
                <div className="form-group">
                  <label>Specialization</label>
                  <select value={specialization} onChange={(e) => setSpecialization(e.target.value)} required>
                    <option value="">-- choose --</option>
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
            {isLogin ? 'Login' : 'Register'}
          </button>
        </form>

        <div className="toggle-auth">
          <p>
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setSuccess('');
              }}
              className="toggle-btn"
            >
              {isLogin ? 'Register' : 'Login'}
            </button>
          </p>
        </div>

        {isLogin && (
          <div className="demo-section">
            <p className="demo-title">Demo Accounts (click to autofill):</p>
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
