import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import '../../styles/RoleDashboards.css';

const EgyetemistaDashboard = () => {
  const { user, tasks, createTask, hasPermission, addFeedback } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [feedbackInputs, setFeedbackInputs] = useState({});
  const SPECIALIZATIONS = ['Vízvezeték-szerelő', 'Villanyszerelő', 'Asztalos', 'Lakatos', 'Informatikus', 'Egyéb'];

  // generic sanitizer: letters, numbers, spaces, hyphens and Hungarian accents
  const sanitizeText = (input) => {
    return input.replace(/[^a-zA-Z0-9\s\-áéíóöőúüűÁÉÍÓÖŐÚÜŰ.,!?]/g, '');
  };

  const myTasks = tasks.filter(t => String(t.createdBy) === String(user.id));

  const handleCreateTask = (e) => {
    e.preventDefault();
    try {
      if (!location || location.trim().length === 0) {
        throw new Error('Kérjük, add meg a helyszínt / szobát!');
      }
      if (!specialization) {
        throw new Error('Kérjük, válassz egy szakterületet!');
      }
      // leave assignedTo empty; manager will assign a worker later
      createTask(title, description, '', location, specialization);
      setTitle('');
      setDescription('');
      setLocation('');
      setSpecialization('');
      alert('Hibabejelentés sikeresen elküldve!');
    } catch (error) {
      alert('Hiba történt a bejelentés során: ' + error.message);
    }
  };

  const handleFeedbackChange = (taskId, value) => {
    setFeedbackInputs({ ...feedbackInputs, [taskId]: value });
  };

  const handleFeedbackSubmit = (taskId) => {
    const text = feedbackInputs[taskId];
    if (!text || text.trim().length === 0) return;
    addFeedback(taskId, text);
  };

  return (
    <div className="role-dashboard">
      <div className="dashboard-grid">
        <section className="section">
          <h2>📋 Saját bejelentéseim</h2>
          <div className="tasks-list" style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '10px' }}>
            {myTasks.length === 0 ? (
              <p className="empty-state">Nincsenek bejelentett hibáid</p>
            ) : (
              myTasks.map(task => (
                <div key={task.id} className="task-card">
                  <h3>{task.title}</h3>
                  <p>{task.description}</p>                  {task.location && <p><strong>Helyszín:</strong> {task.location}</p>}
                  {task.specialization && <p><strong>Szakember:</strong> {task.specialization}</p>}                  
                  <span className={`status-badge status-${task.status}`}>
                    {task.status === 'pending' ? 'Függőben' : task.status === 'in_progress' ? 'Folyamatban' : 'Kész'}
                  </span>
                  <small style={{ display: 'block', marginTop: '5px' }}>{new Date(task.createdAt).toLocaleDateString()}</small>
                  
                  {task.completed && !task.feedback && (
                    <div className="feedback-section" style={{ marginTop: '15px', padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                      <p style={{ margin: '0 0 10px 0', fontSize: '0.9em', fontWeight: 'bold' }}>Megjegyzés / Visszajelzés hozzáadása:</p>
                      <textarea 
                        placeholder="Ide írhatod a visszajelzésed..." 
                        value={feedbackInputs[task.id] || ''}
                        onChange={(e) => handleFeedbackChange(task.id, e.target.value)}
                        style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                        rows="2"
                      />
                      <button className="btn-primary" onClick={() => handleFeedbackSubmit(task.id)} style={{ padding: '5px 15px', fontSize: '0.9em' }}>Elküldés</button>
                    </div>
                  )}

                  {task.feedback && (
                    <div className="feedback-section" style={{ marginTop: '15px', padding: '10px', backgroundColor: '#e6ffe6', borderRadius: '8px', border: '1px solid #b3ffb3' }}>
                      <p style={{ margin: '0 0 5px 0', fontSize: '0.9em', fontWeight: 'bold', color: '#2e8b57' }}>✓ Megjegyzésed:</p>
                      <p style={{ margin: 0, fontStyle: 'italic' }}>"{task.feedback}"</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        {hasPermission('submit_requests') && (
          <section className="section">
            <h2>📝 Új hiba bejelentése</h2>
            <form onSubmit={handleCreateTask} className="form">
              <div className="form-group">
                <label>Hiba megnevezése</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(sanitizeText(e.target.value))}
                  placeholder="Add meg a hiba röviden (pl. Csöpög a csap)"
                  required
                />
              </div>

              <div className="form-group">
                <label>Részletes leírás</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(sanitizeText(e.target.value))}
                  placeholder="Írd le a probléma részleteit..."
                  rows="4"
                />
              </div>
              <div className="form-group">
                <label>Helyszín / Szoba</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(sanitizeText(e.target.value))}
                  placeholder="pl. 3-as épület, 204-es szoba"
                />
              </div>
              <div className="form-group">
                <label>Szükséges szakember</label>
                <select
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  required
                >
                  <option value="">-- válassz --</option>
                  {SPECIALIZATIONS.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <button type="submit" className="btn-primary">
                Bejelentés küldése
              </button>
            </form>
          </section>
        )}

        <section className="section info-section">
          <h3>📌 Jogosultságaid</h3>
          <ul className="permissions-list">
            <li>✓ Bejelentett hibáid nyomon követése</li>
            <li>✓ Új hibák bejelentése és értékelése</li>
            <li>✗ Eszközök és feladatok kezelése nem engedélyezett</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default EgyetemistaDashboard;
