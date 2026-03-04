import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import '../../styles/RoleDashboards.css';

const EgyetemistaDashboard = () => {
  const { user, tasks, createTask, hasPermission } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const myTasks = tasks.filter(t => t.assignedTo === user.id);

  const handleCreateTask = (e) => {
    e.preventDefault();
    try {
      createTask(title, description, user.id);
      setTitle('');
      setDescription('');
      alert('Task created successfully!');
    } catch (error) {
      alert('Error creating task: ' + error.message);
    }
  };

  return (
    <div className="role-dashboard">
      <div className="dashboard-grid">
        <section className="section">
          <h2>📋 My Tasks</h2>
          <div className="tasks-list">
            {myTasks.length === 0 ? (
              <p className="empty-state">No tasks assigned yet</p>
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

        {hasPermission('submit_requests') && (
          <section className="section">
            <h2>📝 Submit New Request</h2>
            <form onSubmit={handleCreateTask} className="form">
              <div className="form-group">
                <label>Task Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter task title"
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your task or request"
                  rows="4"
                />
              </div>

              <button type="submit" className="btn-primary">
                Submit Request
              </button>
            </form>
          </section>
        )}

        <section className="section info-section">
          <h3>📌 Your Permissions</h3>
          <ul className="permissions-list">
            <li>✓ View your assigned tasks</li>
            <li>✓ Submit task requests</li>
            <li>✗ Cannot manage tools</li>
            <li>✗ Cannot approve requests</li>
            <li>✗ Cannot access admin settings</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default EgyetemistaDashboard;
