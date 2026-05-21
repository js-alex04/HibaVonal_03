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

const MaintainerDashboard = () => {
  const {
    user,
    users,
    tasks,
    toolRequests,
    createToolRequest,
    hasPermission,
    updateTaskStatus,
    premises,
    appliances,
    setTaskAwaitingParts,
  } = useAuth();
  const [toolName, setToolName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedTaskId, setSelectedTaskId] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [taskFilterStatus, setTaskFilterStatus] = useState("all");
  const [toastMessage, setToastMessage] = useState(null);
  const [isTaskFilterOpen, setIsTaskFilterOpen] = useState(false);

  const toastTimeoutRef = useRef(null);

  const taskFilterLabels = {
    all: "Összes",
    InProgress: "Folyamatban",
    AwaitingParts: "Alkatrészre vár",
    Repaired: "Javítva",
    Unrepairable: "Javíthatatlan",
  };

  const showToast = (msg, type = "success") => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage({ text: msg, type });
    toastTimeoutRef.current = setTimeout(() => setToastMessage(null), 5000);
  };

  const allMyTasks = tasks.filter(
    (t) => String(t.assignedTo) === String(user.id),
  );

  const myTasks = allMyTasks
    .filter((t) => {
      if (taskFilterStatus === "all") return true;
      const rawStatus = t._backendData?.status;
      if (taskFilterStatus === "InProgress")
        return rawStatus === 1 || rawStatus === "InProgress";
      if (taskFilterStatus === "AwaitingParts")
        return rawStatus === 2 || rawStatus === "AwaitingParts";
      if (taskFilterStatus === "Repaired")
        return rawStatus === 3 || rawStatus === "Repaired";
      if (taskFilterStatus === "Unrepairable")
        return rawStatus === 4 || rawStatus === "Unrepairable";
      return false;
    })
    .sort((a, b) => {
      const getSortOrder = (task) => {
        const rawStatus = task._backendData?.status;
        const order = {
          2: 1, // Alkatrészre vár
          AwaitingParts: 1,
          1: 2, // Folyamatban
          InProgress: 2,
          3: 3, // Javítva
          Repaired: 3,
          4: 4, // Javíthatatlan
          Unrepairable: 4,
        };
        return order[rawStatus] || 99; // A többi státusz a végére kerül
      };

      const orderA = getSortOrder(a);
      const orderB = getSortOrder(b);

      if (orderA !== orderB) {
        return orderA - orderB;
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  const allMyTaskIds = allMyTasks.map((t) => String(t.id));
  const myToolRequests = toolRequests
    .filter((tr) => allMyTaskIds.includes(String(tr.taskId)))
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

  const handleRequestTool = async (e) => {
    e.preventDefault();

    // Validate inputs
    if (!toolName || toolName.trim().length === 0) {
      showToast("Kérjük, add meg az eszköz nevét!", "error");
      return;
    }

    if (toolName.length < 2) {
      showToast(
        "Az eszköz nevének legalább 2 karakternek kell lennie!",
        "error",
      );
      return;
    }

    if (quantity < 1) {
      showToast("A mennyiségnek legalább 1-nek kell lennie!", "error");
      return;
    }

    if (!selectedTaskId) {
      showToast("Kérjük, válassz egy kapcsolódó feladatot!", "error");
      return;
    }

    try {
      await createToolRequest(
        toolName.trim(),
        quantity,
        user.id,
        selectedTaskId,
      );
      await setTaskAwaitingParts(selectedTaskId);
      setToolName("");
      setQuantity(1);
      setSelectedTaskId("");
      showToast(
        'Eszközigénylés elküldve, a hiba állapota "Alkatrészre vár" lett! Kérjük, várj a vezetői visszajelzésre.',
        "success",
      );
    } catch (error) {
      showToast("Hiba: " + error.message, "error");
    }
  };

  const handleUpdateTaskStatus = async (taskId, isChecked) => {
    try {
      await updateTaskStatus(taskId, isChecked);
      if (isChecked) {
        showToast("Hiba készre jelentve!", "success");
      }
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  return (
    <div className="role-dashboard">
      <div className="dashboard-grid-wide">
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
            <span style={{ fontSize: "1.8rem", marginRight: "10px" }}>🔧</span>
            <h2 className="modern-gradient-text" style={{ margin: 0 }}>
              Kiosztott Karbantartási Feladatok
            </h2>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              position: "relative",
              marginBottom: "15px",
              height: "65px",
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
              {taskFilterLabels[taskFilterStatus]}{" "}
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
                      setTaskFilterStatus(key);
                      setIsTaskFilterOpen(false);
                    }}
                    style={{
                      padding: "12px 20px",
                      background:
                        taskFilterStatus === key ? "#ebf8ff" : "transparent",
                      color: taskFilterStatus === key ? "#3182ce" : "#4a5568",
                      border: "none",
                      textAlign: "center",
                      fontWeight: taskFilterStatus === key ? "700" : "500",
                      cursor: "pointer",
                      transition: "background 0.2s",
                      fontSize: "0.95rem",
                    }}
                    onMouseOver={(e) => {
                      if (taskFilterStatus !== key)
                        e.target.style.background = "#f7fafc";
                    }}
                    onMouseOut={(e) => {
                      if (taskFilterStatus !== key)
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
            {myTasks.length === 0 ? (
              <p className="empty-state">Nincsenek hozzád rendelt feladatok</p>
            ) : (
              myTasks.map((task) => {
                const statusDisplay = getStatusDisplay(task);
                const isUnrepairable =
                  task._backendData?.status === 4 ||
                  task._backendData?.status === "Unrepairable";
                const isAwaitingParts =
                  task._backendData?.status === 2 ||
                  task._backendData?.status === "AwaitingParts";
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
                        <div style={{ display: "flex", alignItems: "center" }}>
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
                        <div style={{ display: "flex", alignItems: "center" }}>
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
                        <div style={{ display: "flex", alignItems: "center" }}>
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
                        <div style={{ display: "flex", alignItems: "center" }}>
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

                      {task.specialization && (
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <span
                            style={{
                              color: "#a0aec0",
                              marginRight: "8px",
                              fontSize: "1.1rem",
                            }}
                          >
                            🛠️
                          </span>
                          <span style={{ color: "#4a5568" }}>
                            <strong>Szükséges szakértelem:</strong>{" "}
                            {task.specialization}
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

                    {!isUnrepairable && (
                      <div
                        className="completion-toggle"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexWrap: "wrap",
                          gap: "10px",
                        }}
                      >
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
                          <span>Hiba készre jelentése:</span>
                          <div className="toggle-switch">
                            <input
                              type="checkbox"
                              checked={task.completed || false}
                              disabled={task.completed || isAwaitingParts}
                              onChange={(e) =>
                                handleUpdateTaskStatus(
                                  task.id,
                                  e.target.checked,
                                )
                              }
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
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </section>

        {hasPermission("request_tools") && (
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
              <div style={{ height: "65px", marginBottom: "15px" }}></div>
              <form
                onSubmit={handleRequestTool}
                className="form modern-form tasks-list"
                style={{
                  height: "calc(100vh - 320px)",
                  minHeight: "400px",
                  overflowY: "auto",
                  paddingRight: "10px",
                }}
              >
                <div className="form-group">
                  <label>Kapcsolódó Feladat</label>
                  <select
                    value={selectedTaskId}
                    onChange={(e) => setSelectedTaskId(e.target.value)}
                    required
                  >
                    <option value="">-- Válassz egy feladatot --</option>
                    {allMyTasks
                      .filter((t) => !t.completed)
                      .map((task) => (
                        <option key={task.id} value={task.id}>
                          {task.title}
                        </option>
                      ))}
                  </select>
                  {allMyTasks.filter((t) => !t.completed).length === 0 && (
                    <small
                      className="form-hint"
                      style={{
                        color: "#fc8181",
                        marginTop: "5px",
                        display: "block",
                      }}
                    >
                      Nincs folyamatban lévő feladatod! Eszközt csak feladathoz
                      tudsz igényelni.
                    </small>
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
                  <small
                    style={{
                      display: "block",
                      textAlign: "right",
                      color: "#a0aec0",
                      fontSize: "0.8em",
                      marginTop: "5px",
                    }}
                  >
                    {toolName.length} / 30
                  </small>
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

                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginTop: "10px",
                  }}
                >
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={!selectedTaskId || !toolName.trim()}
                  >
                    Rendelés Elküldése
                  </button>
                </div>
              </form>
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
                  Saját Igényléseim
                </h2>
              </div>
              <div
                className="modern-filter-controls"
                style={{
                  marginBottom: "15px",
                  minHeight: "65px",
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
                {myToolRequests.length === 0 ? (
                  <p className="empty-state">
                    Nincs megjeleníthető saját eszközigénylésed.
                  </p>
                ) : (
                  myToolRequests.map((req) => {
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
                        </div>

                        {!req.isDelivered && (
                          <div
                            style={{
                              marginTop: "10px",
                              padding: "10px",
                              backgroundColor: "#fffbeb",
                              borderRadius: "8px",
                              border: "1px solid #fef3c7",
                              borderLeft: "4px solid #f59e0b",
                            }}
                          >
                            <p
                              style={{
                                margin: 0,
                                fontSize: "0.9em",
                                color: "#b45309",
                                fontWeight: "500",
                              }}
                            >
                              ⏳ A vezető visszajelzésére vár az alkatrész
                              megérkezéséről.
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
                          }}
                        >
                          <small
                            style={{ color: "#a0aec0", fontWeight: "500" }}
                          >
                            Megrendelve:{" "}
                            {new Date(req.createdAt).toLocaleDateString()}
                          </small>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          </>
        )}
      </div>

      {toastMessage && (
        <div
          className={`toast-message ${
            toastMessage.type === "error" ? "toast-error" : ""
          }`}
        >
          {toastMessage.text}
        </div>
      )}
    </div>
  );
};

export default MaintainerDashboard;
