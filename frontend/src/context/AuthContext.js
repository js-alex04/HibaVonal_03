import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

const ROLES = {
  EGYETEMISTA: 'Egyetemista',
  KARBANTARTAS: 'Karbantartó',
  KARBANTARTAS_VEZETO: 'Karbantartási vezető',
  ADMINISZTRATOR: 'Adminisztrátor'
};

const ROLE_PERMISSIONS = {
  [ROLES.EGYETEMISTA]: ['view_tasks', 'submit_requests'],
  [ROLES.KARBANTARTAS]: ['view_tasks', 'request_tools', 'submit_work_logs'],
  [ROLES.KARBANTARTAS_VEZETO]: [
    'view_tasks',
    'request_tools',
    'manage_tool_requests',
    'assign_tools',
    'view_workers',
    'view_reports'
  ],
  [ROLES.ADMINISZTRATOR]: [
    'view_tasks',
    'request_tools',
    'manage_tool_requests',
    'assign_tools',
    'view_workers',
    'view_reports',
    'manage_users',
    'manage_roles',
    'system_settings',
    'view_all_data'
  ]
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [toolRequests, setToolRequests] = useState([]);
  const [tasks, setTasks] = useState([]);

  // Initialize database from localStorage
  useEffect(() => {
    const savedUsers = localStorage.getItem('hibavonal_users');
    const savedToolRequests = localStorage.getItem('hibavonal_tool_requests');
    const savedTasks = localStorage.getItem('hibavonal_tasks');

    if (savedUsers) setUsers(JSON.parse(savedUsers));
    if (savedToolRequests) setToolRequests(JSON.parse(savedToolRequests));
    if (savedTasks) setTasks(JSON.parse(savedTasks));

    // Check if user is already logged in
    const savedUser = localStorage.getItem('hibavonal_current_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Save users to localStorage
  useEffect(() => {
    localStorage.setItem('hibavonal_users', JSON.stringify(users));
  }, [users]);

  // Save tool requests to localStorage
  useEffect(() => {
    localStorage.setItem('hibavonal_tool_requests', JSON.stringify(toolRequests));
  }, [toolRequests]);

  // Save tasks to localStorage
  useEffect(() => {
    localStorage.setItem('hibavonal_tasks', JSON.stringify(tasks));
  }, [tasks]);

  const register = (email, password, name, role) => {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }

    // Validate password length
    if (!password || password.length < 4) {
      throw new Error('Password must be at least 4 characters long');
    }

    // Validate name
    if (!name || name.trim().length < 2) {
      throw new Error('Name must be at least 2 characters long');
    }

    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    const newUser = {
      id: Date.now().toString(),
      email,
      password, // Note: In production, use bcrypt or similar
      name: name.trim(),
      role,
      createdAt: new Date().toISOString()
    };

    setUsers([...users, newUser]);
    return newUser;
  };

  const login = (email, password) => {
    const foundUser = users.find(u => u.email === email && u.password === password);
    if (!foundUser) {
      throw new Error('Invalid email or password');
    }

    localStorage.setItem('hibavonal_current_user', JSON.stringify(foundUser));
    setUser(foundUser);
    return foundUser;
  };

  const logout = () => {
    localStorage.removeItem('hibavonal_current_user');
    setUser(null);
  };

  const hasPermission = (permission) => {
    if (!user) return false;
    const userPermissions = ROLE_PERMISSIONS[user.role] || [];
    return userPermissions.includes(permission);
  };

  const createTask = (title, description, assignedTo) => {
    const newTask = {
      id: Date.now().toString(),
      title,
      description,
      assignedTo,
      createdBy: user.id,
      status: 'pending',
      createdAt: new Date().toISOString()
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
      status: 'pending',
      approvedBy: null,
      createdAt: new Date().toISOString()
    };

    setToolRequests([...toolRequests, newRequest]);
    return newRequest;
  };

  const approveToolRequest = (requestId) => {
    if (!hasPermission('assign_tools')) {
      throw new Error('Permission denied');
    }

    setToolRequests(
      toolRequests.map(req =>
        req.id === requestId
          ? { ...req, status: 'approved', approvedBy: user.id, approvedAt: new Date().toISOString() }
          : req
      )
    );
  };

  const rejectToolRequest = (requestId) => {
    if (!hasPermission('assign_tools')) {
      throw new Error('Permission denied');
    }

    setToolRequests(
      toolRequests.map(req =>
        req.id === requestId
          ? { ...req, status: 'rejected', approvedBy: user.id, rejectedAt: new Date().toISOString() }
          : req
      )
    );
  };

  const value = {
    user,
    users,
    tasks,
    toolRequests,
    register,
    login,
    logout,
    hasPermission,
    createTask,
    createToolRequest,
    approveToolRequest,
    rejectToolRequest,
    ROLES
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
