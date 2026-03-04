import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import '../../styles/RoleDashboards.css';

const AdminisztratoriDashboard = () => {
  const { user, users, tasks, toolRequests, register, ROLES } = useAuth();
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState(ROLES.EGYETEMISTA);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Sanitize input - remove harmful characters but allow common special chars
  const sanitizeInput = (input) => {
    return input.replace(/[<>\"]/g, '').trim();
  };

  const handleAddUser = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate name
    if (!newUserName || newUserName.trim().length === 0) {
      setError('Please enter a name');
      return;
    }

    if (newUserName.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!newUserEmail || !emailRegex.test(newUserEmail)) {
      setError('Please enter a valid email');
      return;
    }

    // Validate password
    if (!newUserPassword || newUserPassword.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }

    try {
      register(
        sanitizeInput(newUserEmail),
        newUserPassword,
        sanitizeInput(newUserName),
        newUserRole
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

  const getRoleCount = (role) => users.filter(u => u.role === role).length;

  const stats = {
    totalUsers: users.length,
    egyetemista: getRoleCount(ROLES.EGYETEMISTA),
    karbantarto: getRoleCount(ROLES.KARBANTARTAS),
    vezeto: getRoleCount(ROLES.KARBANTARTAS_VEZETO),
    admin: getRoleCount(ROLES.ADMINISZTRATOR),
    totalTasks: tasks.length,
    totalToolRequests: toolRequests.length,
    pendingRequests: toolRequests.filter(tr => tr.status === 'pending').length
  };

  return (
    <div className="role-dashboard">
      <div className="dashboard-grid-admin">
        {/* Statistics Section */}
        <section className="section stats-section">
          <h2>📊 System Statistics</h2>
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
              <p>Karbantartó</p>
            </div>
            <div className="stat-card">
              <h3>{stats.vezeto}</h3>
              <p>Karbantartási Vezető</p>
            </div>
            <div className="stat-card">
              <h3>{stats.admin}</h3>
              <p>Adminisztrátor</p>
            </div>
            <div className="stat-card">
              <h3>{stats.totalTasks}</h3>
              <p>Total Tasks</p>
            </div>
            <div className="stat-card">
              <h3>{stats.totalToolRequests}</h3>
              <p>Tool Requests</p>
            </div>
            <div className="stat-card pending">
              <h3>{stats.pendingRequests}</h3>
              <p>Pending Approval</p>
            </div>
          </div>
        </section>

        {/* User Management Section */}
        <section className="section">
          <div className="section-header">
            <h2>👥 User Management</h2>
            <button
              className="btn-add"
              onClick={() => setShowAddUser(!showAddUser)}
            >
              {showAddUser ? '✕ Cancel' : '+ Add User'}
            </button>
          </div>

          {showAddUser && (
            <form onSubmit={handleAddUser} className="form">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={newUserName}
                  onChange={(e) => setNewUserName(sanitizeInput(e.target.value))}
                  placeholder="User full name"
                  required
                />
                <small className="form-hint">Min 2 characters (allowed: letters, numbers, . , - ')</small>
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(sanitizeInput(e.target.value))}
                  placeholder="user@example.com"
                  required
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    placeholder="Initial password"
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
                <small className="form-hint">Min 4 characters</small>
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

              {error && <div className="error-message">{error}</div>}
              {success && <div className="success-message">{success}</div>}

              <button type="submit" className="btn-primary">
                Create User
              </button>
            </form>
          )}

          <div className="users-table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Registered</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`role-badge role-${u.role.toLowerCase()}`}>
                        {u.role}
                      </span>
                    </td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* System Overview */}
        <section className="section info-section">
          <h3>📌 Your Permissions</h3>
          <ul className="permissions-list">
            <li>✓ View all system data</li>
            <li>✓ Create and manage user accounts</li>
            <li>✓ Assign and change user roles</li>
            <li>✓ Manage all tool requests</li>
            <li>✓ View all tasks and reports</li>
            <li>✓ System settings access</li>
            <li>✓ Full audit logs</li>
            <li>✓ Override any action</li>
          </ul>
        </section>

        {/* Role Permissions Reference */}
        <section className="section">
          <h3>🔐 Role Permissions Reference</h3>
          <div className="roles-reference">
            <div className="role-ref">
              <h4>Egyetemista (Student)</h4>
              <ul>
                <li>View assigned tasks</li>
                <li>Submit task requests</li>
              </ul>
            </div>
            <div className="role-ref">
              <h4>Karbantartó (Maintenance Worker)</h4>
              <ul>
                <li>View assigned tasks</li>
                <li>Request tools</li>
                <li>Submit work logs</li>
              </ul>
            </div>
            <div className="role-ref">
              <h4>Karbantartási Vezető (Maintenance Manager)</h4>
              <ul>
                <li>Manage tool requests</li>
                <li>Assign tools</li>
                <li>View all workers</li>
                <li>View reports</li>
              </ul>
            </div>
            <div className="role-ref">
              <h4>Adminisztrátor (Administrator)</h4>
              <ul>
                <li>Full system access</li>
                <li>User management</li>
                <li>System settings</li>
                <li>All manager functions</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminisztratoriDashboard;
