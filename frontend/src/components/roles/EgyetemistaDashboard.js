import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import '../../styles/RoleDashboards.css';

const EgyetemistaDashboard = () => {
  const { user, tasks, createTask, hasPermission } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [specialization, setSpecialization] = useState('');
  const SPECIALIZATIONS = ['Fűtés', 'Viz-Gáz', 'Villany', 'Egyéb'];

  // generic sanitizer: letters, numbers, spaces and hyphens only (no special characters)
  const sanitizeText = (input) => {
    return input.replace(/[^a-zA-Z0-9\s\-]/g, '');
  };

  const myTasks = tasks.filter(t => t.assignedTo === user.id);

  const handleCreateTask = (e) => {
    e.preventDefault();
    try {
      if (!location || location.trim().length === 0) {
        throw new Error('Please specify a room/location');
      }
      if (!specialization) {
        throw new Error('Please select a specialization');
      }
      // leave assignedTo empty; manager will assign a worker later
      createTask(title, description, '', location, specialization);
      setTitle('');
      setDescription('');
      setLocation('');
      setSpecialization('');
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
                  <p>{task.description}</p>                  {task.location && <p><strong>Location:</strong> {task.location}</p>}
                  {task.specialization && <p><strong>Specialist:</strong> {task.specialization}</p>}                  <span className={`status-badge status-${task.status}`}>{task.status}</span>
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
                  onChange={(e) => setTitle(sanitizeText(e.target.value))}
                  placeholder="Enter task title"
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(sanitizeText(e.target.value))}
                  placeholder="Describe your task or request"
                  rows="4"
                />
              </div>
              <div className="form-group">
                <label>Location / Room</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(sanitizeText(e.target.value))}
                  placeholder="e.g. Building 3, Room 204"
                />
              </div>
              <div className="form-group">
                <label>Required Specialist</label>
                <select
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  required
                >
                  <option value="">-- choose --</option>
                  {SPECIALIZATIONS.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
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
