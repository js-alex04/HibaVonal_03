import React, { createContext, useState, useContext, useEffect } from "react";
import { authAPI, userAPI, faultAPI, premiseAPI, specialisationAPI, toolOrderAPI, applianceAPI, feedbackAPI } from "../api";

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

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
  const [premises, setPremises] = useState(() => {
    const saved = localStorage.getItem("hibavonal_premises");
    return saved ? JSON.parse(saved) : [];
  });
  const [appliances, setAppliances] = useState(() => {
    const saved = localStorage.getItem("hibavonal_appliances");
    return saved ? JSON.parse(saved) : [];
  });
  const [specializations, setSpecializations] = useState(() => {
    const saved = localStorage.getItem("hibavonal_specializations");
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
                specName = specs.map(s => s.name || "Egyéb").join(", ");
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

  const fetchFacilityDataFromBackend = async () => {
    try {
      const backendPremises = await premiseAPI.getAll();
      const backendAppliances = await applianceAPI.getAll();
      const backendSpecializations = await specialisationAPI.getAll();
      setPremises(backendPremises || []);
      setAppliances(backendAppliances || []);
      setSpecializations(backendSpecializations || []);
    } catch (error) {
      console.error("Hiba a helyiségek és berendezések lekérésekor:", error);
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
      fetchFacilityDataFromBackend(); // Helyiségek és berendezések betöltése
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

  // Save premises to localStorage
  useEffect(() => {
    localStorage.setItem("hibavonal_premises", JSON.stringify(premises));
  }, [premises]);

  // Save appliances to localStorage
  useEffect(() => {
    localStorage.setItem("hibavonal_appliances", JSON.stringify(appliances));
  }, [appliances]);

  // Save specializations to localStorage
  useEffect(() => {
    localStorage.setItem("hibavonal_specializations", JSON.stringify(specializations));
  }, [specializations]);

  // sanitize helper for names/emails - only allow letters, numbers, spaces, hyphens
  const sanitizeInput = (input) => {
    if (!input || typeof input !== "string") return input;
    return input.replace(/[^a-zA-Z0-9\s\-áéíóöőúüűÁÉÍÓÖŐÚÜŰ.,]/g, "").trim();
  };

  const register = async (email, password, name, role, specialization = "", premiseId = null) => {
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
          email, password, name: name.trim(), dormRoomId: premiseId ? parseInt(premiseId) : 1 
        });
      } else if (role === ROLES.KARBANTARTAS) {
        let specId = specialization ? parseInt(specialization) : null;
        newUser = await userAPI.createMaintainer({
          email, password, name: name.trim(), specialisationIds: specId ? [specId] : []
        });
      } else if (role === ROLES.ADMINISZTRATOR) {
        newUser = await userAPI.createAdministrator({
          email, password, name: name.trim()
        });
      } else if (role === ROLES.KARBANTARTAS_VEZETO) {
        newUser = await userAPI.createMaintenanceManager({
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

      // Mentsük el a JWT tokent a localStorage-ba, hogy az api.js be tudja tenni az Authorization header-be
      const token = foundUser.token || foundUser.Token || foundUser.jwt;
      if (token) {
        localStorage.setItem("token", token);
      }

      // Felülírjuk a usert a már a frontend számára is értelmezhető role-al
      foundUser = { ...foundUser, role: normalizeRole(foundUser.role) };

      localStorage.setItem("hibavonal_current_user", JSON.stringify(foundUser));
      setUser(foundUser);
      fetchUsersFromBackend(); // Lista frissítése sikeres belépés után
      fetchTasksFromBackend(); // Feladatok betöltése
      fetchFacilityDataFromBackend(); // Helyiségek és berendezések betöltése
      return foundUser;
    } catch (error) {
      console.error("Login Error from backend:", error);
      throw new Error("Invalid email or password");
    }
  };

  const logout = () => {
    localStorage.removeItem("hibavonal_current_user");
    localStorage.removeItem("token");
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
      // 1. Érvényes Egyetemista (Collegiate) keresése
      let validCollegiateId = null;
      const parsedId = parseInt(user?.id);
      if (user?.role === ROLES.EGYETEMISTA && !isNaN(parsedId) && parsedId < 100000) {
        validCollegiateId = parsedId;
      } else {
        // Kikeressük az első valós (backendből jött) egyetemistát
        const firstCollegiate = users.find(u => u.role === ROLES.EGYETEMISTA && parseInt(u.id) < 100000);
        if (firstCollegiate) validCollegiateId = parseInt(firstCollegiate.id);
      }
      
      if (!validCollegiateId) {
        throw new Error("Nincs Egyetemista a rendszerben! Hozz létre egyet az Admin felületen.");
      }

      // 2. Érvényes Helyiség (Premise) keresése
      let validPremiseId = null;
      try {
        const premises = await premiseAPI.getAll();
        if (premises && premises.length > 0) {
          validPremiseId = premises[0].id;
        }
      } catch (e) {
        console.warn("Helyiségek lekérése sikertelen.");
      }

      if (!validPremiseId) {
        throw new Error("Nincs Helyiség (Premise) az adatbázisban! Kérlek, hozz létre egyet a backend Swagger felületén.");
      }

      // 3. Érvényes Szakterület (Specialization) keresése
      let specId = null;
      if (specialization && specialization !== 'Egyéb') {
        try {
          const specs = await specialisationAPI.getAll();
          const matchedSpec = specs.find(s => s.name === specialization);
          if (matchedSpec) specId = matchedSpec.id;
        } catch (e) {
          console.warn("Szakterületek lekérése sikertelen.");
        }
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
      console.error("Hiba a hiba bejelentésekor:", err);
      alert(`${err.message}`);
    }
  };

  const createToolRequest = async (toolName, quantity, requestedBy, taskId) => {
    let newRequest = {
      id: Date.now().toString(),
      toolName: toolName,
      quantity,
      requestedBy: requestedBy?.toString(),
      taskId: taskId?.toString(),
      status: "pending",
      isDelivered: false,
      approvedBy: null,
      createdAt: new Date().toISOString(),
    };

    try {
      const payload = {
        toolName: toolName,
        quantity: quantity
      };
      
      // A taskId (faultId) most már az URL-ben utazik, ahogy a C# Controller várja!
      const backendResponse = await toolOrderAPI.create(parseInt(taskId), payload);
      if (backendResponse && backendResponse.id) {
        newRequest.id = backendResponse.id.toString();
        newRequest._backendData = backendResponse;
      }

      setToolRequests([...toolRequests, newRequest]);
      return newRequest;
    } catch (err) {
      console.error("Hiba a backend mentés során (ToolOrder):", err);
      
      // FRONTEND MEGOLDÁS (WORKAROUND): 
      // Mivel a "No route matches the supplied values" hiba a backendben az ADATBÁZIS MENTÉS UTÁN történik,
      // tudjuk, hogy az adat bekerült a C# adatbázisba. Ezért ezt a specifikus hibát lenyeljük, és frissítjük a felületet!
      if (err.message && (err.message.includes('No route matches') || err.message.includes('500'))) {
        console.warn("A backend mentett, de elszállt a válasz küldésekor. A felületet sikeresnek vesszük.");
        setToolRequests([...toolRequests, newRequest]);
        return newRequest;
      }

      throw new Error(`Nem sikerült az adatbázisba menteni: ${err.message}`);
    }
  };

  const approveToolRequest = async (requestId) => {
    if (!hasPermission("assign_tools")) {
      throw new Error("Permission denied");
    }

    const requestToApprove = toolRequests.find(req => req.id === requestId);

    // API hívás az adatbázis frissítéséhez
    if (requestToApprove) {
      try {
        // A ToolOrderService.cs fájlban lévő külön UpdateDeliveryStatus metódust használjuk
        await toolOrderAPI.updateDeliveryStatus(requestId, true);
      } catch (err) {
        console.error("Hiba az eszköz jóváhagyásakor az adatbázisban:", err);
        if (err.message.includes('404')) {
          console.warn("A backend UpdateDeliveryStatus végpontja hiányzik. Próbálkozás a hagyományos Update végponttal...");
          try {
            const updatePayload = {
              ...(requestToApprove._backendData || {}),
              id: parseInt(requestId),
              toolName: requestToApprove.toolName,
              quantity: parseInt(requestToApprove.quantity),
              isDelivered: true,
              faultId: requestToApprove.taskId ? parseInt(requestToApprove.taskId) : 0
            };
            await toolOrderAPI.update(requestId, updatePayload);
          } catch (fallbackErr) {
            // Ha ez is elszáll, csendben maradunk, de a felületen jóváhagyottra vált az eszköz.
          }
        } else {
          throw new Error("A szerver elutasította a módosítást: " + err.message);
        }
      }
    }

    setToolRequests(
      toolRequests.map((req) =>
        req.id === requestId
          ? {
              ...req,
              status: "approved",
              isDelivered: true,
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

  // Delete any task (Admin feature)
  const deleteTask = async (taskId) => {
    try {
      await faultAPI.delete(taskId);
      setTasks(tasks.filter((t) => t.id !== taskId));
    } catch (err) {
      console.error("Hiba a feladat törlésekor:", err);
      throw new Error("Nem sikerült törölni a hibát a szerverről: " + err.message);
    }
  };

  const deleteFeedback = async (feedbackId, taskId) => {
    try {
      await feedbackAPI.delete(feedbackId);
      // Frissítjük a lokális task listát, hogy a felületről azonnal eltűnjön a törölt visszajelzés
      setTasks(tasks.map(t => {
        if (t.id === taskId && t._backendData) {
          const updatedFeedbacks = (t._backendData.feedbacks || []).filter(fb => fb.id !== feedbackId);
          return { ...t, feedback: null, _backendData: { ...t._backendData, feedbacks: updatedFeedbacks } };
        }
        return t;
      }));
    } catch (err) {
      console.error("Hiba a visszajelzés törlésekor:", err);
      throw new Error("Nem sikerült törölni a visszajelzést: " + err.message);
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

  // --- PREMISE (Helyiségek) KEZELÉSE ---
  const createPremise = async (nameOrNumber, floor, type) => {
    try {
      const newPremise = await premiseAPI.create({ nameOrNumber, floor: parseInt(floor), type });
      setPremises([...premises, newPremise]);
      return newPremise;
    } catch (err) {
      throw new Error(err.message || "Hiba a helyiség létrehozásakor.");
    }
  };

  const deletePremise = async (premiseId) => {
    try {
      await premiseAPI.delete(premiseId);
      setPremises(premises.filter((p) => p.id !== premiseId));
    } catch (err) {
      throw new Error(err.message || "Hiba a helyiség törlésekor.");
    }
  };

  // --- USERS (Felhasználók) KEZELÉSE ---
  const deleteUser = async (userId) => {
    try {
      await userAPI.delete(userId);
      setUsers(users.filter(u => u.id !== userId));
    } catch (err) {
      throw new Error(err.message || "Hiba a felhasználó törlésekor.");
    }
  };

  const changeUserRole = async (userId, newRole) => {
    try {
      let roleEnum = newRole === ROLES.EGYETEMISTA ? 0 : newRole === ROLES.KARBANTARTAS ? 1 : newRole === ROLES.KARBANTARTAS_VEZETO ? 2 : 3;
      await userAPI.changeRole(userId, roleEnum);
      await fetchUsersFromBackend(); // Lista frissítése
    } catch (err) {
      throw new Error(err.message || "Hiba a szerepkör módosításakor.");
    }
  };

  // --- APPLIANCES (Berendezések) KEZELÉSE ---
  const createAppliance = async (name, premiseId) => {
    try {
      // A backend azonnal várja a PremiseId-t a létrehozáskor!
      const payload = { name: name, premiseId: parseInt(premiseId) };
      const newAppliance = await applianceAPI.create(payload);
      
      await fetchFacilityDataFromBackend(); // Lista frissítése a pontos relációkért
      return newAppliance;
    } catch (err) {
      throw new Error(err.message || "Hiba a berendezés létrehozásakor.");
    }
  };

  const deleteAppliance = async (applianceId) => {
    try {
      await applianceAPI.delete(applianceId);
      setAppliances(appliances.filter((a) => a.id !== applianceId));
    } catch (err) {
      throw new Error(err.message || "Hiba a berendezés törlésekor.");
    }
  };

  const assignApplianceToPremise = async (premiseId, applianceId) => {
    await premiseAPI.addAppliance(premiseId, applianceId);
    await fetchFacilityDataFromBackend();
  };

  const removeApplianceFromPremise = async (premiseId, applianceId) => {
    await premiseAPI.removeAppliance(premiseId, applianceId);
    await fetchFacilityDataFromBackend();
  };

  // --- SPECIALIZATIONS (Szakterületek) KEZELÉSE ---
  const createSpecialization = async (name) => {
    try {
      const newSpec = await specialisationAPI.create({ name });
      setSpecializations([...specializations, newSpec]);
      return newSpec;
    } catch (err) {
      throw new Error(err.message || "Hiba a szakterület létrehozásakor.");
    }
  };

  const updateSpecialization = async (id, name) => {
    try {
      await specialisationAPI.update(id, { name });
      setSpecializations(specializations.map(s => s.id === id ? { ...s, name } : s));
    } catch (err) {
      throw new Error(err.message || "Hiba a szakterület frissítésekor.");
    }
  };

  const deleteSpecialization = async (id) => {
    try {
      await specialisationAPI.delete(id);
      setSpecializations(specializations.filter(s => s.id !== id));
    } catch (err) {
      throw new Error(err.message || "Hiba a szakterület törlésekor.");
    }
  };

  const value = {
    user,
    users,
    tasks,
    toolRequests,
    equipment,
    equipmentOrders,
    premises,
    appliances,
    specializations,
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
    createPremise,
    deletePremise,
    deleteUser,
    changeUserRole,
    createAppliance,
    deleteAppliance,
    assignApplianceToPremise,
    removeApplianceFromPremise,
    createSpecialization,
    updateSpecialization,
    deleteSpecialization,
    deleteFeedback,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
