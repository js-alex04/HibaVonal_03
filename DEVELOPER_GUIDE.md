# Developer Guide - Backend Integration

This guide explains how to integrate Hibavonal with a backend database and API.

## 🔄 Architecture

### Current Setup (Frontend Only)
```
┌─────────────────────┐
│   React Frontend    │
│  (localStorage)     │
└─────────────────────┘
```

### With Backend
```
┌─────────────────────┐     ┌──────────────────┐     ┌──────────────┐
│   React Frontend    │────▶│   Node.js/API    │────▶│   Database   │
│  (Context API)      │     │   (Express)      │     │  (MongoDB)   │
└─────────────────────┘     └──────────────────┘     └──────────────┘
```

## 📡 API Endpoints Required

### Authentication
```
POST   /api/auth/register       - Register new user
POST   /api/auth/login          - Login user
POST   /api/auth/logout         - Logout
GET    /api/auth/me             - Get current user
```

### Users (Admin only)
```
GET    /api/users               - List all users
GET    /api/users/:id           - Get user details
POST   /api/users               - Create new user
PUT    /api/users/:id           - Update user
DELETE /api/users/:id           - Delete user
```

### Tasks
```
GET    /api/tasks               - List tasks
GET    /api/tasks/:id           - Get task details
POST   /api/tasks               - Create task
PUT    /api/tasks/:id           - Update task
DELETE /api/tasks/:id           - Delete task
```

### Tool Requests
```
GET    /api/requests            - List requests
POST   /api/requests            - Create request
PUT    /api/requests/:id        - Update request
PUT    /api/requests/:id/approve - Approve request
PUT    /api/requests/:id/reject  - Reject request
```

## 🔧 Step-by-Step Integration

### Step 1: Create API Service

Create `src/services/api.js`:

```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

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

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'API Error');
  }

  return data;
};

// Auth APIs
export const authAPI = {
  register: (email, password, name, role) =>
    apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, role }),
    }),

  login: (email, password) =>
    apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  logout: () => {
    localStorage.removeItem('token');
  },

  getCurrentUser: () => apiCall('/auth/me'),
};

// Similar pattern for other endpoints...
```

### Step 2: Update AuthContext.js

Replace localStorage calls with API calls:

```javascript
// Before (localStorage)
const savedUsers = localStorage.getItem('hibavonal_users');

// After (API)
const getCurrentUser = async () => {
  try {
    const user = await authAPI.getCurrentUser();
    setUser(user);
  } catch (error) {
    console.error('Error fetching user:', error);
  }
};
```

### Step 3: Add Environment Variables

Create `.env`:
```
REACT_APP_API_URL=http://localhost:5000/api
```

### Step 4: Backend Example (Node.js + Express)

```javascript
// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const app = express();

app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/hibavonal');

// User Model
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Login Endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET
    );

    res.json({ token, user: { id: user._id, email, name: user.name, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Middleware for authentication
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Protected routes example
app.get('/api/auth/me', auth, async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json(user);
});

app.listen(5000, () => console.log('Server running on port 5000'));
```

## 🗄️ Database Schema

### User Collection
```javascript
{
  _id: ObjectId,
  email: String,       // unique
  password: String,    // bcrypt hashed
  name: String,
  role: String,        // Egyetemista, Karbantartó, etc.
  createdAt: Date
}
```

### Task Collection
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  assignedTo: ObjectId, // reference to User
  createdBy: ObjectId,  // reference to User
  status: String,       // pending, in-progress, completed
  createdAt: Date
}
```

### ToolRequest Collection
```javascript
{
  _id: ObjectId,
  toolName: String,
  quantity: Number,
  reason: String,
  requestedBy: ObjectId,  // reference to User
  status: String,         // pending, approved, rejected
  approvedBy: ObjectId,   // reference to User (optional)
  approvedAt: Date,
  createdAt: Date
}
```

## 📦 Required npm packages

### Frontend (Already included)
- react
- react-dom
- react-scripts

### Backend (if using Node.js)
```bash
npm install express mongoose bcrypt jsonwebtoken cors dotenv
npm install nodemon --save-dev
```

## 🔐 Security Checklist

- [ ] Implement bcrypt password hashing
- [ ] Use JWT for authentication
- [ ] Add HTTPS in production
- [ ] Implement CORS properly
- [ ] Validate all inputs (server-side)
- [ ] Implement rate limiting
- [ ] Add refresh token rotation
- [ ] Implement audit logging
- [ ] Use environment variables for secrets
- [ ] Add request validation middleware
- [ ] Implement role-based authorization checks

## 🧪 Testing

Create `src/services/__tests__/api.test.js`:

```javascript
import { authAPI } from '../api';

jest.mock('fetch');

describe('Auth API', () => {
  it('should login user successfully', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          token: 'jwt_token',
          user: { id: '123', email: 'test@test.com' }
        })
      })
    );

    const result = await authAPI.login('test@test.com', 'password');
    expect(result.token).toBe('jwt_token');
  });
});
```

## 📝 Migration Guide

### Phase 1: API Layer
1. Create API service file
2. Keep localStorage as fallback
3. Test API endpoints

### Phase 2: Context Update
1. Replace localStorage with API calls
2. Add error handling
3. Add loading states

### Phase 3: UI Enhancement
1. Add loading spinners
2. Add retry mechanisms
3. Add user notifications

### Phase 4: Production
1. Deploy backend
2. Update environment variables
3. Enable HTTPS
4. Set up monitoring

## 📚 Resources

- [Express.js Documentation](https://expressjs.com)
- [MongoDB Documentation](https://docs.mongodb.com)
- [JWT Authentication](https://jwt.io)
- [React Context API](https://react.dev/reference/react/useContext)
- [CORS Explained](https://enable-cors.org)

---

Next Step: Choose your backend technology and follow the integration guide above!
