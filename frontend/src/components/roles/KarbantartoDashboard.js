import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import '../../styles/RoleDashboards.css';

const KarbantartoDashboard = () => {
  const { user, tasks, toolRequests, createToolRequest, hasPermission } = useAuth();
  const [toolName, setToolName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const myTasks = tasks.filter(t => t.assignedTo === user.id);
  const myToolRequests = toolRequests.filter(tr => tr.requestedBy === user.id);

  // Sanitize tool name - only allow letters, numbers, spaces, hyphens
  const sanitizeToolName = (input) => {
    return input.replace(/[^a-zA-Z0-9\s\-]/g, '');
  };

  // Sanitize reason - allow letters, numbers, spaces, periods, commas, hyphens
  const sanitizeReason = (input) => {
    return input.replace(/[<>\"]/g, '');
  };

  const handleRequestTool = (e) => {
    e.preventDefault();
    setError('');

    // Validate inputs
    if (!toolName || toolName.trim().length === 0) {
      setError('Please enter a tool name');
      return;
    }

    if (toolName.length < 2) {
      setError('Tool name must be at least 2 characters');
      return;
    }

    if (quantity < 1) {
      setError('Quantity must be at least 1');
      return;
    }

    if (!reason || reason.trim().length === 0) {
      setError('Please provide a reason for the request');
      return;
    }

    if (reason.length < 5) {
      setError('Reason must be at least 5 characters');
      return;
    }

    try {
      createToolRequest(
        toolName.trim(),
        quantity,
        reason.trim(),
        user.id
      );
      setToolName('');
      setQuantity(1);
      setReason('');
      alert('Tool request submitted! Please wait for manager approval.');
    } catch (error) {
      setError('Error: ' + error.message);
    }
  };

  return (
    <div className="role-dashboard">
      <div className="dashboard-grid">
        <section className="section">
          <h2>🔧 Assigned Maintenance Tasks</h2>
          <div className="tasks-list">
            {myTasks.length === 0 ? (
              <p className="empty-state">No tasks assigned</p>
            ) : (
              myTasks.map(task => (
                <div key={task.id} className="task-card">
                  <h3>{task.title}</h3>
                  <p>{task.description}</p>
                  <span className={`status-badge status-${task.status}`}>{task.status}</span>
                  <small>{new Date(task.createdAt).toLocaleDateString()}</small>
                </div>
              ))
            )}
          </div>
        </section>

        {hasPermission('request_tools') && (
          <section className="section">
            <h2>🛠️ Request Tools</h2>
            <form onSubmit={handleRequestTool} className="form">
              {error && <div className="error-message">{error}</div>}

              <div className="form-group">
                <label>Tool Name</label>
                <input
                  type="text"
                  value={toolName}
                  onChange={(e) => setToolName(sanitizeToolName(e.target.value))}
                  placeholder="e.g., Drill, Hammer, Safety Harness"
                  required
                />
                <small className="form-hint">Min 2 characters (letters, numbers, spaces, hyphens only)</small>
              </div>

              <div className="form-group">
                <label>Quantity</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  min="1"
                  required
                />
              </div>

              <div className="form-group">
                <label>Reason / Task Description</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(sanitizeReason(e.target.value))}
                  placeholder="Why do you need these tools?"
                  rows="4"
                  required
                />
                <small className="form-hint">Min 5 characters</small>
              </div>

              <button type="submit" className="btn-primary">
                Submit Tool Request
              </button>
            </form>

            <div className="submissions">
              <h3>My Tool Requests</h3>
              {myToolRequests.length === 0 ? (
                <p className="empty-state">No tool requests yet</p>
              ) : (
                myToolRequests.map(req => (
                  <div key={req.id} className="request-card">
                    <div className="request-header">
                      <h4>{req.toolName}</h4>
                      <span className={`status-badge status-${req.status}`}>{req.status}</span>
                    </div>
                    <p>Quantity: {req.quantity}</p>
                    <p>{req.reason}</p>
                    {req.status === 'pending' && <p className="pending-notice">⏳ Waiting for manager approval</p>}
                    {req.status === 'approved' && <p className="approved-notice">✅ Approved - retrieve your tools</p>}
                    {req.status === 'rejected' && <p className="rejected-notice">❌ Request rejected</p>}
                    <small>{new Date(req.createdAt).toLocaleDateString()}</small>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        <section className="section info-section">
          <h3>📌 Your Permissions</h3>
          <ul className="permissions-list">
            <li>✓ View assigned maintenance tasks</li>
            <li>✓ Request tools for tasks</li>
            <li>✓ Submit work logs</li>
            <li>✗ Cannot approve tool requests</li>
            <li>✗ Cannot manage other workers</li>
            <li>✗ Cannot access admin settings</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default KarbantartoDashboard;
