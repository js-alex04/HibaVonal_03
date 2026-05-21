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
    return { text: "Javítva", bg: "#c6f6d5", color: "#38a169" };

  return { text: "Ismeretlen", bg: "#edf2f7", color: "#718096" };
};

const CollegiateDashboard = () => {
  const {
    user,
    tasks,
    createTask,
    hasPermission,
    addFeedback,
    updateFeedback,
    premises,
    appliances,
    updateTaskDetails,
  } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [applianceId, setApplianceId] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [feedbackInputs, setFeedbackInputs] = useState({});
  const [editingFeedbackId, setEditingFeedbackId] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editAttachment, setEditAttachment] = useState("");
  const [newAttachmentFile, setNewAttachmentFile] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [toastMessage, setToastMessage] = useState(null);

  const toastTimeoutRef = useRef(null);

  const showToast = (msg, type = "success") => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage({ text: msg, type });
    toastTimeoutRef.current = setTimeout(() => setToastMessage(null), 5000);
  };

  // generic sanitizer: letters, numbers, spaces, hyphens and Hungarian accents
  const sanitizeText = (input) => {
    return input.replace(/[^a-zA-Z0-9\s\-áéíóöőúüűÁÉÍÓÖŐÚÜŰ.,!?]/g, "");
  };

  const myTasks = tasks.filter((t) => String(t.createdBy) === String(user.id));
  const filteredTasks = myTasks
    .filter((t) => {
      if (filterStatus === "all") return true;
      const rawStatus = t._backendData?.status;
      if (filterStatus === "Pending")
        return (
          rawStatus === 0 ||
          rawStatus === "Pending" ||
          (!rawStatus && t.status === "pending")
        );
      if (filterStatus === "InProgress")
        return (
          rawStatus === 1 ||
          rawStatus === "InProgress" ||
          (!rawStatus && t.status === "in_progress")
        );
      if (filterStatus === "AwaitingParts")
        return rawStatus === 2 || rawStatus === "AwaitingParts";
      if (filterStatus === "Repaired")
        return (
          rawStatus === 3 ||
          rawStatus === "Repaired" ||
          (!rawStatus && t.status === "completed")
        );
      if (filterStatus === "Unrepairable")
        return rawStatus === 4 || rawStatus === "Unrepairable";
      return false;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      if (!description || description.trim().length === 0) {
        throw new Error("A részletes leírás kitöltése kötelező!");
      }
      if (!attachment) {
        throw new Error("Kérjük, csatolj egy képet a hibáról!");
      }
      if (!location || location.trim().length === 0) {
        throw new Error("Kérjük, add meg a helyszínt / szobát!");
      }
      // leave assignedTo empty; manager will assign a worker later
      const fileName = attachment ? attachment.name : null;
      await createTask(
        title,
        description,
        "",
        location,
        null,
        applianceId,
        fileName,
      );
      setTitle("");
      setDescription("");
      setLocation("");
      setApplianceId("");
      setAttachment(null);
      showToast("Hibabejelentés sikeresen elküldve!", "success");
    } catch (error) {
      showToast(error.message, "error");
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

  const handleEditFeedbackSubmit = async (taskId, feedbackId) => {
    const text = feedbackInputs[taskId];
    if (!text || text.trim().length === 0) return;
    try {
      await updateFeedback(taskId, feedbackId, text);
      setEditingFeedbackId(null);
      showToast(
        'Visszajelzés sikeresen módosítva! A hiba újra "Folyamatban" státuszba került.',
        "success",
      );
    } catch (err) {
      showToast(err.message, "error");
    }
  };

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
      await updateTaskDetails(
        editingTask.id,
        sanitizeText(editTitle),
        sanitizeText(editDescription),
        finalAttachmentName,
      );
      showToast("Hiba sikeresen frissítve!", "success");
      setEditingTask(null);
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const isFormValid =
    location &&
    title.trim().length > 0 &&
    description.trim().length > 0 &&
    attachment !== null;

  const isEditChanged =
    editingTask &&
    (editTitle !== (editingTask.name || editingTask.title || "") ||
      editDescription !== (editingTask.description || "") ||
      newAttachmentFile !== null);

  return (
    <div className="role-dashboard collegiate-dashboard">
      <div className="collegiate-split-layout">
        {hasPermission("submit_requests") && (
          <section
            className="collegiate-form-section modern-card"
            style={{
              display: "flex",
              flexDirection: "column",
              height: "fit-content",
              minWidth: "410px",
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
                📝
              </span>
              <h2 className="modern-gradient-text" style={{ margin: 0 }}>
                Új hiba bejelentése
              </h2>
            </div>

            {/* Láthatatlan távtartó, hogy egyforma magas legyen a jobb oldali szűrős kártyával */}
            <div style={{ height: "65px", marginBottom: "15px" }}></div>

            <form
              onSubmit={handleCreateTask}
              className="form modern-form tasks-list"
              style={{
                height: "calc(100vh - 320px)",
                minHeight: "400px",
                overflowY: "auto",
                paddingRight: "10px",
              }}
            >
              <div className="form-group">
                <label>Helyszín / Szoba</label>
                <select
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value);
                    setApplianceId(""); // Töröljük a berendezést, ha megváltozik a szoba
                    setTitle(""); // Töröljük a megnevezést
                    setDescription(""); // Töröljük a leírást
                    setAttachment(null); // Töröljük a kép csatolmányt
                  }}
                  required
                >
                  <option value="">-- Válassz egy helyiséget --</option>
                  {premises.map((p) => (
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
                  {location &&
                    appliances
                      .filter((a) => String(a.premiseId) === String(location))
                      .map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name}
                        </option>
                      ))}
                </select>
              </div>
              <div className="form-group">
                <label>Hiba megnevezése</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(sanitizeText(e.target.value))}
                  placeholder="Röviden nevezd meg a problémát"
                  maxLength={40}
                  required
                  disabled={!location}
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
                  {title.length} / 40
                </small>
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
                <small
                  style={{
                    display: "block",
                    textAlign: "right",
                    color: "#a0aec0",
                    fontSize: "0.8em",
                    marginTop: "5px",
                  }}
                >
                  {description.length} / 200
                </small>
              </div>

              <div className="form-group">
                <label>Kép csatolása</label>
                <input
                  key={location || "file-input"}
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

              <button
                type="submit"
                className="btn-primary"
                disabled={!isFormValid}
              >
                Bejelentés küldése
              </button>
            </form>
          </section>
        )}

        <div className="collegiate-list-wrapper">
          <section
            className="collegiate-list-section modern-card"
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
                Eddigi bejelentéseim
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
                className={`modern-filter-btn ${filterStatus === "Pending" ? "active" : ""}`}
                onClick={() => setFilterStatus("Pending")}
              >
                Függőben
              </button>
              <button
                className={`modern-filter-btn ${filterStatus === "InProgress" ? "active" : ""}`}
                onClick={() => setFilterStatus("InProgress")}
              >
                Folyamatban
              </button>
              <button
                className={`modern-filter-btn ${filterStatus === "AwaitingParts" ? "active" : ""}`}
                onClick={() => setFilterStatus("AwaitingParts")}
              >
                Alkatrészre vár
              </button>
              <button
                className={`modern-filter-btn ${filterStatus === "Repaired" ? "active" : ""}`}
                onClick={() => setFilterStatus("Repaired")}
              >
                Javítva
              </button>
              <button
                className={`modern-filter-btn ${filterStatus === "Unrepairable" ? "active" : ""}`}
                onClick={() => setFilterStatus("Unrepairable")}
              >
                Javíthatatlan
              </button>
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
                  Jelenleg nincsenek bejelentéseid ebben a státuszban.
                </p>
              ) : (
                filteredTasks.map((task) => {
                  const displayTitle =
                    task.name || task.title || "Ismeretlen megnevezés";
                  const displayDesc =
                    task.description || "Nem tartozik hozzá részletes leírás.";
                  const statusDisplay = getStatusDisplay(task);

                  return (
                    <div key={task.id} className="task-card modern-task-card">
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                        }}
                      >
                        <h3
                          style={{
                            marginBottom: "10px",
                            color: "#2d3748",
                            fontSize: "1.25rem",
                            fontWeight: "700",
                          }}
                        >
                          {displayTitle}
                        </h3>
                        {(task._backendData?.status === 0 ||
                          task._backendData?.status === "Pending" ||
                          (!task._backendData?.status &&
                            task.status === "pending")) && (
                          <button
                            className="btn-secondary"
                            style={{
                              padding: "6px 12px",
                              fontSize: "0.85em",
                              borderRadius: "6px",
                              width: "auto",
                              background: "#edf2f7",
                              color: "#4a5568",
                              border: "none",
                              fontWeight: "600",
                              cursor: "pointer",
                              transition: "background 0.2s",
                            }}
                            onMouseOver={(e) =>
                              (e.target.style.background = "#e2e8f0")
                            }
                            onMouseOut={(e) =>
                              (e.target.style.background = "#edf2f7")
                            }
                            onClick={() => openEditModal(task)}
                          >
                            Szerkesztés
                          </button>
                        )}
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
                          {displayDesc}
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
                              <strong>Helyszín:</strong>{" "}
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
                              <strong>Helyszín:</strong> {task.location}
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
                              <strong>Berendezés:</strong>{" "}
                              {appliances.find(
                                (a) =>
                                  String(a.id) ===
                                  String(task._backendData.applianceId),
                              )?.name ||
                                `#${task._backendData.applianceId} (Törölt/Ismeretlen)`}
                            </span>
                          </div>
                        )}

                        <div style={{ display: "flex", alignItems: "center" }}>
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
                            <strong>Kijelölt szakember: </strong>
                            {!task.specialization ||
                            task.specialization === "Egyéb" ? (
                              <span
                                style={{
                                  color: "#dd6b20",
                                  fontWeight: "600",
                                  marginLeft: "5px",
                                }}
                              >
                                Feldolgozás alatt...
                              </span>
                            ) : (
                              <span
                                style={{
                                  color: "#3182ce",
                                  fontWeight: "600",
                                  marginLeft: "5px",
                                }}
                              >
                                {task.specialization}
                              </span>
                            )}
                          </span>
                        </div>
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
                        <span
                          className="status-badge"
                          style={{
                            backgroundColor: statusDisplay.bg,
                            color: statusDisplay.color,
                            padding: "6px 12px",
                            fontSize: "0.85rem",
                            fontWeight: "700",
                          }}
                        >
                          {statusDisplay.text}
                        </span>
                        <small style={{ color: "#a0aec0", fontWeight: "500" }}>
                          Rögzítve:{" "}
                          {new Date(task.createdAt).toLocaleDateString()}
                        </small>
                      </div>

                      {task.completed && !task.feedback && (
                        <div
                          className="feedback-section modern-form"
                          style={{
                            marginTop: "20px",
                            padding: "15px",
                            backgroundColor: "#f8fafc",
                            borderRadius: "8px",
                            border: "1px solid #e2e8f0",
                          }}
                        >
                          <p
                            style={{
                              margin: "0 0 10px 0",
                              fontSize: "0.95em",
                              fontWeight: "600",
                              color: "#2d3748",
                            }}
                          >
                            💬 Értékeld a javítást / Hagyj megjegyzést:
                          </p>
                          <div className="form-group">
                            <textarea
                              placeholder="Kérjük, oszd meg velünk a tapasztalataidat..."
                              value={feedbackInputs[task.id] || ""}
                              onChange={(e) =>
                                handleFeedbackChange(task.id, e.target.value)
                              }
                              rows="2"
                              maxLength={100}
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
                              {(feedbackInputs[task.id] || "").length} / 100
                            </small>
                          </div>
                          <button
                            className="btn-primary"
                            onClick={() => handleFeedbackSubmit(task.id)}
                            style={{
                              padding: "8px 20px",
                              fontSize: "0.9em",
                              width: "auto",
                              margin: 0,
                              borderRadius: "6px",
                            }}
                          >
                            Visszajelzés küldése
                          </button>
                        </div>
                      )}

                      {task.feedback && (
                        <div
                          className="feedback-section modern-form"
                          style={{
                            marginTop: "20px",
                            padding: "15px",
                            backgroundColor: "#f0fff4",
                            borderRadius: "8px",
                            border: "1px solid #c6f6d5",
                            borderLeft: "4px solid #38a169",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginBottom: "10px",
                            }}
                          >
                            <p
                              style={{
                                margin: 0,
                                fontSize: "0.95em",
                                fontWeight: "700",
                                color: "#276749",
                              }}
                            >
                              ✓ Elküldött visszajelzésed:
                            </p>
                            {task._backendData?.feedbacks?.[0]?.id &&
                              !editingFeedbackId && (
                                <button
                                  className="btn-secondary"
                                  style={{
                                    padding: "4px 10px",
                                    fontSize: "0.8rem",
                                    borderRadius: "6px",
                                    background: "white",
                                    color: "#276749",
                                    border: "1px solid #c6f6d5",
                                    fontWeight: "600",
                                    cursor: "pointer",
                                  }}
                                  onClick={() => {
                                    setEditingFeedbackId(task.id);
                                    setFeedbackInputs({
                                      ...feedbackInputs,
                                      [task.id]: task.feedback,
                                    });
                                  }}
                                >
                                  Szerkesztés
                                </button>
                              )}
                          </div>
                          {editingFeedbackId === task.id ? (
                            <>
                              <div className="form-group">
                                <textarea
                                  value={
                                    feedbackInputs[task.id] !== undefined
                                      ? feedbackInputs[task.id]
                                      : task.feedback
                                  }
                                  onChange={(e) =>
                                    handleFeedbackChange(
                                      task.id,
                                      e.target.value,
                                    )
                                  }
                                  rows="2"
                                  maxLength={100}
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
                                  {
                                    (feedbackInputs[task.id] !== undefined
                                      ? feedbackInputs[task.id]
                                      : task.feedback || ""
                                    ).length
                                  }{" "}
                                  / 100
                                </small>
                              </div>
                              <div style={{ display: "flex", gap: "10px" }}>
                                <button
                                  className="btn-primary"
                                  onClick={() =>
                                    handleEditFeedbackSubmit(
                                      task.id,
                                      task._backendData?.feedbacks?.[0]?.id,
                                    )
                                  }
                                  style={{
                                    padding: "8px 20px",
                                    fontSize: "0.9em",
                                    width: "auto",
                                    margin: 0,
                                    borderRadius: "6px",
                                  }}
                                >
                                  Mentés
                                </button>
                                <button
                                  className="btn-secondary"
                                  onClick={() => setEditingFeedbackId(null)}
                                  style={{
                                    padding: "8px 20px",
                                    fontSize: "0.9em",
                                    background: "#e2e8f0",
                                    color: "#4a5568",
                                    border: "none",
                                    borderRadius: "6px",
                                    fontWeight: "600",
                                    cursor: "pointer",
                                    margin: 0,
                                  }}
                                >
                                  Mégse
                                </button>
                              </div>
                            </>
                          ) : (
                            <>
                              <p
                                style={{
                                  margin: "0 0 10px 0",
                                  fontStyle: "italic",
                                  color: "#2d3748",
                                }}
                              >
                                "{task.feedback}"
                              </p>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Edit Task Modal */}
      {editingTask && (
        <div
          className="modal-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(15, 23, 42, 0.75)",
            backdropFilter: "blur(4px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
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

export default CollegiateDashboard;
