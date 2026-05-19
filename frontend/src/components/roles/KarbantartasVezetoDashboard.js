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

const KarbantartasVezetoDashboard = () => {
  const { user, users, tasks, toolRequests, approveToolRequest, assignTask, updateTaskStatus, createToolRequest, setTaskAwaitingParts, setTaskUnrepairable, premises, appliances, updateTaskDetails, specializations, updateTaskSpecialization, deleteTask } = useAuth();
  const [filterStatus, setFilterStatus] = useState('all');
  const [taskFilter, setTaskFilter] = useState('all');
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderEquipmentName, setOrderEquipmentName] = useState('');
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [orderSelectedTaskId, setOrderSelectedTaskId] = useState('');
  const [selectedWorkerId, setSelectedWorkerId] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editAttachment, setEditAttachment] = useState('');
  const [newAttachmentFile, setNewAttachmentFile] = useState(null);

  const workers = users.filter(u => u.role === 'Karbantartó');
  const filteredOrders = toolRequests
    .filter(tr => filterStatus === 'all' ? true : (filterStatus === 'pending' ? !tr.isDelivered : tr.isDelivered))
    .sort((a, b) => {
      if (a.isDelivered === b.isDelivered) {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      return a.isDelivered ? 1 : -1;
    });
  const unassignedTasks = tasks.filter(t => !t.assignedTo)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  const allTasks = tasks.filter(t => t.assignedTo);
  const filteredTasks = allTasks.filter(t => {
    if (taskFilter === 'all') return true;
    const rawStatus = t._backendData?.status;
    if (taskFilter === 'Pending') return rawStatus === 0 || rawStatus === 'Pending' || (!rawStatus && t.status === 'pending');
    if (taskFilter === 'InProgress') return rawStatus === 1 || rawStatus === 'InProgress' || (!rawStatus && t.status === 'in_progress');
    if (taskFilter === 'AwaitingParts') return rawStatus === 2 || rawStatus === 'AwaitingParts';
    if (taskFilter === 'Repaired') return rawStatus === 3 || rawStatus === 'Repaired' || (!rawStatus && t.status === 'completed');
    if (taskFilter === 'Unrepairable') return rawStatus === 4 || rawStatus === 'Unrepairable';
    return false;
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const handleApprove = async (requestId) => {
    try {
      await approveToolRequest(requestId);
      alert('Eszköz/Alkatrész megérkezettként megjelölve!');
    } catch (error) {
      alert('Hiba: ' + error.message);
    }
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (!orderEquipmentName.trim() || orderQuantity < 1 || !orderSelectedTaskId) {
      alert('Kérjük, töltsd ki az összes mezőt!');
      return;
    }
    try {
      await createToolRequest(orderEquipmentName, orderQuantity, user.id, orderSelectedTaskId);
      await setTaskAwaitingParts(orderSelectedTaskId);
      setOrderEquipmentName('');
      setOrderQuantity(1);
      setOrderSelectedTaskId('');
      setShowOrderForm(false);
      alert('Alkatrész megrendelve, a hiba állapota "Alkatrészre vár" lett!');
    } catch (err) {
      alert('Hiba történt: ' + err.message);
    }
  };

  const selectedWorker = users.find(u => u.id === selectedWorkerId);
  const selectedWorkerTasks = selectedWorkerId ? tasks.filter(t => t.assignedTo === selectedWorkerId) : [];

  const openEditModal = (task) => {
    setEditingTask(task);
    setEditTitle(task.name || task.title || '');
    setEditDescription(task.description || '');
    setEditAttachment(task._backendData?.attachment || 'nincs_kep.jpg');
    setNewAttachmentFile(null);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      // If a new file is selected, its name is used. Otherwise, the original filename is kept.
      const finalAttachmentName = newAttachmentFile ? newAttachmentFile.name : editingTask._backendData?.attachment;
      const safeTitle = editTitle.replace(/[^a-zA-Z0-9\s\-áéíóöőúüűÁÉÍÓÖŐÚÜŰ.,!?]/g, '');
      const safeDesc = editDescription.replace(/[^a-zA-Z0-9\s\-áéíóöőúüűÁÉÍÓÖŐÚÜŰ.,!?]/g, '');
      await updateTaskDetails(editingTask.id, safeTitle, safeDesc, finalAttachmentName);
      setEditingTask(null);
      alert('Hiba sikeresen frissítve!');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Biztosan törölni szeretnéd ezt a hibajelentést? (Végleges törlés az adatbázisból)')) {
      try {
        await deleteTask(taskId);
        alert('Hiba sikeresen törölve!');
      } catch(err) {
        alert(err.message);
      }
    }
  };

  return (
    <div className="role-dashboard">
      <div className="dashboard-grid-wide">
        <section className="section">
          <h2>Eszköz- és Alkatrészrendelések Állapota</h2>
          <div className="filter-controls">
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

          <div className="requests-list" style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '10px' }}>
            {filteredOrders.length === 0 ? (
              <p className="empty-state">Nincsenek rendelések ebben a státuszban</p>
            ) : (
              filteredOrders.map(req => {
                const associatedTask = tasks.find(t => String(t.id) === String(req.taskId));
                const assignedMaintainer = associatedTask ? users.find(u => String(u.id) === String(associatedTask.assignedTo)) : null;
                return (
                  <div key={req.id} className="request-card-manager">
                    <div className="request-header">
                      <div>
                        <h4>{req.toolName}</h4>
                        {assignedMaintainer && <p className="requester" style={{ fontSize: '0.85em', color: '#4a5568', margin: '5px 0 0 0' }}>Karbantartó: <strong>{assignedMaintainer.name}</strong></p>}
                      </div>
                      <span className={`status-badge status-${!req.isDelivered ? 'pending' : 'completed'}`}>
                        {!req.isDelivered ? 'Kiszállítás alatt' : 'Megérkezett'}
                      </span>
                    </div>

                    <div className="request-details">
                      <p><strong>Mennyiség:</strong> {req.quantity}</p>
                      {req.taskId && (
                        <p><strong>Feladat:</strong> {tasks.find(t => String(t.id) === String(req.taskId))?.title || 'Ismeretlen feladat'}</p>
                      )}
                      <small style={{ display: 'block', margin: '10px 0 5px 0', color: '#718096' }}>Megrendelve: {new Date(req.createdAt).toLocaleDateString()}</small>
                    </div>

                    {!req.isDelivered && (
                      <div className="action-buttons">
                        <button
                          className="btn-approve"
                          onClick={() => handleApprove(req.id)}
                        >
                          Megérkezett
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
          <h2>Karbantartási Feladatok Kiosztása</h2>
          <div className="tasks-list" style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '10px' }}>
            {unassignedTasks.length === 0 ? (
              <p className="empty-state">Nincs kiosztásra váró feladat</p>
            ) : (
              unassignedTasks.map(task => {
                const statusDisplay = getStatusDisplay(task);
                const reporter = users.find(u => String(u.id) === String(task.createdBy));
                return (
                <div key={task.id} className="task-card">
                  <div className="task-header">
                    <h4>{task.title}</h4>
                    <div>
                      <span className="status-badge" style={{ backgroundColor: statusDisplay.bg, color: statusDisplay.color }}>
                        {statusDisplay.text}
                      </span>
                      <button className="btn-primary" style={{ padding: '4px 8px', fontSize: '0.8em', marginLeft: '10px' }} onClick={() => openEditModal(task)}>Módosítás</button>
                      <button className="btn-delete-small" style={{ marginLeft: '10px' }} onClick={() => handleDeleteTask(task.id)}>Törlés</button>
                    </div>
                  </div>
                  <p>{task.description}</p>
                  {task._backendData?.premiseId ? (
                    <p><strong>Helyiség:</strong> {premises.find(p => String(p.id) === String(task._backendData.premiseId))?.nameOrNumber || `#${task._backendData.premiseId}`}</p>
                  ) : task.location ? (
                    <p><strong>Helyiség:</strong> {task.location}</p>
                  ) : null}
                  {task._backendData?.applianceId && (
                    <p><strong>Érintett berendezés:</strong> {appliances.find(a => String(a.id) === String(task._backendData.applianceId))?.name || `#${task._backendData.applianceId} (Törölt/Ismeretlen)`}</p>
                  )}
                  {reporter && <p><strong>Bejelentő:</strong> {reporter.name}</p>}
                  <small style={{ display: 'block', margin: '10px 0 5px 0', color: '#718096' }}>Bejelentve: {new Date(task.createdAt).toLocaleDateString()}</small>
                  
                  <div className="form-group" style={{ marginTop: '10px' }}>
                    <label>Szükséges Szakterület</label>
                    <select
                      value={task._backendData?.specializationId || task._backendData?.specialisationId || ''}
                      onChange={async (e) => {
                        try {
                          await updateTaskSpecialization(task.id, e.target.value);
                        } catch (err) {
                          alert(err.message);
                        }
                      }}
                    >
                      <option value="">-- Válassz szakterületet --</option>
                      {specializations.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group" style={{ marginTop: '10px' }}>
                    <label>Karbantartó Kijelölése</label>
                    {(task._backendData?.specializationId || task._backendData?.specialisationId) ? (
                      <select
                        value={task.assignedTo || ''}
                        onChange={(e) => assignTask(task.id, e.target.value)}
                      >
                        <option value="">-- Válassz szakembert --</option>
                        {workers.filter(w => {
                          const specId = task._backendData?.specializationId || task._backendData?.specialisationId;
                          const taskSpec = specializations.find(s => String(s.id) === String(specId));
                          return taskSpec && w.specialization && w.specialization.includes(taskSpec.name);
                        }).length === 0 && <option value="" disabled>Nincs megfelelő szakember!</option>}
                        
                        {workers.filter(w => {
                          const specId = task._backendData?.specializationId || task._backendData?.specialisationId;
                          const taskSpec = specializations.find(s => String(s.id) === String(specId));
                          return taskSpec && w.specialization && w.specialization.includes(taskSpec.name);
                        }).map(w => (
                          <option key={w.id} value={w.id}>
                            {w.name} {w.specialization ? `(${w.specialization})` : ''}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p style={{ margin: 0, fontSize: '0.85em', color: '#e53e3e', fontStyle: 'italic', padding: '8px', backgroundColor: '#fed7d7', borderRadius: '4px' }}>
                        Szakember kijelöléséhez előbb válaszd ki a hiba szakterületét!
                      </p>
                    )}
                  </div>
                </div>
                );
              })
            )}
          </div>
        </section>

        <section className="section">
          <h2>Hibajavítások Állapotának Követése</h2>
          <div className="filter-controls" style={{ flexWrap: 'wrap' }}>
            <button className={`filter-btn ${taskFilter === 'all' ? 'active' : ''}`} onClick={() => setTaskFilter('all')}>Összes</button>
            <button className={`filter-btn ${taskFilter === 'Pending' ? 'active' : ''}`} onClick={() => setTaskFilter('Pending')}>Függőben</button>
            <button className={`filter-btn ${taskFilter === 'InProgress' ? 'active' : ''}`} onClick={() => setTaskFilter('InProgress')}>Folyamatban</button>
            <button className={`filter-btn ${taskFilter === 'AwaitingParts' ? 'active' : ''}`} onClick={() => setTaskFilter('AwaitingParts')}>Alkatrészre vár</button>
            <button className={`filter-btn ${taskFilter === 'Repaired' ? 'active' : ''}`} onClick={() => setTaskFilter('Repaired')}>Javítva</button>
            <button className={`filter-btn ${taskFilter === 'Unrepairable' ? 'active' : ''}`} onClick={() => setTaskFilter('Unrepairable')}>Javíthatatlan</button>
          </div>

          <div className="tasks-list" style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '10px' }}>
            {filteredTasks.length === 0 ? (
              <p className="empty-state">Nincsenek feladatok ebben a kategóriában</p>
            ) : (
              filteredTasks.map(task => {
                const assignee = users.find(u => String(u.id) === String(task.assignedTo));
                const reporter = users.find(u => String(u.id) === String(task.createdBy));
                const statusDisplay = getStatusDisplay(task);
                return (
                  <div key={task.id} className={`task-card ${task.completed ? 'task-completed' : ''}`}>
                    <div className="task-header">
                      <h4>{task.title}</h4>
                      <div>
                        <span className="status-badge" style={{ backgroundColor: statusDisplay.bg, color: statusDisplay.color }}>
                          {statusDisplay.text}
                        </span>
                        <button className="btn-primary" style={{ padding: '4px 8px', fontSize: '0.8em', marginLeft: '10px' }} onClick={() => openEditModal(task)}>Módosítás</button>
                        <button className="btn-delete-small" style={{ marginLeft: '10px' }} onClick={() => handleDeleteTask(task.id)}>Törlés</button>
                      </div>
                    </div>
                    <p>{task.description}</p>
                    {task._backendData?.premiseId ? (
                      <p><strong>Helyiség:</strong> {premises.find(p => String(p.id) === String(task._backendData.premiseId))?.nameOrNumber || `#${task._backendData.premiseId}`}</p>
                    ) : task.location ? (
                      <p><strong>Helyiség:</strong> {task.location}</p>
                    ) : null}
                    {task._backendData?.applianceId && (
                      <p><strong>Érintett berendezés:</strong> {appliances.find(a => String(a.id) === String(task._backendData.applianceId))?.name || `#${task._backendData.applianceId} (Törölt/Ismeretlen)`}</p>
                    )}
                    {reporter && <p><strong>Bejelentő:</strong> {reporter.name}</p>}
                    {assignee && <p><strong>Kiosztva:</strong> {assignee.name}</p>}
                    
                    {task.feedback && (
                      <div style={{ marginTop: '10px', padding: '8px', backgroundColor: '#f0f4f8', borderRadius: '4px', borderLeft: '4px solid #667eea' }}>
                        <strong>Hallgató megjegyzése:</strong>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.9em', fontStyle: 'italic' }}>"{task.feedback}"</p>
                      </div>
                    )}

                    <small style={{ display: 'block', margin: '10px 0 5px 0', color: '#718096' }}>Bejelentve: {new Date(task.createdAt).toLocaleDateString()}</small>

                    <div className="completion-toggle" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                      <label className="toggle-label" style={task.completed ? { cursor: 'not-allowed' } : {}}>
                        <span>Készre jelentés:</span>
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

                      {!task.completed && (
                        <button 
                          className="btn-reject" 
                          style={{ padding: '5px 10px', fontSize: '0.85em' }}
                          onClick={() => {
                            if (window.confirm('Biztosan javíthatatlannak jelölöd ezt a hibát?')) {
                              setTaskUnrepairable(task.id);
                            }
                          }}
                        >
                          Javíthatatlan
                        </button>
                      )}

                      {task.completed && task.completedAt && (
                        <small className="completion-date">
                          Befejezve: {new Date(task.completedAt).toLocaleDateString()}
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
          <h2>Csapatom - Karbantartók</h2>
          <div className="workers-list" style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '10px' }}>
            {workers.length === 0 ? (
              <p className="empty-state">Nincsenek karbantartók regisztrálva a rendszerben</p>
            ) : (
              workers.map(worker => {
                const workerRequests = toolRequests.filter(tr => tr.requestedBy === worker.id);
                const pendingReqs = workerRequests.filter(tr => tr.status === 'pending');
                const assignedTasksCount = tasks.filter(t => String(t.assignedTo) === String(worker.id)).length;
                return (
                  <div 
                    key={worker.id} 
                    className="worker-card" 
                    onClick={() => setSelectedWorkerId(worker.id)} 
                    style={{ cursor: 'pointer' }} 
                    title="Kattints a feladatok megtekintéséhez"
                  >
                    <h4>{worker.name}</h4>
                    <p className="worker-email">{worker.email}</p>
                    <div className="worker-stats">
                      <span>Összes Igénylés: {workerRequests.length}</span>
                      <span className="pending">Függőben: {pendingReqs.length}</span>
                      <span style={{ color: '#3182ce', fontWeight: 'bold' }}>Kiosztott feladatok: {assignedTasksCount}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        <section className="section">
          <h2>Eszközök és Szerszámok Igénylése</h2>
          <button className="btn-add" onClick={() => setShowOrderForm(!showOrderForm)} style={{marginTop: '15px'}}>
            {showOrderForm ? 'Mégse' : '+ Alkatrész rendelése'}
          </button>
          
          {showOrderForm && (
            <form onSubmit={handleCreateOrder} className="form" style={{marginTop: '15px'}}>
              <div className="form-group">
                <label>Kapcsolódó Hiba</label>
                <select value={orderSelectedTaskId} onChange={(e) => setOrderSelectedTaskId(e.target.value)} required>
                  <option value="">-- Válassz egy hibát --</option>
                  {tasks.filter(t => !t.completed && t.assignedTo).map(task => (
                    <option key={task.id} value={task.id}>{task.title}</option>
                  ))}
                </select>
                {tasks.filter(t => !t.completed && t.assignedTo).length === 0 && (
                  <small className="form-hint" style={{color: '#fc8181', marginTop: '5px', display: 'block'}}>Először rendelj hozzá egy karbantartót a hibához!</small>
                )}
              </div>
              <div className="form-group">
                <label>Eszköz/Alkatrész Neve</label>
                <input type="text" value={orderEquipmentName} onChange={(e) => setOrderEquipmentName(e.target.value)} placeholder="pl. Csaptelep, Izzó" required disabled={!orderSelectedTaskId} maxLength={30} />
                <small style={{ display: 'block', textAlign: 'right', color: '#a0aec0', fontSize: '0.8em', marginTop: '5px' }}>{orderEquipmentName.length} / 30</small>
              </div>
              <div className="form-group">
                <label>Szükséges Mennyiség</label>
                <input type="number" value={orderQuantity} onChange={(e) => setOrderQuantity(parseInt(e.target.value))} min="1" required disabled={!orderSelectedTaskId} />
              </div>
              <button type="submit" className="btn-primary" disabled={!orderSelectedTaskId}>Rendelés Elküldése</button>
            </form>
          )}
        </section>

        <section className="section info-section">
          <h3>Jogosultságaid</h3>
          <ul className="permissions-list">
            <li>Összes karbantartási feladat megtekintése</li>
            <li>Eszközrendelések kiszállításának rögzítése</li>
            <li>Hibák kiosztása a karbantartóknak</li>
            <li>Alkatrészek rendelése közvetlenül a hibákhoz</li>
          </ul>
        </section>
      </div>

      {/* Worker Tasks Modal */}
      {selectedWorkerId && selectedWorker && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="modal-content section" style={{ backgroundColor: 'white', padding: '25px', borderRadius: '8px', width: '90%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', margin: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid #667eea', paddingBottom: '10px' }}>
              <h2 style={{ margin: 0, borderBottom: 'none', paddingBottom: 0 }}>{selectedWorker.name} feladatai</h2>
              <button style={{ padding: '8px 16px', cursor: 'pointer', border: '1px solid #ccc', borderRadius: '5px', background: '#f9f9f9', fontWeight: 'bold' }} onClick={() => setSelectedWorkerId(null)}>Bezárás</button>
            </div>
            
            {selectedWorkerTasks.length === 0 ? (
              <p className="empty-state">Nincsenek kiosztott feladatok.</p>
            ) : (
              <div className="tasks-list">
                {selectedWorkerTasks.map(task => {
                  const statusDisplay = getStatusDisplay(task);
                  const reporter = users.find(u => String(u.id) === String(task.createdBy));
                  return (
                    <div key={task.id} className={`task-card ${task.completed ? 'task-completed' : ''}`}>
                      <div className="task-header">
                        <h4>{task.title}</h4>
                        <div>
                          <span className="status-badge" style={{ backgroundColor: statusDisplay.bg, color: statusDisplay.color }}>
                            {statusDisplay.text}
                          </span>
                          <button className="btn-delete-small" style={{ marginLeft: '10px' }} onClick={() => handleDeleteTask(task.id)}>Törlés</button>
                        </div>
                      </div>
                      <p>{task.description}</p>
                      {task._backendData?.premiseId ? (
                        <p><strong>Helyiség:</strong> {premises.find(p => String(p.id) === String(task._backendData.premiseId))?.nameOrNumber || `#${task._backendData.premiseId}`}</p>
                      ) : task.location ? (
                        <p><strong>Helyiség:</strong> {task.location}</p>
                      ) : null}
                      {reporter && <p><strong>Bejelentő:</strong> {reporter.name}</p>}
                      <small style={{ display: 'block', margin: '10px 0 5px 0', color: '#718096' }}>Bejelentve: {new Date(task.createdAt).toLocaleDateString()}</small>
                      {task.completedAt && (
                        <small className="completion-date" style={{ display: 'block', marginTop: '5px' }}>
                          Befejezve: {new Date(task.completedAt).toLocaleDateString()}
                        </small>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

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

export default KarbantartasVezetoDashboard;
