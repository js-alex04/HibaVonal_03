import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import '../../styles/RoleDashboards.css';

const KarbantartasVezetoDashboard = () => {
  const { user, users, tasks, toolRequests, approveToolRequest, rejectToolRequest, hasPermission } = useAuth();
  const [filterStatus, setFilterStatus] = useState('pending');

  const workers = users.filter(u => u.role === 'Karbantartó');
  const pendingRequests = toolRequests.filter(tr => tr.status === filterStatus);

  const handleApprove = (requestId) => {
    try {
      approveToolRequest(requestId);
      alert('Tool request approved!');
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const handleReject = (requestId) => {
    try {
      rejectToolRequest(requestId);
      alert('Tool request rejected!');
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  return (
    <div className="role-dashboard">
      <div className="dashboard-grid-wide">
        <section className="section">
          <h2>👷 Manage Tool Requests</h2>
          <div className="filter-controls">
            <button
              className={`filter-btn ${filterStatus === 'pending' ? 'active' : ''}`}
              onClick={() => setFilterStatus('pending')}
            >
              Pending
            </button>
            <button
              className={`filter-btn ${filterStatus === 'approved' ? 'active' : ''}`}
              onClick={() => setFilterStatus('approved')}
            >
              Approved
            </button>
            <button
              className={`filter-btn ${filterStatus === 'rejected' ? 'active' : ''}`}
              onClick={() => setFilterStatus('rejected')}
            >
              Rejected
            </button>
          </div>

          <div className="requests-list">
            {pendingRequests.length === 0 ? (
              <p className="empty-state">No {filterStatus} requests</p>
            ) : (
              pendingRequests.map(req => {
                const requester = users.find(u => u.id === req.requestedBy);
                return (
                  <div key={req.id} className="request-card-manager">
                    <div className="request-header">
                      <div>
                        <h4>{req.toolName}</h4>
                        <p className="requester">Requested by: <strong>{requester?.name}</strong></p>
                      </div>
                      <span className={`status-badge status-${req.status}`}>{req.status}</span>
                    </div>

                    <div className="request-details">
                      <p><strong>Quantity:</strong> {req.quantity}</p>
                      <p><strong>Reason:</strong> {req.reason}</p>
                      <small>{new Date(req.createdAt).toLocaleDateString()}</small>
                    </div>

                    {req.status === 'pending' && (
                      <div className="action-buttons">
                        <button
                          className="btn-approve"
                          onClick={() => handleApprove(req.id)}
                        >
                          ✓ Approve & Assign
                        </button>
                        <button
                          className="btn-reject"
                          onClick={() => handleReject(req.id)}
                        >
                          ✗ Reject
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </section>

        <section className="section">
          <h2>👥 My Team - Maintenance Workers</h2>
          <div className="workers-list">
            {workers.length === 0 ? (
              <p className="empty-state">No maintenance workers registered</p>
            ) : (
              workers.map(worker => {
                const workerRequests = toolRequests.filter(tr => tr.requestedBy === worker.id);
                const pendingReqs = workerRequests.filter(tr => tr.status === 'pending');
                return (
                  <div key={worker.id} className="worker-card">
                    <h4>{worker.name}</h4>
                    <p className="worker-email">{worker.email}</p>
                    <div className="worker-stats">
                      <span>Total Requests: {workerRequests.length}</span>
                      <span className="pending">Pending: {pendingReqs.length}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        <section className="section info-section">
          <h3>📌 Your Permissions</h3>
          <ul className="permissions-list">
            <li>✓ View all maintenance tasks</li>
            <li>✓ Manage tool requests (approve/reject)</li>
            <li>✓ Assign tools to workers</li>
            <li>✓ View worker information</li>
            <li>✓ View reports and statistics</li>
            <li>✗ Cannot manage user accounts</li>
            <li>✗ Cannot change system settings</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default KarbantartasVezetoDashboard;
