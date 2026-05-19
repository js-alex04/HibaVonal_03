import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/RoleDashboards.css';

const ProfileDashboard = ({ onBack }) => {
  const { user, updateProfile, changePassword } = useAuth();
  
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileEmail, setProfileEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      await updateProfile(profileName, profileEmail);
      setSuccess('Profil sikeresen frissítve!');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');

    if (newPassword !== confirmNewPassword) {
      setError('A két új jelszó nem egyezik!');
      return;
    }

    try {
      await changePassword(currentPassword, newPassword);
      setSuccess('Jelszó sikeresen frissítve!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="role-dashboard">
      <div className="dashboard-grid" style={{ display: 'block', maxWidth: '600px', margin: '0 auto' }}>
        <section className="section">
          <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: 0 }}>Saját profil beállítások</h2>
            <button className="btn-primary" onClick={onBack} style={{ padding: '8px 16px', width: 'auto' }}>Vissza a Dashboardra</button>
          </div>
          
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message" style={{ color: 'green', marginBottom: '15px' }}>{success}</div>}

          <form onSubmit={handleUpdateProfile} className="form" style={{ marginBottom: '30px' }}>
            <div className="form-group">
              <label>Név</label>
              <input type="text" value={profileName} onChange={(e) => setProfileName(e.target.value)} required maxLength={50} />
              <small style={{ display: 'block', textAlign: 'right', color: '#a0aec0', fontSize: '0.8em', marginTop: '5px' }}>{profileName.length} / 50</small>
            </div>
            <div className="form-group">
              <label>E-mail</label>
              <input type="email" value={profileEmail} onChange={(e) => setProfileEmail(e.target.value)} required maxLength={50} />
              <small style={{ display: 'block', textAlign: 'right', color: '#a0aec0', fontSize: '0.8em', marginTop: '5px' }}>{profileEmail.length} / 50</small>
            </div>
            <button type="submit" className="btn-primary">Profil mentése</button>
          </form>
          
          <form onSubmit={handleChangePassword} className="form">
            <div className="form-group">
              <label>Jelenlegi jelszó</label>
              <div className="password-input-wrapper">
                <input type={showCurrentPassword ? 'text' : 'password'} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required maxLength={50} />
                <button type="button" className="toggle-password-btn" onClick={() => setShowCurrentPassword(!showCurrentPassword)} title={showCurrentPassword ? 'Jelszó elrejtése' : 'Jelszó mutatása'}>
                  {showCurrentPassword ? '◡ Elrejtés' : '👁️ Mutatás'}
                </button>
              </div>
              <small style={{ display: 'block', textAlign: 'right', color: '#a0aec0', fontSize: '0.8em', marginTop: '5px' }}>{currentPassword.length} / 50</small>
            </div>
            <div className="form-group">
              <label>Új jelszó</label>
              <div className="password-input-wrapper">
                <input type={showNewPassword ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required maxLength={50} />
                <button type="button" className="toggle-password-btn" onClick={() => setShowNewPassword(!showNewPassword)} title={showNewPassword ? 'Jelszó elrejtése' : 'Jelszó mutatása'}>
                  {showNewPassword ? '◡ Elrejtés' : '👁️ Mutatás'}
                </button>
              </div>
              <small style={{ display: 'block', textAlign: 'right', color: '#a0aec0', fontSize: '0.8em', marginTop: '5px' }}>{newPassword.length} / 50</small>
            </div>
            <div className="form-group">
              <label>Új jelszó újra</label>
              <div className="password-input-wrapper">
                <input type={showConfirmPassword ? 'text' : 'password'} value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} required maxLength={50} />
                <button type="button" className="toggle-password-btn" onClick={() => setShowConfirmPassword(!showConfirmPassword)} title={showConfirmPassword ? 'Jelszó elrejtése' : 'Jelszó mutatása'}>
                  {showConfirmPassword ? '◡ Elrejtés' : '👁️ Mutatás'}
                </button>
              </div>
              <small style={{ display: 'block', textAlign: 'right', color: '#a0aec0', fontSize: '0.8em', marginTop: '5px' }}>{confirmNewPassword.length} / 50</small>
            </div>
            <button type="submit" className="btn-primary">Jelszó módosítása</button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default ProfileDashboard;