import React, { createContext, useState, useContext, useEffect } from "react";

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
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [toolRequests, setToolRequests] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [equipmentOrders, setEquipmentOrders] = useState([]);

  // Initialize database from localStorage
  useEffect(() => {
    const savedUsers = localStorage.getItem("hibavonal_users");
    const savedToolRequests = localStorage.getItem("hibavonal_tool_requests");
    const savedTasks = localStorage.getItem("hibavonal_tasks");
    const savedEquipment = localStorage.getItem("hibavonal_equipment");
    const savedEquipmentOrders = localStorage.getItem(
      "hibavonal_equipment_orders",
    );

    if (savedUsers) setUsers(JSON.parse(savedUsers));
    if (savedToolRequests) setToolRequests(JSON.parse(savedToolRequests));
    if (savedTasks) setTasks(JSON.parse(savedTasks));
    if (savedEquipment) setEquipment(JSON.parse(savedEquipment));
    if (savedEquipmentOrders)
      setEquipmentOrders(JSON.parse(savedEquipmentOrders));

    // Check if user is already logged in
    const savedUser = localStorage.getItem("hibavonal_current_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
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
    return input.replace(/[^a-zA-Z0-9\s\-]/g, "").trim();
  };

  const register = (email, password, name, role, specialization = "") => {
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

    const newUser = {
      id: Date.now().toString(),
      email,
      password, // Note: In production, use bcrypt or similar
      name: name.trim(),
      role,
      specialization: role === ROLES.KARBANTARTAS ? specialization : "",
      createdAt: new Date().toISOString(),
    };

    setUsers([...users, newUser]);
    return newUser;
  };

  const login = (email, password) => {
    const foundUser = users.find(
      (u) => u.email === email && u.password === password,
    );
    if (!foundUser) {
      throw new Error("Invalid email or password");
    }

    localStorage.setItem("hibavonal_current_user", JSON.stringify(foundUser));
    setUser(foundUser);
    return foundUser;
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

  const assignTask = (taskId, assigneeId) => {
    if (!hasPermission("assign_tasks")) {
      throw new Error("Permission denied");
    }
    setTasks(
      tasks.map((t) =>
        t.id === taskId
          ? { ...t, assignedTo: assigneeId, status: "assigned" }
          : t,
      ),
    );
  };

  const updateTaskStatus = (taskId, isCompleted) => {
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
  };

  const createTask = (
    title,
    description,
    assignedTo = "",
    location,
    specialization,
  ) => {
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
    return newTask;
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
  const deleteTask = (taskId) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task && task.completed) {
      setTasks(tasks.filter((t) => t.id !== taskId));
    }
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
