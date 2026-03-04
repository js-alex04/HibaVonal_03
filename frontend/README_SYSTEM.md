# Hibavonal - Role-Based Task Management System

A comprehensive React-based task management system with role-based access control (RBAC) for maintenance and facility management.

## 🎯 System Overview

Hibavonal implements a four-tier role-based permission system:

### Roles & Permissions

#### 1. **Egyetemista** (Student)
- View assigned tasks
- Submit task requests
- Limited system access
- **Best for**: Students or users requesting maintenance

#### 2. **Karbantartó** (Maintenance Worker)
- View assigned maintenance tasks
- Request tools for tasks
- Submit work logs
- **Best for**: Field workers performing maintenance

#### 3. **Karbantartási Vezető** (Maintenance Manager)
- Manage and approve/reject tool requests
- Assign tools to workers
- View all team members
- View reports and statistics
- **Best for**: Team leads and supervisors

#### 4. **Adminisztrátor** (Administrator)
- **Full system access**
- Create and manage user accounts
- Assign and change user roles
- Manage all tool requests
- View all data and reports
- System settings access
- **Best for**: System administrators

## 🚀 Getting Started

### Installation

```bash
# Install dependencies
npm install

# Start the development server
npm start
```

The application will open at `http://localhost:3000`

## 📋 Features

### Authentication & User Management
- User registration with role assignment
- Login with credentials
- Session persistence (localStorage)
- Logout functionality
- User account creation by admins

### Database System
- **localStorage-based** data persistence
- Easily replaceable with backend API (Firebase, Express.js, etc.)
- Structures for: Users, Tasks, Tool Requests

### Role-Based Features

#### Egyetemista Dashboard
- View personal assigned tasks
- Submit new task requests
- Track request status

#### Karbantartó Dashboard
- View assigned maintenance tasks
- Request tools for specific tasks
- Track tool request status
- Indication when requests are pending/approved/rejected

#### Karbantartási Vezető Dashboard
- Tool request management interface
- Approve/Reject tool requests
- View team member list
- Worker statistics
- Filter requests by status

#### Adminisztrátor Dashboard
- System statistics dashboard
- Complete user management
- Add new users with role assignment
- User directory with role badges
- Role permissions reference
- System overview

## 🔐 Demo Credentials

The system comes with demo accounts for testing. On the login page, click any role button to auto-fill credentials:

```
Egyetemista:
  Email: egyetemista@test.com
  Password: test123

Karbantartó:
  Email: karbantarto@test.com
  Password: test123

Karbantartási Vezető:
  Email: vezeto@test.com
  Password: test123

Adminisztrátor:
  Email: admin@test.com
  Password: test123
```

## 📁 Project Structure

```
src/
├── App.js                          # Main app component with auth routing
├── context/
│   └── AuthContext.js             # Authentication & permission logic
├── components/
│   ├── Login.js                   # Login/Registration form
│   ├── Dashboard.js               # Main dashboard router
│   └── roles/
│       ├── EgyetemistaDashboard.js
│       ├── KarbantartoDashboard.js
│       ├── KarbantartasVezetoDashboard.js
│       └── AdminisztratoriDashboard.js
└── styles/
    ├── Login.css
    ├── Dashboard.css
    └── RoleDashboards.css
```

## 🔧 Key Components

### AuthContext.js
- Manages user authentication state
- Stores and retrieves users from localStorage
- Manages tasks and tool requests
- Permission checking system
- CRUD operations for tasks and requests

### Role Dashboards
Each role has its specialized dashboard with:
- Relevant data display
- Permission-based UI elements
- Action buttons (approve, reject, request, etc.)
- Real-time updates

## 💾 Data Storage

### Current Implementation
- **localStorage**: Client-side storage
- All data persists across browser sessions
- Perfect for prototyping and testing

### To integrate with a backend:
1. Replace localStorage calls with API requests
2. Update AuthContext.js methods to call your backend
3. Implement user authentication tokens
4. Add server-side permission validation

## 🔑 Key Functions

### AuthContext Methods

```javascript
// Authentication
login(email, password)           // Login user
register(email, password, name, role)  // Register new user
logout()                          // Logout current user

// Permissions
hasPermission(permission)         // Check user permission

// Task Management
createTask(title, description, assignedTo)
createToolRequest(toolName, quantity, reason, requestedBy)

// Request Management
approveToolRequest(requestId)
rejectToolRequest(requestId)
```

## 🎨 Styling

- **Modern gradient design** with purple theme
- Responsive grid layouts
- Status badges and indicators
- Hover effects and transitions
- Mobile-friendly interface

## 🔐 Security Notes

> ⚠️ **Important**: This is a frontend demo. For production:
> - Never store passwords in plain text
> - Implement server-side authentication
> - Use bcrypt or similar for password hashing
> - Implement JWT or session tokens
> - Add HTTPS
> - Implement proper CORS
> - Add input validation and sanitization

## 🚀 Future Enhancements

- [ ] Backend API integration
- [ ] Real database (MongoDB, PostgreSQL, etc.)
- [ ] Email notifications
- [ ] Advanced reporting
- [ ] Tool inventory management
- [ ] Work schedule management
- [ ] User profile pages
- [ ] Audit logs
- [ ] Two-factor authentication
- [ ] Password reset functionality

## 📞 Support

For questions or issues with the system, check:
1. Admin dashboard for system statistics
2. User permissions reference
3. Demo credentials for testing each role
4. Browser console for error messages

---

Built with React | Role-Based Access Control System | Hibavonal Task Management
