
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import '../../styles/RoleDashboards.css';

const AdminisztratoriDashboard = () => {
  const { user, users, tasks, toolRequests, equipmentOrders, premises, appliances, specializations, register, ROLES, deleteTask, createPremise, deletePremise, deleteUser, changeUserRole, createAppliance, deleteAppliance, assignApplianceToPremise, removeApplianceFromPremise, updateAppliance, createSpecialization, updateSpecialization, deleteSpecialization, deleteFeedback } = useAuth();
  const [showAddUser, setShowAddUser] = useState(false);
  const [showAddPremise, setShowAddPremise] = useState(false);
  const [showAddAppliance, setShowAddAppliance] = useState(false);
  const [showAddSpecialization, setShowAddSpecialization] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState(ROLES.EGYETEMISTA);
  const [newUserSpecialization, setNewUserSpecialization] = useState([]);
  const [newUserPremiseId, setNewUserPremiseId] = useState('');
  const [newPremiseName, setNewPremiseName] = useState('');
  const [newPremiseFloor, setNewPremiseFloor] = useState(1);
  const [newPremiseType, setNewPremiseType] = useState(0);
  const [newApplianceName, setNewApplianceName] = useState('');
  const [newAppliancePremiseId, setNewAppliancePremiseId] = useState('');
  const [showEditAppliance, setShowEditAppliance] = useState(false);
  const [editApplianceId, setEditApplianceId] = useState(null);
  const [editApplianceName, setEditApplianceName] = useState('');
  const [editAppliancePremiseId, setEditAppliancePremiseId] = useState('');
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

    if (newUserRole === ROLES.KARBANTARTAS && (!newUserSpecialization || newUserSpecialization.length === 0)) {
      setError('Kérjük, válassz legalább egy szakterületet a karbantartónak!');
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
        newUserRole === ROLES.KARBANTARTAS ? newUserSpecialization : [],
        newUserRole === ROLES.EGYETEMISTA ? newUserPremiseId : null
      );
      setSuccess('Felhasználó sikeresen létrehozva!');
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserName('');
      setNewUserRole(ROLES.EGYETEMISTA);
      setNewUserSpecialization([]);
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

  const handleChangeRole = async (userId, newRole) => {
    try {
      await changeUserRole(userId, newRole);
      setSuccess('Szerepkör sikeresen módosítva!');
    } catch (err) {
      setError(err.message);
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

  const handleEditApplianceClick = (appliance) => {
    setEditApplianceId(appliance.id);
    setEditApplianceName(appliance.name);
    setEditAppliancePremiseId(appliance.premiseId ? appliance.premiseId.toString() : ''); // Convert to string for select value
    setShowEditAppliance(true);
    setError('');
    setSuccess('');
  };

  const handleUpdateAppliance = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      await updateAppliance(editApplianceId, sanitizeInput(editApplianceName), editAppliancePremiseId);
      setSuccess('Berendezés sikeresen frissítve!');
      setShowEditAppliance(false);
      setEditApplianceId(null);
      setEditApplianceName('');
      setEditAppliancePremiseId('');
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
  const filteredTasks = tasks.filter(t => {
    if (taskFilter === 'all') return true;
    const rawStatus = t._backendData?.status;
    if (taskFilter === 'Pending') return rawStatus === 0 || rawStatus === 'Pending' || (!rawStatus && t.status === 'pending');
    if (taskFilter === 'InProgress') return rawStatus === 1 || rawStatus === 'InProgress' || (!rawStatus && t.status === 'in_progress');
    if (taskFilter === 'AwaitingParts') return rawStatus === 2 || rawStatus === 'AwaitingParts';
    if (taskFilter === 'Repaired') return rawStatus === 3 || rawStatus === 'Repaired' || (!rawStatus && t.status === 'completed');
    if (taskFilter === 'Unrepairable') return rawStatus === 4 || rawStatus === 'Unrepairable';
    return false;
  });

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
            <input type="text" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} placeholder="Felhasználó teljes neve" required maxLength={50} />
                <small style={{ display: 'block', textAlign: 'right', color: '#a0aec0', fontSize: '0.8em', marginTop: '5px' }}>{newUserName.length} / 50</small>
              </div>
              <div className="form-group">
                <label>E-mail Cím</label>
            <input type="email" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} placeholder="pelda@hibavonal.hu" required maxLength={50} />
                <small style={{ display: 'block', textAlign: 'right', color: '#a0aec0', fontSize: '0.8em', marginTop: '5px' }}>{newUserEmail.length} / 50</small>
              </div>
              <div className="form-group">
                <label>Jelszó</label>
                <input type="password" value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} placeholder="Kezdeti jelszó" required maxLength={50} />
                <small style={{ display: 'block', textAlign: 'right', color: '#a0aec0', fontSize: '0.8em', marginTop: '5px' }}>{newUserPassword.length} / 50</small>
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
                  <label>Szakterületek (Több is választható)</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '10px', border: '2px solid #e0e0e0', borderRadius: '5px' }}>
                    {specializations.map(s => (
                      <label key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'normal', cursor: 'pointer', fontSize: '14px', color: '#555' }}>
                        <input
                          type="checkbox"
                          value={s.id}
                          checked={Array.isArray(newUserSpecialization) ? newUserSpecialization.includes(String(s.id)) : false}
                          onChange={(e) => {
                            const idStr = String(s.id);
                            if (e.target.checked) {
                              setNewUserSpecialization(prev => Array.isArray(prev) ? [...prev, idStr] : [idStr]);
                            } else {
                              setNewUserSpecialization(prev => Array.isArray(prev) ? prev.filter(item => item !== idStr) : []);
                            }
                          }}
                          style={{ width: 'auto', margin: 0 }}
                        />
                        {s.name}
                      </label>
                    ))}
                  </div>
                </div>
              )}
              {newUserRole === ROLES.EGYETEMISTA && (
                <div className="form-group">
                  <label>Kollégiumi Szoba (Helyiség)</label>
                  <select value={newUserPremiseId} onChange={(e) => setNewUserPremiseId(e.target.value)} required>
                    <option value="">-- Válassz szobát --</option>
                    {premises.map(p => (
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
                  <td>
                    {String(u.id) !== String(user.id) ? (
                      <select value={u.role} onChange={(e) => handleChangeRole(u.id, e.target.value)}>
                        <option value={ROLES.EGYETEMISTA}>{ROLES.EGYETEMISTA}</option>
                        <option value={ROLES.KARBANTARTAS}>{ROLES.KARBANTARTAS}</option>
                        <option value={ROLES.KARBANTARTAS_VEZETO}>{ROLES.KARBANTARTAS_VEZETO}</option>
                        <option value={ROLES.ADMINISZTRATOR}>{ROLES.ADMINISZTRATOR}</option>
                      </select>
                    ) : (
                      <span className={`role-badge role-${u.role.toLowerCase()}`}>{u.role}</span>
                    )}
                  </td>
                    <td>{u.specialization || '-'}</td>
                    <td>
                      {String(u.id) !== String(user.id) && (
                        <>
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
                <input type="text" value={newPremiseName} onChange={(e) => setNewPremiseName(e.target.value)} placeholder="pl. 101-es szoba, Mosókonyha" required maxLength={30} />
                <small style={{ display: 'block', textAlign: 'right', color: '#a0aec0', fontSize: '0.8em', marginTop: '5px' }}>{newPremiseName.length} / 30</small>
              </div>
              <div className="form-group">
                <label>Emelet</label>
                <input type="number" value={newPremiseFloor} onChange={(e) => setNewPremiseFloor(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Típus</label>
                <select value={newPremiseType} onChange={(e) => setNewPremiseType(e.target.value)}>
                  <option value={0}>Közösségi tér</option>
                  <option value={1}>Kollégiumi szoba (Privát)</option>
                </select>
              </div>
              <button type="submit" className="btn-primary">Helyiség Hozzáadása</button>
            </form>
          )}

          <div className="premises-list users-table" style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '10px' }}>
            {(!premises || premises.length === 0) ? (
              <p className="empty-state">Nincsenek helyiségek a rendszerben</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Név / Szám</th>
                    <th>Emelet</th>
                    <th>Típus</th>
                    <th>Műveletek</th>
                  </tr>
                </thead>
                <tbody>
                  {premises.map(p => (
                    <tr key={p.id}>
                      <td><strong>{p.nameOrNumber}</strong></td>
                      <td>{p.floor}. emelet</td>
                      <td>{String(p.type) === '1' || String(p.type) === 'PrivateRoom' ? 'Kollégiumi szoba (Privát)' : 'Közösségi tér'}</td>
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
                <input type="text" value={newApplianceName} onChange={(e) => setNewApplianceName(e.target.value)} placeholder="pl. Mosógép, 1-es Lift, TV" required maxLength={30} />
                <small style={{ display: 'block', textAlign: 'right', color: '#a0aec0', fontSize: '0.8em', marginTop: '5px' }}>{newApplianceName.length} / 30</small>
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

          {showEditAppliance && (
            <form onSubmit={handleUpdateAppliance} className="form" style={{ marginBottom: '20px' }}>
              <h3>Berendezés módosítása</h3>
              <div className="form-group">
                <label>Berendezés Neve</label>
                <input
                  type="text"
                  value={editApplianceName}
                  onChange={(e) => setEditApplianceName(e.target.value)}
                  required
                  maxLength={30}
                />
                <small style={{ display: 'block', textAlign: 'right', color: '#a0aec0', fontSize: '0.8em', marginTop: '5px' }}>{editApplianceName.length} / 30</small>
              </div>
              <div className="form-group">
                <label>Elhelyezés (Helyiség)</label>
                <select
                  value={editAppliancePremiseId}
                  onChange={(e) => setEditAppliancePremiseId(e.target.value)}
                >
                  <option value="">-- Raktáron (Nincs kiosztva) --</option>
                  {premises.map(p => (
                    <option key={p.id} value={p.id}>{p.nameOrNumber}</option>
                  ))}
                </select>
              </div>
              {error && <div className="error-message">{error}</div>}
              {success && <div className="success-message">{success}</div>}
              <button type="submit" className="btn-primary">Módosítás mentése</button>
              <button type="button" className="btn-secondary" onClick={() => setShowEditAppliance(false)} style={{ marginLeft: '10px' }}>Mégse</button>
            </form>
          )}

          <div className="appliances-list users-table" style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '10px' }}>
            {(!appliances || appliances.length === 0) ? (
              <p className="empty-state">Nincsenek berendezések a leltárban</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Berendezés Neve</th>
                    <th>Elhelyezés (Helyiség)</th>
                    <th>Műveletek</th>
                  </tr>
                </thead>
                <tbody>
                  {appliances.map(a => {
                    const premiseName = a.premiseId 
                      ? (premises.find(p => String(p.id) === String(a.premiseId))?.nameOrNumber || `Ismeretlen (ID: ${a.premiseId})`)
                      : 'Raktáron';
                    return (
                    <tr key={a.id}>
                      <td><strong>{a.name}</strong></td>
                      <td>{premiseName}</td>
                      <td>
                        <button className="btn-approve" style={{ padding: '4px 8px', fontSize: '0.8em', marginRight: '5px' }} onClick={() => handleEditApplianceClick(a)}>Módosítás</button>
                        <button className="btn-delete-small" onClick={() => handleDeleteAppliance(a.id)}>Selejtezés</button>
                      </td>
                    </tr>
                  )})}
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

          <div className="specializations-list users-table" style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '10px' }}>
            {(!specializations || specializations.length === 0) ? (
              <p className="empty-state">Nincsenek szakterületek a rendszerben</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Szakterület Neve</th>
                    <th>Műveletek</th>
                  </tr>
                </thead>
                <tbody>
                  {specializations.map(s => (
                    <tr key={s.id}>
                      <td><strong>{s.name}</strong></td>
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
                const associatedTask = tasks.find(t => String(t.id) === String(req.taskId));
                const assignedMaintainer = associatedTask ? users.find(u => String(u.id) === String(associatedTask.assignedTo)) : null;
                return (
                <div key={req.id} className="order-card">
                  <div className="order-info">
                    <h4>{req.toolName}</h4>
                    <p>Kért mennyiség: <strong>{req.quantity}</strong> db</p>
                    {assignedMaintainer && <p style={{ margin: '5px 0' }}>Karbantartó: <strong>{assignedMaintainer.name}</strong></p>}
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
          <div className="filter-controls" style={{ flexWrap: 'wrap' }}>
            <button className={`filter-btn ${taskFilter === 'all' ? 'active' : ''}`} onClick={() => setTaskFilter('all')}>Összes</button>
            <button className={`filter-btn ${taskFilter === 'Pending' ? 'active' : ''}`} onClick={() => setTaskFilter('Pending')}>Függőben</button>
            <button className={`filter-btn ${taskFilter === 'InProgress' ? 'active' : ''}`} onClick={() => setTaskFilter('InProgress')}>Folyamatban</button>
            <button className={`filter-btn ${taskFilter === 'AwaitingParts' ? 'active' : ''}`} onClick={() => setTaskFilter('AwaitingParts')}>Alkatrészre vár</button>
            <button className={`filter-btn ${taskFilter === 'Repaired' ? 'active' : ''}`} onClick={() => setTaskFilter('Repaired')}>Javítva</button>
            <button className={`filter-btn ${taskFilter === 'Unrepairable' ? 'active' : ''}`} onClick={() => setTaskFilter('Unrepairable')}>Javíthatatlan</button>
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
                        {task._backendData?.premiseId ? (
                          <span><strong>Helyiség:</strong> {premises.find(p => String(p.id) === String(task._backendData.premiseId))?.nameOrNumber || `#${task._backendData.premiseId}`}</span>
                        ) : task.location ? (
                          <span><strong>Helyiség:</strong> {task.location}</span>
                        ) : null}
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
