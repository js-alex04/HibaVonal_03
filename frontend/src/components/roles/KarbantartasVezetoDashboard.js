import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import '../../styles/RoleDashboards.css';


const KarbantartasVezetoDashboard = () => {
  const { user, users, tasks, toolRequests, approveToolRequest, rejectToolRequest, assignTask, updateTaskStatus, createEquipmentOrder } = useAuth();
  const [filterStatus, setFilterStatus] = useState('pending');
  const [taskFilter, setTaskFilter] = useState('all');
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderEquipmentName, setOrderEquipmentName] = useState('');
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [orderReason, setOrderReason] = useState('');

  const workers = users.filter(u => u.role === 'Karbantartó');
  const pendingRequests = toolRequests.filter(tr => tr.status === filterStatus);
  const unassignedTasks = tasks.filter(t => !t.assignedTo || t.status === 'pending');
  
  const allTasks = tasks.filter(t => t.assignedTo);
  const filteredTasks = taskFilter === 'all' 
    ? allTasks 
    : allTasks.filter(t => t.status === taskFilter || (taskFilter === 'in_progress' && t.status === 'assigned'));

  const handleApprove = async (requestId) => {
    try {
      await approveToolRequest(requestId);
      alert('Eszközigénylés jóváhagyva!');
    } catch (error) {
      alert('Hiba: ' + error.message);
    }
  };

  const handleReject = (requestId) => {
    try {
      rejectToolRequest(requestId);
      alert('Eszközigénylés elutasítva!');
    } catch (error) {
      alert('Hiba: ' + error.message);
    }
  };

  const handleCreateOrder = (e) => {
    e.preventDefault();
    if (!orderEquipmentName.trim() || orderQuantity < 1) {
      alert('Kérjük, töltsd ki az összes mezőt!');
      return;
    }
    createEquipmentOrder(orderEquipmentName, orderQuantity, orderReason);
    setOrderEquipmentName('');
    setOrderQuantity(1);
    setOrderReason('');
    setShowOrderForm(false);
    alert('A megrendelés sikeresen továbbítva az Adminnak!');
  };


  return (
    <div className="role-dashboard">
      <div className="dashboard-grid-wide">
        <section className="section">
          <h2>Eszközigénylések Kezelése</h2>
          <div className="filter-controls">
            <button
              className={`filter-btn ${filterStatus === 'pending' ? 'active' : ''}`}
              onClick={() => setFilterStatus('pending')}
            >
              Függőben
            </button>
            <button
              className={`filter-btn ${filterStatus === 'approved' ? 'active' : ''}`}
              onClick={() => setFilterStatus('approved')}
            >
              Jóváhagyva
            </button>
            <button
              className={`filter-btn ${filterStatus === 'rejected' ? 'active' : ''}`}
              onClick={() => setFilterStatus('rejected')}
            >
              Elutasítva
            </button>
          </div>

          <div className="requests-list" style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '10px' }}>
            {pendingRequests.length === 0 ? (
              <p className="empty-state">Nincsenek igénylések ebben a státuszban</p>
            ) : (
              pendingRequests.map(req => {
                const requester = users.find(u => u.id === req.requestedBy);
                return (
                  <div key={req.id} className="request-card-manager">
                    <div className="request-header">
                      <div>
                        <h4>{req.toolName}</h4>
                        <p className="requester">Kérte: <strong>{requester?.name}</strong></p>
                      </div>
                      <span className={`status-badge status-${req.status}`}>{req.status}</span>
                    </div>

                    <div className="request-details">
                      <p><strong>Mennyiség:</strong> {req.quantity}</p>
                      {req.taskId && (
                        <p><strong>Feladat:</strong> {tasks.find(t => String(t.id) === String(req.taskId))?.title || 'Ismeretlen feladat'}</p>
                      )}
                      <small>{new Date(req.createdAt).toLocaleDateString()}</small>
                    </div>

                    {req.status === 'pending' && (
                      <div className="action-buttons">
                        <button
                          className="btn-approve"
                          onClick={() => handleApprove(req.id)}
                        >
                          Jóváhagyás
                        </button>
                        <button
                          className="btn-reject"
                          onClick={() => handleReject(req.id)}
                        >
                          Elutasítás
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
              unassignedTasks.map(task => (
                <div key={task.id} className="task-card">
                  <h4>{task.title}</h4>
                  <p>{task.description}</p>
                  {task.location && <p><strong>Helyszín:</strong> {task.location}</p>}
                  {task.specialization && <p><strong>Szükséges szakember:</strong> {task.specialization}</p>}
                  <div className="form-group">
                    <label>Karbantartó Kijelölése</label>
                    <select
                      value={task.assignedTo || ''}
                      onChange={(e) => assignTask(task.id, e.target.value)}
                    >
                      <option value="">-- válassz --</option>
                      {(!task.specialization || task.specialization === 'Egyéb') ? (
                        workers.map(w => (
                          <option key={w.id} value={w.id}>
                            {w.name} {w.specialization ? `(${w.specialization})` : ''}
                          </option>
                        ))
                      ) : (
                        <>
                          <optgroup label="Ajánlott (Megfelelő szakképesítés)">
                            {workers.filter(w => w.specialization?.includes(task.specialization)).map(w => (
                              <option key={w.id} value={w.id}>
                                {w.name} {w.specialization ? `(${w.specialization})` : ''}
                              </option>
                            ))}
                          </optgroup>
                          <optgroup label="Egyéb karbantartók">
                            {workers.filter(w => !w.specialization?.includes(task.specialization)).map(w => (
                              <option key={w.id} value={w.id}>
                                {w.name} {w.specialization ? `(${w.specialization})` : ''}
                              </option>
                            ))}
                          </optgroup>
                        </>
                      )}
                    </select>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="section">
          <h2>Hibajavítások Állapotának Követése</h2>
          <div className="filter-controls">
            <button
              className={`filter-btn ${taskFilter === 'all' ? 'active' : ''}`}
              onClick={() => setTaskFilter('all')}
            >
              Összes
            </button>
            <button
              className={`filter-btn ${taskFilter === 'in_progress' ? 'active' : ''}`}
              onClick={() => setTaskFilter('in_progress')}
            >
              Folyamatban
            </button>
            <button
              className={`filter-btn ${taskFilter === 'completed' ? 'active' : ''}`}
              onClick={() => setTaskFilter('completed')}
            >
              Kész
            </button>
          </div>

          <div className="tasks-list" style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '10px' }}>
            {filteredTasks.length === 0 ? (
              <p className="empty-state">Nincsenek feladatok ebben a kategóriában</p>
            ) : (
              filteredTasks.map(task => {
                const assignee = users.find(u => u.id === task.assignedTo);
                return (
                  <div key={task.id} className={`task-card ${task.completed ? 'task-completed' : ''}`}>
                    <div className="task-header">
                      <h4>{task.title}</h4>
                      <span className={`status-badge status-${task.completed ? 'completed' : task.status}`}>
                        {task.completed ? 'Kész' : 'Folyamatban'}
                      </span>
                    </div>
                    <p>{task.description}</p>
                    {task.location && <p><strong>Helyszín:</strong> {task.location}</p>}
                    {assignee && <p><strong>Kiosztva:</strong> {assignee.name}</p>}
                    
                    {task.feedback && (
                      <div style={{ marginTop: '10px', padding: '8px', backgroundColor: '#f0f4f8', borderRadius: '4px', borderLeft: '4px solid #667eea' }}>
                        <strong>Hallgató megjegyzése:</strong>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.9em', fontStyle: 'italic' }}>"{task.feedback}"</p>
                      </div>
                    )}

                    <div className="completion-toggle">
                      <label className="toggle-label">
                        <span>Készre jelentés:</span>
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
                return (
                  <div key={worker.id} className="worker-card">
                    <h4>{worker.name}</h4>
                    <p className="worker-email">{worker.email}</p>
                    <div className="worker-stats">
                      <span>Összes Igénylés: {workerRequests.length}</span>
                      <span className="pending">Függőben: {pendingReqs.length}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        <section className="section">
          <h2>Új Eszközök Beszerzése</h2>
          <button className="btn-add" onClick={() => setShowOrderForm(!showOrderForm)} style={{marginTop: '15px'}}>
            {showOrderForm ? 'Mégse' : '+ Eszközök rendelése'}
          </button>
          
          {showOrderForm && (
            <form onSubmit={handleCreateOrder} className="form" style={{marginTop: '15px'}}>
              <div className="form-group">
                <label>Eszköz Neve</label>
                <input type="text" value={orderEquipmentName} onChange={(e) => setOrderEquipmentName(e.target.value)} placeholder="pl. Fúrógép, Létra" required />
              </div>
              <div className="form-group">
                <label>Szükséges Mennyiség</label>
                <input type="number" value={orderQuantity} onChange={(e) => setOrderQuantity(e.target.value)} min="1" required />
              </div>
              <div className="form-group">
                <label>Indok</label>
                <input type="text" value={orderReason} onChange={(e) => setOrderReason(e.target.value)} placeholder="Miért szükséges a beszerzés?" required />
              </div>
              <button type="submit" className="btn-primary">Rendelés Elküldése</button>
            </form>
          )}
        </section>

        <section className="section info-section">
          <h3>Jogosultságaid</h3>
          <ul className="permissions-list">
            <li>Összes karbantartási feladat megtekintése</li>
            <li>Eszközigénylések kezelése (jóváhagyás/elutasítás)</li>
            <li>Hibák kiosztása a karbantartóknak</li>
            <li>Új eszközök rendelése az Adminisztrátortól</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default KarbantartasVezetoDashboard;
