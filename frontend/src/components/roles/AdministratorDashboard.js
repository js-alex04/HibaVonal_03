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

const AdministratorDashboard = () => {
  const {
    user,
    users,
    tasks,
    toolRequests,
    equipmentOrders,
    premises,
    appliances,
    specializations,
    register,
    ROLES,
    deleteTask,
    createPremise,
    updatePremise,
    deletePremise,
    deleteUser,
    changeUserRole,
    createAppliance,
    deleteAppliance,
    assignApplianceToPremise,
    removeApplianceFromPremise,
    updateAppliance,
    createSpecialization,
    updateSpecialization,
    deleteSpecialization,
    deleteFeedback,
    adminUpdateUser,
  } = useAuth();
  const [showAddUser, setShowAddUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [editUserId, setEditUserId] = useState(null);
  const [editUserName, setEditUserName] = useState("");
  const [editUserEmail, setEditUserEmail] = useState("");
  const [editUserRole, setEditUserRole] = useState("");
  const [editUserSpecializations, setEditUserSpecializations] = useState([]);
  const [editUserPremiseId, setEditUserPremiseId] = useState("");
  const [showAddPremise, setShowAddPremise] = useState(false);
  const [showEditPremise, setShowEditPremise] = useState(false);
  const [editPremiseId, setEditPremiseId] = useState(null);
  const [editPremiseName, setEditPremiseName] = useState("");
  const [editPremiseFloor, setEditPremiseFloor] = useState(1);
  const [editPremiseType, setEditPremiseType] = useState(0);
  const [showAddAppliance, setShowAddAppliance] = useState(false);
  const [showAddSpecialization, setShowAddSpecialization] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [newUserRole, setNewUserRole] = useState(ROLES.EGYETEMISTA);
  const [newUserSpecialization, setNewUserSpecialization] = useState([]);
  const [newUserPremiseId, setNewUserPremiseId] = useState("");
  const [newPremiseName, setNewPremiseName] = useState("");
  const [newPremiseFloor, setNewPremiseFloor] = useState(1);
  const [newPremiseType, setNewPremiseType] = useState(0);
  const [newApplianceName, setNewApplianceName] = useState("");
  const [newAppliancePremiseId, setNewAppliancePremiseId] = useState("");
  const [showEditAppliance, setShowEditAppliance] = useState(false);
  const [editApplianceId, setEditApplianceId] = useState(null);
  const [editApplianceName, setEditApplianceName] = useState("");
  const [editAppliancePremiseId, setEditAppliancePremiseId] = useState("");
  const [newSpecializationName, setNewSpecializationName] = useState("");
  const [requestFilter, setRequestFilter] = useState("all");
  const [taskFilter, setTaskFilter] = useState("all");
  const [toastMessage, setToastMessage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [statsModal, setStatsModal] = useState({ isOpen: false, type: null });
  const [isTaskFilterOpen, setIsTaskFilterOpen] = useState(false);

  const toastTimeoutRef = useRef(null);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    message: "",
    onConfirm: null,
    confirmText: "Igen",
  });
  const [promptModal, setPromptModal] = useState({
    isOpen: false,
    message: "",
    defaultValue: "",
    onConfirm: null,
    confirmText: "Mentés",
  });
  const [promptInputValue, setPromptInputValue] = useState("");

  const setError = (msg) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    if (msg) {
      setToastMessage({ text: msg, type: "error" });
      toastTimeoutRef.current = setTimeout(() => setToastMessage(null), 5000);
    } else {
      setToastMessage(null);
    }
  };

  const setSuccess = (msg) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    if (msg) {
      setToastMessage({ text: msg, type: "success" });
      toastTimeoutRef.current = setTimeout(() => setToastMessage(null), 5000);
    } else {
      setToastMessage(null);
    }
  };

  const showConfirm = (message, onConfirm, confirmText = "Törlés") => {
    setConfirmModal({ isOpen: true, message, onConfirm, confirmText });
  };

  const showPrompt = (
    message,
    defaultValue,
    onConfirm,
    confirmText = "Mentés",
  ) => {
    setPromptInputValue(defaultValue);
    setPromptModal({
      isOpen: true,
      message,
      defaultValue,
      onConfirm,
      confirmText,
    });
  };

  const taskFilterLabels = {
    all: "Összes",
    Pending: "Függőben",
    InProgress: "Folyamatban",
    AwaitingParts: "Alkatrészre vár",
    Repaired: "Javítva",
    Unrepairable: "Javíthatatlan",
  };

  // Sanitize input
  const sanitizeInput = (input) => {
    return input.replace(/[<>"']/g, "").trim();
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!newUserName || newUserName.trim().length === 0) {
      setError("Kérjük, add meg a nevet!");
      return;
    }

    if (newUserName.trim().length < 2 || !/[a-zA-Z0-9]/.test(newUserName)) {
      setError(
        "A névnek legalább 2 karakterből kell állnia, és betűket vagy számokat kell tartalmaznia!",
      );
      return;
    }

    let finalEmail = newUserEmail.trim();
    if (finalEmail && !finalEmail.includes("@")) {
      finalEmail += "@hibavonal.hu";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!finalEmail || !emailRegex.test(finalEmail)) {
      setError("Kérjük, adj meg egy érvényes felhasználónevet!");
      return;
    }

    if (!newUserPassword || newUserPassword.length < 4) {
      setError("A jelszónak legalább 4 karakterből kell állnia!");
      return;
    }

    if (
      newUserRole === ROLES.KARBANTARTAS &&
      (!newUserSpecialization || newUserSpecialization.length === 0)
    ) {
      setError("Kérjük, válassz legalább egy szakterületet a karbantartónak!");
      return;
    }

    if (newUserRole === ROLES.EGYETEMISTA && !newUserPremiseId) {
      setError("Kérjük, válaszd ki a kollégista szobáját!");
      return;
    }

    try {
      await register(
        sanitizeInput(finalEmail),
        newUserPassword,
        sanitizeInput(newUserName),
        newUserRole,
        newUserRole === ROLES.KARBANTARTAS ? newUserSpecialization : [],
        newUserRole === ROLES.EGYETEMISTA ? newUserPremiseId : null,
      );
      setSuccess("Felhasználó sikeresen létrehozva!");
      setNewUserEmail("");
      setNewUserPassword("");
      setNewUserName("");
      setNewUserRole(ROLES.EGYETEMISTA);
      setNewUserSpecialization([]);
      setNewUserPremiseId("");
      setShowAddUser(false);
      setShowPassword(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddPremise = async (e) => {
    e.preventDefault();
    try {
      await createPremise(
        sanitizeInput(newPremiseName),
        newPremiseFloor,
        parseInt(newPremiseType),
      );
      setNewPremiseName("");
      setNewPremiseFloor(1);
      setNewPremiseType(0);
      setShowAddPremise(false);
      setSuccess("Helyiség sikeresen létrehozva!");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeletePremise = (id) => {
    showConfirm(
      "Biztosan törölni szeretnéd ezt a helyiséget?",
      async () => {
        try {
          await deletePremise(id);
          setSuccess("Helyiség törölve!");
        } catch (err) {
          setError(err.message);
        }
      },
      "Törlés",
    );
  };

  const handleEditPremiseClick = (p) => {
    setEditPremiseId(p.id);
    setEditPremiseName(p.nameOrNumber);
    setEditPremiseFloor(p.floor);
    setEditPremiseType(
      String(p.type) === "1" || String(p.type) === "PrivateRoom" ? 1 : 0,
    );
    setShowEditPremise(true);
    setShowAddPremise(false);
    setError("");
    setSuccess("");
  };

  const handleUpdatePremise = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await updatePremise(
        editPremiseId,
        sanitizeInput(editPremiseName),
        editPremiseFloor,
        parseInt(editPremiseType),
      );
      setSuccess("Helyiség sikeresen frissítve!");
      setShowEditPremise(false);
      setEditPremiseId(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteTask = (taskId) => {
    showConfirm(
      "Biztosan törölni szeretnéd ezt a hibajelentést? (Végleges törlés az adatbázisból)",
      async () => {
        try {
          await deleteTask(taskId);
          setSuccess("Hiba sikeresen törölve!");
        } catch (err) {
          setError(err.message);
        }
      },
      "Törlés",
    );
  };

  const handleDeleteFeedback = (feedbackId, taskId) => {
    showConfirm(
      "Biztosan törölni szeretnéd ezt a visszajelzést?",
      async () => {
        try {
          await deleteFeedback(feedbackId, taskId);
          setSuccess("Visszajelzés törölve!");
        } catch (err) {
          setError(err.message);
        }
      },
      "Törlés",
    );
  };

  const handleDeleteUser = (userId) => {
    showConfirm(
      "Biztosan törölni szeretnéd ezt a felhasználót?",
      async () => {
        try {
          await deleteUser(userId);
          setSuccess("Felhasználó sikeresen törölve!");
        } catch (err) {
          setError(err.message);
        }
      },
      "Törlés",
    );
  };

  const handleEditUserClick = (u) => {
    setEditUserId(u.id);
    setEditUserName(u.name);
    setEditUserEmail(u.email ? u.email.replace("@hibavonal.hu", "") : "");
    setEditUserRole(u.role);

    let currentSpecs = [];
    if (
      u.role === ROLES.KARBANTARTAS &&
      u.specialization &&
      u.specialization !== "Nincs beállítva" &&
      u.specialization !== "Általános" &&
      u.specialization !== "Egyéb"
    ) {
      const specNames = u.specialization.split(", ");
      currentSpecs = specializations
        .filter((s) => specNames.includes(s.name))
        .map((s) => String(s.id));
    }
    setEditUserSpecializations(currentSpecs);
    setEditUserPremiseId(""); // Alapértelmezett, mivel a backend utólag nem tárolja listázáskor
    setShowEditUser(true);
    setShowAddUser(false);
    setError("");
    setSuccess("");
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    let finalEmail = editUserEmail.trim();
    if (finalEmail && !finalEmail.includes("@")) {
      finalEmail += "@hibavonal.hu";
    }

    if (
      editUserRole === ROLES.KARBANTARTAS &&
      editUserSpecializations.length === 0
    ) {
      setError("Kérjük, válassz legalább egy szakterületet a karbantartónak!");
      return;
    }

    if (editUserRole === ROLES.EGYETEMISTA && !editUserPremiseId) {
      setError("Kérjük, válaszd ki a kollégiumi szobát!");
      return;
    }

    try {
      await adminUpdateUser(
        editUserId,
        sanitizeInput(editUserName),
        sanitizeInput(finalEmail),
        editUserRole,
        editUserRole === ROLES.KARBANTARTAS ? editUserSpecializations : [],
        editUserRole === ROLES.EGYETEMISTA ? editUserPremiseId : null,
      );

      setSuccess("Felhasználó adatai és szerepköre sikeresen frissítve!");
      setShowEditUser(false);
      setEditUserId(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddAppliance = async (e) => {
    e.preventDefault();
    if (!newAppliancePremiseId) {
      setError("Kérjük, válassz egy helyiséget a berendezéshez!");
      return;
    }
    try {
      await createAppliance(
        sanitizeInput(newApplianceName),
        newAppliancePremiseId,
      );
      setNewApplianceName("");
      setNewAppliancePremiseId("");
      setShowAddAppliance(false);
      setSuccess("Berendezés sikeresen létrehozva!");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditApplianceClick = (appliance) => {
    setEditApplianceId(appliance.id);
    setEditApplianceName(appliance.name);
    setEditAppliancePremiseId(
      appliance.premiseId ? appliance.premiseId.toString() : "",
    ); // Convert to string for select value
    setShowEditAppliance(true);
    setError("");
    setSuccess("");
  };

  const handleUpdateAppliance = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await updateAppliance(
        editApplianceId,
        sanitizeInput(editApplianceName),
        editAppliancePremiseId,
      );
      setSuccess("Berendezés sikeresen frissítve!");
      setShowEditAppliance(false);
      setEditApplianceId(null);
      setEditApplianceName("");
      setEditAppliancePremiseId("");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteAppliance = (id) => {
    showConfirm(
      "Biztosan törölni szeretnéd ezt a berendezést?",
      async () => {
        try {
          await deleteAppliance(id);
          setSuccess("Berendezés törölve!");
        } catch (err) {
          setError(err.message);
        }
      },
      "Törlés",
    );
  };

  const handleAssignAppliance = async (
    applianceId,
    currentPremiseId,
    newPremiseId,
  ) => {
    try {
      if (!newPremiseId) {
        // Eltávolítás a szobából
        if (currentPremiseId) {
          await removeApplianceFromPremise(currentPremiseId, applianceId);
          setSuccess("Berendezés eltávolítva a helyiségből!");
        }
      } else {
        // Hozzárendelés / Áthelyezés új szobába
        await assignApplianceToPremise(newPremiseId, applianceId);
        setSuccess("Berendezés sikeresen áthelyezve!");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddSpecialization = async (e) => {
    e.preventDefault();
    try {
      await createSpecialization(sanitizeInput(newSpecializationName));
      setNewSpecializationName("");
      setShowAddSpecialization(false);
      setSuccess("Szakterület sikeresen létrehozva!");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateSpecialization = (id, currentName) => {
    showPrompt(
      "Írd be az új szakterület nevet:",
      currentName,
      async (newName) => {
        if (
          newName !== null &&
          newName.trim() !== "" &&
          newName !== currentName
        ) {
          try {
            await updateSpecialization(id, sanitizeInput(newName));
            setSuccess("Szakterület sikeresen frissítve!");
          } catch (err) {
            setError(err.message);
          }
        }
      },
      "Mentés",
    );
  };

  const handleDeleteSpecialization = (id) => {
    showConfirm(
      "Biztosan törölni szeretnéd ezt a szakterületet? (Csak akkor törölhető, ha nincs hozzárendelve karbantartóhoz vagy hibához!)",
      async () => {
        try {
          await deleteSpecialization(id);
          setSuccess("Szakterület törölve!");
        } catch (err) {
          setError(err.message);
        }
      },
      "Törlés",
    );
  };

  const openStatsModal = (type) => setStatsModal({ isOpen: true, type });

  const getRoleCount = (role) => users.filter((u) => u.role === role).length;

  const sortedUsers = [...users].sort((a, b) => {
    const roleOrder = {
      [ROLES.ADMINISZTRATOR]: 1,
      [ROLES.KARBANTARTAS_VEZETO]: 2,
      [ROLES.KARBANTARTAS]: 3,
      [ROLES.EGYETEMISTA]: 4,
    };
    const orderA = roleOrder[a.role] || 99;
    const orderB = roleOrder[b.role] || 99;
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    return (a.name || "").localeCompare(b.name || "");
  });

  const completedTasks = tasks.filter((t) => t.completed);
  const filteredRequests = toolRequests
    .filter((tr) =>
      requestFilter === "all"
        ? true
        : requestFilter === "pending"
          ? !tr.isDelivered
          : tr.isDelivered,
    )
    .sort((a, b) => {
      if (a.isDelivered === b.isDelivered) {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      return a.isDelivered ? 1 : -1;
    });

  const filteredTasks = tasks
    .filter((t) => {
      if (taskFilter === "all") return true;
      const rawStatus = t._backendData?.status;
      if (taskFilter === "Pending")
        return (
          rawStatus === 0 ||
          rawStatus === "Pending" ||
          (!rawStatus && t.status === "pending")
        );
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
      const getSortOrder = (task) => {
        const rawStatus = task._backendData?.status;
        const order = {
          0: 1, // Függőben
          Pending: 1,
          1: 2, // Folyamatban
          InProgress: 2,
          2: 3, // Alkatrészre vár
          AwaitingParts: 3,
          3: 4, // Javítva
          Repaired: 4,
          4: 5, // Javíthatatlan
          Unrepairable: 5,
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

  const stats = {
    totalUsers: users.length,
    egyetemista: getRoleCount(ROLES.EGYETEMISTA),
    karbantarto: getRoleCount(ROLES.KARBANTARTAS),
    vezeto: getRoleCount(ROLES.KARBANTARTAS_VEZETO),
    admin: getRoleCount(ROLES.ADMINISZTRATOR),
    totalTasks: tasks.length,
    totalToolRequests: toolRequests.length,
    pendingRequests: toolRequests.filter((tr) => tr.status === "pending")
      .length,
    completedTasks: completedTasks.length,
  };

  const statCards = [
    {
      id: "totalUsers",
      title: "Összes Felhasználó",
      value: stats.totalUsers,
      color: "#3182ce",
    },
    {
      id: "egyetemista",
      title: "Kollégista",
      value: stats.egyetemista,
      color: "#38a169",
    },
    {
      id: "karbantarto",
      title: "Karbantartó",
      value: stats.karbantarto,
      color: "#dd6b20",
    },
    {
      id: "vezeto",
      title: "Karbantartási vezető",
      value: stats.vezeto,
      color: "#805ad5",
    },
    {
      id: "totalTasks",
      title: "Összes Hiba",
      value: stats.totalTasks,
      color: "#319795",
    },
    {
      id: "totalToolRequests",
      title: "Összes Igénylés",
      value: stats.totalToolRequests,
      color: "#e53e3e",
    },
  ];

  const renderStatsContent = () => {
    let title = "";
    let list = [];
    let renderer = null;

    const getRoleColor = (role) => {
      switch (role) {
        case ROLES.EGYETEMISTA:
          return "#38a169";
        case ROLES.KARBANTARTAS:
          return "#dd6b20";
        case ROLES.KARBANTARTAS_VEZETO:
          return "#805ad5";
        case ROLES.ADMINISZTRATOR:
          return "#3182ce";
        default:
          return "#718096";
      }
    };

    if (statsModal.type === "totalUsers") {
      title = "Összes Felhasználó";
      list = sortedUsers;
      renderer = (u) => (
        <div
          key={u.id}
          className="task-card modern-task-card"
          style={{ padding: "15px", marginBottom: "10px" }}
        >
          <h4 style={{ margin: "0 0 5px 0", color: "#2d3748" }}>{u.name}</h4>
          <p style={{ margin: 0, color: "#4a5568" }}>
            {u.email} •{" "}
            <span style={{ color: getRoleColor(u.role), fontWeight: "600" }}>
              {u.role}
            </span>
          </p>
        </div>
      );
    } else if (statsModal.type === "egyetemista") {
      title = "Kollégisták";
      list = users
        .filter((u) => u.role === ROLES.EGYETEMISTA)
        .sort((a, b) => (a.name || "").localeCompare(b.name || ""));
      renderer = (u) => (
        <div
          key={u.id}
          className="task-card modern-task-card"
          style={{ padding: "15px", marginBottom: "10px" }}
        >
          <h4 style={{ margin: "0 0 5px 0", color: "#2d3748" }}>{u.name}</h4>
          <p style={{ margin: 0, color: "#4a5568" }}>{u.email}</p>
        </div>
      );
    } else if (statsModal.type === "karbantarto") {
      title = "Karbantartók";
      list = users
        .filter((u) => u.role === ROLES.KARBANTARTAS)
        .sort((a, b) => (a.name || "").localeCompare(b.name || ""));
      renderer = (u) => (
        <div
          key={u.id}
          className="task-card modern-task-card"
          style={{ padding: "15px", marginBottom: "10px" }}
        >
          <h4 style={{ margin: "0 0 5px 0", color: "#2d3748" }}>{u.name}</h4>
          <p style={{ margin: 0, color: "#4a5568" }}>
            {u.email} • Szakterület:{" "}
            <strong>{u.specialization || "Nincs beállítva"}</strong>
          </p>
        </div>
      );
    } else if (statsModal.type === "vezeto") {
      title = "Karbantartási vezetők";
      list = users
        .filter((u) => u.role === ROLES.KARBANTARTAS_VEZETO)
        .sort((a, b) => (a.name || "").localeCompare(b.name || ""));
      renderer = (u) => (
        <div
          key={u.id}
          className="task-card modern-task-card"
          style={{ padding: "15px", marginBottom: "10px" }}
        >
          <h4 style={{ margin: "0 0 5px 0", color: "#2d3748" }}>{u.name}</h4>
          <p style={{ margin: 0, color: "#4a5568" }}>{u.email}</p>
        </div>
      );
    } else if (statsModal.type === "totalTasks") {
      title = "Összes Hiba";
      list = tasks;
      list = [...tasks].sort((a, b) => {
        const getSortOrder = (task) => {
          const rawStatus = task._backendData?.status;
          const order = {
            0: 1, // Függőben
            Pending: 1,
            1: 2, // Folyamatban
            InProgress: 2,
            2: 3, // Alkatrészre vár
            AwaitingParts: 3,
            3: 4, // Javítva
            Repaired: 4,
            4: 5, // Javíthatatlan
            Unrepairable: 5,
          };
          return order[rawStatus] || 99;
        };
        const orderA = getSortOrder(a);
        const orderB = getSortOrder(b);
        if (orderA !== orderB) {
          return orderA - orderB;
        }
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      renderer = (t) => {
        const statusDisplay = getStatusDisplay(t);
        return (
          <div
            key={t.id}
            className="task-card modern-task-card"
            style={{ padding: "15px", marginBottom: "10px" }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <h4 style={{ margin: "0 0 5px 0", color: "#2d3748" }}>
                {t.title}
              </h4>
              <span
                className="status-badge"
                style={{
                  backgroundColor: statusDisplay.bg,
                  color: statusDisplay.color,
                  fontSize: "0.75rem",
                  padding: "4px 8px",
                }}
              >
                {statusDisplay.text}
              </span>
            </div>
            <p style={{ margin: 0, color: "#4a5568", fontSize: "0.9em" }}>
              Bejelentve: {new Date(t.createdAt).toLocaleDateString()}
            </p>
          </div>
        );
      };
    } else if (statsModal.type === "totalToolRequests") {
      title = "Összes Igénylés";
      list = [...toolRequests].sort((a, b) => {
        if (a.isDelivered === b.isDelivered) {
          return new Date(b.createdAt) - new Date(a.createdAt);
        }
        return a.isDelivered ? 1 : -1;
      });
      renderer = (r) => {
        const associatedTask = tasks.find(
          (t) => String(t.id) === String(r.taskId),
        );
        const assignedMaintainer = associatedTask
          ? users.find(
              (u) => String(u.id) === String(associatedTask.assignedTo),
            )
          : null;

        return (
          <div
            key={r.id}
            className="task-card modern-task-card"
            style={{ padding: "15px", marginBottom: "10px" }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <h4 style={{ margin: "0 0 5px 0", color: "#2d3748" }}>
                {r.toolName} ({r.quantity} db)
              </h4>
              <span
                className="status-badge"
                style={{
                  backgroundColor: !r.isDelivered ? "#feebc8" : "#c6f6d5",
                  color: !r.isDelivered ? "#dd6b20" : "#38a169",
                  fontSize: "0.75rem",
                  padding: "4px 8px",
                }}
              >
                {!r.isDelivered ? "Kiszállítás alatt" : "Megérkezett"}
              </span>
            </div>
            <p style={{ margin: 0, color: "#4a5568", fontSize: "0.9em" }}>
              Kérte: {assignedMaintainer?.name || "Ismeretlen"}
            </p>
            <p
              style={{
                margin: "5px 0 0 0",
                color: "#718096",
                fontSize: "0.8em",
              }}
            >
              Dátum: {new Date(r.createdAt).toLocaleDateString()}
            </p>
          </div>
        );
      };
    }

    return { title, list, renderer };
  };

  // Eredeti adatok összehasonlítása a Szerkesztés modalok mentés gombjának letiltásához
  const originalUser = users.find((u) => u.id === editUserId);
  let isUserEditChanged = false;
  if (originalUser) {
    const originalEmail = originalUser.email
      ? originalUser.email.replace("@hibavonal.hu", "")
      : "";
    let originalSpecs = [];
    if (
      originalUser.role === ROLES.KARBANTARTAS &&
      originalUser.specialization &&
      originalUser.specialization !== "Nincs beállítva" &&
      originalUser.specialization !== "Általános" &&
      originalUser.specialization !== "Egyéb"
    ) {
      const specNames = originalUser.specialization.split(", ");
      originalSpecs = specializations
        .filter((s) => specNames.includes(s.name))
        .map((s) => String(s.id));
    }
    const sortedEditSpecs = [...editUserSpecializations].sort().join(",");
    const sortedOriginalSpecs = [...originalSpecs].sort().join(",");

    isUserEditChanged =
      editUserName !== originalUser.name ||
      editUserEmail !== originalEmail ||
      editUserRole !== originalUser.role ||
      (editUserRole === ROLES.EGYETEMISTA && editUserPremiseId !== "") ||
      (originalUser.role === ROLES.KARBANTARTAS &&
        sortedEditSpecs !== sortedOriginalSpecs);
  }

  const originalPremise = premises.find((p) => p.id === editPremiseId);
  let isPremiseEditChanged = false;
  if (originalPremise) {
    const origTypeNorm =
      String(originalPremise.type) === "1" ||
      String(originalPremise.type) === "PrivateRoom"
        ? "1"
        : "0";

    isPremiseEditChanged =
      editPremiseName !== originalPremise.nameOrNumber ||
      String(editPremiseFloor) !== String(originalPremise.floor) ||
      String(editPremiseType) !== origTypeNorm;
  }

  const originalAppliance = appliances.find((a) => a.id === editApplianceId);
  let isApplianceEditChanged = false;
  if (originalAppliance) {
    isApplianceEditChanged =
      editApplianceName !== originalAppliance.name ||
      String(editAppliancePremiseId) !==
        (originalAppliance.premiseId
          ? String(originalAppliance.premiseId)
          : "");
  }

  const isAddUserValid =
    newUserName.trim().length >= 2 &&
    newUserEmail.trim().length > 0 &&
    newUserPassword.length >= 4 &&
    (newUserRole === ROLES.KARBANTARTAS
      ? newUserSpecialization.length > 0
      : true) &&
    (newUserRole === ROLES.EGYETEMISTA ? newUserPremiseId !== "" : true);

  const isAddPremiseValid =
    newPremiseName.trim().length > 0 && String(newPremiseFloor).length > 0;

  const isAddApplianceValid =
    newApplianceName.trim().length > 0 && newAppliancePremiseId !== "";

  const isAddSpecializationValid = newSpecializationName.trim().length > 0;

  const isPromptValid =
    promptInputValue.trim() !== "" &&
    promptInputValue !== promptModal.defaultValue;

  return (
    <div className="role-dashboard">
      <div className="dashboard-grid-admin">
        {/* Statistics Section */}
        <section
          className="modern-card"
          style={{
            display: "flex",
            flexDirection: "column",
            marginBottom: "30px",
            height: "fit-content",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "25px",
            }}
          >
            <span style={{ fontSize: "1.8rem", marginRight: "10px" }}>📊</span>
            <h2 className="modern-gradient-text" style={{ margin: 0 }}>
              Rendszer Statisztikák
            </h2>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "20px",
            }}
          >
            {statCards.map((card) => (
              <div
                key={card.id}
                onClick={() => openStatsModal(card.id)}
                style={{
                  background:
                    "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                  border: "1px solid #e2e8f0",
                  borderRadius: "16px",
                  padding: "20px",
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-5px)";
                  e.currentTarget.style.boxShadow =
                    "0 10px 15px rgba(0,0,0,0.1)";
                  e.currentTarget.style.borderColor = card.color;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 6px rgba(0,0,0,0.05)";
                  e.currentTarget.style.borderColor = "#e2e8f0";
                }}
              >
                <h3
                  style={{
                    fontSize: "2.2rem",
                    color: card.color,
                    margin: "0 0 10px 0",
                  }}
                >
                  {card.value}
                </h3>
                <p
                  style={{
                    margin: 0,
                    color: "#718096",
                    fontWeight: "600",
                    fontSize: "0.9rem",
                  }}
                >
                  {card.title}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* User Management Section */}
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
              justifyContent: "space-between",
              marginBottom: "15px",
              minHeight: "70px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <span style={{ fontSize: "1.8rem", marginRight: "10px" }}>
                👥
              </span>
              <h2 className="modern-gradient-text" style={{ margin: 0 }}>
                Felhasználókezelés
              </h2>
            </div>
            <button
              className="btn-secondary"
              onClick={() => {
                setShowAddUser(true);
                setShowEditUser(false);
                setShowPassword(false);
              }}
              style={{
                background: "#edf2f7",
                color: "#4a5568",
                padding: "10px 20px",
                borderRadius: "8px",
                border: "none",
                fontWeight: "600",
                cursor: "pointer",
                transition: "background 0.2s",
              }}
              onMouseOver={(e) => (e.target.style.background = "#e2e8f0")}
              onMouseOut={(e) => (e.target.style.background = "#edf2f7")}
            >
              + Új Felhasználó
            </button>
          </div>

          <div
            className="users-list tasks-list"
            style={{
              height: "calc(100vh - 320px)",
              minHeight: "400px",
              overflowY: "auto",
              paddingRight: "10px",
            }}
          >
            {sortedUsers.length === 0 ? (
              <p className="empty-state">Nincs megjeleníthető felhasználó.</p>
            ) : (
              sortedUsers.map((u) => {
                const getRoleColor = (role) => {
                  switch (role) {
                    case ROLES.EGYETEMISTA:
                      return "#38a169";
                    case ROLES.KARBANTARTAS:
                      return "#dd6b20";
                    case ROLES.KARBANTARTAS_VEZETO:
                      return "#805ad5";
                    case ROLES.ADMINISZTRATOR:
                      return "#3182ce";
                    default:
                      return "#718096";
                  }
                };

                return (
                  <div key={u.id} className="task-card modern-task-card">
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
                        {u.name}
                      </h4>
                      <div>
                        <span
                          className="status-badge"
                          style={{
                            backgroundColor: getRoleColor(u.role) + "20",
                            color: getRoleColor(u.role),
                            padding: "6px 12px",
                            fontSize: "0.85rem",
                            fontWeight: "700",
                          }}
                        >
                          {u.role}
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
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <span
                          style={{
                            color: "#a0aec0",
                            marginRight: "8px",
                            fontSize: "1.1rem",
                          }}
                        >
                          ✉️
                        </span>
                        <span style={{ color: "#4a5568" }}>
                          <strong>E-mail:</strong> {u.email}
                        </span>
                      </div>

                      {u.role === ROLES.KARBANTARTAS && (
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
                            <strong>Szakterület:</strong>{" "}
                            {u.specialization || "Nincs beállítva"}
                          </span>
                        </div>
                      )}
                    </div>

                    {String(u.id) !== String(user.id) && (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "flex-end",
                          alignItems: "center",
                          borderTop: "1px solid #edf2f7",
                          paddingTop: "15px",
                          marginTop: "15px",
                          gap: "10px",
                        }}
                      >
                        <button
                          className="btn-secondary"
                          style={{
                            padding: "6px 12px",
                            fontSize: "0.85rem",
                            borderRadius: "6px",
                            background: "#ebf8ff",
                            color: "#3182ce",
                            border: "1px solid #bee3f8",
                            fontWeight: "600",
                            cursor: "pointer",
                            transition: "all 0.2s",
                          }}
                          onMouseOver={(e) =>
                            (e.target.style.background = "#bee3f8")
                          }
                          onMouseOut={(e) =>
                            (e.target.style.background = "#ebf8ff")
                          }
                          onClick={() => handleEditUserClick(u)}
                        >
                          Szerkesztés
                        </button>
                        <button
                          className="btn-secondary"
                          style={{
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
                          onClick={() => handleDeleteUser(u.id)}
                        >
                          Törlés
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Premises Management */}
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
              justifyContent: "space-between",
              marginBottom: "15px",
              minHeight: "70px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <span style={{ fontSize: "1.8rem", marginRight: "10px" }}>
                🚪
              </span>
              <h2 className="modern-gradient-text" style={{ margin: 0 }}>
                Helyiségek / Szobák Listája
              </h2>
            </div>
            <button
              className="btn-secondary"
              onClick={() => {
                setShowAddPremise(true);
                setShowEditPremise(false);
              }}
              style={{
                background: "#edf2f7",
                color: "#4a5568",
                padding: "10px 20px",
                borderRadius: "8px",
                border: "none",
                fontWeight: "600",
                cursor: "pointer",
                transition: "background 0.2s",
              }}
              onMouseOver={(e) => (e.target.style.background = "#e2e8f0")}
              onMouseOut={(e) => (e.target.style.background = "#edf2f7")}
            >
              + Új Helyiség
            </button>
          </div>

          <div
            className="premises-list tasks-list"
            style={{
              height: "calc(100vh - 320px)",
              minHeight: "400px",
              overflowY: "auto",
              paddingRight: "10px",
            }}
          >
            {!premises || premises.length === 0 ? (
              <p className="empty-state">Nincsenek helyiségek a rendszerben</p>
            ) : (
              premises.map((p) => (
                <div key={p.id} className="task-card modern-task-card">
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
                      {p.nameOrNumber}
                    </h4>
                    <div>
                      <span
                        className="status-badge"
                        style={{
                          backgroundColor:
                            String(p.type) === "1" ||
                            String(p.type) === "PrivateRoom"
                              ? "#ebf8ff"
                              : "#f0fff4",
                          color:
                            String(p.type) === "1" ||
                            String(p.type) === "PrivateRoom"
                              ? "#3182ce"
                              : "#38a169",
                          padding: "6px 12px",
                          fontSize: "0.85rem",
                          fontWeight: "700",
                        }}
                      >
                        {String(p.type) === "1" ||
                        String(p.type) === "PrivateRoom"
                          ? "Kollégiumi szoba"
                          : "Közösségi tér"}
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
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        color: "#a0aec0",
                        marginRight: "8px",
                        fontSize: "1.1rem",
                      }}
                    >
                      🏢
                    </span>
                    <span style={{ color: "#4a5568" }}>
                      <strong>Emelet:</strong>{" "}
                      {String(p.floor) === "0"
                        ? "Földszint"
                        : `${p.floor}. emelet`}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      alignItems: "center",
                      borderTop: "1px solid #edf2f7",
                      paddingTop: "15px",
                      marginTop: "15px",
                      gap: "10px",
                    }}
                  >
                    <button
                      className="btn-secondary"
                      style={{
                        padding: "6px 12px",
                        fontSize: "0.85rem",
                        borderRadius: "6px",
                        background: "#ebf8ff",
                        color: "#3182ce",
                        border: "1px solid #bee3f8",
                        fontWeight: "600",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                      onMouseOver={(e) =>
                        (e.target.style.background = "#bee3f8")
                      }
                      onMouseOut={(e) =>
                        (e.target.style.background = "#ebf8ff")
                      }
                      onClick={() => handleEditPremiseClick(p)}
                    >
                      Szerkesztés
                    </button>
                    <button
                      className="btn-secondary"
                      style={{
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
                      onClick={() => handleDeletePremise(p.id)}
                    >
                      Törlés
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Appliances Management */}
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
              justifyContent: "space-between",
              marginBottom: "15px",
              minHeight: "70px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <span style={{ fontSize: "1.8rem", marginRight: "10px" }}>
                🔌
              </span>
              <h2 className="modern-gradient-text" style={{ margin: 0 }}>
                Berendezések Leltára
              </h2>
            </div>
            <button
              className="btn-secondary"
              onClick={() => {
                setShowAddAppliance(true);
                setShowEditAppliance(false);
              }}
              style={{
                background: "#edf2f7",
                color: "#4a5568",
                padding: "10px 20px",
                borderRadius: "8px",
                border: "none",
                fontWeight: "600",
                cursor: "pointer",
                transition: "background 0.2s",
              }}
              onMouseOver={(e) => (e.target.style.background = "#e2e8f0")}
              onMouseOut={(e) => (e.target.style.background = "#edf2f7")}
            >
              + Új Berendezés
            </button>
          </div>

          <div
            className="appliances-list tasks-list"
            style={{
              height: "calc(100vh - 320px)",
              minHeight: "400px",
              overflowY: "auto",
              paddingRight: "10px",
            }}
          >
            {!appliances || appliances.length === 0 ? (
              <p className="empty-state">Nincsenek berendezések a leltárban</p>
            ) : (
              appliances.map((a) => {
                const premiseName = a.premiseId
                  ? premises.find((p) => String(p.id) === String(a.premiseId))
                      ?.nameOrNumber || `Ismeretlen (ID: ${a.premiseId})`
                  : "Raktáron (Nincs kiosztva)";
                return (
                  <div key={a.id} className="task-card modern-task-card">
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
                        {a.name}
                      </h4>
                    </div>

                    <div
                      style={{
                        backgroundColor: "#f7fafc",
                        padding: "12px",
                        borderRadius: "8px",
                        marginBottom: "15px",
                        border: "1px solid #e2e8f0",
                        display: "flex",
                        alignItems: "center",
                      }}
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
                        <strong>Elhelyezés:</strong> {premiseName}
                      </span>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "center",
                        borderTop: "1px solid #edf2f7",
                        paddingTop: "15px",
                        marginTop: "15px",
                        gap: "10px",
                      }}
                    >
                      <button
                        className="btn-secondary"
                        style={{
                          padding: "6px 12px",
                          fontSize: "0.85rem",
                          borderRadius: "6px",
                          background: "#ebf8ff",
                          color: "#3182ce",
                          border: "1px solid #bee3f8",
                          fontWeight: "600",
                          cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                        onMouseOver={(e) =>
                          (e.target.style.background = "#bee3f8")
                        }
                        onMouseOut={(e) =>
                          (e.target.style.background = "#ebf8ff")
                        }
                        onClick={() => handleEditApplianceClick(a)}
                      >
                        Módosítás
                      </button>
                      <button
                        className="btn-secondary"
                        style={{
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
                        onClick={() => handleDeleteAppliance(a.id)}
                      >
                        Selejtezés
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Specializations Management */}
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
              justifyContent: "space-between",
              marginBottom: "15px",
              minHeight: "70px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <span style={{ fontSize: "1.8rem", marginRight: "10px" }}>
                🛠️
              </span>
              <h2 className="modern-gradient-text" style={{ margin: 0 }}>
                Szakterületek (Kategóriák)
              </h2>
            </div>
            <button
              className="btn-secondary"
              onClick={() => setShowAddSpecialization(true)}
              style={{
                background: "#edf2f7",
                color: "#4a5568",
                padding: "10px 20px",
                borderRadius: "8px",
                border: "none",
                fontWeight: "600",
                cursor: "pointer",
                transition: "background 0.2s",
              }}
              onMouseOver={(e) => (e.target.style.background = "#e2e8f0")}
              onMouseOut={(e) => (e.target.style.background = "#edf2f7")}
            >
              + Új Szakterület
            </button>
          </div>

          <div
            className="specializations-list tasks-list"
            style={{
              height: "calc(100vh - 320px)",
              minHeight: "400px",
              overflowY: "auto",
              paddingRight: "10px",
            }}
          >
            {!specializations || specializations.length === 0 ? (
              <p className="empty-state">
                Nincsenek szakterületek a rendszerben
              </p>
            ) : (
              specializations.map((s) => (
                <div
                  key={s.id}
                  className="task-card modern-task-card"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <h4
                    style={{
                      margin: 0,
                      color: "#2d3748",
                      fontSize: "1.25rem",
                      fontWeight: "700",
                    }}
                  >
                    {s.name}
                  </h4>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      className="btn-secondary"
                      style={{
                        padding: "6px 12px",
                        fontSize: "0.85rem",
                        borderRadius: "6px",
                        background: "#ebf8ff",
                        color: "#3182ce",
                        border: "1px solid #bee3f8",
                        fontWeight: "600",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                      onMouseOver={(e) =>
                        (e.target.style.background = "#bee3f8")
                      }
                      onMouseOut={(e) =>
                        (e.target.style.background = "#ebf8ff")
                      }
                      onClick={() => handleUpdateSpecialization(s.id, s.name)}
                    >
                      Módosítás
                    </button>
                    <button
                      className="btn-secondary"
                      style={{
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
                      onClick={() => handleDeleteSpecialization(s.id)}
                    >
                      Törlés
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Tool Orders from Maintainers */}
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
              justifyContent: "space-between",
              marginBottom: "15px",
              minHeight: "70px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <span style={{ fontSize: "1.8rem", marginRight: "10px" }}>
                📦
              </span>
              <h2 className="modern-gradient-text" style={{ margin: 0 }}>
                Karbantartói Eszközigénylések
              </h2>
            </div>
          </div>
          <div
            className="modern-filter-controls"
            style={{
              marginBottom: "15px",
              minHeight: "65px",
            }}
          >
            <button
              className={`modern-filter-btn ${requestFilter === "all" ? "active" : ""}`}
              onClick={() => setRequestFilter("all")}
            >
              Összes
            </button>
            <button
              className={`modern-filter-btn ${
                requestFilter === "pending" ? "active" : ""
              }`}
              onClick={() => setRequestFilter("pending")}
            >
              Kiszállítás alatt
            </button>
            <button
              className={`modern-filter-btn ${
                requestFilter === "delivered" ? "active" : ""
              }`}
              onClick={() => setRequestFilter("delivered")}
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
            {filteredRequests.length === 0 ? (
              <p className="empty-state">Nincs megjeleníthető rendelés</p>
            ) : (
              filteredRequests.map((req) => {
                const associatedTask = tasks.find(
                  (t) => String(t.id) === String(req.taskId),
                );
                const assignedMaintainer = associatedTask
                  ? users.find(
                      (u) => String(u.id) === String(associatedTask.assignedTo),
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
                      <div style={{ display: "flex", alignItems: "center" }}>
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
                        <div style={{ display: "flex", alignItems: "center" }}>
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
                      }}
                    >
                      <small style={{ color: "#a0aec0", fontWeight: "500" }}>
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

        {/* All Faults / Tasks */}
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
              justifyContent: "space-between",
              marginBottom: "15px",
              minHeight: "70px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <span style={{ fontSize: "1.8rem", marginRight: "10px" }}>
                📋
              </span>
              <h2 className="modern-gradient-text" style={{ margin: 0 }}>
                Hibajelentések Felügyelete
              </h2>
            </div>
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
            {Object.entries(taskFilterLabels).map(([key, label]) => (
              <button
                key={key}
                className={`modern-filter-btn ${taskFilter === key ? "active" : ""}`}
                onClick={() => setTaskFilter(key)}
              >
                {label}
              </button>
            ))}
          </div>
          <div
            className="tasks-list tasks-list"
            style={{
              height: "calc(100vh - 320px)",
              minHeight: "400px",
              overflowY: "auto",
              paddingRight: "10px",
            }}
          >
            {filteredTasks.length === 0 ? (
              <p className="empty-state">Nincsenek hibajelentések</p>
            ) : (
              filteredTasks.map((task) => {
                const assignee = users.find(
                  (u) => String(u.id) === String(task.assignedTo),
                );
                const reporter = users.find(
                  (u) => String(u.id) === String(task.createdBy),
                );
                const statusDisplay = getStatusDisplay(task);
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

                      {assignee && (
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
                            <strong>Kiosztva:</strong> {assignee.name}
                          </span>
                        </div>
                      )}
                    </div>

                    {task._backendData?.feedbacks &&
                      task._backendData.feedbacks.length > 0 && (
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
                            Hallgató visszajelzése:
                          </strong>
                          {task._backendData.feedbacks.map((fb) => (
                            <div
                              key={fb.id}
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginTop: "5px",
                              }}
                            >
                              <p
                                style={{
                                  margin: "4px 0 0 0",
                                  fontSize: "0.9em",
                                  fontStyle: "italic",
                                  color: "#2d3748",
                                }}
                              >
                                "{fb.text || fb.message || fb.description}"
                              </p>
                              <button
                                className="btn-secondary"
                                style={{
                                  padding: "4px 10px",
                                  fontSize: "0.8rem",
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
                                onClick={() =>
                                  handleDeleteFeedback(fb.id, task.id)
                                }
                              >
                                Törlés
                              </button>
                            </div>
                          ))}
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
      </div>

      {/* Add User Modal */}
      {showAddUser && (
        <div className="modal-overlay" style={{ zIndex: 2000 }}>
          <div
            className="modal-content modern-card"
            style={{
              width: "90%",
              maxWidth: "500px",
              padding: "35px",
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
              padding: "30px",
              position: "relative",
            }}
          >
            <button
              className="close-modal-btn"
              onClick={() => setShowAddUser(false)}
              style={{
                position: "absolute",
                top: "15px",
                right: "15px",
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
                cursor: "pointer",
              }}
            >
              &times;
            </button>
            <h2
              className="modern-gradient-text"
              style={{ margin: "0 0 20px 0", flexShrink: 0 }}
            >
              Új Felhasználó
            </h2>
            <form
              onSubmit={handleAddUser}
              className="form modern-form"
              style={{ overflowY: "auto", paddingRight: "5px" }}
            >
              <div className="form-group">
                <label>Név</label>
                <input
                  type="text"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="Felhasználó teljes neve"
                  required
                  maxLength={35}
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
                  {newUserName.length} / 35
                </small>
              </div>
              <div className="form-group">
                <label>Felhasználónév</label>
                <input
                  type="text"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="pl. nev"
                  required
                  maxLength={20}
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
                  {newUserEmail.length} / 20
                </small>
              </div>
              <div className="form-group">
                <label>Jelszó</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    placeholder="Kezdeti jelszó"
                    required
                    maxLength={24}
                  />
                  <button
                    type="button"
                    className="toggle-password-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    title={
                      showPassword ? "Jelszó elrejtése" : "Jelszó mutatása"
                    }
                  >
                    {showPassword ? "Elrejt" : "Mutat"}
                  </button>
                </div>
                <small
                  style={{
                    display: "block",
                    textAlign: "right",
                    color: "#a0aec0",
                    fontSize: "0.8em",
                    marginTop: "5px",
                  }}
                >
                  {newUserPassword.length} / 24
                </small>
              </div>
              <div className="form-group">
                <label>Szerepkör</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                >
                  {Object.values(ROLES).map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>
              {newUserRole === ROLES.KARBANTARTAS && (
                <div className="form-group">
                  <label>Szakterületek (Több is választható)</label>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                      padding: "10px",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      maxHeight: "150px",
                      overflowY: "auto",
                    }}
                  >
                    {specializations.map((s) => (
                      <label
                        key={s.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          fontWeight: "normal",
                          cursor: "pointer",
                          fontSize: "0.95rem",
                          color: "#4a5568",
                        }}
                      >
                        <input
                          type="checkbox"
                          value={s.id}
                          checked={
                            Array.isArray(newUserSpecialization)
                              ? newUserSpecialization.includes(String(s.id))
                              : false
                          }
                          onChange={(e) => {
                            const idStr = String(s.id);
                            if (e.target.checked) {
                              setNewUserSpecialization((prev) =>
                                Array.isArray(prev)
                                  ? [...prev, idStr]
                                  : [idStr],
                              );
                            } else {
                              setNewUserSpecialization((prev) =>
                                Array.isArray(prev)
                                  ? prev.filter((item) => item !== idStr)
                                  : [],
                              );
                            }
                          }}
                          style={{ width: "auto", margin: 0 }}
                        />
                        {s.name}
                      </label>
                    ))}
                  </div>
                </div>
              )}
              {newUserRole === ROLES.EGYETEMISTA && (
                <div className="form-group">
                  <label>Kollégiumi Szoba (Helyiség)</label>
                  <select
                    value={newUserPremiseId}
                    onChange={(e) => setNewUserPremiseId(e.target.value)}
                    required
                  >
                    <option value="">-- Válassz szobát --</option>
                    {premises
                      .filter(
                        (p) =>
                          String(p.type) === "1" ||
                          String(p.type) === "PrivateRoom",
                      )
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nameOrNumber}
                        </option>
                      ))}
                  </select>
                </div>
              )}
              <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{
                    flex: 1,
                    margin: 0,
                    ...(!isAddUserValid
                      ? { opacity: 0.6, cursor: "not-allowed" }
                      : {}),
                  }}
                  disabled={!isAddUserValid}
                >
                  Létrehozás
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowAddUser(false)}
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
                    margin: 0,
                  }}
                  onMouseOver={(e) => (e.target.style.background = "#cbd5e0")}
                  onMouseOut={(e) => (e.target.style.background = "#e2e8f0")}
                >
                  Mégse
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditUser && (
        <div className="modal-overlay" style={{ zIndex: 2000 }}>
          <div
            className="modal-content modern-card"
            style={{
              width: "90%",
              maxWidth: "500px",
              padding: "35px",
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
              padding: "30px",
              position: "relative",
            }}
          >
            <button
              className="close-modal-btn"
              onClick={() => setShowEditUser(false)}
              style={{
                position: "absolute",
                top: "15px",
                right: "15px",
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
                cursor: "pointer",
              }}
            >
              &times;
            </button>
            <h2
              className="modern-gradient-text"
              style={{ margin: "0 0 20px 0", flexShrink: 0 }}
            >
              Felhasználó szerkesztése
            </h2>
            <form
              onSubmit={handleUpdateUser}
              className="form modern-form"
              style={{ overflowY: "auto", paddingRight: "5px" }}
            >
              <div className="form-group">
                <label>Név</label>
                <input
                  type="text"
                  value={editUserName}
                  onChange={(e) => setEditUserName(e.target.value)}
                  required
                  maxLength={35}
                />
              </div>
              <div className="form-group">
                <label>Felhasználónév</label>
                <input
                  type="text"
                  value={editUserEmail}
                  onChange={(e) => setEditUserEmail(e.target.value)}
                  placeholder="pl. nev (a @hibavonal.hu automatikus)"
                  required
                  maxLength={40}
                />
              </div>
              <div className="form-group">
                <label>Szerepkör</label>
                <select
                  value={editUserRole}
                  onChange={(e) => setEditUserRole(e.target.value)}
                >
                  {Object.values(ROLES).map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>
              {editUserRole === ROLES.KARBANTARTAS && (
                <div className="form-group">
                  <label>Szakterületek (Több is választható)</label>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                      padding: "10px",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      maxHeight: "150px",
                      overflowY: "auto",
                    }}
                  >
                    {specializations.map((s) => (
                      <label
                        key={s.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          fontWeight: "normal",
                          cursor: "pointer",
                          fontSize: "0.95rem",
                          color: "#4a5568",
                        }}
                      >
                        <input
                          type="checkbox"
                          value={s.id}
                          checked={editUserSpecializations.includes(
                            String(s.id),
                          )}
                          onChange={(e) => {
                            const idStr = String(s.id);
                            if (e.target.checked) {
                              setEditUserSpecializations((prev) => [
                                ...prev,
                                idStr,
                              ]);
                            } else {
                              setEditUserSpecializations((prev) =>
                                prev.filter((item) => item !== idStr),
                              );
                            }
                          }}
                          style={{ width: "auto", margin: 0 }}
                        />
                        {s.name}
                      </label>
                    ))}
                  </div>
                </div>
              )}
              {editUserRole === ROLES.EGYETEMISTA && (
                <div className="form-group">
                  <label>Kollégiumi Szoba (Helyiség)</label>
                  <select
                    value={editUserPremiseId}
                    onChange={(e) => setEditUserPremiseId(e.target.value)}
                    required
                  >
                    <option value="">-- Válassz szobát --</option>
                    {premises
                      .filter(
                        (p) =>
                          String(p.type) === "1" ||
                          String(p.type) === "PrivateRoom",
                      )
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nameOrNumber}
                        </option>
                      ))}
                  </select>
                </div>
              )}
              <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{
                    flex: 1,
                    margin: 0,
                    ...(!isUserEditChanged
                      ? { opacity: 0.6, cursor: "not-allowed" }
                      : {}),
                  }}
                  disabled={!isUserEditChanged}
                >
                  Mentés
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowEditUser(false)}
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
                    margin: 0,
                  }}
                  onMouseOver={(e) => (e.target.style.background = "#cbd5e0")}
                  onMouseOut={(e) => (e.target.style.background = "#e2e8f0")}
                >
                  Mégse
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Premise Modal */}
      {showAddPremise && (
        <div className="modal-overlay" style={{ zIndex: 2000 }}>
          <div
            className="modal-content modern-card"
            style={{
              width: "90%",
              maxWidth: "500px",
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
              padding: "30px",
              position: "relative",
            }}
          >
            <button
              className="close-modal-btn"
              onClick={() => setShowAddPremise(false)}
              style={{
                position: "absolute",
                top: "15px",
                right: "15px",
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
                cursor: "pointer",
              }}
            >
              &times;
            </button>
            <h2
              className="modern-gradient-text"
              style={{ margin: "0 0 20px 0", flexShrink: 0 }}
            >
              Új Helyiség
            </h2>
            <form
              onSubmit={handleAddPremise}
              className="form modern-form"
              style={{ overflowY: "auto", paddingRight: "5px" }}
            >
              <div className="form-group">
                <label>Név vagy Szám</label>
                <input
                  type="text"
                  value={newPremiseName}
                  onChange={(e) => setNewPremiseName(e.target.value)}
                  placeholder="pl. 101-es szoba, Mosókonyha"
                  required
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
                  {newPremiseName.length} / 30
                </small>
              </div>
              <div className="form-group">
                <label>Emelet</label>
                <input
                  type="number"
                  value={newPremiseFloor}
                  onChange={(e) => setNewPremiseFloor(e.target.value)}
                  min="0"
                  required
                />
              </div>
              <div className="form-group">
                <label>Típus</label>
                <select
                  value={newPremiseType}
                  onChange={(e) => setNewPremiseType(e.target.value)}
                >
                  <option value={0}>Közösségi tér</option>
                  <option value={1}>Kollégiumi szoba (Privát)</option>
                </select>
              </div>
              <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{
                    flex: 1,
                    margin: 0,
                    ...(!isAddPremiseValid
                      ? { opacity: 0.6, cursor: "not-allowed" }
                      : {}),
                  }}
                  disabled={!isAddPremiseValid}
                >
                  Létrehozás
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowAddPremise(false)}
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
                    margin: 0,
                  }}
                  onMouseOver={(e) => (e.target.style.background = "#cbd5e0")}
                  onMouseOut={(e) => (e.target.style.background = "#e2e8f0")}
                >
                  Mégse
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Premise Modal */}
      {showEditPremise && (
        <div className="modal-overlay" style={{ zIndex: 2000 }}>
          <div
            className="modal-content modern-card"
            style={{
              width: "90%",
              maxWidth: "500px",
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
              padding: "30px",
              position: "relative",
            }}
          >
            <button
              className="close-modal-btn"
              onClick={() => setShowEditPremise(false)}
              style={{
                position: "absolute",
                top: "15px",
                right: "15px",
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
                cursor: "pointer",
              }}
            >
              &times;
            </button>
            <h2
              className="modern-gradient-text"
              style={{ margin: "0 0 20px 0", flexShrink: 0 }}
            >
              Helyiség szerkesztése
            </h2>
            <form
              onSubmit={handleUpdatePremise}
              className="form modern-form"
              style={{ overflowY: "auto", paddingRight: "5px" }}
            >
              <div className="form-group">
                <label>Név vagy Szám</label>
                <input
                  type="text"
                  value={editPremiseName}
                  onChange={(e) => setEditPremiseName(e.target.value)}
                  required
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
                  {editPremiseName.length} / 30
                </small>
              </div>
              <div className="form-group">
                <label>Emelet</label>
                <input
                  type="number"
                  value={editPremiseFloor}
                  onChange={(e) => setEditPremiseFloor(e.target.value)}
                  min="0"
                  required
                />
              </div>
              <div className="form-group">
                <label>Típus</label>
                <select
                  value={editPremiseType}
                  onChange={(e) => setEditPremiseType(e.target.value)}
                >
                  <option value={0}>Közösségi tér</option>
                  <option value={1}>Kollégiumi szoba (Privát)</option>
                </select>
              </div>
              <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{
                    flex: 1,
                    margin: 0,
                    ...(!isPremiseEditChanged
                      ? { opacity: 0.6, cursor: "not-allowed" }
                      : {}),
                  }}
                  disabled={!isPremiseEditChanged}
                >
                  Mentés
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowEditPremise(false)}
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
                    margin: 0,
                  }}
                  onMouseOver={(e) => (e.target.style.background = "#cbd5e0")}
                  onMouseOut={(e) => (e.target.style.background = "#e2e8f0")}
                >
                  Mégse
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Appliance Modal */}
      {showAddAppliance && (
        <div className="modal-overlay" style={{ zIndex: 2000 }}>
          <div
            className="modal-content modern-card"
            style={{
              width: "90%",
              maxWidth: "500px",
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
              padding: "30px",
              position: "relative",
            }}
          >
            <button
              className="close-modal-btn"
              onClick={() => setShowAddAppliance(false)}
              style={{
                position: "absolute",
                top: "15px",
                right: "15px",
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
                cursor: "pointer",
              }}
            >
              &times;
            </button>
            <h2
              className="modern-gradient-text"
              style={{ margin: "0 0 20px 0", flexShrink: 0 }}
            >
              Új Berendezés
            </h2>
            <form
              onSubmit={handleAddAppliance}
              className="form modern-form"
              style={{ overflowY: "auto", paddingRight: "5px" }}
            >
              <div className="form-group">
                <label>Berendezés Neve</label>
                <input
                  type="text"
                  value={newApplianceName}
                  onChange={(e) => setNewApplianceName(e.target.value)}
                  placeholder="pl. Mosógép, 1-es Lift, TV"
                  required
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
                  {newApplianceName.length} / 30
                </small>
              </div>
              <div className="form-group">
                <label>Elhelyezés (Helyiség)</label>
                <select
                  value={newAppliancePremiseId}
                  onChange={(e) => setNewAppliancePremiseId(e.target.value)}
                  required
                >
                  <option value="">-- Válassz helyiséget --</option>
                  {premises.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nameOrNumber}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{
                    flex: 1,
                    margin: 0,
                    ...(!isAddApplianceValid
                      ? { opacity: 0.6, cursor: "not-allowed" }
                      : {}),
                  }}
                  disabled={!isAddApplianceValid}
                >
                  Létrehozás
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowAddAppliance(false)}
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
                    margin: 0,
                  }}
                  onMouseOver={(e) => (e.target.style.background = "#cbd5e0")}
                  onMouseOut={(e) => (e.target.style.background = "#e2e8f0")}
                >
                  Mégse
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Appliance Modal */}
      {showEditAppliance && (
        <div className="modal-overlay" style={{ zIndex: 2000 }}>
          <div
            className="modal-content modern-card"
            style={{
              width: "90%",
              maxWidth: "500px",
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
              padding: "30px",
              position: "relative",
            }}
          >
            <button
              className="close-modal-btn"
              onClick={() => setShowEditAppliance(false)}
              style={{
                position: "absolute",
                top: "15px",
                right: "15px",
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
                cursor: "pointer",
              }}
            >
              &times;
            </button>
            <h2
              className="modern-gradient-text"
              style={{ margin: "0 0 20px 0", flexShrink: 0 }}
            >
              Berendezés szerkesztése
            </h2>
            <form
              onSubmit={handleUpdateAppliance}
              className="form modern-form"
              style={{ overflowY: "auto", paddingRight: "5px" }}
            >
              <div className="form-group">
                <label>Berendezés Neve</label>
                <input
                  type="text"
                  value={editApplianceName}
                  onChange={(e) => setEditApplianceName(e.target.value)}
                  required
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
                  {editApplianceName.length} / 30
                </small>
              </div>
              <div className="form-group">
                <label>Elhelyezés (Helyiség)</label>
                <select
                  value={editAppliancePremiseId}
                  onChange={(e) => setEditAppliancePremiseId(e.target.value)}
                >
                  <option value="">-- Raktáron (Nincs kiosztva) --</option>
                  {premises.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nameOrNumber}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{
                    flex: 1,
                    margin: 0,
                    ...(!isApplianceEditChanged
                      ? { opacity: 0.6, cursor: "not-allowed" }
                      : {}),
                  }}
                  disabled={!isApplianceEditChanged}
                >
                  Mentés
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowEditAppliance(false)}
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
                    margin: 0,
                  }}
                  onMouseOver={(e) => (e.target.style.background = "#cbd5e0")}
                  onMouseOut={(e) => (e.target.style.background = "#e2e8f0")}
                >
                  Mégse
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Specialization Modal */}
      {showAddSpecialization && (
        <div className="modal-overlay" style={{ zIndex: 2000 }}>
          <div
            className="modal-content modern-card"
            style={{
              width: "90%",
              maxWidth: "500px",
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
              padding: "30px",
              position: "relative",
            }}
          >
            <button
              className="close-modal-btn"
              onClick={() => setShowAddSpecialization(false)}
              style={{
                position: "absolute",
                top: "15px",
                right: "15px",
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
                cursor: "pointer",
              }}
            >
              &times;
            </button>
            <h2
              className="modern-gradient-text"
              style={{ margin: "0 0 20px 0", flexShrink: 0 }}
            >
              Új Szakterület
            </h2>
            <form
              onSubmit={handleAddSpecialization}
              className="form modern-form"
              style={{ overflowY: "auto", paddingRight: "5px" }}
            >
              <div className="form-group">
                <label>Szakterület / Kategória Neve</label>
                <input
                  type="text"
                  value={newSpecializationName}
                  onChange={(e) => setNewSpecializationName(e.target.value)}
                  placeholder="pl. Informatika, Asztalos"
                  required
                />
              </div>
              <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{
                    flex: 1,
                    margin: 0,
                    ...(!isAddSpecializationValid
                      ? { opacity: 0.6, cursor: "not-allowed" }
                      : {}),
                  }}
                  disabled={!isAddSpecializationValid}
                >
                  Létrehozás
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowAddSpecialization(false)}
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
                    margin: 0,
                  }}
                  onMouseOver={(e) => (e.target.style.background = "#cbd5e0")}
                  onMouseOut={(e) => (e.target.style.background = "#e2e8f0")}
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

      {/* Egyedi Prompt Modal */}
      {promptModal.isOpen && (
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
            <div style={{ fontSize: "3rem", marginBottom: "15px" }}>✏️</div>
            <h3 style={{ margin: "0 0 15px 0", color: "#2d3748" }}>
              Adat megadása
            </h3>
            <p
              style={{
                color: "#4a5568",
                marginBottom: "15px",
                lineHeight: "1.5",
              }}
            >
              {promptModal.message}
            </p>
            <input
              type="text"
              value={promptInputValue}
              onChange={(e) => setPromptInputValue(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                marginBottom: "25px",
                borderRadius: "8px",
                border: "1px solid #cbd5e0",
                fontSize: "1rem",
              }}
              autoFocus
            />
            <div
              style={{ display: "flex", gap: "15px", justifyContent: "center" }}
            >
              <button
                className="btn-secondary"
                onClick={() =>
                  setPromptModal({ ...promptModal, isOpen: false })
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
                disabled={!isPromptValid}
                onClick={() => {
                  if (promptModal.onConfirm)
                    promptModal.onConfirm(promptInputValue);
                  setPromptModal({ ...promptModal, isOpen: false });
                }}
                style={{
                  padding: "12px 20px",
                  background: "#3182ce",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "700",
                  flex: 1,
                  margin: 0,
                  fontSize: "1rem",
                  ...(!isPromptValid
                    ? { opacity: 0.6, cursor: "not-allowed" }
                    : {}),
                }}
              >
                {promptModal.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Modal */}
      {statsModal.isOpen && (
        <div className="modal-overlay" style={{ zIndex: 2000 }}>
          <div
            className="modal-content modern-card"
            style={{
              width: "90%",
              maxWidth: "600px",
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
              padding: "35px",
              position: "relative",
            }}
          >
            <button
              className="close-modal-btn"
              onClick={() => setStatsModal({ isOpen: false, type: null })}
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
                cursor: "pointer",
              }}
            >
              &times;
            </button>
            {(() => {
              const { title, list, renderer } = renderStatsContent();
              return (
                <>
                  <div
                    style={{
                      marginBottom: "25px",
                      paddingRight: "40px",
                      minHeight: "40px",
                    }}
                  >
                    <h2 className="modern-gradient-text" style={{ margin: 0 }}>
                      {title}
                    </h2>
                  </div>
                  <div
                    className="tasks-list"
                    style={{
                      overflowY: "auto",
                      paddingRight: "10px",
                      flex: 1,
                      minHeight: 0,
                    }}
                  >
                    {list.length === 0 ? (
                      <p className="empty-state">Nincs megjeleníthető adat.</p>
                    ) : (
                      list.map(renderer)
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

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

export default AdministratorDashboard;
