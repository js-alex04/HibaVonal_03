import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import EgyetemistaDashboard from './roles/EgyetemistaDashboard';
import KarbantartoDashboard from './roles/KarbantartoDashboard';
import KarbantartasVezetoDashboard from './roles/KarbantartasVezetoDashboard';
import AdminisztratoriDashboard from './roles/AdminisztratoriDashboard';
import ProfileDashboard from './ProfileDashboard';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const { user, logout, ROLES } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [showProfile, setShowProfile] = useState(false);

  const renderDashboard = () => {
    if (showProfile) {
      return <ProfileDashboard onBack={() => setShowProfile(false)} />;
    }
    switch (user.role) {
      case ROLES.EGYETEMISTA:
        return <EgyetemistaDashboard />;
      case ROLES.KARBANTARTAS:
        return <KarbantartoDashboard />;
      case ROLES.KARBANTARTAS_VEZETO:
        return <KarbantartasVezetoDashboard />;
      case ROLES.ADMINISZTRATOR:
        return <AdminisztratoriDashboard />;
      default:
        return <div>Unknown role</div>;
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>Hibavonal</h1>
          <span className="role-badge">{user.role}</span>
        </div>
        <div className="header-right">
          <span className="user-info">Üdvözlünk, {user.name}</span>
          <button onClick={logout} className="btn-logout">
            Kijelentkezés
          </button>
          <button className="btn-primary" onClick={() => setShowProfile(true)} style={{ marginLeft: '10px', padding: '6px 12px' }}>
            ⚙️ Profil
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        {renderDashboard()}
      </div>
    </div>
  );
};

export default Dashboard;
