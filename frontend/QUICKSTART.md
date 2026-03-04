# 🚀 Quick Start Guide - Hibavonal

## Installation & Setup (5 minutes)

### Prerequisites
- Node.js 14+ installed
- npm or yarn package manager

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Start Development Server
```bash
npm start
```

The app will open automatically at `http://localhost:3000`

---

## 🎮 How to Use the System

### First Time Setup

1. **Login Page** appears on startup
2. Click any **Demo Account Button** to auto-fill credentials:
   - **Egyetemista** - Student account
   - **Karbantartó** - Maintenance worker
   - **Karbantartási Vezető** - Team manager  
   - **Adminisztrátor** - System admin

### Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Egyetemista | egyetemista@test.com | test123 |
| Karbantartó | karbantarto@test.com | test123 |
| Karbantartási Vezető | vezeto@test.com | test123 |
| Adminisztrátor | admin@test.com | test123 |

---

## 📋 What Each Role Can Do

### 👨‍🎓 Egyetemista (Student)
- View your assigned tasks
- Submit new task requests
- Track request status

**Login and try:**
- Check "My Tasks" section
- Submit a new request

### 🔧 Karbantartó (Maintenance Worker)
- View assigned maintenance tasks
- Request tools for your work
- Track tool request status

**Login and try:**
- View assigned tasks
- Request a tool (e.g., "Hammer", quantity 1)
- See pending approval status

### 👷 Karbantartási Vezető (Maintenance Manager)
- Approve or reject tool requests
- Manage team of workers
- View worker statistics
- Generate reports

**Login and try:**
- Go to "Manage Tool Requests"
- Filter by "Pending" status
- Approve a tool request from a worker

### 👨‍💼 Adminisztrátor (Administrator)
- Create new user accounts
- Assign roles to users
- View system statistics
- Full system access
- See all users and their info

**Login and try:**
- Go to "User Management"
- Click "+ Add User"
- Create a new test user
- Check system statistics

---

## 🗂️ Project Structure

```
hibavonal/
├── src/
│   ├── components/           # React components
│   │   ├── Login.js
│   │   ├── Dashboard.js
│   │   └── roles/           # Role-specific dashboards
│   ├── context/             # Authentication & state
│   │   └── AuthContext.js
│   ├── styles/              # CSS styling
│   ├── App.js              # Main app file
│   └── index.js
├── public/
│   └── index.html
├── package.json
└── README_SYSTEM.md        # Full documentation
```

---

## 💾 Data Storage

All data is stored in **browser localStorage** - it persists even after closing the browser.

### To Reset All Data:
1. Open Browser DevTools (F12)
2. Go to Application → LocalStorage
3. Find `hibavonal_*` keys
4. Delete them
5. Refresh page

---

## 🔄 Testing Workflow

### Try this workflow:

1. **Admin creates users**
   - Login as Adminisztrátor
   - Create a new Karbantartó (maintenance worker)
   - Create a new Karbantartási Vezető

2. **Worker requests tools**
   - Login as Karbantartó
   - Submit a tool request
   - Note the "Pending" status

3. **Manager approves**
   - Login as Karbantartási Vezető
   - See pending tool requests
   - Approve the request

4. **Check system stats**
   - Login as Adminisztrátor
   - View statistics dashboard
   - See all users and their roles

---

## 🐛 Troubleshooting

### App won't start
```bash
# Clear node modules and reinstall
rm -rf node_modules
npm install
npm start
```

### Data disappeared
- Check if localStorage is enabled
- Try accessing from same browser/private mode
- Check DevTools → Application → LocalStorage

### Demo buttons not working
- Make sure you're on the login page
- Try refreshing the page

---

## 🔐 Important Notes

⚠️ **This is a demo system with:**
- Passwords stored in plain text (for demo only!)
- Frontend-only authentication
- Browser localStorage (not secure for real data)

**For production, you'll need:**
- Secure backend server
- Real database (MongoDB, PostgreSQL, etc.)
- Password hashing (bcrypt)
- JWT authentication tokens
- HTTPS encryption

See `DEVELOPER_GUIDE.md` for backend integration instructions.

---

## 📞 Quick Commands

```bash
# Start development
npm start

# Build for production
npm build

# Run tests
npm test

# Eject (permanently)
npm eject
```

---

## 🎯 Next Steps

1. ✅ Run `npm start`
2. ✅ Try demo accounts
3. ✅ Create test users
4. ✅ Test each role's features
5. ✅ Review DEVELOPER_GUIDE.md for backend integration
6. ✅ Customize for your needs

---

**Happy testing! 🚀**

Questions? Check README_SYSTEM.md for detailed documentation.
