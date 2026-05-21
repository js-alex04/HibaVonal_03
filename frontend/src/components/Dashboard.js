import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import AdministratorDashboard from "./roles/AdministratorDashboard";
import CollegiateDashboard from "./roles/CollegiateDashboard";
import MaintenanceManagerDashboard from "./roles/MaintenanceManagerDashboard";
import MaintainerDashboard from "./roles/MaintainerDashboard";
import ProfileDashboard from "./ProfileDashboard";
import PermissionsInfoModal from "./PermissionsInfoModal";
import "../styles/Dashboard.css";

const Dashboard = () => {
  const { user, logout, ROLES } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [showProfile, setShowProfile] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [managerPage, setManagerPage] = useState(1);

  const renderDashboard = () => {
    if (showProfile) {
      return <ProfileDashboard onBack={() => setShowProfile(false)} />;
    }
    switch (user.role) {
      case ROLES.EGYETEMISTA:
        return <CollegiateDashboard />;
      case ROLES.KARBANTARTAS:
        return <MaintainerDashboard />;
      case ROLES.KARBANTARTAS_VEZETO:
        return <MaintenanceManagerDashboard currentPage={managerPage} />;
      case ROLES.ADMINISZTRATOR:
        return <AdministratorDashboard />;
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

        {user.role === ROLES.KARBANTARTAS_VEZETO && !showProfile && (
          <div className="header-center">
            <button
              className="pagination-btn"
              onClick={() => setManagerPage((p) => Math.max(1, p - 1))}
              disabled={managerPage === 1}
            >
              &lt;
            </button>
            <span className="page-info">{managerPage}. oldal</span>
            <button
              className="pagination-btn"
              onClick={() => setManagerPage((p) => Math.min(2, p + 1))}
              disabled={managerPage >= 2}
            >
              &gt;
            </button>
          </div>
        )}

        <div className="header-right">
          <span className="user-info">Üdvözlünk, {user.name}</span>
          <button
            className="btn-icon"
            onClick={() => setShowInfoModal(true)}
            title="Információ a jogosultságokról"
          >
            ℹ️
          </button>
          <button
            className="btn-icon"
            onClick={() => setShowProfile(true)}
            title="Profil beállítások"
          >
            ⚙️
          </button>
          <button onClick={logout} className="btn-logout">
            Kijelentkezés
          </button>
        </div>
      </header>

      <div className="dashboard-content">{renderDashboard()}</div>
      {showInfoModal && (
        <PermissionsInfoModal
          role={user.role}
          onClose={() => setShowInfoModal(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
