import React, { createContext, useState, useContext, useEffect } from "react";
import { authAPI, userAPI, faultAPI, premiseAPI, specialisationAPI } from "../api";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

const ROLES = {
  EGYETEMISTA: "Egyetemista",
  KARBANTARTAS: "Karbantartó",
  KARBANTARTAS_VEZETO: "Karbantartási vezető",
  ADMINISZTRATOR: "Adminisztrátor",
};

const ROLE_PERMISSIONS = {
  [ROLES.EGYETEMISTA]: ["view_tasks", "submit_requests"],
  [ROLES.KARBANTARTAS]: ["view_tasks", "request_tools", "submit_work_logs"],
  [ROLES.KARBANTARTAS_VEZETO]: [
    "view_tasks",
    "request_tools",
    "manage_tool_requests",
    "assign_tools",
    "assign_tasks",
    "view_workers",
    "view_reports",
  ],
  [ROLES.ADMINISZTRATOR]: [
    "view_tasks",
    "request_tools",
    "manage_tool_requests",
    "assign_tools",
    "assign_tasks",
    "view_workers",
    "view_reports",
    "manage_users",
    "manage_roles",
    "system_settings",
    "view_all_data",
  ],
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("hibavonal_current_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem("hibavonal_users");
    return saved ? JSON.parse(saved) : [];
  });
  const [toolRequests, setToolRequests] = useState(() => {
    const saved = localStorage.getItem("hibavonal_tool_requests");
    return saved ? JSON.parse(saved) : [];
  });
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem("hibavonal_tasks");
    return saved ? JSON.parse(saved) : [];
  });
  const [equipment, setEquipment] = useState(() => {
    const saved = localStorage.getItem("hibavonal_equipment");
    return saved ? JSON.parse(saved) : [];
  });
  const [equipmentOrders, setEquipmentOrders] = useState(() => {
    const saved = localStorage.getItem("hibavonal_equipment_orders");
    return saved ? JSON.parse(saved) : [];
  });

  // Szerepkör normalizáló (kihelyezve, hogy a listázásnál is használhassuk)
  const normalizeRole = (role) => {
    // Kezeljük a számokat (enum) és pontosan a C# által küldött Enum neveket is
    if (role === 0 || role === "Collegiate" || role === "Egyetemista") return ROLES.EGYETEMISTA;
    if (role === 1 || role === "Maintainer" || role === "Karbantartó") return ROLES.KARBANTARTAS;
    if (role === 2 || role === "Administrator" || role === "Adminisztrátor") return ROLES.ADMINISZTRATOR;
    if (role === 3 || role === "MaintenanceManager" || role === "Karbantartási vezető") return ROLES.KARBANTARTAS_VEZETO;
    
    console.warn("Ismeretlen szerepkör érkezett a backendtől:", role);
    return role;
  };

  const fetchUsersFromBackend = async () => {
    try {
      const backendUsers = await userAPI.getAll();
      const normalizedUsers = await Promise.all(
        backendUsers.map(async (u) => {
          const role = normalizeRole(u.role);
          let specName = u.specialization || "";

          // Ha karbantartó, lekérdezzük a pontos szakterületét a szerverről
          if (role === ROLES.KARBANTARTAS && !specName) {
            try {
              const specs = await specialisationAPI.getByMaintainerId(u.id);
              if (specs && specs.length > 0) {
                specName = specs.map((s) => {
                  if (s.id === 1 || s.specialisationId === 1) return "Vízvezeték-szerelő";
                  if (s.id === 2 || s.specialisationId === 2) return "Villanyszerelő";
                  if (s.id === 3 || s.specialisationId === 3) return "Asztalos";
                  if (s.id === 4 || s.specialisationId === 4) return "Lakatos";
                  if (s.id === 5 || s.specialisationId === 5) return "Informatikus";
                  return s.name || "Egyéb";
                }).join(", ");
              } else {
                specName = "Általános";
              }
            } catch (e) {
              specName = "Általános";
            }
          }

          return {
            ...u,
            id: u.id.toString(),
            role: role,
            specialization: specName,
          };
        })
      );
      setUsers(normalizedUsers);
    } catch (error) {
      console.error("Hiba a felhasználók lekérésekor:", error);
    }
  };

  const fetchTasksFromBackend = async () => {
    try {
      const backendFaults = await faultAPI.getAll();
      const normalizedTasks = backendFaults.map((f) => {
        let specName = 'Egyéb';
        if (f.specializationId === 1) specName = 'Vízvezeték-szerelő';
        else if (f.specializationId === 2) specName = 'Villanyszerelő';
        else if (f.specializationId === 3) specName = 'Asztalos';
        else if (f.specializationId === 4) specName = 'Lakatos';
        else if (f.specializationId === 5) specName = 'Informatikus';

        const isCompleted = f.status === 3 || f.status === 4 || f.status === 'Repaired' || f.status === 'Unrepairable';
        const feedbackObj = f.feedbacks && f.feedbacks.length > 0 ? f.feedbacks[0] : null;

        return {
          id: f.id.toString(),
          title: f.description ? f.description.substring(0, 30) + (f.description.length > 30 ? "..." : "") : "Névtelen hiba",
          description: f.description,
          assignedTo: f.assignedMaintenanceId ? f.assignedMaintenanceId.toString() : "",
          createdBy: f.collegiateId ? f.collegiateId.toString() : "",
          status: (f.status === 0 || f.status === 'Pending') ? "pending" : (f.status === 1 || f.status === 2 || f.status === 'InProgress' || f.status === 'AwaitingParts') ? "in_progress" : "completed",
          completed: isCompleted,
          completedAt: isCompleted ? f.date : null,
          createdAt: f.date,
          location: f.premiseId ? `Helyiség #${f.premiseId}` : "",
          specialization: specName,
          feedback: feedbackObj ? (feedbackObj.text || feedbackObj.description || feedbackObj.message || "Értékelve") : null,
          _backendData: f
        };
      });
      setTasks(normalizedTasks);
    } catch (error) {
      console.error("Hiba a feladatok lekérésekor:", error);
    }
  };

  // Initialize database from localStorage
  useEffect(() => {
    // Mivel az állapotok most már rögtön inicializáláskor (lazy init) betöltődnek a localStorage-ból,
    // nem fogják felülírni az adatokat üres tömbbel (ami az eltűnést okozta) oldalfrissítéskor.
    // Ha van bejelentkezett felhasználó, csak szinkronizáljuk a friss adatokat a backendről:
    if (user) {
      fetchUsersFromBackend(); // Userek betöltése backendről automatikusan
      fetchTasksFromBackend(); // Feladatok betöltése backendről automatikusan
    }
  }, []);

  // Save users to localStorage
  useEffect(() => {
    localStorage.setItem("hibavonal_users", JSON.stringify(users));
  }, [users]);

  // Save tool requests to localStorage
  useEffect(() => {
    localStorage.setItem(
      "hibavonal_tool_requests",
      JSON.stringify(toolRequests),
    );
  }, [toolRequests]);

  // Save tasks to localStorage
  useEffect(() => {
    localStorage.setItem("hibavonal_tasks", JSON.stringify(tasks));
  }, [tasks]);

  // Save equipment to localStorage
  useEffect(() => {
    localStorage.setItem("hibavonal_equipment", JSON.stringify(equipment));
  }, [equipment]);

  // Save equipment orders to localStorage
  useEffect(() => {
    localStorage.setItem(
      "hibavonal_equipment_orders",
      JSON.stringify(equipmentOrders),
    );
  }, [equipmentOrders]);

  // sanitize helper for names/emails - only allow letters, numbers, spaces, hyphens
  const sanitizeInput = (input) => {
    if (!input || typeof input !== "string") return input;
    return input.replace(/[^a-zA-Z0-9\s\-áéíóöőúüűÁÉÍÓÖŐÚÜŰ.,]/g, "").trim();
  };

  const register = async (email, password, name, role, specialization = "") => {
    // Only sanitize name and specialization (Login.js already sanitizes email)
    name = sanitizeInput(name);
    specialization = sanitizeInput(specialization);

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Invalid email format");
    }

    // Validate password length
    if (!password || password.length < 4) {
      throw new Error("Password must be at least 4 characters long");
    }

    // Validate name has at least one alphanumeric character and length
    if (!name || name.trim().length < 2 || !/[a-zA-Z0-9]/.test(name)) {
      throw new Error(
        "Name must be at least 2 characters long and contain letters or numbers",
      );
    }

    const existingUser = users.find((u) => u.email === email);
    if (existingUser) {
      throw new Error("User already exists");
    }

    try {
      let newUser;
      if (role === ROLES.EGYETEMISTA) {
        newUser = await userAPI.createCollegiate({
          email, password, name: name.trim(), dormRoomId: 1 // Alapértelmezett szoba (Helyiség) a demóhoz
        });
      } else if (role === ROLES.KARBANTARTAS) {
        let specId = null;
        if (specialization === 'Vízvezeték-szerelő') specId = 1;
        else if (specialization === 'Villanyszerelő') specId = 2;
        else if (specialization === 'Asztalos') specId = 3;
        else if (specialization === 'Lakatos') specId = 4;
        else if (specialization === 'Informatikus') specId = 5;

        newUser = await userAPI.createMaintainer({
          email, password, name: name.trim(), specialisationIds: specId ? [specId] : [] // A backend listát vár
        });
      } else {
        const backendRole = role === ROLES.ADMINISZTRATOR ? 'Administrator' : 'MaintenanceManager';
        newUser = await userAPI.createManagementAdmin(backendRole, {
          email, password, name: name.trim()
        });
      }

      await fetchUsersFromBackend(); // Újratöltjük a listát a mentés után
      return newUser;
    } catch (err) {
      console.error("Hiba a regisztráció során:", err);
      throw new Error(err.message || "Hiba történt a regisztráció során a szerveren.");
    }
  };

  const login = async (email, password) => {
    try {
      let foundUser = await authAPI.login(email, password);

      // Felülírjuk a usert a már a frontend számára is értelmezhető role-al
      foundUser = { ...foundUser, role: normalizeRole(foundUser.role) };

      localStorage.setItem("hibavonal_current_user", JSON.stringify(foundUser));
      setUser(foundUser);
      fetchUsersFromBackend(); // Lista frissítése sikeres belépés után
      fetchTasksFromBackend(); // Feladatok betöltése
      return foundUser;
    } catch (error) {
      console.error("Login Error from backend:", error);
      throw new Error("Invalid email or password");
    }
  };

  const logout = () => {
    localStorage.removeItem("hibavonal_current_user");
    setUser(null);
  };

  const hasPermission = (permission) => {
    if (!user) return false;
    const userPermissions = ROLE_PERMISSIONS[user.role] || [];
    return userPermissions.includes(permission);
  };

  const assignTask = async (taskId, assigneeId) => {
    if (!hasPermission("assign_tasks")) {
      throw new Error("Permission denied");
    }

    try {
      // Megkeressük a feladatot a helyi state-ben
      const task = tasks.find((t) => t.id === taskId);

      // Ha backendből jött, frissítjük a C# API-n is
      if (task && task._backendData) {
        if (assigneeId) {
          await faultAPI.assignMaintainer(taskId, assigneeId);
        }
      }

      // UI frissítése
      setTasks(
        tasks.map((t) =>
          t.id === taskId
            ? { ...t, assignedTo: assigneeId.toString(), status: "in_progress" }
            : t,
        ),
      );
    } catch (err) {
      console.error("Hiba a feladat hozzárendelésekor:", err);
      alert("Hiba történt a karbantartó mentése során a szerveren: " + err.message);
    }
  };

  const updateTaskStatus = async (taskId, isCompleted) => {
    try {
      const task = tasks.find((t) => t.id === taskId);

      if (task && task._backendData) {
        // C# Enum stringként (JsonStringEnumConverter miatt ezt várja a backend)
        const newStatus = isCompleted ? "Repaired" : "InProgress";
        await faultAPI.updateStatus(taskId, { status: newStatus });
      }

      setTasks(
        tasks.map((t) =>
          t.id === taskId
            ? {
                ...t,
                completed: isCompleted,
                status: isCompleted ? "completed" : "in_progress",
                completedAt: isCompleted ? new Date().toISOString() : null,
              }
            : t,
        ),
      );
    } catch (err) {
      alert("Hiba történt a státusz mentésekor: " + err.message);
      console.error("Hiba a feladat státuszának frissítésekor:", err);
    }
  };

  const createTask = async (
    title,
    description,
    assignedTo = "",
    location,
    specialization,
  ) => {
    try {
      let specId = null;
      if (specialization === 'Vízvezeték-szerelő') specId = 1;
      else if (specialization === 'Villanyszerelő') specId = 2;
      else if (specialization === 'Asztalos') specId = 3;
      else if (specialization === 'Lakatos') specId = 4;
      else if (specialization === 'Informatikus') specId = 5;

      // 404 Hiba megelőzése: Csak létező Egyetemista (Collegiate) ID-t küldhetünk be!
      let validCollegiateId = 1;
      const parsedId = parseInt(user?.id);
      if (user?.role === ROLES.EGYETEMISTA && !isNaN(parsedId) && parsedId < 100000) {
        validCollegiateId = parsedId;
      } else {
        // Kikeressük az első valós (backendből jött) egyetemistát
        const firstCollegiate = users.find(u => u.role === ROLES.EGYETEMISTA && parseInt(u.id) < 100000);
        if (firstCollegiate) validCollegiateId = parseInt(firstCollegiate.id);
      }
      
      let validPremiseId = 1;
      try {
        const premises = await premiseAPI.getAll();
        if (premises && premises.length > 0) {
          validPremiseId = premises[0].id;
        }
      } catch (e) {
        console.warn("Helyiségek lekérése sikertelen, marad az 1-es ID");
      }

      const newFault = {
        description: title + (description ? " - " + description : ""),
        date: new Date().toISOString(),
        collegiateId: validCollegiateId, 
        premiseId: validPremiseId,
        specializationId: specId,
        status: 0, // Visszaállítva számra (0 = Pending), ez a legbiztosabb a C# Enum-oknál
        attachment: "nincs_kep.jpg"
      };

      await faultAPI.create(validCollegiateId, newFault);
      await fetchTasksFromBackend(); // Újratöltjük a C# szerverről, hogy meglegyen a valódi ID-ja!
    } catch (err) {
      console.error("Hiba a backend mentés során, fallback helyi state-be:", err);
      alert(`Hiba a szerverre mentés során: ${err.message}`);
      const newTask = {
        id: Date.now().toString(),
        title: sanitizeInput(title),
        description: sanitizeInput(description),
        location: sanitizeInput(location),
        specialization: sanitizeInput(specialization),
        assignedTo: assignedTo || "",
        createdBy: user?.id || "",
        status: "pending",
        createdAt: new Date().toISOString(),
      };
      setTasks([...tasks, newTask]);
    }
  };

  const createToolRequest = (toolName, quantity, reason, requestedBy) => {
    const newRequest = {
      id: Date.now().toString(),
      toolName,
      quantity,
      reason,
      requestedBy,
      status: "pending",
      approvedBy: null,
      createdAt: new Date().toISOString(),
    };

    setToolRequests([...toolRequests, newRequest]);
    return newRequest;
  };

  const approveToolRequest = (requestId) => {
    if (!hasPermission("assign_tools")) {
      throw new Error("Permission denied");
    }

    const requestToApprove = toolRequests.find(req => req.id === requestId);

    setToolRequests(
      toolRequests.map((req) =>
        req.id === requestId
          ? {
              ...req,
              status: "approved",
              approvedBy: user.id,
              approvedAt: new Date().toISOString(),
            }
          : req,
      ),
    );

    // Készlet automatikus csökkentése a jóváhagyáskor
    if (requestToApprove) {
      setEquipment(prevEquipment => 
        prevEquipment.map(eq => 
          eq.name === requestToApprove.toolName
            ? { ...eq, quantity: Math.max(0, eq.quantity - requestToApprove.quantity) }
            : eq
        )
      );
    }
  };

  const rejectToolRequest = (requestId) => {
    if (!hasPermission("assign_tools")) {
      throw new Error("Permission denied");
    }

    setToolRequests(
      toolRequests.map((req) =>
        req.id === requestId
          ? {
              ...req,
              status: "rejected",
              approvedBy: user.id,
              rejectedAt: new Date().toISOString(),
            }
          : req,
      ),
    );
  };

  // Equipment Management
  const addEquipment = (name, quantity, minQuantity) => {
    const newEquipment = {
      id: Date.now().toString(),
      name: sanitizeInput(name),
      quantity: parseInt(quantity),
      minQuantity: parseInt(minQuantity) || 5,
      createdAt: new Date().toISOString(),
    };
    setEquipment([...equipment, newEquipment]);
    return newEquipment;
  };

  const updateEquipmentQuantity = (equipmentId, quantity) => {
    setEquipment(
      equipment.map((eq) =>
        eq.id === equipmentId ? { ...eq, quantity: parseInt(quantity) } : eq,
      ),
    );
  };

  const deleteEquipment = (equipmentId) => {
    setEquipment(equipment.filter((eq) => eq.id !== equipmentId));
  };

  const getLowStockEquipment = () => {
    return equipment.filter((eq) => eq.quantity <= eq.minQuantity);
  };

  // Equipment Orders (from manager to admin)
  const createEquipmentOrder = (equipmentName, quantity, reason) => {
    const newOrder = {
      id: Date.now().toString(),
      equipmentName: sanitizeInput(equipmentName),
      quantity: parseInt(quantity),
      reason: sanitizeInput(reason),
      requestedBy: user.id,
      requestedByName: user.name,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    setEquipmentOrders([...equipmentOrders, newOrder]);
    return newOrder;
  };

  const approveEquipmentOrder = (orderId) => {
    const orderToApprove = equipmentOrders.find(o => o.id === orderId);

    setEquipmentOrders(
      equipmentOrders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: "approved",
              approvedBy: user.id,
              approvedAt: new Date().toISOString(),
            }
          : order,
      ),
    );

    // Készlet automatikus növelése a jóváhagyáskor (Kizárólag Frontend logika)
    if (orderToApprove) {
      setEquipment(prevEquipment => {
        const existingEq = prevEquipment.find(e => e.name.toLowerCase() === orderToApprove.equipmentName.toLowerCase());
        if (existingEq) {
          // Ha az eszköz már létezik, növeljük a darabszámát a rendelt mennyiséggel
          return prevEquipment.map(e => 
            e.id === existingEq.id ? { ...e, quantity: e.quantity + orderToApprove.quantity } : e
          );
        } else {
          // Ha teljesen új eszközről van szó, felvesszük a leltárba 5-ös alapértelmezett riasztási szinttel
          const newEq = {
            id: Date.now().toString(),
            name: orderToApprove.equipmentName,
            quantity: orderToApprove.quantity,
            minQuantity: 5,
            createdAt: new Date().toISOString()
          };
          return [...prevEquipment, newEq];
        }
      });
    }
  };

  const rejectEquipmentOrder = (orderId) => {
    setEquipmentOrders(
      equipmentOrders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: "rejected",
              approvedBy: user.id,
              rejectedAt: new Date().toISOString(),
            }
          : order,
      ),
    );
  };

  // Delete completed task
  const deleteTask = async (taskId) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task && task.completed) {
      try {
        await faultAPI.delete(taskId);
        setTasks(tasks.filter((t) => t.id !== taskId));
      } catch (err) {
        console.error("Hiba a feladat törlésekor:", err);
        alert("Nem sikerült törölni a hibát a szerverről!");
      }
    }
  };

  const addFeedback = async (taskId, feedbackText) => {
    try {
      // Küldjük a backendnek (több property-vel is próbálkozunk, a biztonság kedvéért)
      await faultAPI.addFeedback(taskId, { text: feedbackText, description: feedbackText, message: feedbackText });
    } catch (err) {
      console.error("Hiba a visszajelzés küldésekor (szerver):", err);
    }
    
    setTasks(
      tasks.map((t) =>
        t.id === taskId ? { ...t, feedback: feedbackText } : t
      )
    );
  };

  const value = {
    user,
    users,
    tasks,
    toolRequests,
    equipment,
    equipmentOrders,
    register,
    login,
    logout,
    hasPermission,
    createTask,
    assignTask,
    updateTaskStatus,
    deleteTask,
    addFeedback,
    createToolRequest,
    approveToolRequest,
    rejectToolRequest,
    addEquipment,
    updateEquipmentQuantity,
    deleteEquipment,
    getLowStockEquipment,
    createEquipmentOrder,
    approveEquipmentOrder,
    rejectEquipmentOrder,
    ROLES,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
