
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import '../../styles/RoleDashboards.css';

const AdminisztratoriDashboard = () => {
  const { user, users, tasks, toolRequests, equipment, equipmentOrders, register, ROLES, addEquipment, deleteEquipment, approveEquipmentOrder, rejectEquipmentOrder, deleteTask } = useAuth();
  const [showAddUser, setShowAddUser] = useState(false);
  const [showAddEquipment, setShowAddEquipment] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState(ROLES.EGYETEMISTA);
  const [newUserSpecialization, setNewUserSpecialization] = useState('');
  const [newEquipmentName, setNewEquipmentName] = useState('');
  const [newEquipmentQuantity, setNewEquipmentQuantity] = useState(10);
  const [newEquipmentMinQuantity, setNewEquipmentMinQuantity] = useState(5);
  const [orderFilter, setOrderFilter] = useState('pending');
  const [taskFilter, setTaskFilter] = useState('completed');
  const SPECIALIZATIONS = ['Vízvezeték-szerelő', 'Villanyszerelő', 'Asztalos', 'Lakatos', 'Informatikus', 'Egyéb'];
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Sanitize input
  const sanitizeInput = (input) => {
    return input.replace(/[<>"']/g, '').trim();
  };

  const handleAddUser = (e) => {
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

    try {
      register(
        sanitizeInput(newUserEmail),
        newUserPassword,
        sanitizeInput(newUserName),
        newUserRole,
        newUserRole === ROLES.KARBANTARTAS ? newUserSpecialization : ''
      );
      setSuccess('Felhasználó sikeresen létrehozva!');
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserName('');
      setNewUserRole(ROLES.EGYETEMISTA);
      setShowAddUser(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddEquipment = (e) => {
    e.preventDefault();
    if (!newEquipmentName.trim()) {
      setError('Kérjük, add meg a berendezés nevét!');
      return;
    }
    addEquipment(newEquipmentName, newEquipmentQuantity, newEquipmentMinQuantity);
    setNewEquipmentName('');
    setNewEquipmentQuantity(10);
    setNewEquipmentMinQuantity(5);
    setShowAddEquipment(false);
    setSuccess('Berendezés sikeresen hozzáadva!');
  };

  const handleApproveOrder = (orderId) => {
    approveEquipmentOrder(orderId);
    alert('Rendelés jóváhagyva!');
  };

  const handleRejectOrder = (orderId) => {
    rejectEquipmentOrder(orderId);
    alert('Rendelés elutasítva!');
  };

  const handleDeleteTask = (taskId) => {
    if (window.confirm('Biztosan törölni szeretnéd ezt a befejezett hibát?')) {
      deleteTask(taskId);
    }
  };

  const getRoleCount = (role) => users.filter(u => u.role === role).length;

  const completedTasks = tasks.filter(t => t.completed);
  const filteredOrders = equipmentOrders.filter(o => orderFilter === 'all' || o.status === orderFilter);

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
    totalEquipmentTypes: equipment.length,
    totalEquipmentItems: equipment.reduce((sum, eq) => sum + eq.quantity, 0),
    pendingOrders: equipmentOrders.filter(o => o.status === 'pending').length
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
            <div className="stat-card">
              <h3>{stats.totalEquipmentItems} db</h3>
              <p>Eszköz Raktáron ({stats.totalEquipmentTypes} fajta)</p>
            </div>
            <div className="stat-card pending">
              <h3>{stats.pendingOrders}</h3>
              <p>Függőben lévő Rendelések</p>
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
                <input type="text" value={newUserName} onChange={(e) => setNewUserName(sanitizeInput(e.target.value))} placeholder="Felhasználó teljes neve" required />
              </div>
              <div className="form-group">
                <label>E-mail Cím</label>
                <input type="email" value={newUserEmail} onChange={(e) => setNewUserEmail(sanitizeInput(e.target.value))} placeholder="pelda@email.hu" required />
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
                    {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
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
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td><span className={`role-badge role-${u.role.toLowerCase()}`}>{u.role}</span></td>
                    <td>{u.specialization || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Equipment Management */}
        <section className="section">
          <div className="section-header">
            <h2>Eszközök & Berendezések Leltára</h2>
            <button className="btn-add" onClick={() => setShowAddEquipment(!showAddEquipment)}>
              {showAddEquipment ? 'Mégse' : '+ Új Berendezés'}
            </button>
          </div>

          {showAddEquipment && (
            <form onSubmit={handleAddEquipment} className="form">
              <div className="form-group">
                <label>Berendezés Neve</label>
                <input type="text" value={newEquipmentName} onChange={(e) => setNewEquipmentName(e.target.value)} placeholder="pl. Fúrógép, Szerver" required />
              </div>
              <div className="form-group">
                <label>Mennyiség</label>
                <input type="number" value={newEquipmentQuantity} onChange={(e) => setNewEquipmentQuantity(e.target.value)} min="0" required />
              </div>
              <div className="form-group">
                <label>Minimum Mennyiség (Riasztási szint)</label>
                <input type="number" value={newEquipmentMinQuantity} onChange={(e) => setNewEquipmentMinQuantity(e.target.value)} min="1" required />
              </div>
              <button type="submit" className="btn-primary">Berendezés Hozzáadása</button>
            </form>
          )}

          <div className="equipment-list" style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '10px' }}>
            {equipment.length === 0 ? (
              <p className="empty-state">Nincs berendezés a leltárban</p>
            ) : (
              equipment.map(eq => (
                <div key={eq.id} className={`equipment-card ${eq.quantity <= eq.minQuantity ? 'low-stock' : ''}`}>
                  <div className="equipment-info">
                    <h4>{eq.name}</h4>
                    <p>Mennyiség: <strong>{eq.quantity}</strong> (Minimum: {eq.minQuantity})</p>
                    {eq.quantity <= eq.minQuantity && <span className="low-stock-badge">Alacsony Készlet!</span>}
                  </div>
                  <button className="btn-delete" onClick={() => { if (window.confirm('Biztosan törölni szeretnéd ezt a berendezést?')) deleteEquipment(eq.id); }}>Törlés</button>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Equipment Orders from Manager */}
        <section className="section">
          <h2>Eszközrendelések a Vezetőtől</h2>
          <div className="filter-controls">
            <button className={`filter-btn ${orderFilter === 'pending' ? 'active' : ''}`} onClick={() => setOrderFilter('pending')}>Függőben</button>
            <button className={`filter-btn ${orderFilter === 'approved' ? 'active' : ''}`} onClick={() => setOrderFilter('approved')}>Jóváhagyva</button>
            <button className={`filter-btn ${orderFilter === 'rejected' ? 'active' : ''}`} onClick={() => setOrderFilter('rejected')}>Elutasítva</button>
            <button className={`filter-btn ${orderFilter === 'all' ? 'active' : ''}`} onClick={() => setOrderFilter('all')}>Összes</button>
          </div>

          <div className="orders-list" style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '10px' }}>
            {filteredOrders.length === 0 ? (
              <p className="empty-state">Nincs megjeleníthető rendelés</p>
            ) : (
              filteredOrders.map(order => (
                <div key={order.id} className="order-card">
                  <div className="order-info">
                    <h4>{order.equipmentName}</h4>
                    <p>Kért mennyiség: <strong>{order.quantity}</strong></p>
                    <p>Indoklás: {order.reason}</p>
                    <p>Kérte: {order.requestedByName}</p>
                    <small>{new Date(order.createdAt).toLocaleDateString()}</small>
                  </div>
                  <div className="order-actions">
                    <span className={`status-badge status-${order.status}`}>{order.status}</span>
                    {order.status === 'pending' && (
                      <div className="action-buttons">
                        <button className="btn-approve" onClick={() => handleApproveOrder(order.id)}>Jóváhagyás</button>
                        <button className="btn-reject" onClick={() => handleRejectOrder(order.id)}>Elutasítás</button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Completed Faults */}
        <section className="section">
          <h2>Befejezett Hibák (Megoldott Problémák)</h2>
          <div className="tasks-list" style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '10px' }}>
            {completedTasks.length === 0 ? (
              <p className="empty-state">Nincsenek készre jelentett hibák</p>
            ) : (
              completedTasks.map(task => {
                const assignee = users.find(u => u.id === task.assignedTo);
                return (
                  <div key={task.id} className="task-card task-completed">
                    <div className="task-header">
                      <h4>{task.title}</h4>
                      <button className="btn-delete-small" onClick={() => handleDeleteTask(task.id)}>Törlés</button>
                    </div>
                    <p>{task.description}</p>
                    {task.location && <p><strong>Helyszín:</strong> {task.location}</p>}
                    {assignee && <p><strong>Javította:</strong> {assignee.name}</p>}
                    
                    {task.feedback && (
                      <div style={{ margin: '10px 0', padding: '8px', backgroundColor: '#e6ffe6', borderRadius: '4px', borderLeft: '4px solid #4caf50' }}>
                        <strong>Hallgató visszajelzése:</strong>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.9em', fontStyle: 'italic' }}>"{task.feedback}"</p>
                      </div>
                    )}

                    {task.completedAt && <small>Befejezve: {new Date(task.completedAt).toLocaleDateString()}</small>}
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
            <li>Berendezések és felszerelések raktárkészletének kezelése</li>
            <li>Karbantartási vezetőtől érkező eszközrendelések jóváhagyása/elutasítása</li>
            <li>Befejezett hibák nyomon követése és törlése az adatbázisból</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default AdminisztratoriDashboard;
