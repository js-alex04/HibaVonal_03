# 📚 API Reference & Data Structure Guide

## 🔑 AuthContext API Reference

All functionality is accessed through the `useAuth()` hook:

```javascript
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { user, login, hasPermission, createTask } = useAuth();
  // ... use the methods
}
```

---

## 👤 User Management

### User Object
```javascript
{
  id: "1234567890",              // Unique identifier (timestamp)
  email: "user@example.com",      // Email address (unique)
  password: "hashed_or_plain",    // User password
  name: "John Doe",               // Full name
  role: "Karbantartó",            // One of four roles
  createdAt: "2024-03-04T10:00:00Z" // ISO timestamp
}
```

### Available Roles
```javascript
{
  EGYETEMISTA: 'Egyetemista',
  KARBANTARTAS: 'Karbantartó',
  KARBANTARTAS_VEZETO: 'Karbantartási vezető',
  ADMINISZTRATOR: 'Adminisztrátor'
}
```

---

## 🔐 Authentication Methods

### `register(email, password, name, role)`
Creates a new user account.

```javascript
try {
  const newUser = register(
    'john@example.com',
    'password123',
    'John Doe',
    'Karbantartó'
  );
  // Returns user object
} catch (error) {
  // "User already exists"
}
```

### `login(email, password)`
Authenticates user and sets session.

```javascript
try {
  const user = login('john@example.com', 'password123');
  // Sets user state and localStorage
} catch (error) {
  // "Invalid email or password"
}
```

### `logout()`
Clears user session.

```javascript
logout();
// Removes user state and localStorage
```

---

## 🔒 Permission System

### `hasPermission(permission)`
Check if user has specific permission.

```javascript
if (hasPermission('assign_tools')) {
  // Show tool management interface
}
```

### Available Permissions by Role

**Egyetemista:**
```javascript
['view_tasks', 'submit_requests']
```

**Karbantartó:**
```javascript
['view_tasks', 'request_tools', 'submit_work_logs']
```

**Karbantartási Vezető:**
```javascript
[
  'view_tasks',
  'request_tools',
  'manage_tool_requests',
  'assign_tools',
  'view_workers',
  'view_reports'
]
```

**Adminisztrátor:**
```javascript
[
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
```

---

## 📋 Task Management

### Task Object
```javascript
{
  id: "1234567890",           // Unique identifier
  title: "Fix Water Pump",     // Task title
  description: "...",          // Detailed description
  assignedTo: "user_id",       // User ID assigned to
  createdBy: "admin_id",       // User ID who created
  status: "pending",           // pending, in-progress, completed
  createdAt: "2024-03-04T10:00:00Z"
}
```

### `createTask(title, description, assignedTo)`
Create a new task.

```javascript
const task = createTask(
  'Repair Equipment',
  'The equipment in Building A needs repair',
  'userid_12345'
);
```

### Accessing Tasks
```javascript
const { tasks } = useAuth();

// Get user's assigned tasks
const myTasks = tasks.filter(t => t.assignedTo === user.id);

// Get tasks created by user
const myCreatedTasks = tasks.filter(t => t.createdBy === user.id);
```

---

## 🛠️ Tool Request Management

### ToolRequest Object
```javascript
{
  id: "1234567890",              // Unique identifier
  toolName: "Drill",             // Name of tool requested
  quantity: 2,                   // Quantity needed
  reason: "Building maintenance", // Why tool is needed
  requestedBy: "worker_id",      // User ID who requested
  status: "pending",             // pending, approved, rejected
  approvedBy: "manager_id",      // User ID who approved (optional)
  createdAt: "2024-03-04T10:00:00Z",
  approvedAt: "2024-03-04T11:00:00Z" // (optional)
}
```

### `createToolRequest(toolName, quantity, reason, requestedBy)`
Worker requests tools.

```javascript
const request = createToolRequest(
  'Safety Harness',
  1,
  'Installing scaffolding on 5th floor',
  user.id
);
```

### `approveToolRequest(requestId)`
Manager approves request (requires permission).

```javascript
if (hasPermission('assign_tools')) {
  approveToolRequest('request_id_12345');
}
```

### `rejectToolRequest(requestId)`
Manager rejects request (requires permission).

```javascript
if (hasPermission('assign_tools')) {
  rejectToolRequest('request_id_12345');
}
```

### Accessing Requests
```javascript
const { toolRequests } = useAuth();

// Get user's requests
const myRequests = toolRequests.filter(tr => tr.requestedBy === user.id);

// Get pending requests (for managers)
const pending = toolRequests.filter(tr => tr.status === 'pending');

// Get approved requests
const approved = toolRequests.filter(tr => tr.status === 'approved');
```

---

## 👥 Users & Teams

### Accessing Users List
```javascript
const { users } = useAuth();

// Get all maintenance workers
const workers = users.filter(u => u.role === 'Karbantartó');

// Get all managers
const managers = users.filter(u => u.role === 'Karbantartási vezető');

// Count users by role
const karbantartoCount = users.filter(u => u.role === 'Karbantartó').length;
```

---

## 📊 System State Structure

Complete AuthContext state available via `useAuth()`:

```javascript
const {
  // User info
  user,                    // Current logged-in user (or null)
  users,                   // Array of all users
  
  // Data
  tasks,                   // Array of all tasks
  toolRequests,           // Array of all tool requests
  
  // Authentication
  register,               // Function
  login,                  // Function
  logout,                 // Function
  hasPermission,          // Function
  
  // Operations
  createTask,            // Function
  createToolRequest,     // Function
  approveToolRequest,    // Function
  rejectToolRequest,     // Function
  
  // Constants
  ROLES                  // Object with role names
} = useAuth();
```

---

## 🎯 Common Use Cases

### 1. Check if user can manage tools
```javascript
const canManageTools = hasPermission('assign_tools');
```

### 2. Get current user's pending requests
```javascript
const myPendingRequests = toolRequests.filter(
  tr => tr.requestedBy === user.id && tr.status === 'pending'
);
```

### 3. Show admin-only button
```javascript
{hasPermission('manage_users') && (
  <button onClick={handleAddUser}>Add User</button>
)}
```

### 4. Filter data by role
```javascript
const workers = users.filter(u => u.role === ROLES.KARBANTARTAS);
```

### 5. Count statistics
```javascript
const stats = {
  totalUsers: users.length,
  pendingRequests: toolRequests.filter(tr => tr.status === 'pending').length,
  approvedRequests: toolRequests.filter(tr => tr.status === 'approved').length,
};
```

---

## 💾 localStorage Keys

Data persisted to browser localStorage:

```javascript
// Current logged-in user
localStorage.getItem('hibavonal_current_user')

// All users database
localStorage.getItem('hibavonal_users')

// All tool requests
localStorage.getItem('hibavonal_tool_requests')

// All tasks
localStorage.getItem('hibavonal_tasks')
```

### Reset Data
```javascript
// Clear all data
localStorage.removeItem('hibavonal_current_user');
localStorage.removeItem('hibavonal_users');
localStorage.removeItem('hibavonal_tool_requests');
localStorage.removeItem('hibavonal_tasks');
```

---

## 🔄 Data Flow Example

### Complete Tool Request Workflow

1. **Worker creates request**
   ```javascript
   // In KarbantartoDashboard.js
   createToolRequest(
     'Drill',
     1,
     'Fixing building foundation',
     user.id
   );
   ```

2. **Data stored**
   ```
   localStorage['hibavonal_tool_requests'] = [
     { id: '123', toolName: 'Drill', status: 'pending', ... }
   ]
   ```

3. **Manager views pending**
   ```javascript
   // In KarbantartasVezetoDashboard.js
   const pending = toolRequests.filter(tr => tr.status === 'pending');
   ```

4. **Manager approves**
   ```javascript
   approveToolRequest('123');
   ```

5. **Request updated**
   ```
   { id: '123', status: 'approved', approvedBy: '456', ... }
   ```

6. **Worker sees approval**
   ```javascript
   // Request shows "✅ Approved - retrieve your tools"
   ```

---

## ⚠️ Error Handling

Always wrap AuthContext methods in try-catch:

```javascript
try {
  createTask(title, description, assignedTo);
} catch (error) {
  console.error('Task creation failed:', error.message);
  // Handle error (show toast, alert, etc.)
}
```

Common errors:
- "User already exists" - during registration
- "Invalid email or password" - during login
- "Permission denied" - when user lacks permission

---

## 🚀 Best Practices

1. **Always check permissions before showing UI**
   ```javascript
   {hasPermission('manage_tool_requests') && <ToolManager />}
   ```

2. **Filter data, don't modify original**
   ```javascript
   const filtered = tasks.filter(...); // Good
   tasks[0].status = 'done';           // Bad - mutates state
   ```

3. **Use useAuth only in React components**
   ```javascript
   // In component
   const { user } = useAuth(); // ✓ Good
   
   // Outside component
   const { user } = useAuth(); // ✗ Bad - Error
   ```

4. **Always check user before accessing**
   ```javascript
   const { user } = useAuth();
   if (!user) return <Redirect to="/login" />;
   ```

5. **Catch errors in forms**
   ```javascript
   try {
     register(...);
   } catch (err) {
     setError(err.message);
   }
   ```

---

## 📞 Debugging

Check authentication state:
```javascript
const { user } = useAuth();
console.log('Current user:', user);
```

Check all users:
```javascript
const { users } = useAuth();
console.log('All users:', users);
```

Check permissions:
```javascript
const { user, ROLE_PERMISSIONS } = useAuth();
console.log('My permissions:', ROLE_PERMISSIONS[user?.role]);
```

Check localStorage:
```javascript
// In browser console
localStorage.getItem('hibavonal_users')
localStorage.getItem('hibavonal_tool_requests')
```

---

**See README_SYSTEM.md for full system documentation**
**See DEVELOPER_GUIDE.md for backend integration**
