import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import '../../styles/RoleDashboards.css';


const KarbantartasVezetoDashboard = () => {
  const { user, users, tasks, toolRequests, equipment, equipmentOrders, approveToolRequest, rejectToolRequest, assignTask, hasPermission, updateTaskStatus, getLowStockEquipment, createEquipmentOrder } = useAuth();
  const [filterStatus, setFilterStatus] = useState('pending');
  const [taskFilter, setTaskFilter] = useState('all');
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderEquipmentName, setOrderEquipmentName] = useState('');
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [orderReason, setOrderReason] = useState('');

  const workers = users.filter(u => u.role === 'Karbantartó');
  const pendingRequests = toolRequests.filter(tr => tr.status === filterStatus);
  const unassignedTasks = tasks.filter(t => !t.assignedTo || t.status === 'pending');
  const lowStockEquipment = getLowStockEquipment();
  
  const allTasks = tasks.filter(t => t.assignedTo);
  const filteredTasks = taskFilter === 'all' 
    ? allTasks 
    : allTasks.filter(t => t.status === taskFilter || (taskFilter === 'in_progress' && t.status === 'assigned'));

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

  const handleCreateOrder = (e) => {
    e.preventDefault();
    if (!orderEquipmentName.trim() || orderQuantity < 1) {
      alert('Please fill in all fields');
      return;
    }
    createEquipmentOrder(orderEquipmentName, orderQuantity, orderReason);
    setOrderEquipmentName('');
    setOrderQuantity(1);
    setOrderReason('');
    setShowOrderForm(false);
    alert('Order submitted to admin!');
  };


  return (
    <div className="role-dashboard">
      <div className="dashboard-grid-wide">
        <section className="section">
          <h2>Manage Tool Requests</h2>
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
                          Approve & Assign
                        </button>
                        <button
                          className="btn-reject"
                          onClick={() => handleReject(req.id)}
                        >
                          Reject
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
          <h2>Assign Maintenance Tasks</h2>
          <div className="tasks-list">
            {unassignedTasks.length === 0 ? (
              <p className="empty-state">No tasks waiting assignment</p>
            ) : (
              unassignedTasks.map(task => (
                <div key={task.id} className="task-card">
                  <h4>{task.title}</h4>
                  <p>{task.description}</p>
                  {task.location && <p><strong>Location:</strong> {task.location}</p>}
                  {task.specialization && <p><strong>Specialist needed:</strong> {task.specialization}</p>}
                  <div className="form-group">
                    <label>Assign to worker</label>
                    <select
                      value={task.assignedTo || ''}
                      onChange={(e) => assignTask(task.id, e.target.value)}
                    >
                      <option value="">-- choose --</option>
                      {workers
                        .filter(w => !task.specialization || w.specialization === task.specialization)
                        .map(w => (
                          <option key={w.id} value={w.id}>
                            {w.name} {w.specialization ? `(${w.specialization})` : ''}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="section">
          <h2>Track Fault Repair Status</h2>
          <div className="filter-controls">
            <button
              className={`filter-btn ${taskFilter === 'all' ? 'active' : ''}`}
              onClick={() => setTaskFilter('all')}
            >
              All
            </button>
            <button
              className={`filter-btn ${taskFilter === 'in_progress' ? 'active' : ''}`}
              onClick={() => setTaskFilter('in_progress')}
            >
              In Progress
            </button>
            <button
              className={`filter-btn ${taskFilter === 'completed' ? 'active' : ''}`}
              onClick={() => setTaskFilter('completed')}
            >
              Completed
            </button>
          </div>

          <div className="tasks-list">
            {filteredTasks.length === 0 ? (
              <p className="empty-state">No {taskFilter === 'all' ? '' : taskFilter} tasks</p>
            ) : (
              filteredTasks.map(task => {
                const assignee = users.find(u => u.id === task.assignedTo);
                return (
                  <div key={task.id} className={`task-card ${task.completed ? 'task-completed' : ''}`}>
                    <div className="task-header">
                      <h4>{task.title}</h4>
                      <span className={`status-badge status-${task.completed ? 'completed' : task.status}`}>
                        {task.completed ? 'Done' : 'In Progress'}
                      </span>
                    </div>
                    <p>{task.description}</p>
                    {task.location && <p><strong>Location:</strong> {task.location}</p>}
                    {assignee && <p><strong>Assigned to:</strong> {assignee.name}</p>}
                    
                    <div className="completion-toggle">
                      <label className="toggle-label">
                        <span>Mark as done:</span>
                        <div className="toggle-switch">
                          <input
                            type="checkbox"
                            checked={task.completed || false}
                            onChange={(e) => updateTaskStatus(task.id, e.target.checked)}
                          />
                          <span className="toggle-slider"></span>
                        </div>
                      </label>
                      {task.completed && task.completedAt && (
                        <small className="completion-date">
                          Completed on: {new Date(task.completedAt).toLocaleDateString()}
                        </small>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        <section className="section">
          <h2>My Team - Maintenance Workers</h2>
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

        <section className="section">
          <h2>Equipment Inventory - Low Stock</h2>
          <div className="equipment-list">
            {lowStockEquipment.length === 0 ? (
              <p className="empty-state">All equipment is well stocked</p>
            ) : (
              lowStockEquipment.map(eq => (
                <div key={eq.id} className="equipment-card low-stock">
                  <div className="equipment-info">
                    <h4>{eq.name}</h4>
                    <p>Current: <strong>{eq.quantity}</strong> / Minimum: {eq.minQuantity}</p>
                    <span className="low-stock-badge">Low Stock!</span>
                  </div>
                </div>
              ))
            )}
          </div>
          <button className="btn-add" onClick={() => setShowOrderForm(!showOrderForm)} style={{marginTop: '15px'}}>
            {showOrderForm ? 'Cancel' : '+ Order from Admin'}
          </button>
          
          {showOrderForm && (
            <form onSubmit={handleCreateOrder} className="form" style={{marginTop: '15px'}}>
              <div className="form-group">
                <label>Equipment Name</label>
                <input type="text" value={orderEquipmentName} onChange={(e) => setOrderEquipmentName(e.target.value)} placeholder="e.g., Drill, Hammer" required />
              </div>
              <div className="form-group">
                <label>Quantity Needed</label>
                <input type="number" value={orderQuantity} onChange={(e) => setOrderQuantity(e.target.value)} min="1" required />
              </div>
              <div className="form-group">
                <label>Reason</label>
                <input type="text" value={orderReason} onChange={(e) => setOrderReason(e.target.value)} placeholder="Why needed" />
              </div>
              <button type="submit" className="btn-primary">Submit Order</button>
            </form>
          )}
        </section>

        <section className="section info-section">
          <h3>Your Permissions</h3>
          <ul className="permissions-list">
            <li>View all maintenance tasks</li>
            <li>Manage tool requests (approve/reject)</li>
            <li>Assign tools to workers</li>
            <li>View worker information</li>
            <li>View reports and statistics</li>
            <li>View low stock equipment</li>
            <li>Order equipment from admin</li>
            <li>Cannot manage user accounts</li>
            <li>Cannot change system settings</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default KarbantartasVezetoDashboard;

