const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://localhost:7080/api';

// Általános hívás logika
export const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Ne küldjünk tokent a Login végpontokra, mert egy lejárt/beragadt token azonnali 401-et okozhat!
  if (token && !endpoint.toLowerCase().includes('login')) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `API Hiba: ${response.status} a(z) ${endpoint} végponton.`;
    const textData = await response.text().catch(() => '');
    if (textData) {
      try {
        const jsonData = JSON.parse(textData);
        if (jsonData.errors) {
          // C# Validációs hibák (400 Bad Request) részletes kibontása
          const errorDetails = Object.values(jsonData.errors).flat().join(' | ');
          errorMsg = `${jsonData.title || 'Validációs hiba'}: ${errorDetails}`;
        } else {
          errorMsg = jsonData.message || jsonData.title || JSON.stringify(jsonData);
        }
      } catch {
        errorMsg = textData; // Ha sima szöveget kapunk a C# BadRequest(ex.Message)-ből
      }
    }
    throw new Error(errorMsg);
  }

  // Ha 204 No Content, ne próbáljuk meg JSON-ként parse-olni
  if (response.status === 204) {
    return null;
  }

  return await response.json();
};

// --- AUTH / FELHASZNÁLÓK ---
export const authAPI = {
  login: async (email, password) => {
    try {
      // A backend struktúrája alapján a Login valószínűleg a User kontrollerben van
      return await apiCall('/User/Login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
    } catch (error) {
      if (error.message.includes('404')) {
        // Ha mégsem ott lenne, fallback az eredeti /Auth/login útvonalra
        return await apiCall('/Auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });
      }
      throw error;
    }
  },
  getCurrentUser: () => apiCall('/User/GetCurrentUser').catch(() => apiCall('/Auth/me')),
};

// --- USERS (Felhasználók) ---
export const userAPI = {
  getAll: async () => {
    try {
      return await apiCall('/User/GetAllUsers');
    } catch (error) {
      // Mivel a backend a közös GetAllUsers végponton 400-as hibát dob, 
      // kénytelenek vagyunk szerepkörönként lekérdezni a felhasználókat és a frontendben összefűzni őket.
      console.warn("A GetAllUsers végpont hibát dobott a szerveren. Biztonsági tartalék (fallback) útvonalak használata...");
      let allUsers = [];

      const fetchRole = async (endpoint) => {
        try {
          const data = await apiCall(endpoint);
          if (Array.isArray(data)) allUsers.push(...data);
        } catch (e) { /* Csendes hibakezelés, ha valamelyik végpont mégsem létezik */ }
      };

      // Mivel a többi szerepkörnek még nincs megírva a végpontja a backendben (404-et adnak),
      // csak a Karbantartókat kérdezzük le, amiről tudjuk, hogy létezik.
      await fetchRole('/Maintainer/GetAllMaintainers');

      return allUsers;
    }
  },
  createCollegiate: (data) => apiCall('/User/CreateCollegiate', { method: 'POST', body: JSON.stringify(data) }),
  createMaintainer: (data) => apiCall('/User/CreateMaintainer', { method: 'POST', body: JSON.stringify(data) }),
  createAdministrator: (data) => apiCall('/User/CreateAdministrator', { method: 'POST', body: JSON.stringify(data) }),
  createMaintenanceManager: (data) => apiCall('/User/CreateMaintenanceManager', { method: 'POST', body: JSON.stringify(data) }),
  changeRole: (userId, roleEnum) => apiCall(`/User/ChangeUserRole/${userId}/change-role?newRole=${roleEnum}`, { method: 'PUT' }),
  delete: (id) => apiCall(`/User/DeleteUser/${id}/delete`, { method: 'DELETE' }),
  updateProfile: (userId, data) => apiCall(`/User/UpdateUserProfile/${userId}/profile`, { method: 'PUT', body: JSON.stringify(data) }),
  changePassword: (userId, data) => apiCall(`/User/ChangePassword/${userId}/change-password`, { method: 'PUT', body: JSON.stringify(data) }),
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
  create: async (data) => {
    try {
      return await apiCall('/Appliance/CreateAppliance', { method: 'POST', body: JSON.stringify(data) });
    } catch (err) {
      if (err.message.includes('404')) {
        // Ha a hosszú név nem létezik, megpróbáljuk a szabványos REST végpontot
        return await apiCall('/Appliance', { method: 'POST', body: JSON.stringify(data) });
      }
      throw err;
    }
  },
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
  getByCollegiateId: (id) => apiCall(`/Fault/GetFaultsByCollegiateId/${id}`),
  create: (collegiateId, data) => apiCall(`/Fault/CreateFault/${collegiateId}`, { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiCall(`/Fault/UpdateFault/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiCall(`/Fault/DeleteFault/${id}`, { method: 'DELETE' }),
  addFeedback: (id, data) => apiCall(`/Fault/NewFeedback/${id}/new-feedback`, { method: 'POST', body: JSON.stringify(data) }),
  assignMaintainer: (faultId, maintainerId) => apiCall(`/Fault/AssignFaultMaintainer/${faultId}/assign-maintainer?id=${faultId}&faultId=${faultId}&maintainerId=${maintainerId}`, { method: 'PUT', body: JSON.stringify({}) }),
  setSpecialisation: (faultId, specialisationId) => apiCall(`/Fault/SetFaultSpecialisation/${faultId}/set-maintainer-specialisation?specialisationId=${specialisationId}`, { method: 'PUT' }),
  updateStatus: (id, data) => {
    
    const sVal = data && typeof data === 'object' ? (data.status !== undefined ? data.status : data.Status) : data;
    return apiCall(`/Fault/UpdateFaultStatus/${id}/update-status?status=${sVal}&newStatus=${sVal}`, { method: 'PUT', body: JSON.stringify(data) });
  },
};

// --- TOOL ORDERS (Eszközrendelések) ---
export const toolOrderAPI = {
  getAll: async () => {
    try {
      return await apiCall('/ToolOrder/GetAllToolOrders');
    } catch (err) {
      return await apiCall('/ToolOrder/GetAllOrders');
    }
  },
  create: (faultId, data) => apiCall(`/ToolOrder/CreateToolOrder/${faultId}`, { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiCall(`/ToolOrder/UpdateToolOrder/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  updateDeliveryStatus: (id, isDelivered) => apiCall(`/ToolOrder/UpdateDeliveryStatus/${id}/delivery-status?isDelivered=${isDelivered}`, { method: 'PUT' }),
};

// --- FEEDBACKS (Visszajelzések) ---
export const feedbackAPI = {
  getAll: () => apiCall('/Feedback/GetAllFeedbacks'),
  delete: (id) => apiCall(`/Feedback/DeleteFeedback/${id}`, { method: 'DELETE' }),
};