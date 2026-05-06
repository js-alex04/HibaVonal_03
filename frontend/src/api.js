const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://localhost:7080/api';

// Általános hívás logika
export const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API Hiba: ${response.status} a(z) ${endpoint} végponton.`);
  }

  // Ha 204 No Content, ne próbáljuk meg JSON-ként parse-olni
  if (response.status === 204) {
    return null;
  }

  return await response.json();
};

// --- AUTH / FELHASZNÁLÓK ---
export const authAPI = {
  login: (email, password) =>
    apiCall('/Auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  getCurrentUser: () => apiCall('/Auth/me'),
};

// --- USERS (Felhasználók) ---
export const userAPI = {
  getAll: () => apiCall('/User/GetAllUsers'),
  createCollegiate: (data) => apiCall('/User/CreateCollegiate', { method: 'POST', body: JSON.stringify(data) }),
  createMaintainer: (data) => apiCall('/User/CreateMaintainer', { method: 'POST', body: JSON.stringify(data) }),
  createManagementAdmin: (role, data) => apiCall(`/User/CreateManagementAdmin?role=${role}`, { method: 'POST', body: JSON.stringify(data) }),
};

// --- PREMISES (Helyiségek) ---
export const premiseAPI = {
  getAll: () => apiCall('/Premise/GetAllPremises'),
  getById: (id) => apiCall(`/Premise/GetPremiseById/${id}`),
  create: (data) => apiCall('/Premise/CreatePremise', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiCall(`/Premise/UpdatePremise/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiCall(`/Premise/DeletePremise/${id}`, { method: 'DELETE' }),
  addAppliance: (premiseId, applianceId) => apiCall(`/Premise/AddApplianceToPremise/${premiseId}/add-appliance/${applianceId}`, { method: 'PUT' }),
  removeAppliance: (premiseId, applianceId) => apiCall(`/Premise/DeleteApplianceFromPremise/${premiseId}/remove-appliance/${applianceId}`, { method: 'PUT' }),
};

// --- APPLIANCES (Berendezések) ---
export const applianceAPI = {
  getAll: () => apiCall('/Appliance/GetAllAppliances'),
  getById: (id) => apiCall(`/Appliance/GetApplianceById/${id}`),
  create: (data) => apiCall('/Appliance/CreateAppliance', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiCall(`/Appliance/UpdateAppliance/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiCall(`/Appliance/DeleteAppliance/${id}`, { method: 'DELETE' }),
};

// --- MAINTAINER SPECIALISATIONS (Karbantartói szakterületek) ---
export const specialisationAPI = {
  getAll: () => apiCall('/MaintainerSpecialisation/GetAllMaintainerSpecialisations'),
  getById: (id) => apiCall(`/MaintainerSpecialisation/GetMaintainerSpecialisationById/${id}`),
  getByMaintainerId: (maintainerId) => apiCall(`/MaintainerSpecialisation/GetSpecialisationsByMaintainerId/maintainer/${maintainerId}`),
  create: (data) => apiCall('/MaintainerSpecialisation/CreateMaintainerSpecialisation', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiCall(`/MaintainerSpecialisation/UpdateMaintainerSpecialisation/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiCall(`/MaintainerSpecialisation/DeleteMaintainerSpecialisation/${id}`, { method: 'DELETE' }),
};

// --- FAULTS / TASKS (Hibák / Feladatok) ---
export const faultAPI = {
  getAll: () => apiCall('/Fault/GetAllFaults'),
  getById: (id) => apiCall(`/Fault/GetFaultById/${id}`),
  create: (collegiateId, data) => apiCall(`/Fault/CreateFault/${collegiateId}`, { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiCall(`/Fault/UpdateFault/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiCall(`/Fault/DeleteFault/${id}`, { method: 'DELETE' }),
  addFeedback: (id, data) => apiCall(`/Fault/AddFeedback/${id}/add-feedback`, { method: 'POST', body: JSON.stringify(data) }),
  assignMaintainer: (faultId, maintainerId) => apiCall(`/Fault/AssignFaultMaintainer/${faultId}/assign-maintainer?id=${faultId}&faultId=${faultId}&maintainerId=${maintainerId}`, { method: 'PUT', body: JSON.stringify({}) }),
  updateStatus: (id, data) => apiCall(`/Fault/UpdateFaultStatus/${id}/update-status`, { method: 'PUT', body: JSON.stringify(data) }),
};

// --- TOOL ORDERS (Eszközrendelések) ---
export const toolOrderAPI = {
  getAll: () => apiCall('/ToolOrder/GetAllOrders'),
  create: (data) => apiCall('/ToolOrder/CreateToolOrder', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiCall(`/ToolOrder/UpdateToolOrder/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
};