import React, { useState, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import "../../styles/RoleDashboards.css";

const getStatusDisplay = (task) => {
  const rawStatus = task._backendData?.status;
  if (rawStatus === 0 || rawStatus === "Pending")
    return { text: "Függőben", bg: "#feebc8", color: "#dd6b20" };
  if (rawStatus === 1 || rawStatus === "InProgress")
    return { text: "Folyamatban", bg: "#bee3f8", color: "#3182ce" };
  if (rawStatus === 2 || rawStatus === "AwaitingParts")
    return { text: "Alkatrészre vár", bg: "#e9d8fd", color: "#805ad5" };
  if (rawStatus === 3 || rawStatus === "Repaired")
    return { text: "Javítva", bg: "#c6f6d5", color: "#38a169" };
  if (rawStatus === 4 || rawStatus === "Unrepairable")
    return { text: "Javíthatatlan", bg: "#fed7d7", color: "#e53e3e" };

  // Biztonsági tartalék, ha mégis az AuthContext-es egyszerűsített verzió jönne
  if (task.status === "pending")
    return { text: "Függőben", bg: "#feebc8", color: "#dd6b20" };
  if (task.status === "in_progress")
    return { text: "Folyamatban", bg: "#bee3f8", color: "#3182ce" };
  if (task.status === "completed")
    return { text: "Kész", bg: "#c6f6d5", color: "#38a169" };

  return { text: "Ismeretlen", bg: "#edf2f7", color: "#718096" };
};

const MaintenanceManagerDashboard = ({ currentPage = 1 }) => {
  const {
    user,
    users,
    tasks,
    toolRequests,
    approveToolRequest,
    assignTask,
    updateTaskStatus,
    createToolRequest,
    setTaskAwaitingParts,
    setTaskUnrepairable,
    premises,
    appliances,
    updateTaskDetails,
    specializations,
    updateTaskSpecialization,
    deleteTask,
  } = useAuth();
  const [filterStatus, setFilterStatus] = useState("all");
  const [taskFilter, setTaskFilter] = useState("all");
  const [orderEquipmentName, setOrderEquipmentName] = useState("");
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [orderSelectedTaskId, setOrderSelectedTaskId] = useState("");
  const [selectedWorkerId, setSelectedWorkerId] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editAttachment, setEditAttachment] = useState("");
  const [newAttachmentFile, setNewAttachmentFile] = useState(null);
  const [isTaskFilterOpen, setIsTaskFilterOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    message: "",
    onConfirm: null,
    confirmText: "Igen",
  });

  const toastTimeoutRef = useRef(null);

  const showToast = (msg, type = "success") => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage({ text: msg, type });
    toastTimeoutRef.current = setTimeout(() => setToastMessage(null), 5000);
  };

  const showConfirm = (message, onConfirm, confirmText = "Törlés") => {
    setConfirmModal({ isOpen: true, message, onConfirm, confirmText });
  };

  const workers = users.filter((u) => u.role === "Karbantartó");
  const filteredOrders = toolRequests
    .filter((tr) =>
      filterStatus === "all"
        ? true
        : filterStatus === "pending"
          ? !tr.isDelivered
          : tr.isDelivered,
    )
    .sort((a, b) => {
      if (a.isDelivered === b.isDelivered) {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      return a.isDelivered ? 1 : -1;
    });
  const unassignedTasks = tasks
    .filter((t) => !t.assignedTo)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const allTasks = tasks.filter((t) => t.assignedTo);

  // Státuszok sorrendje a "Hibajavítások Állapotának Követése" listában
  const statusSortOrder = {
    1: 1, // InProgress
    InProgress: 1,
    2: 2, // AwaitingParts
    AwaitingParts: 2,
    3: 3, // Repaired
    Repaired: 3,
    4: 4, // Unrepairable
    Unrepairable: 4,
    0: 5, // Pending (tartalék)
    Pending: 5,
  };

  const taskFilterLabels = {
    all: "Összes",
    InProgress: "Folyamatban",
    AwaitingParts: "Alkatrészre vár",
    Repaired: "Javítva",
    Unrepairable: "Javíthatatlan",
  };

  const filteredTasks = allTasks
    .filter((t) => {
      if (taskFilter === "all") return true;
      const rawStatus = t._backendData?.status;
      if (taskFilter === "InProgress")
        return (
          rawStatus === 1 ||
          rawStatus === "InProgress" ||
          (!rawStatus && t.status === "in_progress")
        );
      if (taskFilter === "AwaitingParts")
        return rawStatus === 2 || rawStatus === "AwaitingParts";
      if (taskFilter === "Repaired")
        return (
          rawStatus === 3 ||
          rawStatus === "Repaired" ||
          (!rawStatus && t.status === "completed")
        );
      if (taskFilter === "Unrepairable")
        return rawStatus === 4 || rawStatus === "Unrepairable";
      return false;
    })
    .sort((a, b) => {
      const statusA = a._backendData?.status;
      const statusB = b._backendData?.status;
      const orderA = statusSortOrder[statusA] ?? 99;
      const orderB = statusSortOrder[statusB] ?? 99;

      if (orderA !== orderB) {
        return orderA - orderB;
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  const handleApprove = async (requestId) => {
    try {
      const result = await approveToolRequest(requestId);
      if (result && result.allPartsArrived) {
        showToast(
          "Utolsó alkatrész is megérkezett! A hiba újra 'Folyamatban' lett.",
          "success",
        );
      } else if (result && result.taskId) {
        showToast(
          "Alkatrész megérkezett! (A hibához még várunk további rendelésekre.)",
          "success",
        );
      } else {
        showToast("Eszköz/Alkatrész megérkezettként megjelölve!", "success");
      }
    } catch (error) {
      showToast(error.message, "error");
    }
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (
      !orderEquipmentName.trim() ||
      orderQuantity < 1 ||
      !orderSelectedTaskId
    ) {
      showToast("Kérjük, töltsd ki az összes mezőt!", "error");
      return;
    }
    try {
      await createToolRequest(
        orderEquipmentName,
        orderQuantity,
        user.id,
        orderSelectedTaskId,
      );
      await setTaskAwaitingParts(orderSelectedTaskId);
      setOrderEquipmentName("");
      setOrderQuantity(1);
      setOrderSelectedTaskId("");
      showToast(
        'Alkatrész megrendelve, a hiba állapota "Alkatrészre vár" lett!',
        "success",
      );
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const selectedWorker = users.find((u) => u.id === selectedWorkerId);
  const selectedWorkerTasks = selectedWorkerId
    ? tasks.filter((t) => t.assignedTo === selectedWorkerId)
    : [];

  const openEditModal = (task) => {
    setEditingTask(task);
    setEditTitle(task.name || task.title || "");
    setEditDescription(task.description || "");
    setEditAttachment(task._backendData?.attachment || "nincs_kep.jpg");
    setNewAttachmentFile(null);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      // If a new file is selected, its name is used. Otherwise, the original filename is kept.
      const finalAttachmentName = newAttachmentFile
        ? newAttachmentFile.name
        : editingTask._backendData?.attachment;
      const safeTitle = editTitle.replace(
        /[^a-zA-Z0-9\s\-áéíóöőúüűÁÉÍÓÖŐÚÜŰ.,!?]/g,
        "",
      );
      const safeDesc = editDescription.replace(
        /[^a-zA-Z0-9\s\-áéíóöőúüűÁÉÍÓÖŐÚÜŰ.,!?]/g,
        "",
      );
      await updateTaskDetails(
        editingTask.id,
        safeTitle,
        safeDesc,
        finalAttachmentName,
      );
      setEditingTask(null);
      showToast("Hiba sikeresen frissítve!", "success");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleDeleteTask = (taskId) => {
    showConfirm(
      "Biztosan törölni szeretnéd ezt a hibajelentést? (Végleges törlés az adatbázisból)",
      async () => {
        try {
          await deleteTask(taskId);
          showToast("Hiba sikeresen törölve!", "success");
        } catch (err) {
          showToast(err.message, "error");
        }
      },
      "Törlés",
    );
  };

  const isEditChanged =
    editingTask &&
    (editTitle !== (editingTask.name || editingTask.title || "") ||
      editDescription !== (editingTask.description || "") ||
      newAttachmentFile !== null);

  return (
    <div className="role-dashboard">
      <div className="dashboard-grid-wide">
        {currentPage === 1 && (
          <>
            <section
              className="modern-card"
              style={{
                display: "flex",
                flexDirection: "column",
                height: "fit-content",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "15px",
                  minHeight: "70px",
                }}
              >
                <span style={{ fontSize: "1.8rem", marginRight: "10px" }}>
                  📋
                </span>
                <h2 className="modern-gradient-text" style={{ margin: 0 }}>
                  Karbantartási Feladatok Kiosztása
                </h2>
              </div>
              {/* Láthatatlan távtartó, hogy egyforma magas legyen a középső (szűrős) kártyával */}
              <div style={{ height: "44px", marginBottom: "25px" }}></div>
              <div
                className="tasks-list"
                style={{
                  height: "calc(100vh - 320px)",
                  minHeight: "400px",
                  overflowY: "auto",
                  paddingRight: "10px",
                }}
              >
                {unassignedTasks.length === 0 ? (
                  <p className="empty-state">Nincs kiosztásra váró feladat</p>
                ) : (
                  unassignedTasks.map((task) => {
                    const statusDisplay = getStatusDisplay(task);
                    const reporter = users.find(
                      (u) => String(u.id) === String(task.createdBy),
                    );
                    return (
                      <div key={task.id} className="task-card modern-task-card">
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                          }}
                        >
                          <h4
                            style={{
                              marginBottom: "10px",
                              color: "#2d3748",
                              fontSize: "1.25rem",
                              fontWeight: "700",
                              marginTop: 0,
                            }}
                          >
                            {task.title}
                          </h4>
                          <div>
                            <span
                              className="status-badge"
                              style={{
                                backgroundColor: statusDisplay.bg,
                                color: statusDisplay.color,
                              }}
                            >
                              {statusDisplay.text}
                            </span>
                          </div>
                        </div>

                        <div
                          style={{
                            backgroundColor: "#f7fafc",
                            padding: "12px",
                            borderRadius: "8px",
                            marginBottom: "15px",
                            border: "1px solid #e2e8f0",
                          }}
                        >
                          <p
                            style={{
                              margin: 0,
                              color: "#4a5568",
                              lineHeight: "1.5",
                            }}
                          >
                            {task.description}
                          </p>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "10px",
                            margin: "15px 0",
                          }}
                        >
                          {task._backendData?.premiseId ? (
                            <div
                              style={{ display: "flex", alignItems: "center" }}
                            >
                              <span
                                style={{
                                  color: "#a0aec0",
                                  marginRight: "8px",
                                  fontSize: "1.1rem",
                                }}
                              >
                                📍
                              </span>
                              <span style={{ color: "#4a5568" }}>
                                <strong>Helyiség:</strong>{" "}
                                {premises.find(
                                  (p) =>
                                    String(p.id) ===
                                    String(task._backendData.premiseId),
                                )?.nameOrNumber ||
                                  `#${task._backendData.premiseId}`}
                              </span>
                            </div>
                          ) : task.location ? (
                            <div
                              style={{ display: "flex", alignItems: "center" }}
                            >
                              <span
                                style={{
                                  color: "#a0aec0",
                                  marginRight: "8px",
                                  fontSize: "1.1rem",
                                }}
                              >
                                📍
                              </span>
                              <span style={{ color: "#4a5568" }}>
                                <strong>Helyiség:</strong> {task.location}
                              </span>
                            </div>
                          ) : null}

                          {task._backendData?.applianceId && (
                            <div
                              style={{ display: "flex", alignItems: "center" }}
                            >
                              <span
                                style={{
                                  color: "#a0aec0",
                                  marginRight: "8px",
                                  fontSize: "1.1rem",
                                }}
                              >
                                🔌
                              </span>
                              <span style={{ color: "#4a5568" }}>
                                <strong>Érintett berendezés:</strong>{" "}
                                {appliances.find(
                                  (a) =>
                                    String(a.id) ===
                                    String(task._backendData.applianceId),
                                )?.name ||
                                  `#${task._backendData.applianceId} (Törölt/Ismeretlen)`}
                              </span>
                            </div>
                          )}

                          {reporter && (
                            <div
                              style={{ display: "flex", alignItems: "center" }}
                            >
                              <span
                                style={{
                                  color: "#a0aec0",
                                  marginRight: "8px",
                                  fontSize: "1.1rem",
                                }}
                              >
                                👤
                              </span>
                              <span style={{ color: "#4a5568" }}>
                                <strong>Bejelentő:</strong> {reporter.name}
                              </span>
                            </div>
                          )}
                        </div>

                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            borderTop: "1px solid #edf2f7",
                            paddingTop: "15px",
                            marginTop: "15px",
                            marginBottom: "15px",
                          }}
                        >
                          <small
                            style={{ color: "#a0aec0", fontWeight: "500" }}
                          >
                            Bejelentve:{" "}
                            {new Date(task.createdAt).toLocaleDateString()}
                          </small>
                        </div>

                        <div className="modern-form">
                          <div
                            className="form-group"
                            style={{ marginTop: "10px" }}
                          >
                            <label>Szükséges Szakterület</label>
                            <select
                              value={
                                task._backendData?.specializationId ||
                                task._backendData?.specialisationId ||
                                ""
                              }
                              onChange={async (e) => {
                                try {
                                  await updateTaskSpecialization(
                                    task.id,
                                    e.target.value,
                                  );
                                } catch (err) {
                                  showToast(err.message, "error");
                                }
                              }}
                            >
                              <option value="">
                                -- Válassz szakterületet --
                              </option>
                              {specializations.map((s) => (
                                <option key={s.id} value={s.id}>
                                  {s.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div
                            className="form-group"
                            style={{ marginTop: "10px" }}
                          >
                            <label>Karbantartó Kijelölése</label>
                            {task._backendData?.specializationId ||
                            task._backendData?.specialisationId ? (
                              <select
                                value={task.assignedTo || ""}
                                onChange={async (e) => {
                                  try {
                                    await assignTask(task.id, e.target.value);
                                    showToast(
                                      "Karbantartó sikeresen hozzárendelve!",
                                      "success",
                                    );
                                  } catch (err) {
                                    showToast(err.message, "error");
                                  }
                                }}
                              >
                                <option value="">
                                  -- Válassz szakembert --
                                </option>
                                {workers.filter((w) => {
                                  const specId =
                                    task._backendData?.specializationId ||
                                    task._backendData?.specialisationId;
                                  const taskSpec = specializations.find(
                                    (s) => String(s.id) === String(specId),
                                  );
                                  return (
                                    taskSpec &&
                                    w.specialization &&
                                    w.specialization.includes(taskSpec.name)
                                  );
                                }).length === 0 && (
                                  <option value="" disabled>
                                    Nincs megfelelő szakember!
                                  </option>
                                )}

                                {workers
                                  .filter((w) => {
                                    const specId =
                                      task._backendData?.specializationId ||
                                      task._backendData?.specialisationId;
                                    const taskSpec = specializations.find(
                                      (s) => String(s.id) === String(specId),
                                    );
                                    return (
                                      taskSpec &&
                                      w.specialization &&
                                      w.specialization.includes(taskSpec.name)
                                    );
                                  })
                                  .map((w) => (
                                    <option key={w.id} value={w.id}>
                                      {w.name}{" "}
                                      {w.specialization
                                        ? `(${w.specialization})`
                                        : ""}
                                    </option>
                                  ))}
                              </select>
                            ) : (
                              <p
                                style={{
                                  margin: 0,
                                  fontSize: "0.85em",
                                  color: "#e53e3e",
                                  fontStyle: "italic",
                                  padding: "8px",
                                  backgroundColor: "#fed7d7",
                                  borderRadius: "4px",
                                }}
                              >
                                Szakember kijelöléséhez előbb válaszd ki a hiba
                                szakterületét!
                              </p>
                            )}
                          </div>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            marginTop: "15px",
                          }}
                        >
                          <button
                            className="btn-secondary"
                            style={{
                              padding: "6px 20px",
                              fontSize: "0.85rem",
                              borderRadius: "6px",
                              background: "#fff5f5",
                              color: "#e53e3e",
                              border: "1px solid #feb2b2",
                              fontWeight: "600",
                              cursor: "pointer",
                              transition: "all 0.2s",
                            }}
                            onMouseOver={(e) =>
                              (e.target.style.background = "#fed7d7")
                            }
                            onMouseOut={(e) =>
                              (e.target.style.background = "#fff5f5")
                            }
                            onClick={() => handleDeleteTask(task.id)}
                          >
                            Törlés
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>

            <section
              className="modern-card"
              style={{
                display: "flex",
                flexDirection: "column",
                height: "fit-content",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "15px",
                  minHeight: "70px",
                }}
              >
                <span style={{ fontSize: "1.8rem", marginRight: "10px" }}>
                  📊
                </span>
                <h2 className="modern-gradient-text" style={{ margin: 0 }}>
                  Hibajavítások Állapotának Követése
                </h2>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  position: "relative",
                  marginBottom: "25px",
                }}
              >
                <button
                  className="btn-secondary"
                  onClick={() => setIsTaskFilterOpen(!isTaskFilterOpen)}
                  style={{
                    borderRadius: "30px",
                    padding: "10px 30px",
                    height: "44px",
                    background: "#edf2f7",
                    color: "#4a5568",
                    border: "none",
                    fontWeight: "700",
                    fontSize: "1rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    transition: "all 0.2s ease",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                  }}
                  onMouseOver={(e) => (e.target.style.background = "#e2e8f0")}
                  onMouseOut={(e) => (e.target.style.background = "#edf2f7")}
                >
                  {taskFilterLabels[taskFilter]}{" "}
                  <span>{isTaskFilterOpen ? "▲" : "▼"}</span>
                </button>

                {isTaskFilterOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      marginTop: "10px",
                      backgroundColor: "white",
                      borderRadius: "24px",
                      boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                      display: "flex",
                      flexDirection: "column",
                      overflow: "hidden",
                      zIndex: 100,
                      minWidth: "200px",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    {Object.entries(taskFilterLabels).map(([key, label]) => (
                      <button
                        key={key}
                        onClick={() => {
                          setTaskFilter(key);
                          setIsTaskFilterOpen(false);
                        }}
                        style={{
                          padding: "12px 20px",
                          background:
                            taskFilter === key ? "#ebf8ff" : "transparent",
                          color: taskFilter === key ? "#3182ce" : "#4a5568",
                          border: "none",
                          textAlign: "center",
                          fontWeight: taskFilter === key ? "700" : "500",
                          cursor: "pointer",
                          transition: "background 0.2s",
                          fontSize: "0.95rem",
                        }}
                        onMouseOver={(e) => {
                          if (taskFilter !== key)
                            e.target.style.background = "#f7fafc";
                        }}
                        onMouseOut={(e) => {
                          if (taskFilter !== key)
                            e.target.style.background = "transparent";
                        }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div
                className="tasks-list"
                style={{
                  height: "calc(100vh - 320px)",
                  minHeight: "400px",
                  overflowY: "auto",
                  paddingRight: "10px",
                }}
              >
                {filteredTasks.length === 0 ? (
                  <p className="empty-state">
                    Nincsenek feladatok ebben a kategóriában
                  </p>
                ) : (
                  filteredTasks.map((task) => {
                    const assignee = users.find(
                      (u) => String(u.id) === String(task.assignedTo),
                    );
                    const reporter = users.find(
                      (u) => String(u.id) === String(task.createdBy),
                    );
                    const statusDisplay = getStatusDisplay(task);
                    const isUnrepairable =
                      task._backendData?.status === 4 ||
                      task._backendData?.status === "Unrepairable";
                    const isAwaitingParts =
                      task._backendData?.status === 2 ||
                      task._backendData?.status === "AwaitingParts";
                    return (
                      <div
                        key={task.id}
                        className={`task-card modern-task-card ${task.completed ? "task-completed" : ""}`}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                          }}
                        >
                          <h4
                            style={{
                              marginBottom: "10px",
                              color: "#2d3748",
                              fontSize: "1.25rem",
                              fontWeight: "700",
                              marginTop: 0,
                            }}
                          >
                            {task.title}
                          </h4>
                          <div>
                            <span
                              className="status-badge"
                              style={{
                                backgroundColor: statusDisplay.bg,
                                color: statusDisplay.color,
                              }}
                            >
                              {statusDisplay.text}
                            </span>
                          </div>
                        </div>

                        <div
                          style={{
                            backgroundColor: "#f7fafc",
                            padding: "12px",
                            borderRadius: "8px",
                            marginBottom: "15px",
                            border: "1px solid #e2e8f0",
                          }}
                        >
                          <p
                            style={{
                              margin: 0,
                              color: "#4a5568",
                              lineHeight: "1.5",
                            }}
                          >
                            {task.description}
                          </p>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "10px",
                            margin: "15px 0",
                          }}
                        >
                          {task._backendData?.premiseId ? (
                            <div
                              style={{ display: "flex", alignItems: "center" }}
                            >
                              <span
                                style={{
                                  color: "#a0aec0",
                                  marginRight: "8px",
                                  fontSize: "1.1rem",
                                }}
                              >
                                📍
                              </span>
                              <span style={{ color: "#4a5568" }}>
                                <strong>Helyiség:</strong>{" "}
                                {premises.find(
                                  (p) =>
                                    String(p.id) ===
                                    String(task._backendData.premiseId),
                                )?.nameOrNumber ||
                                  `#${task._backendData.premiseId}`}
                              </span>
                            </div>
                          ) : task.location ? (
                            <div
                              style={{ display: "flex", alignItems: "center" }}
                            >
                              <span
                                style={{
                                  color: "#a0aec0",
                                  marginRight: "8px",
                                  fontSize: "1.1rem",
                                }}
                              >
                                📍
                              </span>
                              <span style={{ color: "#4a5568" }}>
                                <strong>Helyiség:</strong> {task.location}
                              </span>
                            </div>
                          ) : null}

                          {task._backendData?.applianceId && (
                            <div
                              style={{ display: "flex", alignItems: "center" }}
                            >
                              <span
                                style={{
                                  color: "#a0aec0",
                                  marginRight: "8px",
                                  fontSize: "1.1rem",
                                }}
                              >
                                🔌
                              </span>
                              <span style={{ color: "#4a5568" }}>
                                <strong>Érintett berendezés:</strong>{" "}
                                {appliances.find(
                                  (a) =>
                                    String(a.id) ===
                                    String(task._backendData.applianceId),
                                )?.name ||
                                  `#${task._backendData.applianceId} (Törölt/Ismeretlen)`}
                              </span>
                            </div>
                          )}

                          {reporter && (
                            <div
                              style={{ display: "flex", alignItems: "center" }}
                            >
                              <span
                                style={{
                                  color: "#a0aec0",
                                  marginRight: "8px",
                                  fontSize: "1.1rem",
                                }}
                              >
                                👤
                              </span>
                              <span style={{ color: "#4a5568" }}>
                                <strong>Bejelentő:</strong> {reporter.name}
                              </span>
                            </div>
                          )}

                          {assignee && (
                            <div
                              style={{ display: "flex", alignItems: "center" }}
                            >
                              <span
                                style={{
                                  color: "#a0aec0",
                                  marginRight: "8px",
                                  fontSize: "1.1rem",
                                }}
                              >
                                👷
                              </span>
                              <span style={{ color: "#4a5568" }}>
                                <strong>Kiosztva:</strong> {assignee.name}
                              </span>
                            </div>
                          )}
                        </div>

                        {task.feedback && (
                          <div
                            style={{
                              marginTop: "10px",
                              padding: "12px",
                              backgroundColor: "#f0fff4",
                              borderRadius: "8px",
                              border: "1px solid #c6f6d5",
                              borderLeft: "4px solid #38a169",
                            }}
                          >
                            <strong style={{ color: "#276749" }}>
                              Hallgató megjegyzése:
                            </strong>
                            <p
                              style={{
                                margin: "4px 0 0 0",
                                fontSize: "0.9em",
                                fontStyle: "italic",
                                color: "#2d3748",
                              }}
                            >
                              "{task.feedback}"
                            </p>
                          </div>
                        )}

                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            borderTop: "1px solid #edf2f7",
                            paddingTop: "15px",
                            marginTop: "15px",
                            marginBottom: "15px",
                          }}
                        >
                          <small
                            style={{ color: "#a0aec0", fontWeight: "500" }}
                          >
                            Bejelentve:{" "}
                            {new Date(task.createdAt).toLocaleDateString()}
                          </small>
                        </div>

                        <div
                          className="completion-toggle"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            flexWrap: "wrap",
                            gap: "10px",
                          }}
                        >
                          {!isUnrepairable && (
                            <label
                              className="toggle-label"
                              style={
                                task.completed || isAwaitingParts
                                  ? { cursor: "not-allowed" }
                                  : {}
                              }
                              title={
                                isAwaitingParts
                                  ? "Alkatrészre váró hiba nem jelölhető készre!"
                                  : ""
                              }
                            >
                              <span>Készre jelentés:</span>
                              <div className="toggle-switch">
                                <input
                                  type="checkbox"
                                  checked={task.completed || false}
                                  disabled={task.completed || isAwaitingParts}
                                  onChange={async (e) => {
                                    const isChecked = e.target.checked;
                                    try {
                                      await updateTaskStatus(
                                        task.id,
                                        isChecked,
                                      );
                                      if (isChecked) {
                                        showToast(
                                          "Hiba készre jelentve!",
                                          "success",
                                        );
                                      }
                                    } catch (err) {
                                      showToast(err.message, "error");
                                    }
                                  }}
                                />
                                <span
                                  className="toggle-slider"
                                  style={
                                    task.completed || isAwaitingParts
                                      ? { cursor: "not-allowed", opacity: 0.7 }
                                      : {}
                                  }
                                ></span>
                              </div>
                            </label>
                          )}

                          {!task.completed && (
                            <button
                              className="btn-reject"
                              disabled={isAwaitingParts}
                              title={
                                isAwaitingParts
                                  ? "Alkatrészre váró hiba nem minősíthető javíthatatlannak!"
                                  : ""
                              }
                              style={{
                                padding: "5px 10px",
                                fontSize: "0.85em",
                                ...(isAwaitingParts
                                  ? { opacity: 0.5, cursor: "not-allowed" }
                                  : {}),
                              }}
                              onClick={() => {
                                if (isAwaitingParts) return;
                                showConfirm(
                                  "Biztosan javíthatatlannak jelölöd ezt a hibát?",
                                  async () => {
                                    try {
                                      await setTaskUnrepairable(task.id);
                                      showToast(
                                        "Hiba javíthatatlanként megjelölve!",
                                        "success",
                                      );
                                    } catch (err) {
                                      showToast(err.message, "error");
                                    }
                                  },
                                  "Igen, javíthatatlan",
                                );
                              }}
                            >
                              Javíthatatlan
                            </button>
                          )}

                          {task.completed && task.completedAt && (
                            <small className="completion-date">
                              Befejezve:{" "}
                              {new Date(task.completedAt).toLocaleDateString()}
                            </small>
                          )}
                        </div>

                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            marginTop: "15px",
                          }}
                        >
                          <button
                            className="btn-secondary"
                            style={{
                              padding: "6px 20px",
                              fontSize: "0.85rem",
                              borderRadius: "6px",
                              background: "#fff5f5",
                              color: "#e53e3e",
                              border: "1px solid #feb2b2",
                              fontWeight: "600",
                              cursor: "pointer",
                              transition: "all 0.2s",
                            }}
                            onMouseOver={(e) =>
                              (e.target.style.background = "#fed7d7")
                            }
                            onMouseOut={(e) =>
                              (e.target.style.background = "#fff5f5")
                            }
                            onClick={() => handleDeleteTask(task.id)}
                          >
                            Törlés
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>

            <section
              className="modern-card"
              style={{
                display: "flex",
                flexDirection: "column",
                height: "fit-content",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "15px",
                  minHeight: "70px",
                }}
              >
                <span style={{ fontSize: "1.8rem", marginRight: "10px" }}>
                  👥
                </span>
                <h2 className="modern-gradient-text" style={{ margin: 0 }}>
                  Csapatom: Karbantartók
                </h2>
              </div>
              {/* Láthatatlan távtartó, hogy egyforma magas legyen a középső (szűrős) kártyával */}
              <div style={{ height: "44px", marginBottom: "25px" }}></div>
              <div
                className="workers-list tasks-list"
                style={{
                  height: "calc(100vh - 320px)",
                  minHeight: "400px",
                  overflowY: "auto",
                  paddingRight: "10px",
                }}
              >
                {workers.length === 0 ? (
                  <p className="empty-state">
                    Nincsenek karbantartók regisztrálva a rendszerben
                  </p>
                ) : (
                  workers.map((worker) => {
                    const workerRequests = toolRequests.filter((tr) => {
                      if (
                        tr.requestedBy &&
                        String(tr.requestedBy) === String(worker.id)
                      ) {
                        return true;
                      }
                      const associatedTask = tasks.find(
                        (t) => String(t.id) === String(tr.taskId),
                      );
                      return (
                        associatedTask &&
                        String(associatedTask.assignedTo) === String(worker.id)
                      );
                    });
                    const workerTasks = tasks.filter(
                      (t) => String(t.assignedTo) === String(worker.id),
                    );
                    const assignedTasksCount = workerTasks.length;
                    const completedTasksCount = workerTasks.filter((t) => {
                      const rawStatus = t._backendData?.status;
                      return (
                        rawStatus === 3 ||
                        rawStatus === "Repaired" ||
                        (!rawStatus && t.status === "completed")
                      );
                    }).length;
                    return (
                      <div
                        key={worker.id}
                        className="worker-card modern-task-card"
                        onClick={() => setSelectedWorkerId(worker.id)}
                        style={{ cursor: "pointer" }}
                        title="Kattints a feladatok megtekintéséhez"
                      >
                        <h4>{worker.name}</h4>
                        <p className="worker-email">{worker.email}</p>
                        <div className="worker-stats">
                          <span>Igénylések száma: {workerRequests.length}</span>
                          <span
                            style={{ color: "#3182ce", fontWeight: "bold" }}
                          >
                            Kiosztott feladatok: {assignedTasksCount}
                          </span>
                          <span
                            style={{ color: "#38a169", fontWeight: "bold" }}
                          >
                            Elvégzett feladatok: {completedTasksCount}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          </>
        )}

        {currentPage === 2 && (
          <>
            <section
              className="modern-card"
              style={{
                display: "flex",
                flexDirection: "column",
                height: "fit-content",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "15px",
                  minHeight: "70px",
                }}
              >
                <span style={{ fontSize: "1.8rem", marginRight: "10px" }}>
                  🛠️
                </span>
                <h2 className="modern-gradient-text" style={{ margin: 0 }}>
                  Eszközök és Szerszámok Igénylése
                </h2>
              </div>

              {/* Láthatatlan távtartó, hogy egyforma magas legyen a jobb oldali kártyával */}
              <div style={{ height: "44px", marginBottom: "25px" }}></div>
              <div
                className="tasks-list"
                style={{
                  height: "calc(100vh - 320px)",
                  minHeight: "400px",
                  overflowY: "auto",
                  paddingRight: "10px",
                }}
              >
                <form onSubmit={handleCreateOrder} className="form modern-form">
                  <div className="form-group">
                    <label>Kapcsolódó Hiba</label>
                    <select
                      value={orderSelectedTaskId}
                      onChange={(e) => setOrderSelectedTaskId(e.target.value)}
                      required
                    >
                      <option value="">-- Válassz egy hibát --</option>
                      {tasks
                        .filter((t) => !t.completed && t.assignedTo)
                        .map((task) => (
                          <option key={task.id} value={task.id}>
                            {task.title}
                          </option>
                        ))}
                    </select>
                    {tasks.filter((t) => !t.completed && t.assignedTo)
                      .length === 0 && (
                      <small
                        className="form-hint"
                        style={{
                          color: "#fc8181",
                          marginTop: "5px",
                          display: "block",
                        }}
                      >
                        Először rendelj hozzá egy karbantartót a hibához!
                      </small>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Eszköz/Alkatrész Neve</label>
                    <input
                      type="text"
                      value={orderEquipmentName}
                      onChange={(e) => setOrderEquipmentName(e.target.value)}
                      placeholder="pl. Csaptelep, Izzó"
                      required
                      disabled={!orderSelectedTaskId}
                      maxLength={30}
                    />
                    <small
                      style={{
                        display: "block",
                        textAlign: "right",
                        color: "#a0aec0",
                        fontSize: "0.8em",
                        marginTop: "5px",
                      }}
                    >
                      {orderEquipmentName.length} / 30
                    </small>
                  </div>
                  <div className="form-group">
                    <label>Szükséges Mennyiség</label>
                    <input
                      type="number"
                      value={orderQuantity}
                      onChange={(e) =>
                        setOrderQuantity(parseInt(e.target.value))
                      }
                      min="1"
                      required
                      disabled={!orderSelectedTaskId}
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={
                      !orderSelectedTaskId || !orderEquipmentName.trim()
                    }
                  >
                    Rendelés Elküldése
                  </button>
                </form>
              </div>
            </section>

            <section
              className="modern-card"
              style={{
                display: "flex",
                flexDirection: "column",
                height: "fit-content",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "15px",
                  minHeight: "70px",
                }}
              >
                <span style={{ fontSize: "1.8rem", marginRight: "10px" }}>
                  📦
                </span>
                <h2 className="modern-gradient-text" style={{ margin: 0 }}>
                  Eszköz- és Alkatrészrendelések Állapota
                </h2>
              </div>
              <div
                className="modern-filter-controls-manager"
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: "25px",
                  height: "44px",
                  overflow: "hidden",
                }}
              >
                <button
                  className={`modern-filter-btn ${filterStatus === "all" ? "active" : ""}`}
                  onClick={() => setFilterStatus("all")}
                >
                  Összes
                </button>

                <button
                  className={`modern-filter-btn ${filterStatus === "pending" ? "active" : ""}`}
                  onClick={() => setFilterStatus("pending")}
                >
                  Kiszállítás alatt
                </button>
                <button
                  className={`modern-filter-btn ${filterStatus === "delivered" ? "active" : ""}`}
                  onClick={() => setFilterStatus("delivered")}
                >
                  Megérkezett
                </button>
              </div>

              <div
                className="requests-list tasks-list"
                style={{
                  height: "calc(100vh - 320px)",
                  minHeight: "400px",
                  overflowY: "auto",
                  paddingRight: "10px",
                }}
              >
                {filteredOrders.length === 0 ? (
                  <p className="empty-state">
                    Nincsenek rendelések ebben a státuszban
                  </p>
                ) : (
                  filteredOrders.map((req) => {
                    const associatedTask = tasks.find(
                      (t) => String(t.id) === String(req.taskId),
                    );
                    const assignedMaintainer = associatedTask
                      ? users.find(
                          (u) =>
                            String(u.id) === String(associatedTask.assignedTo),
                        )
                      : null;
                    return (
                      <div key={req.id} className="task-card modern-task-card">
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                          }}
                        >
                          <h4
                            style={{
                              marginBottom: "10px",
                              color: "#2d3748",
                              fontSize: "1.25rem",
                              fontWeight: "700",
                              marginTop: 0,
                            }}
                          >
                            {req.toolName}
                          </h4>
                          <div>
                            <span
                              className="status-badge"
                              style={{
                                backgroundColor: !req.isDelivered
                                  ? "#feebc8"
                                  : "#c6f6d5",
                                color: !req.isDelivered ? "#dd6b20" : "#38a169",
                              }}
                            >
                              {!req.isDelivered
                                ? "Kiszállítás alatt"
                                : "Megérkezett"}
                            </span>
                          </div>
                        </div>

                        <div
                          style={{
                            backgroundColor: "#f7fafc",
                            padding: "12px",
                            borderRadius: "8px",
                            marginBottom: "15px",
                            border: "1px solid #e2e8f0",
                            display: "flex",
                            flexDirection: "column",
                            gap: "10px",
                          }}
                        >
                          <div
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <span
                              style={{
                                color: "#a0aec0",
                                marginRight: "8px",
                                fontSize: "1.1rem",
                              }}
                            >
                              📦
                            </span>
                            <span style={{ color: "#4a5568" }}>
                              <strong>Mennyiség:</strong> {req.quantity} db
                            </span>
                          </div>

                          {req.taskId && (
                            <div
                              style={{ display: "flex", alignItems: "center" }}
                            >
                              <span
                                style={{
                                  color: "#a0aec0",
                                  marginRight: "8px",
                                  fontSize: "1.1rem",
                                }}
                              >
                                🔧
                              </span>
                              <span style={{ color: "#4a5568" }}>
                                <strong>Feladat:</strong>{" "}
                                {tasks.find(
                                  (t) => String(t.id) === String(req.taskId),
                                )?.title || "Ismeretlen feladat"}
                              </span>
                            </div>
                          )}

                          {assignedMaintainer && (
                            <div
                              style={{ display: "flex", alignItems: "center" }}
                            >
                              <span
                                style={{
                                  color: "#a0aec0",
                                  marginRight: "8px",
                                  fontSize: "1.1rem",
                                }}
                              >
                                👷
                              </span>
                              <span style={{ color: "#4a5568" }}>
                                <strong>Karbantartó:</strong>{" "}
                                {assignedMaintainer.name}
                              </span>
                            </div>
                          )}
                        </div>

                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            borderTop: "1px solid #edf2f7",
                            paddingTop: "15px",
                            marginTop: "15px",
                            marginBottom: !req.isDelivered ? "15px" : "0",
                          }}
                        >
                          <small
                            style={{ color: "#a0aec0", fontWeight: "500" }}
                          >
                            Megrendelve:{" "}
                            {new Date(req.createdAt).toLocaleDateString()}
                          </small>
                        </div>

                        {!req.isDelivered && (
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "center",
                            }}
                          >
                            <button
                              className="btn-secondary"
                              onClick={() => handleApprove(req.id)}
                              style={{
                                padding: "6px 20px",
                                fontSize: "0.85rem",
                                borderRadius: "6px",
                                background: "#f0fff4",
                                color: "#2f855a",
                                border: "1px solid #c6f6d5",
                                fontWeight: "600",
                                cursor: "pointer",
                                transition: "all 0.2s",
                              }}
                              onMouseOver={(e) =>
                                (e.target.style.background = "#c6f6d5")
                              }
                              onMouseOut={(e) =>
                                (e.target.style.background = "#f0fff4")
                              }
                            >
                              ✓ Megérkezett
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          </>
        )}
      </div>

      {/* Worker Tasks Modal */}
      {selectedWorkerId && selectedWorker && (
        <div className="modal-overlay">
          <div
            className="modal-content modern-card"
            style={{
              width: "90%",
              maxWidth: "800px",
              maxHeight: "90vh",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              padding: "35px",
              position: "relative",
            }}
          >
            <button
              className="close-modal-btn"
              onClick={() => setSelectedWorkerId(null)}
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                zIndex: 100,
                backgroundColor: "#fff",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
                border: "1px solid #e2e8f0",
              }}
            >
              &times;
            </button>
            <div
              style={{
                marginBottom: "25px",
                paddingRight: "40px",
              }}
            >
              <h2 className="modern-gradient-text" style={{ margin: 0 }}>
                {selectedWorker.name} feladatai
              </h2>
            </div>

            {selectedWorkerTasks.length === 0 ? (
              <p className="empty-state">Nincsenek kiosztott feladatok.</p>
            ) : (
              <div
                className="tasks-list"
                style={{
                  overflowY: "auto",
                  paddingRight: "10px",
                  flex: 1,
                  minHeight: 0,
                }}
              >
                {selectedWorkerTasks.map((task) => {
                  const statusDisplay = getStatusDisplay(task);
                  const reporter = users.find(
                    (u) => String(u.id) === String(task.createdBy),
                  );
                  return (
                    <div
                      key={task.id}
                      className={`task-card modern-task-card ${task.completed ? "task-completed" : ""}`}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                        }}
                      >
                        <h4
                          style={{
                            marginBottom: "10px",
                            color: "#2d3748",
                            fontSize: "1.25rem",
                            fontWeight: "700",
                            marginTop: 0,
                          }}
                        >
                          {task.title}
                        </h4>
                        <div>
                          <span
                            className="status-badge"
                            style={{
                              backgroundColor: statusDisplay.bg,
                              color: statusDisplay.color,
                            }}
                          >
                            {statusDisplay.text}
                          </span>
                          <button
                            className="btn-secondary"
                            style={{
                              marginLeft: "10px",
                              padding: "6px 12px",
                              fontSize: "0.85rem",
                              borderRadius: "6px",
                              background: "#fff5f5",
                              color: "#e53e3e",
                              border: "1px solid #feb2b2",
                              fontWeight: "600",
                              cursor: "pointer",
                              transition: "all 0.2s",
                            }}
                            onMouseOver={(e) =>
                              (e.target.style.background = "#fed7d7")
                            }
                            onMouseOut={(e) =>
                              (e.target.style.background = "#fff5f5")
                            }
                            onClick={() => handleDeleteTask(task.id)}
                          >
                            Törlés
                          </button>
                        </div>
                      </div>

                      <div
                        style={{
                          backgroundColor: "#f7fafc",
                          padding: "12px",
                          borderRadius: "8px",
                          marginBottom: "15px",
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        <p
                          style={{
                            margin: 0,
                            color: "#4a5568",
                            lineHeight: "1.5",
                          }}
                        >
                          {task.description}
                        </p>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "10px",
                          margin: "15px 0",
                        }}
                      >
                        {task._backendData?.premiseId ? (
                          <div
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <span
                              style={{
                                color: "#a0aec0",
                                marginRight: "8px",
                                fontSize: "1.1rem",
                              }}
                            >
                              📍
                            </span>
                            <span style={{ color: "#4a5568" }}>
                              <strong>Helyiség:</strong>{" "}
                              {premises.find(
                                (p) =>
                                  String(p.id) ===
                                  String(task._backendData.premiseId),
                              )?.nameOrNumber ||
                                `#${task._backendData.premiseId}`}
                            </span>
                          </div>
                        ) : task.location ? (
                          <div
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <span
                              style={{
                                color: "#a0aec0",
                                marginRight: "8px",
                                fontSize: "1.1rem",
                              }}
                            >
                              📍
                            </span>
                            <span style={{ color: "#4a5568" }}>
                              <strong>Helyiség:</strong> {task.location}
                            </span>
                          </div>
                        ) : null}

                        {reporter && (
                          <div
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <span
                              style={{
                                color: "#a0aec0",
                                marginRight: "8px",
                                fontSize: "1.1rem",
                              }}
                            >
                              👤
                            </span>
                            <span style={{ color: "#4a5568" }}>
                              <strong>Bejelentő:</strong> {reporter.name}
                            </span>
                          </div>
                        )}
                      </div>

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          borderTop: "1px solid #edf2f7",
                          paddingTop: "15px",
                          marginTop: "15px",
                        }}
                      >
                        <small style={{ color: "#a0aec0", fontWeight: "500" }}>
                          Bejelentve:{" "}
                          {new Date(task.createdAt).toLocaleDateString()}
                        </small>
                        {task.completedAt && (
                          <small
                            className="completion-date"
                            style={{ color: "#38a169", fontWeight: "600" }}
                          >
                            Befejezve:{" "}
                            {new Date(task.completedAt).toLocaleDateString()}
                          </small>
                        )}
                      </div>
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
        <div className="modal-overlay">
          <div
            className="modal-content modern-card"
            style={{
              width: "90%",
              maxWidth: "500px",
              padding: "35px",
            }}
          >
            <h2
              className="modern-gradient-text"
              style={{
                margin: "0 0 25px 0",
              }}
            >
              Bejelentés szerkesztése
            </h2>
            <form onSubmit={handleEditSubmit} className="form modern-form">
              <div className="form-group">
                <label>Hiba megnevezése</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                  maxLength={40}
                />
                <small
                  style={{
                    display: "block",
                    textAlign: "right",
                    color: "#a0aec0",
                    fontSize: "0.8em",
                    marginTop: "5px",
                  }}
                >
                  {editTitle.length} / 40
                </small>
              </div>
              <div className="form-group">
                <label>Részletes leírás</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows="4"
                  required
                  maxLength={200}
                />
                <small
                  style={{
                    display: "block",
                    textAlign: "right",
                    color: "#a0aec0",
                    fontSize: "0.8em",
                    marginTop: "5px",
                  }}
                >
                  {editDescription.length} / 200
                </small>
              </div>
              <div className="form-group">
                <label>Csatolmány</label>
                <p
                  style={{
                    fontSize: "0.9em",
                    color: "#718096",
                    margin: "0 0 8px 0",
                  }}
                >
                  Jelenlegi fájl:{" "}
                  <strong style={{ color: "#2d3748" }}>
                    {newAttachmentFile
                      ? newAttachmentFile.name
                      : editAttachment}
                  </strong>
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
                  style={{ padding: "8px" }}
                />
                <small
                  className="form-hint"
                  style={{ color: "#a0aec0", marginTop: "8px" }}
                >
                  Új kép feltöltése lecseréli a régit. Ha nem választasz fájlt,
                  a jelenlegi marad.
                </small>
              </div>
              <div style={{ display: "flex", gap: "15px", marginTop: "25px" }}>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ flex: 1, margin: 0 }}
                  disabled={!isEditChanged}
                >
                  Mentés
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{
                    flex: 1,
                    padding: "14px",
                    background: "#e2e8f0",
                    color: "#4a5568",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "700",
                    fontSize: "1.05rem",
                    transition: "background 0.2s",
                    margin: 0,
                  }}
                  onMouseOver={(e) => (e.target.style.background = "#cbd5e0")}
                  onMouseOut={(e) => (e.target.style.background = "#e2e8f0")}
                  onClick={() => setEditingTask(null)}
                >
                  Mégse
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Egyedi Megerősítő (Confirm) Modal */}
      {confirmModal.isOpen && (
        <div className="modal-overlay" style={{ zIndex: 2000 }}>
          <div
            className="modal-content modern-card"
            style={{
              width: "90%",
              maxWidth: "420px",
              padding: "30px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "3rem", marginBottom: "15px" }}>⚠️</div>
            <h3 style={{ margin: "0 0 15px 0", color: "#2d3748" }}>
              Megerősítés szükséges
            </h3>
            <p
              style={{
                color: "#4a5568",
                marginBottom: "25px",
                lineHeight: "1.5",
              }}
            >
              {confirmModal.message}
            </p>
            <div
              style={{ display: "flex", gap: "15px", justifyContent: "center" }}
            >
              <button
                className="btn-secondary"
                onClick={() =>
                  setConfirmModal({ ...confirmModal, isOpen: false })
                }
                style={{
                  padding: "12px 20px",
                  background: "#e2e8f0",
                  color: "#4a5568",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "700",
                  flex: 1,
                  transition: "background 0.2s",
                }}
                onMouseOver={(e) => (e.target.style.background = "#cbd5e0")}
                onMouseOut={(e) => (e.target.style.background = "#e2e8f0")}
              >
                Mégse
              </button>
              <button
                className="btn-primary"
                onClick={() => {
                  if (confirmModal.onConfirm) confirmModal.onConfirm();
                  setConfirmModal({ ...confirmModal, isOpen: false });
                }}
                style={{
                  padding: "12px 20px",
                  background: "#e53e3e",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "700",
                  flex: 1,
                  margin: 0,
                  fontSize: "1rem",
                }}
              >
                {confirmModal.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}

      {toastMessage && (
        <div
          className={`toast-message ${toastMessage.type === "error" ? "toast-error" : ""}`}
        >
          {toastMessage.text}
        </div>
      )}
    </div>
  );
};

export default MaintenanceManagerDashboard;
