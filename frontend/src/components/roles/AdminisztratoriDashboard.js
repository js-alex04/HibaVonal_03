
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import '../../styles/RoleDashboards.css';

const AdminisztratoriDashboard = () => {
  const { user, users, tasks, toolRequests, equipmentOrders, premises, appliances, specializations, register, ROLES, deleteTask, createPremise, deletePremise, deleteUser, changeUserRole, createAppliance, deleteAppliance, assignApplianceToPremise, removeApplianceFromPremise, createSpecialization, updateSpecialization, deleteSpecialization, deleteFeedback } = useAuth();
  const [showAddUser, setShowAddUser] = useState(false);
  const [showAddPremise, setShowAddPremise] = useState(false);
  const [showAddAppliance, setShowAddAppliance] = useState(false);
  const [showAddSpecialization, setShowAddSpecialization] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState(ROLES.EGYETEMISTA);
  const [newUserSpecialization, setNewUserSpecialization] = useState('');
  const [newUserPremiseId, setNewUserPremiseId] = useState('');
  const [newPremiseName, setNewPremiseName] = useState('');
  const [newPremiseFloor, setNewPremiseFloor] = useState(1);
  const [newPremiseType, setNewPremiseType] = useState(0);
  const [newApplianceName, setNewApplianceName] = useState('');
  const [newAppliancePremiseId, setNewAppliancePremiseId] = useState('');
  const [newSpecializationName, setNewSpecializationName] = useState('');
  const [requestFilter, setRequestFilter] = useState('all');
  const [taskFilter, setTaskFilter] = useState('all');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Sanitize input
  const sanitizeInput = (input) => {
    return input.replace(/[<>"']/g, '').trim();
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newUserName || newUserName.trim().length === 0) {
      setError('Kérjük, add meg a nevet!');
      return;
    }

    if (newUserName.trim().length < 2 || !/[a-zA-Z0-9]/.test(newUserName)) {
      setError('A névnek legalább 2 karakterből kell állnia, és betűket vagy számokat kell tartalmaznia!');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!newUserEmail || !emailRegex.test(newUserEmail)) {
      setError('Kérjük, adj meg egy érvényes e-mail címet!');
      return;
    }

    if (!newUserPassword || newUserPassword.length < 4) {
      setError('A jelszónak legalább 4 karakterből kell állnia!');
      return;
    }

    if (newUserRole === ROLES.EGYETEMISTA && !newUserPremiseId) {
      setError('Kérjük, válaszd ki a kollégista szobáját!');
      return;
    }

    try {
      await register(
        sanitizeInput(newUserEmail),
        newUserPassword,
        sanitizeInput(newUserName),
        newUserRole,
        newUserRole === ROLES.KARBANTARTAS ? newUserSpecialization : '',
        newUserRole === ROLES.EGYETEMISTA ? newUserPremiseId : null
      );
      setSuccess('Felhasználó sikeresen létrehozva!');
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserName('');
      setNewUserRole(ROLES.EGYETEMISTA);
      setNewUserPremiseId('');
      setShowAddUser(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddPremise = async (e) => {
    e.preventDefault();
    try {
      await createPremise(sanitizeInput(newPremiseName), newPremiseFloor, parseInt(newPremiseType));
      setNewPremiseName('');
      setNewPremiseFloor(1);
      setNewPremiseType(0);
      setShowAddPremise(false);
      setSuccess('Helyiség sikeresen létrehozva!');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeletePremise = async (id) => {
    if (window.confirm('Biztosan törölni szeretnéd ezt a helyiséget? (Figyelem: A hozzá tartozó berendezések és hibák is érintettek lehetnek!)')) {
      try {
        await deletePremise(id);
        setSuccess('Helyiség törölve!');
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Biztosan törölni szeretnéd ezt a hibajelentést? (Végleges törlés az adatbázisból)')) {
      try {
        await deleteTask(taskId);
        setSuccess('Hiba sikeresen törölve!');
      } catch(err) {
        setError(err.message);
      }
    }
  };

  const handleDeleteFeedback = async (feedbackId, taskId) => {
    if (window.confirm('Biztosan törölni szeretnéd ezt a visszajelzést?')) {
      try {
        await deleteFeedback(feedbackId, taskId);
        setSuccess('Visszajelzés törölve!');
      } catch(err) {
        setError(err.message);
      }
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Biztosan törölni szeretnéd ezt a felhasználót?')) {
      try {
        await deleteUser(userId);
        setSuccess('Felhasználó sikeresen törölve!');
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleChangeRole = async (userId, currentRole) => {
    const newRoleStr = window.prompt(`Jelenlegi szerepkör: ${currentRole}\nÍrd be az új szerepkört:\n0 - Egyetemista\n1 - Karbantartó\n2 - Vezető\n3 - Admin`, "");
    if (newRoleStr !== null) {
      let newRole;
      if (newRoleStr === "0") newRole = ROLES.EGYETEMISTA;
      else if (newRoleStr === "1") newRole = ROLES.KARBANTARTAS;
      else if (newRoleStr === "2") newRole = ROLES.KARBANTARTAS_VEZETO;
      else if (newRoleStr === "3") newRole = ROLES.ADMINISZTRATOR;
      else return alert("Érvénytelen választás!");

      try {
        await changeUserRole(userId, newRole);
        setSuccess('Szerepkör sikeresen módosítva!');
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleAddAppliance = async (e) => {
    e.preventDefault();
    if (!newAppliancePremiseId) {
      setError('Kérjük, válassz egy helyiséget a berendezéshez!');
      return;
    }
    try {
      await createAppliance(sanitizeInput(newApplianceName), newAppliancePremiseId);
      setNewApplianceName('');
      setNewAppliancePremiseId('');
      setShowAddAppliance(false);
      setSuccess('Berendezés sikeresen létrehozva!');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteAppliance = async (id) => {
    if (window.confirm('Biztosan törölni szeretnéd ezt a berendezést?')) {
      try {
        await deleteAppliance(id);
        setSuccess('Berendezés törölve!');
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleAssignAppliance = async (applianceId, currentPremiseId, newPremiseId) => {
    try {
      if (!newPremiseId) {
        // Eltávolítás a szobából
        if (currentPremiseId) {
          await removeApplianceFromPremise(currentPremiseId, applianceId);
          setSuccess('Berendezés eltávolítva a helyiségből!');
        }
      } else {
        // Hozzárendelés / Áthelyezés új szobába
        await assignApplianceToPremise(newPremiseId, applianceId);
        setSuccess('Berendezés sikeresen áthelyezve!');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddSpecialization = async (e) => {
    e.preventDefault();
    try {
      await createSpecialization(sanitizeInput(newSpecializationName));
      setNewSpecializationName('');
      setShowAddSpecialization(false);
      setSuccess('Szakterület sikeresen létrehozva!');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateSpecialization = async (id, currentName) => {
    const newName = window.prompt("Írd be az új szakterület nevet:", currentName);
    if (newName !== null && newName.trim() !== "" && newName !== currentName) {
      try {
        await updateSpecialization(id, sanitizeInput(newName));
        setSuccess('Szakterület sikeresen frissítve!');
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleDeleteSpecialization = async (id) => {
    if (window.confirm('Biztosan törölni szeretnéd ezt a szakterületet?')) {
      try {
        await deleteSpecialization(id);
        setSuccess('Szakterület törölve!');
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const getRoleCount = (role) => users.filter(u => u.role === role).length;

  const completedTasks = tasks.filter(t => t.completed);
  const filteredRequests = toolRequests.filter(tr => requestFilter === 'all' || tr.status === requestFilter);
  const filteredTasks = tasks.filter(t => taskFilter === 'all' || t.status === taskFilter);

  const stats = {
    totalUsers: users.length,
    egyetemista: getRoleCount(ROLES.EGYETEMISTA),
    karbantarto: getRoleCount(ROLES.KARBANTARTAS),
    vezeto: getRoleCount(ROLES.KARBANTARTAS_VEZETO),
    admin: getRoleCount(ROLES.ADMINISZTRATOR),
    totalTasks: tasks.length,
    totalToolRequests: toolRequests.length,
    pendingRequests: toolRequests.filter(tr => tr.status === 'pending').length,
    completedTasks: completedTasks.length,
  };

  return (
    <div className="role-dashboard">
      <div className="dashboard-grid-admin">
        {/* Statistics Section */}
        <section className="section stats-section">
          <h2>Rendszer Statisztikák</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>{stats.totalUsers}</h3>
              <p>Összes Felhasználó</p>
            </div>
            <div className="stat-card">
              <h3>{stats.egyetemista}</h3>
              <p>Egyetemista</p>
            </div>
            <div className="stat-card">
              <h3>{stats.karbantarto}</h3>
              <p>Karbantartó</p>
            </div>
            <div className="stat-card">
              <h3>{stats.vezeto}</h3>
              <p>Vezető</p>
            </div>
            <div className="stat-card">
              <h3>{stats.completedTasks}</h3>
              <p>Befejezett Hibák</p>
            </div>
            <div className="stat-card pending">
              <h3>{stats.pendingRequests}</h3>
              <p>Függőben lévő Eszközigénylések</p>
            </div>
          </div>
        </section>

        {/* User Management Section */}
        <section className="section">
          <div className="section-header">
            <h2>Felhasználókezelés</h2>
            <button className="btn-add" onClick={() => setShowAddUser(!showAddUser)}>
              {showAddUser ? 'Mégse' : '+ Új Felhasználó'}
            </button>
          </div>

          {showAddUser && (
            <form onSubmit={handleAddUser} className="form">
              <div className="form-group">
                <label>Név</label>
            <input type="text" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} placeholder="Felhasználó teljes neve" required />
              </div>
              <div className="form-group">
                <label>E-mail Cím</label>
            <input type="email" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} placeholder="pelda@email.hu" required />
              </div>
              <div className="form-group">
                <label>Jelszó</label>
                <input type="password" value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} placeholder="Kezdeti jelszó" required />
              </div>
              <div className="form-group">
                <label>Szerepkör</label>
                <select value={newUserRole} onChange={(e) => setNewUserRole(e.target.value)}>
                  <option value={ROLES.EGYETEMISTA}>{ROLES.EGYETEMISTA}</option>
                  <option value={ROLES.KARBANTARTAS}>{ROLES.KARBANTARTAS}</option>
                  <option value={ROLES.KARBANTARTAS_VEZETO}>{ROLES.KARBANTARTAS_VEZETO}</option>
                  <option value={ROLES.ADMINISZTRATOR}>{ROLES.ADMINISZTRATOR}</option>
                </select>
              </div>
              {newUserRole === ROLES.KARBANTARTAS && (
                <div className="form-group">
                  <label>Szakterület</label>
                  <select value={newUserSpecialization} onChange={(e) => setNewUserSpecialization(e.target.value)} required>
                    <option value="">-- Válassz --</option>
                    {specializations.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              )}
              {newUserRole === ROLES.EGYETEMISTA && (
                <div className="form-group">
                  <label>Kollégiumi Szoba (Helyiség)</label>
                  <select value={newUserPremiseId} onChange={(e) => setNewUserPremiseId(e.target.value)} required>
                    <option value="">-- Válassz szobát --</option>
                    {premises.filter(p => p.type === 'DormRoom' || p.type === 0).map(p => (
                      <option key={p.id} value={p.id}>{p.nameOrNumber}</option>
                    ))}
                  </select>
                </div>
              )}
              {error && <div className="error-message">{error}</div>}
              {success && <div className="success-message">{success}</div>}
              <button type="submit" className="btn-primary">Felhasználó Létrehozása</button>
            </form>
          )}

          <div className="users-table" style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '10px' }}>
            <table>
              <thead>
                <tr>
                  <th>Név</th>
                  <th>E-mail</th>
                  <th>Szerepkör</th>
                  <th>Szakterület</th>
                  <th>Műveletek</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td><span className={`role-badge role-${u.role.toLowerCase()}`}>{u.role}</span></td>
                    <td>{u.specialization || '-'}</td>
                    <td>
                      {String(u.id) !== String(user.id) && (
                        <>
                          <button className="btn-approve" style={{padding: '4px 8px', fontSize: '0.8em', marginRight: '5px'}} onClick={() => handleChangeRole(u.id, u.role)}>Jogosultság</button>
                          <button className="btn-delete-small" onClick={() => handleDeleteUser(u.id)}>Törlés</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Premises Management */}
        <section className="section">
          <div className="section-header">
            <h2>Helyiségek / Szobák Listája</h2>
            <button className="btn-add" onClick={() => setShowAddPremise(!showAddPremise)}>
              {showAddPremise ? 'Mégse' : '+ Új Helyiség'}
            </button>
          </div>

          {showAddPremise && (
            <form onSubmit={handleAddPremise} className="form">
              <div className="form-group">
                <label>Név vagy Szám</label>
                <input type="text" value={newPremiseName} onChange={(e) => setNewPremiseName(e.target.value)} placeholder="pl. 101-es szoba, Mosókonyha" required />
              </div>
              <div className="form-group">
                <label>Emelet</label>
                <input type="number" value={newPremiseFloor} onChange={(e) => setNewPremiseFloor(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Típus</label>
                <select value={newPremiseType} onChange={(e) => setNewPremiseType(e.target.value)}>
                  <option value={0}>Kollégiumi szoba</option>
                  <option value={1}>Közösségi tér</option>
                  <option value={2}>Kiszolgáló helyiség</option>
                </select>
              </div>
              <button type="submit" className="btn-primary">Helyiség Hozzáadása</button>
            </form>
          )}

          <div className="premises-list" style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '10px' }}>
            {(!premises || premises.length === 0) ? (
              <p className="empty-state">Nincsenek helyiségek a rendszerben</p>
            ) : (
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Azonosító</th>
                    <th>Név / Szám</th>
                    <th>Emelet</th>
                    <th>Típus</th>
                    <th>Műveletek</th>
                  </tr>
                </thead>
                <tbody>
                  {premises.map(p => (
                    <tr key={p.id}>
                      <td>{p.id}</td>
                      <td>{p.nameOrNumber}</td>
                      <td>{p.floor}. emelet</td>
                      <td>{p.type === 0 || p.type === 'DormRoom' ? 'Kollégiumi szoba' : p.type === 1 || p.type === 'CommonArea' ? 'Közösségi tér' : 'Kiszolgáló helyiség'}</td>
                      <td>
                        <button className="btn-delete-small" onClick={() => handleDeletePremise(p.id)}>Törlés</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* Appliances Management */}
        <section className="section">
          <div className="section-header">
            <h2>Berendezések Leltára</h2>
            <button className="btn-add" onClick={() => setShowAddAppliance(!showAddAppliance)}>
              {showAddAppliance ? 'Mégse' : '+ Új Berendezés'}
            </button>
          </div>

          {showAddAppliance && (
            <form onSubmit={handleAddAppliance} className="form">
              <div className="form-group">
                <label>Berendezés Neve</label>
                <input type="text" value={newApplianceName} onChange={(e) => setNewApplianceName(e.target.value)} placeholder="pl. Mosógép, 1-es Lift, TV" required />
              </div>
              <div className="form-group">
                <label>Elhelyezés (Helyiség)</label>
                <select value={newAppliancePremiseId} onChange={(e) => setNewAppliancePremiseId(e.target.value)} required>
                  <option value="">-- Válassz helyiséget --</option>
                  {premises.map(p => (
                    <option key={p.id} value={p.id}>{p.nameOrNumber}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn-primary">Berendezés Hozzáadása</button>
            </form>
          )}

          <div className="appliances-list" style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '10px' }}>
            {(!appliances || appliances.length === 0) ? (
              <p className="empty-state">Nincsenek berendezések a leltárban</p>
            ) : (
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Azonosító</th>
                    <th>Név</th>
                    <th>Jelenlegi Helyiség</th>
                    <th>Műveletek</th>
                  </tr>
                </thead>
                <tbody>
                  {appliances.map(a => (
                    <tr key={a.id}>
                      <td>{a.id}</td>
                      <td>{a.name}</td>
                      <td>
                        <select 
                          value={a.premiseId || ''} 
                          onChange={(e) => handleAssignAppliance(a.id, a.premiseId, e.target.value)}
                        >
                          <option value="">-- Raktáron (Nincs kiosztva) --</option>
                          {premises.map(p => (
                            <option key={p.id} value={p.id}>{p.nameOrNumber}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <button className="btn-delete-small" onClick={() => handleDeleteAppliance(a.id)}>Selejtezés</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* Specializations Management */}
        <section className="section">
          <div className="section-header">
            <h2>Karbantartói Szakterületek (Kategóriák)</h2>
            <button className="btn-add" onClick={() => setShowAddSpecialization(!showAddSpecialization)}>
              {showAddSpecialization ? 'Mégse' : '+ Új Szakterület'}
            </button>
          </div>

          {showAddSpecialization && (
            <form onSubmit={handleAddSpecialization} className="form">
              <div className="form-group">
                <label>Szakterület / Kategória Neve</label>
                <input type="text" value={newSpecializationName} onChange={(e) => setNewSpecializationName(e.target.value)} placeholder="pl. Informatika, Asztalos" required />
              </div>
              <button type="submit" className="btn-primary">Hozzáadás</button>
            </form>
          )}

          <div className="specializations-list" style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '10px' }}>
            {(!specializations || specializations.length === 0) ? (
              <p className="empty-state">Nincsenek szakterületek a rendszerben</p>
            ) : (
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Azonosító</th>
                    <th>Név</th>
                    <th>Műveletek</th>
                  </tr>
                </thead>
                <tbody>
                  {specializations.map(s => (
                    <tr key={s.id}>
                      <td>{s.id}</td>
                      <td>{s.name}</td>
                      <td>
                        <button className="btn-approve" style={{padding: '4px 8px', fontSize: '0.8em', marginRight: '5px'}} onClick={() => handleUpdateSpecialization(s.id, s.name)}>Módosítás</button>
                        <button className="btn-delete-small" onClick={() => handleDeleteSpecialization(s.id)}>Törlés</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* Tool Orders from Maintainers */}
        <section className="section">
          <h2>Karbantartói Eszközigénylések Rendszere</h2>
          <div className="filter-controls">
            <button className={`filter-btn ${requestFilter === 'pending' ? 'active' : ''}`} onClick={() => setRequestFilter('pending')}>Függőben</button>
            <button className={`filter-btn ${requestFilter === 'approved' ? 'active' : ''}`} onClick={() => setRequestFilter('approved')}>Jóváhagyva</button>
            <button className={`filter-btn ${requestFilter === 'rejected' ? 'active' : ''}`} onClick={() => setRequestFilter('rejected')}>Elutasítva</button>
            <button className={`filter-btn ${requestFilter === 'all' ? 'active' : ''}`} onClick={() => setRequestFilter('all')}>Összes</button>
          </div>

          <div className="orders-list" style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '10px' }}>
            {filteredRequests.length === 0 ? (
              <p className="empty-state">Nincs megjeleníthető rendelés</p>
            ) : (
              filteredRequests.map(req => {
                const requester = users.find(u => String(u.id) === String(req.requestedBy));
                return (
                <div key={req.id} className="order-card">
                  <div className="order-info">
                    <h4>{req.toolName}</h4>
                    <p>Kért mennyiség: <strong>{req.quantity}</strong> db</p>
                    <p>Kérte: {requester?.name || 'Ismeretlen'}</p>
                    <small>{new Date(req.createdAt).toLocaleDateString()}</small>
                  </div>
                  <div className="order-actions">
                    <span className={`status-badge status-${req.status}`}>
                      {req.status === 'pending' ? 'Függőben' : req.status === 'approved' ? 'Jóváhagyva' : 'Elutasítva'}
                    </span>
                  </div>
                </div>
              )})
            )}
          </div>
        </section>

        {/* All Faults / Tasks */}
        <section className="section">
          <h2>Hibajelentések Teljeskörű Felügyelete</h2>
          <div className="filter-controls">
            <button className={`filter-btn ${taskFilter === 'pending' ? 'active' : ''}`} onClick={() => setTaskFilter('pending')}>Függőben</button>
            <button className={`filter-btn ${taskFilter === 'in_progress' ? 'active' : ''}`} onClick={() => setTaskFilter('in_progress')}>Folyamatban</button>
            <button className={`filter-btn ${taskFilter === 'completed' ? 'active' : ''}`} onClick={() => setTaskFilter('completed')}>Kész</button>
            <button className={`filter-btn ${taskFilter === 'all' ? 'active' : ''}`} onClick={() => setTaskFilter('all')}>Összes</button>
          </div>
          <div className="tasks-list" style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '10px' }}>
            {filteredTasks.length === 0 ? (
              <p className="empty-state">Nincsenek hibajelentések</p>
            ) : (
              filteredTasks.map(task => {
                const assignee = users.find(u => String(u.id) === String(task.assignedTo));
                const reporter = users.find(u => String(u.id) === String(task.createdBy));
                return (
                  <div key={task.id} className="task-card task-completed">
                    <div className="task-header">
                      <h4>{task.title}</h4>
                      <div>
                        <span className={`status-badge status-${task.status}`} style={{marginRight: '10px'}}>
                            {task.status === 'pending' ? 'Függőben' : task.status === 'in_progress' ? 'Folyamatban' : 'Kész'}
                        </span>
                        <button className="btn-delete-small" onClick={() => handleDeleteTask(task.id)}>Törlés</button>
                      </div>
                    </div>
                    <p>{task.description}</p>
                    <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', fontSize: '0.9em', color: '#4a5568', marginTop: '10px' }}>
                        {task.location && <span><strong>Helyszín:</strong> {task.location}</span>}
                        {reporter && <span><strong>Bejelentő:</strong> {reporter.name}</span>}
                        {assignee && <span><strong>Kiosztva:</strong> {assignee.name}</span>}
                    </div>
                    
                    {task._backendData?.feedbacks && task._backendData.feedbacks.length > 0 && (
                      <div style={{ margin: '10px 0', padding: '8px', backgroundColor: '#e6ffe6', borderRadius: '4px', borderLeft: '4px solid #4caf50' }}>
                        <strong>Hallgató visszajelzése:</strong>
                        {task._backendData.feedbacks.map(fb => (
                            <div key={fb.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '5px' }}>
                                <p style={{ margin: '0', fontSize: '0.9em', fontStyle: 'italic' }}>"{fb.text || fb.message || fb.description}"</p>
                                <button className="btn-delete-small" onClick={() => handleDeleteFeedback(fb.id, task.id)}>Törlés</button>
                            </div>
                        ))}
                      </div>
                    )}

                    <div style={{ marginTop: '10px' }}>
                        <small>Bejelentve: {new Date(task.createdAt).toLocaleDateString()}</small>
                        {task.completedAt && <small style={{ marginLeft: '15px' }}>Befejezve: {new Date(task.completedAt).toLocaleDateString()}</small>}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Permissions */}
        <section className="section info-section">
          <h3>Jogosultságaid</h3>
          <ul className="permissions-list">
            <li>Teljes hozzáférés a rendszer adataihoz</li>
            <li>Felhasználói fiókok kezelése és létrehozása</li>
            <li>Helyiségek / Szobák listájának megtekintése</li>
            <li>Karbantartási vezetőtől érkező eszközrendelések megtekintése (jóváhagyás nélkül)</li>
            <li>Befejezett hibák nyomon követése és törlése az adatbázisból</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default AdminisztratoriDashboard;
