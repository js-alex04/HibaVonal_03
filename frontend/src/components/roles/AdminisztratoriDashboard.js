
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
  const SPECIALIZATIONS = ['Fűtés', 'Viz-Gáz', 'Villany', 'Egyéb'];
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
      setError('Please enter a name');
      return;
    }

    if (newUserName.trim().length < 2 || !/[a-zA-Z0-9]/.test(newUserName)) {
      setError('Name must be at least 2 characters and include letters or numbers');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!newUserEmail || !emailRegex.test(newUserEmail)) {
      setError('Please enter a valid email');
      return;
    }

    if (!newUserPassword || newUserPassword.length < 4) {
      setError('Password must be at least 4 characters');
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
      setSuccess('User created successfully!');
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
      setError('Please enter equipment name');
      return;
    }
    addEquipment(newEquipmentName, newEquipmentQuantity, newEquipmentMinQuantity);
    setNewEquipmentName('');
    setNewEquipmentQuantity(10);
    setNewEquipmentMinQuantity(5);
    setShowAddEquipment(false);
    setSuccess('Equipment added successfully!');
  };

  const handleApproveOrder = (orderId) => {
    approveEquipmentOrder(orderId);
    alert('Order approved!');
  };

  const handleRejectOrder = (orderId) => {
    rejectEquipmentOrder(orderId);
    alert('Order rejected!');
  };

  const handleDeleteTask = (taskId) => {
    if (window.confirm('Are you sure you want to delete this completed task?')) {
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
    totalEquipment: equipment.length,
    pendingOrders: equipmentOrders.filter(o => o.status === 'pending').length
  };

  return (
    <div className="role-dashboard">
      <div className="dashboard-grid-admin">
        {/* Statistics Section */}
        <section className="section stats-section">
          <h2>System Statistics</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>{stats.totalUsers}</h3>
              <p>Total Users</p>
            </div>
            <div className="stat-card">
              <h3>{stats.egyetemista}</h3>
              <p>Egyetemista</p>
            </div>
            <div className="stat-card">
              <h3>{stats.karbantarto}</h3>
              <p>Karbantarto</p>
            </div>
            <div className="stat-card">
              <h3>{stats.vezeto}</h3>
              <p>Manager</p>
            </div>
            <div className="stat-card">
              <h3>{stats.completedTasks}</h3>
              <p>Completed Tasks</p>
            </div>
            <div className="stat-card">
              <h3>{stats.totalEquipment}</h3>
              <p>Equipment</p>
            </div>
            <div className="stat-card pending">
              <h3>{stats.pendingOrders}</h3>
              <p>Pending Orders</p>
            </div>
          </div>
        </section>

        {/* User Management Section */}
        <section className="section">
          <div className="section-header">
            <h2>User Management</h2>
            <button className="btn-add" onClick={() => setShowAddUser(!showAddUser)}>
              {showAddUser ? 'Cancel' : '+ Add User'}
            </button>
          </div>

          {showAddUser && (
            <form onSubmit={handleAddUser} className="form">
              <div className="form-group">
                <label>Name</label>
                <input type="text" value={newUserName} onChange={(e) => setNewUserName(sanitizeInput(e.target.value))} placeholder="User full name" required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={newUserEmail} onChange={(e) => setNewUserEmail(sanitizeInput(e.target.value))} placeholder="user@example.com" required />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} placeholder="Initial password" required />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select value={newUserRole} onChange={(e) => setNewUserRole(e.target.value)}>
                  <option value={ROLES.EGYETEMISTA}>{ROLES.EGYETEMISTA}</option>
                  <option value={ROLES.KARBANTARTAS}>{ROLES.KARBANTARTAS}</option>
                  <option value={ROLES.KARBANTARTAS_VEZETO}>{ROLES.KARBANTARTAS_VEZETO}</option>
                  <option value={ROLES.ADMINISZTRATOR}>{ROLES.ADMINISZTRATOR}</option>
                </select>
              </div>
              {newUserRole === ROLES.KARBANTARTAS && (
                <div className="form-group">
                  <label>Specialization</label>
                  <select value={newUserSpecialization} onChange={(e) => setNewUserSpecialization(e.target.value)} required>
                    <option value="">-- choose --</option>
                    {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              )}
              {error && <div className="error-message">{error}</div>}
              {success && <div className="success-message">{success}</div>}
              <button type="submit" className="btn-primary">Create User</button>
            </form>
          )}

          <div className="users-table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Specialization</th>
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
            <h2>Equipment Inventory</h2>
            <button className="btn-add" onClick={() => setShowAddEquipment(!showAddEquipment)}>
              {showAddEquipment ? 'Cancel' : '+ Add Equipment'}
            </button>
          </div>

          {showAddEquipment && (
            <form onSubmit={handleAddEquipment} className="form">
              <div className="form-group">
                <label>Equipment Name</label>
                <input type="text" value={newEquipmentName} onChange={(e) => setNewEquipmentName(e.target.value)} placeholder="e.g., Drill, Hammer" required />
              </div>
              <div className="form-group">
                <label>Quantity</label>
                <input type="number" value={newEquipmentQuantity} onChange={(e) => setNewEquipmentQuantity(e.target.value)} min="0" required />
              </div>
              <div className="form-group">
                <label>Minimum Quantity (Alert Level)</label>
                <input type="number" value={newEquipmentMinQuantity} onChange={(e) => setNewEquipmentMinQuantity(e.target.value)} min="1" required />
              </div>
              <button type="submit" className="btn-primary">Add Equipment</button>
            </form>
          )}

          <div className="equipment-list">
            {equipment.length === 0 ? (
              <p className="empty-state">No equipment in inventory</p>
            ) : (
              equipment.map(eq => (
                <div key={eq.id} className={`equipment-card ${eq.quantity <= eq.minQuantity ? 'low-stock' : ''}`}>
                  <div className="equipment-info">
                    <h4>{eq.name}</h4>
                    <p>Quantity: <strong>{eq.quantity}</strong> (Min: {eq.minQuantity})</p>
                    {eq.quantity <= eq.minQuantity && <span className="low-stock-badge">Low Stock!</span>}
                  </div>
                  <button className="btn-delete" onClick={() => { if (window.confirm('Delete this equipment?')) deleteEquipment(eq.id); }}>Delete</button>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Equipment Orders from Manager */}
        <section className="section">
          <h2>Equipment Orders from Manager</h2>
          <div className="filter-controls">
            <button className={`filter-btn ${orderFilter === 'pending' ? 'active' : ''}`} onClick={() => setOrderFilter('pending')}>Pending</button>
            <button className={`filter-btn ${orderFilter === 'approved' ? 'active' : ''}`} onClick={() => setOrderFilter('approved')}>Approved</button>
            <button className={`filter-btn ${orderFilter === 'rejected' ? 'active' : ''}`} onClick={() => setOrderFilter('rejected')}>Rejected</button>
            <button className={`filter-btn ${orderFilter === 'all' ? 'active' : ''}`} onClick={() => setOrderFilter('all')}>All</button>
          </div>

          <div className="orders-list">
            {filteredOrders.length === 0 ? (
              <p className="empty-state">No orders</p>
            ) : (
              filteredOrders.map(order => (
                <div key={order.id} className="order-card">
                  <div className="order-info">
                    <h4>{order.equipmentName}</h4>
                    <p>Quantity: <strong>{order.quantity}</strong></p>
                    <p>Reason: {order.reason}</p>
                    <p>Requested by: {order.requestedByName}</p>
                    <small>{new Date(order.createdAt).toLocaleDateString()}</small>
                  </div>
                  <div className="order-actions">
                    <span className={`status-badge status-${order.status}`}>{order.status}</span>
                    {order.status === 'pending' && (
                      <div className="action-buttons">
                        <button className="btn-approve" onClick={() => handleApproveOrder(order.id)}>Approve</button>
                        <button className="btn-reject" onClick={() => handleRejectOrder(order.id)}>Reject</button>
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
          <h2>Completed Faults (Resolved Issues)</h2>
          <div className="tasks-list">
            {completedTasks.length === 0 ? (
              <p className="empty-state">No completed tasks</p>
            ) : (
              completedTasks.map(task => {
                const assignee = users.find(u => u.id === task.assignedTo);
                return (
                  <div key={task.id} className="task-card task-completed">
                    <div className="task-header">
                      <h4>{task.title}</h4>
                      <button className="btn-delete-small" onClick={() => handleDeleteTask(task.id)}>Delete</button>
                    </div>
                    <p>{task.description}</p>
                    {task.location && <p><strong>Location:</strong> {task.location}</p>}
                    {assignee && <p><strong>Fixed by:</strong> {assignee.name}</p>}
                    {task.completedAt && <small>Completed: {new Date(task.completedAt).toLocaleDateString()}</small>}
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Permissions */}
        <section className="section info-section">
          <h3>Your Permissions</h3>
          <ul className="permissions-list">
            <li>View all system data</li>
            <li>Create and manage user accounts</li>
            <li>Manage equipment inventory</li>
            <li>Approve/reject equipment orders</li>
            <li>View and delete completed tasks</li>
            <li>System settings access</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default AdminisztratoriDashboard;
