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

const EgyetemistaDashboard = () => {
  const { user, tasks, createTask, hasPermission, addFeedback, premises, appliances, updateTaskDetails } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [applianceId, setApplianceId] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [feedbackInputs, setFeedbackInputs] = useState({});
  const [editingTask, setEditingTask] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editAttachment, setEditAttachment] = useState('');
  const [newAttachmentFile, setNewAttachmentFile] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editSuccess, setEditSuccess] = useState('');
  const [editError, setEditError] = useState('');

  // generic sanitizer: letters, numbers, spaces, hyphens and Hungarian accents
  const sanitizeText = (input) => {
    return input.replace(/[^a-zA-Z0-9\s\-áéíóöőúüűÁÉÍÓÖŐÚÜŰ.,!?]/g, '');
  };

  const myTasks = tasks.filter(t => String(t.createdBy) === String(user.id));
  const filteredTasks = myTasks.filter(t => {
    if (filterStatus === 'all') return true;
    const rawStatus = t._backendData?.status;
    if (filterStatus === 'Pending') return rawStatus === 0 || rawStatus === 'Pending' || (!rawStatus && t.status === 'pending');
    if (filterStatus === 'InProgress') return rawStatus === 1 || rawStatus === 'InProgress' || (!rawStatus && t.status === 'in_progress');
    if (filterStatus === 'AwaitingParts') return rawStatus === 2 || rawStatus === 'AwaitingParts';
    if (filterStatus === 'Repaired') return rawStatus === 3 || rawStatus === 'Repaired' || (!rawStatus && t.status === 'completed');
    if (filterStatus === 'Unrepairable') return rawStatus === 4 || rawStatus === 'Unrepairable';
    return false;
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setSubmitSuccess('');
    setSubmitError('');
    try {
      if (!description || description.trim().length === 0) {
        throw new Error('A részletes leírás kitöltése kötelező!');
      }
      if (!attachment) {
        throw new Error('Kérjük, csatolj egy képet a hibáról!');
      }
      if (!location || location.trim().length === 0) {
        throw new Error('Kérjük, add meg a helyszínt / szobát!');
      }
      // leave assignedTo empty; manager will assign a worker later
      const fileName = attachment ? attachment.name : null;
      await createTask(title, description, '', location, null, applianceId, fileName);
      setTitle('');
      setDescription('');
      setLocation('');
      setApplianceId('');
      setAttachment(null);
      setSubmitSuccess('Hibabejelentés sikeresen elküldve!');
    } catch (error) {
      setSubmitError('Hiba történt a bejelentés során: ' + error.message);
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

  const openEditModal = (task) => {
    setEditingTask(task);
    setEditTitle(task.name || task.title || '');
    setEditDescription(task.description || '');
    setEditAttachment(task._backendData?.attachment || 'nincs_kep.jpg');
    setNewAttachmentFile(null);
    setEditSuccess('');
    setEditError('');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditSuccess('');
    setEditError('');
    try {
      // If a new file is selected, its name is used. Otherwise, the original filename is kept.
      const finalAttachmentName = newAttachmentFile ? newAttachmentFile.name : editingTask._backendData?.attachment;
      await updateTaskDetails(editingTask.id, sanitizeText(editTitle), sanitizeText(editDescription), finalAttachmentName);
      setEditSuccess('Hiba sikeresen frissítve!');
      setTimeout(() => {
        setEditingTask(null);
        setEditSuccess('');
      }, 1500); // 1.5 mp múlva az ablak magától bezárul
    } catch (err) {
      setEditError(err.message);
    }
  };

  return (
    <div className="role-dashboard">
      <div className="dashboard-grid">
        <section className="section" style={{ display: 'flex', flexDirection: 'column' }}>
          <h2>📋 Saját bejelentéseim</h2>
          <div className="filter-controls" style={{ flexWrap: 'wrap', marginBottom: '15px' }}>
            <button className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`} onClick={() => setFilterStatus('all')}>Összes</button>
            <button className={`filter-btn ${filterStatus === 'Pending' ? 'active' : ''}`} onClick={() => setFilterStatus('Pending')}>Függőben</button>
            <button className={`filter-btn ${filterStatus === 'InProgress' ? 'active' : ''}`} onClick={() => setFilterStatus('InProgress')}>Folyamatban</button>
            <button className={`filter-btn ${filterStatus === 'AwaitingParts' ? 'active' : ''}`} onClick={() => setFilterStatus('AwaitingParts')}>Alkatrészre vár</button>
            <button className={`filter-btn ${filterStatus === 'Repaired' ? 'active' : ''}`} onClick={() => setFilterStatus('Repaired')}>Javítva</button>
            <button className={`filter-btn ${filterStatus === 'Unrepairable' ? 'active' : ''}`} onClick={() => setFilterStatus('Unrepairable')}>Javíthatatlan</button>
          </div>
          <div className="tasks-list" style={{ flex: 1, maxHeight: '600px', overflowY: 'auto', paddingRight: '10px' }}>
            {filteredTasks.length === 0 ? (
              <p className="empty-state">Nincs megjeleníthető bejelentés ebben a kategóriában</p>
            ) : (
            filteredTasks.map(task => {
              const displayTitle = task.name || task.title || "Névtelen hiba";
              const displayDesc = task.description || "Nincs külön leírás megadva.";
              const statusDisplay = getStatusDisplay(task);

              return (
                <div key={task.id} className="task-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 style={{ marginBottom: '10px', color: '#2d3748' }}>{displayTitle}</h3>
                    {!task.completed && (
                      <button className="btn-primary" style={{ padding: '4px 8px', fontSize: '0.8em' }} onClick={() => openEditModal(task)}>Módosítás</button>
                    )}
                  </div>
                  <div style={{ backgroundColor: '#f7fafc', padding: '10px', borderRadius: '6px', marginBottom: '15px', border: '1px solid #e2e8f0' }}>
                    <p style={{ margin: 0, color: '#4a5568' }}>{displayDesc}</p>
                  </div>
                  {task._backendData?.premiseId ? (
                    <p><strong>Helyiség:</strong> {premises.find(p => String(p.id) === String(task._backendData.premiseId))?.nameOrNumber || `#${task._backendData.premiseId}`}</p>
                  ) : task.location ? (
                    <p><strong>Helyiség:</strong> {task.location}</p>
                  ) : null}
                  {task._backendData?.applianceId && (
                    <p><strong>Érintett berendezés:</strong> {appliances.find(a => String(a.id) === String(task._backendData.applianceId))?.name || `#${task._backendData.applianceId} (Törölt/Ismeretlen)`}</p>
                  )}
                  <p style={{ margin: '5px 0 10px 0' }}>
                    <strong>Szakember: </strong>
                    {(!task.specialization || task.specialization === 'Egyéb') ? (
                      <span style={{ color: '#c05621', backgroundColor: '#feebc8', padding: '3px 8px', borderRadius: '12px', fontSize: '0.85em', fontWeight: 'bold', marginLeft: '5px' }}>
                        ⏳ Kijelölés folyamatban...
                      </span>
                    ) : (
                      <span style={{ color: '#2b6cb0', fontWeight: 'bold', marginLeft: '5px' }}>{task.specialization}</span>
                    )}
                  </p>
                  <span className="status-badge" style={{ backgroundColor: statusDisplay.bg, color: statusDisplay.color }}>
                    {statusDisplay.text}
                  </span>
                  <small style={{ display: 'block', marginTop: '5px' }}>Bejelentve: {new Date(task.createdAt).toLocaleDateString()}</small>
                  
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
                    <div className="feedback-section" style={{ marginTop: '15px', padding: '10px', backgroundColor: '#e6ffe6', borderRadius: '8px', borderLeft: '4px solid #4caf50' }}>
                      <p style={{ margin: '0 0 5px 0', fontSize: '0.9em', fontWeight: 'bold', color: '#2e8b57' }}>✓ Megjegyzésed:</p>
                      <p style={{ margin: 0, fontStyle: 'italic' }}>"{task.feedback}"</p>
                    </div>
                  )}
                </div>
              );
            })
            )}
          </div>
        </section>

        {hasPermission('submit_requests') && (
          <section className="section">
            <h2>📝 Új hiba bejelentése</h2>
            <form onSubmit={handleCreateTask} className="form">
              <div className="form-group">
                <label>Helyszín / Szoba</label>
                <select
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value);
                    setApplianceId(''); // Töröljük a berendezést, ha megváltozik a szoba
                  }}
                  required
                >
                  <option value="">-- Válassz egy helyiséget --</option>
                  {premises.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nameOrNumber}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Berendezés (Opcionális)</label>
                <select
                  value={applianceId}
                  onChange={(e) => setApplianceId(e.target.value)}
                  disabled={!location} // Csak akkor választható, ha már van helyiség
                >
                  <option value="">-- Nem berendezéshez kapcsolódik --</option>
                  {location && appliances
                    .filter(a => String(a.premiseId) === String(location))
                    .map(a => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                </select>
              </div>
              <div className="form-group">
                <label>Hiba megnevezése</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(sanitizeText(e.target.value))}
                  placeholder="Add meg a hiba röviden (pl. Csöpög a csap)"
                  maxLength={20}
                  required
                  disabled={!location}
                />
                <small style={{ display: 'block', textAlign: 'right', color: '#a0aec0', fontSize: '0.8em', marginTop: '5px' }}>{title.length} / 20</small>
              </div>

              <div className="form-group">
                <label>Részletes leírás</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(sanitizeText(e.target.value))}
                  placeholder="Írd le a probléma részleteit..."
                  rows="4"
                  maxLength={200}
                  required
                  disabled={!location}
                />
                <small style={{ display: 'block', textAlign: 'right', color: '#a0aec0', fontSize: '0.8em', marginTop: '5px' }}>{description.length} / 200</small>
              </div>

              <div className="form-group">
                <label>Kép csatolása</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setAttachment(e.target.files[0]);
                    } else {
                      setAttachment(null);
                    }
                  }}
                  required
                  disabled={!location}
                />
              </div>

              <button type="submit" className="btn-primary" disabled={!location}>
                Bejelentés küldése
              </button>
              {submitSuccess && <div className="success-message" style={{ marginTop: '10px', marginBottom: 0 }}>{submitSuccess}</div>}
              {submitError && <div className="error-message" style={{ marginTop: '10px', marginBottom: 0 }}>{submitError}</div>}
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

      {/* Edit Task Modal */}
      {editingTask && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="modal-content section" style={{ backgroundColor: 'white', padding: '25px', borderRadius: '8px', width: '90%', maxWidth: '500px' }}>
            <h2 style={{ marginTop: 0, borderBottom: '2px solid #667eea', paddingBottom: '10px' }}>Hiba módosítása</h2>
            <form onSubmit={handleEditSubmit} className="form">
              <div className="form-group">
                <label>Hiba megnevezése</label>
                <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} required maxLength={50} />
              </div>
              <div className="form-group">
                <label>Részletes leírás</label>
                <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows="4" required maxLength={200} />
              </div>
              <div className="form-group">
                <label>Csatolmány</label>
                <p style={{ fontSize: '0.9em', color: '#666', margin: '0 0 8px 0' }}>
                  Jelenlegi fájl: <strong>{newAttachmentFile ? newAttachmentFile.name : editAttachment}</strong>
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setNewAttachmentFile(e.target.files[0]);
                    } else {
                      setNewAttachmentFile(null);
                    }
                  }}
                />
                <small className="form-hint">Új kép feltöltése lecseréli a régit. Ha nem választasz fájlt, a jelenlegi marad.</small>
              </div>
              {editSuccess && <div className="success-message" style={{ margin: '10px 0 0 0' }}>{editSuccess}</div>}
              {editError && <div className="error-message" style={{ margin: '10px 0 0 0' }}>{editError}</div>}
              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Mentés</button>
                <button type="button" className="btn-secondary" style={{ flex: 1, padding: '12px', background: '#e2e8f0', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => setEditingTask(null)}>Mégse</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EgyetemistaDashboard;
