import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import '../../styles/RoleDashboards.css';

const getStatusDisplay = (task) => {
  const rawStatus = task._backendData?.status;
  if (rawStatus === 0 || rawStatus === 'Pending') return { text: 'Függőben', bg: '#feebc8', color: '#dd6b20' };
  if (rawStatus === 1 || rawStatus === 'InProgress') return { text: 'Folyamatban', bg: '#bee3f8', color: '#3182ce' };
  if (rawStatus === 2 || rawStatus === 'AwaitingParts') return { text: 'Alkatrészre vár', bg: '#e9d8fd', color: '#805ad5' };
  if (rawStatus === 3 || rawStatus === 'Repaired') return { text: 'Javítva', bg: '#c6f6d5', color: '#38a169' };
  if (rawStatus === 4 || rawStatus === 'Unrepairable') return { text: 'Javíthatatlan', bg: '#fed7d7', color: '#e53e3e' };
  
  // Biztonsági tartalék, ha mégis az AuthContext-es egyszerűsített verzió jönne
  if (task.status === 'pending') return { text: 'Függőben', bg: '#feebc8', color: '#dd6b20' };
  if (task.status === 'in_progress') return { text: 'Folyamatban', bg: '#bee3f8', color: '#3182ce' };
  if (task.status === 'completed') return { text: 'Kész', bg: '#c6f6d5', color: '#38a169' };
  
  return { text: 'Ismeretlen', bg: '#edf2f7', color: '#718096' };
};

const KarbantartoDashboard = () => {
  const { user, tasks, toolRequests, createToolRequest, hasPermission, updateTaskStatus, premises, appliances, setTaskAwaitingParts } = useAuth();
  const [toolName, setToolName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // generic sanitizer for text fields (allow accents and punctuation)
  const sanitizeText = (input) => {
    return input.replace(/[^a-zA-Z0-9\s\-áéíóöőúüűÁÉÍÓÖŐÚÜŰ.,!?]/g, '');
  };

  const myTasks = tasks.filter(t => String(t.assignedTo) === String(user.id));
  const myTaskIds = myTasks.map(t => String(t.id));
  const myToolRequests = toolRequests
    .filter(tr => myTaskIds.includes(String(tr.taskId)))
    .filter(tr => filterStatus === 'all' ? true : (filterStatus === 'pending' ? !tr.isDelivered : tr.isDelivered))
    .sort((a, b) => {
      if (a.isDelivered === b.isDelivered) {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      return a.isDelivered ? 1 : -1;
    });

  const handleRequestTool = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate inputs
    if (!toolName || toolName.trim().length === 0) {
      setError('Kérjük, add meg az eszköz nevét!');
      return;
    }

    if (toolName.length < 2) {
      setError('Az eszköz nevének legalább 2 karakternek kell lennie!');
      return;
    }

    if (quantity < 1) {
      setError('A mennyiségnek legalább 1-nek kell lennie!');
      return;
    }

    if (!selectedTaskId) {
      setError('Kérjük, válassz egy kapcsolódó feladatot!');
      return;
    }

    try {
      await createToolRequest(
        toolName.trim(),
        quantity,
        user.id,
        selectedTaskId
      );
      await setTaskAwaitingParts(selectedTaskId);
      setToolName('');
      setQuantity(1);
      setSelectedTaskId('');
      setSuccess('Eszközigénylés elküldve, a hiba állapota "Alkatrészre vár" lett! Kérjük, várj a vezetői jóváhagyásra.');
      setTimeout(() => setSuccess(''), 5000);
    } catch (error) {
      setError('Hiba: ' + error.message);
    }
  };

  return (
    <div className="role-dashboard">
      <div className="dashboard-grid">
        <section className="section" style={{ display: 'flex', flexDirection: 'column' }}>
          <h2>🔧 Kiosztott Karbantartási Feladatok</h2>
          <div className="tasks-list" style={{ flex: 1, maxHeight: '600px', overflowY: 'auto', paddingRight: '10px' }}>
            {myTasks.length === 0 ? (
              <p className="empty-state">Nincsenek hozzád rendelt feladatok</p>
            ) : (
              myTasks.map(task => {
                const statusDisplay = getStatusDisplay(task);
                return (
                <div key={task.id} className="task-card">
                  <h3>{task.title}</h3>
                  <p>{task.description}</p>
                  {task._backendData?.premiseId ? (
                    <p><strong>Helyiség:</strong> {premises.find(p => String(p.id) === String(task._backendData.premiseId))?.nameOrNumber || `#${task._backendData.premiseId}`}</p>
                  ) : task.location ? (
                    <p><strong>Helyiség:</strong> {task.location}</p>
                  ) : null}
                  {task._backendData?.applianceId && (
                    <p><strong>Érintett berendezés:</strong> {appliances.find(a => String(a.id) === String(task._backendData.applianceId))?.name || `#${task._backendData.applianceId} (Törölt/Ismeretlen)`}</p>
                  )}
                  {task.specialization && <p><strong>Szükséges szakember:</strong> {task.specialization}</p>}
                  <span className="status-badge" style={{ backgroundColor: statusDisplay.bg, color: statusDisplay.color }}>
                    {statusDisplay.text}
                  </span>
                  <small style={{ display: 'block', margin: '10px 0 5px 0', color: '#718096' }}>Bejelentve: {new Date(task.createdAt).toLocaleDateString()}</small>

                  {task.feedback && (
                    <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f0f4f8', borderRadius: '5px', borderLeft: '4px solid #667eea' }}>
                      <strong>Hallgató megjegyzése:</strong>
                      <p style={{ margin: '5px 0 0 0', fontStyle: 'italic' }}>"{task.feedback}"</p>
                    </div>
                  )}
                  
                  <div className="completion-toggle" style={{ marginTop: '15px', paddingTop: '10px', borderTop: '1px solid #eee' }}>
                    <label className="toggle-label" style={task.completed ? { cursor: 'not-allowed' } : {}}>
                      <span>Hiba készre jelentése:</span>
                      <div className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={task.completed || false}
                          disabled={task.completed}
                          onChange={(e) => updateTaskStatus(task.id, e.target.checked)}
                        />
                        <span className="toggle-slider" style={task.completed ? { cursor: 'not-allowed', opacity: 0.7 } : {}}></span>
                      </div>
                    </label>
                  </div>
                </div>
                );
              })
            )}
          </div>
        </section>

        {hasPermission('request_tools') && (
          <section className="section">
            <h2>🛠️ Eszközök és Szerszámok Igénylése</h2>
            <form onSubmit={handleRequestTool} className="form">
              {error && <div className="error-message">{error}</div>}
              {success && <div className="success-message">{success}</div>}

              <div className="form-group">
                <label>Kapcsolódó Feladat</label>
                <select
                  value={selectedTaskId}
                  onChange={(e) => setSelectedTaskId(e.target.value)}
                  required
                >
                  <option value="">-- válassz egy feladatot --</option>
                  {myTasks.filter(t => !t.completed).map(task => (
                    <option key={task.id} value={task.id}>
                      {task.title}
                    </option>
                  ))}
                </select>
                {myTasks.filter(t => !t.completed).length === 0 && (
                  <small className="form-hint" style={{color: '#fc8181'}}>Nincs folyamatban lévő feladatod! Eszközt csak feladathoz tudsz igényelni.</small>
                )}
              </div>

              <div className="form-group">
                <label>Eszköz/Alkatrész Neve</label>
                <input
                  type="text"
                  value={toolName}
                  onChange={(e) => setToolName(e.target.value)}
                  placeholder="Írd be az eszköz nevét..."
                  required
                  disabled={!selectedTaskId}
                  maxLength={30}
                />
                <small style={{ display: 'block', textAlign: 'right', color: '#a0aec0', fontSize: '0.8em', marginTop: '5px' }}>{toolName.length} / 30</small>
              </div>

              <div className="form-group">
                <label>Mennyiség</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  min="1"
                  required
                  disabled={!selectedTaskId}
                />
              </div>

              <button type="submit" className="btn-primary">
                Igénylés Beküldése
              </button>
            </form>

            <div className="submissions">
              <h3>Saját Igényléseim</h3>
              <div className="filter-controls" style={{ marginBottom: '15px' }}>
                <button
                  className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
                  onClick={() => setFilterStatus('all')}
                >
                  Összes
                </button>
                <button
                  className={`filter-btn ${filterStatus === 'pending' ? 'active' : ''}`}
                  onClick={() => setFilterStatus('pending')}
                >
                  Kiszállítás alatt
                </button>
                <button
                  className={`filter-btn ${filterStatus === 'delivered' ? 'active' : ''}`}
                  onClick={() => setFilterStatus('delivered')}
                >
                  Megérkezett
                </button>
              </div>
              <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '10px' }}>
              {myToolRequests.length === 0 ? (
                <p className="empty-state">TODO: Kell egy végpont a karbantartó azonosítója alapján, hogy listázhassuk a saját rendeléseit is!</p>
              ) : (
                myToolRequests.map(req => (
                  <div key={req.id} className="request-card">
                    <div className="request-header">
                      <h4>{req.toolName}</h4>
                      <span className={`status-badge status-${!req.isDelivered ? 'pending' : 'completed'}`}>
                        {!req.isDelivered ? 'Kiszállítás alatt' : 'Megérkezett'}
                      </span>
                    </div>
                    <p>Mennyiség: {req.quantity}</p>
                    {req.taskId && (
                      <p><strong>Feladat:</strong> {tasks.find(t => String(t.id) === String(req.taskId))?.title || 'Ismeretlen feladat'}</p>
                    )}
                    {req.status === 'pending' && <p className="pending-notice">⏳ Vezetői jóváhagyásra vár</p>}
                    {req.status === 'approved' && <p className="approved-notice">✅ Jóváhagyva - Átveheted az eszközt</p>}
                    {req.status === 'rejected' && <p className="rejected-notice">❌ Igénylés elutasítva</p>}
                    <small>{new Date(req.createdAt).toLocaleDateString()}</small>
                  </div>
                ))
              )}
              </div>
            </div>
          </section>
        )}

        <section className="section info-section">
          <h3>📌 Jogosultságaid</h3>
          <ul className="permissions-list">
            <li>✓ Kiosztott feladataid megtekintése és kezelése</li>
            <li>✓ Szerszámok és eszközök igénylése a raktárból</li>
            <li>✗ Nem hagyhatsz jóvá más igényléseket</li>
            <li>✗ Nem menedzselhetsz más dolgozókat</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default KarbantartoDashboard;
