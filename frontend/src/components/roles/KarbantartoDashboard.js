import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import '../../styles/RoleDashboards.css';

const KarbantartoDashboard = () => {
  const { user, tasks, toolRequests, createToolRequest, hasPermission, updateTaskStatus, equipment } = useAuth();
  const [toolName, setToolName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  // generic sanitizer for text fields (allow accents and punctuation)
  const sanitizeText = (input) => {
    return input.replace(/[^a-zA-Z0-9\s\-áéíóöőúüűÁÉÍÓÖŐÚÜŰ.,!?]/g, '');
  };

  const myTasks = tasks.filter(t => String(t.assignedTo) === String(user.id));
  const myToolRequests = toolRequests.filter(tr => String(tr.requestedBy) === String(user.id));

  // we no longer free‑type tool name, using dropdown so sanitization not needed here
  // Sanitize reason - allow letters, numbers, spaces, hyphens and Hungarian accents
  const sanitizeReason = (input) => {
    return input.replace(/[^a-zA-Z0-9\s\-áéíóöőúüűÁÉÍÓÖŐÚÜŰ.,!?]/g, '');
  };

  const selectedEquipment = equipment.find(eq => eq.name === toolName);
  const maxAvailable = selectedEquipment ? selectedEquipment.quantity : 1;

  const handleRequestTool = (e) => {
    e.preventDefault();
    setError('');

    // Validate inputs
    if (!toolName || toolName.trim().length === 0) {
      setError('Kérjük, válassz egy eszközt!');
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

    if (selectedEquipment && quantity > maxAvailable) {
      setError(`Maximum ${maxAvailable} db kérhető ebből az eszközből!`);
      return;
    }

    if (!reason || reason.trim().length === 0) {
      setError('Kérjük, add meg az igénylés indokát!');
      return;
    }

    if (reason.length < 5) {
      setError('Az indoknak legalább 5 karakter hosszúnak kell lennie!');
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
      alert('Eszközigénylés elküldve! Kérjük, várj a vezetői jóváhagyásra.');
    } catch (error) {
      setError('Hiba: ' + error.message);
    }
  };

  return (
    <div className="role-dashboard">
      <div className="dashboard-grid">
        <section className="section">
          <h2>🔧 Kiosztott Karbantartási Feladatok</h2>
          <div className="tasks-list" style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '10px' }}>
            {myTasks.length === 0 ? (
              <p className="empty-state">Nincsenek hozzád rendelt feladatok</p>
            ) : (
              myTasks.map(task => (
                <div key={task.id} className="task-card">
                  <h3>{task.title}</h3>
                  <p>{task.description}</p>
                  {task.location && <p><strong>Helyszín:</strong> {task.location}</p>}
                  {task.specialization && <p><strong>Szükséges szakember:</strong> {task.specialization}</p>}
                  <span className={`status-badge status-${task.status}`}>{task.status}</span>
                  <small>{new Date(task.createdAt).toLocaleDateString()}</small>

                  {task.feedback && (
                    <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f0f4f8', borderRadius: '5px', borderLeft: '4px solid #667eea' }}>
                      <strong>Hallgató megjegyzése:</strong>
                      <p style={{ margin: '5px 0 0 0', fontStyle: 'italic' }}>"{task.feedback}"</p>
                    </div>
                  )}
                  
                  <div className="completion-toggle" style={{ marginTop: '15px', paddingTop: '10px', borderTop: '1px solid #eee' }}>
                    <label className="toggle-label">
                      <span>Hiba készre jelentése:</span>
                      <div className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={task.completed || false}
                          onChange={(e) => updateTaskStatus(task.id, e.target.checked)}
                        />
                        <span className="toggle-slider"></span>
                      </div>
                    </label>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {hasPermission('request_tools') && (
          <section className="section">
            <h2>🛠️ Eszközök és Szerszámok Igénylése</h2>
            <form onSubmit={handleRequestTool} className="form">
              {error && <div className="error-message">{error}</div>}

              <div className="form-group">
                <label>Eszköz Neve</label>
                <select
                  value={toolName}
                  onChange={(e) => setToolName(e.target.value)}
                  required
                >
                  <option value="">-- válassz egy eszközt --</option>
                  {equipment.map(eq => (
                    <option key={eq.id} value={eq.name} disabled={eq.quantity === 0}>
                      {eq.name} (Elérhető: {eq.quantity} db)
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Mennyiség</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  min="1"
                  max={maxAvailable}
                  required
                />
                {selectedEquipment && (
                  <small className="form-hint" style={{color: '#667eea'}}>Maximum {maxAvailable} db kérhető ebből a raktáron lévő eszközből.</small>
                )}
              </div>

              <div className="form-group">
                <label>Indok / Feladat Leírása</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(sanitizeReason(e.target.value))}
                  placeholder="Miért van szükséged ezekre a szerszámokra?"
                  rows="4"
                  required
                />
                <small className="form-hint">Minimum 5 karakter (speciális karakterek nélkül)</small>
              </div>

              <button type="submit" className="btn-primary">
                Igénylés Beküldése
              </button>
            </form>

            <div className="submissions">
              <h3>Saját Igényléseim</h3>
              <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '10px' }}>
              {myToolRequests.length === 0 ? (
                <p className="empty-state">Még nem adtál le igénylést</p>
              ) : (
                myToolRequests.map(req => (
                  <div key={req.id} className="request-card">
                    <div className="request-header">
                      <h4>{req.toolName}</h4>
                      <span className={`status-badge status-${req.status}`}>{req.status}</span>
                    </div>
                    <p>Mennyiség: {req.quantity}</p>
                    <p>{req.reason}</p>
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
