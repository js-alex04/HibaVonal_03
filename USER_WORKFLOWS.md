# 🔄 Hibavonal - User Workflows & System Flows

## 📊 Workflow Diagrams

### 1. Authentication Flow

```
┌─────────────────┐
│   User Visits   │
│  App at :3000   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Check localStorage for session     │
└────────┬────────────────────────────┘
         │
    ┌────┴────┐
    │          │
    ▼ Yes      ▼ No
┌──────┐   ┌──────────┐
│Show  │   │Show Login│
│Dash. │   │Page      │
└──────┘   └────┬─────┘
               │
          ┌────┴─────────┐
          │               │
    ┌─────▼────┐    ┌────▼─────┐
    │  Login   │    │ Register  │
    └──────┬───┘    └────┬─────┘
           │             │
    ┌──────▼─────────────▼──┐
    │  Enter email/password  │
    │  (or fill with demo)   │
    └──────┬────────────────┘
           │
           ▼
    ┌─────────────────┐
    │ Verify in DB    │
    └────┬────────┬───┘
         │        │
    ┌────▼─┐  ┌──▼────┐
    │Valid │  │Invalid│
    │  ↓   │  │  ↓    │
    │ Show │  │ Error │
    │Dash. │  │ Message
    └──────┘  └───────┘
```

### 2. Role-Based Access Control

```
User Logs In
     │
     ▼
┌─────────────────────────────────┐
│  Load User Record from DB       │
│  {role: "Karbantartó", ...}    │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Main Dashboard                 │
│  - Display user info & role     │
│  - Show logout button           │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Route to Role Dashboard        │
│  based on user.role             │
└────────┬────────────────────────┘
         │
    ┌────┼────────┬─────────┬──────────┐
    │    │        │         │          │
    ▼    ▼        ▼         ▼          ▼
┌────┐ ┌────┐ ┌─────┐ ┌───────┐ ┌────────┐
│Egy.│ │Kar.│ │Vez. │ │Admin  │ │(Check  │
│    │ │    │ │     │ │       │ │perms)  │
└────┘ └────┘ └─────┘ └───────┘ └────────┘
  │      │       │         │         │
  │      │       │         │         │
  ▼      ▼       ▼         ▼         ▼
Limited┌─────┐ Full    Full      Full
UI   │Check │Access   Access    Access
     │Perms │
     └──┬───┘
        │
    ┌───┴────────────────┐
    │                    │
    ▼ Has Permission?    ▼ No
┌─────────────┐    ┌──────────┐
│Show Feature │    │Hide or   │
│   Button    │    │Block     │
└─────────────┘    └──────────┘
```

### 3. Tool Request Workflow

```
KARBANTARTÓ (Worker)
        │
        ▼
┌──────────────────┐
│1. Needs Tools    │
│   for Job        │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────┐
│2. Fills Request Form:    │
│   - Tool name            │
│   - Quantity             │
│   - Reason/description   │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│3. Submits Request        │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│4. Saved to Database      │
│   Status: "pending"      │
└────────┬─────────────────┘
         │

MANAGER SEES REQUEST
        │
        ▼
┌──────────────────────────┐
│5. Karbantartási Vezető   │
│   Views Pending Requests │
└────────┬─────────────────┘
         │
    ┌────┴────────┐
    │             │
    ▼ Approve     ▼ Reject
┌─────────┐ ┌──────────┐
│6.Click  │ │6. Click  │
│Approve  │ │Reject    │
└────┬────┘ └────┬─────┘
     │           │
     ▼           ▼
┌──────────┐ ┌──────────┐
│Updated   │ │Updated   │
│Status:   │ │Status:   │
│approved  │ │rejected  │
└────┬─────┘ └────┬─────┘
     │           │
     ▼           ▼

WORKER SEES UPDATE
     │
┌────┴─────┐
│           │
▼ Approved  ▼ Rejected
┌──────┐   ┌────────┐
│✅OK  │   │❌ Try  │
│Get   │   │Again  │
│Tools │   │       │
└──────┘   └────────┘
```

### 4. Admin User Creation Flow

```
Adminisztrátor Logs In
        │
        ▼
┌──────────────────────┐
│View Admin Dashboard  │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│Click "+ Add User"    │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│Form Appears:         │
│- Name                │
│- Email               │
│- Password            │
│- Role (dropdown)     │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│Fill in Details       │
│Select Role           │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│Click "Create User"   │
└────────┬─────────────┘
         │
    ├────┴────┐
    │         │
    ▼ Valid   ▼ Invalid
┌─────┐   ┌───────┐
│Save │   │Error  │
│to DB│   │Msg    │
└──┬──┘   └───────┘
   │
   ▼
┌──────────────┐
│Success Msg   │
│User added!   │
│Show in list  │
└──────────────┘
```

---

## 👤 User Journeys by Role

### Journey 1: Egyetemista (Student)

```
1. ARRIVES
   └─ Sees login page

2. LOGS IN
   └─ Uses demo: egyetemista@test.com / test123

3. DASHBOARD
   └─ Sees greeting "Welcome, [Name]"
   └─ Role badge shows "Egyetemista"

4. VIEWS TASKS
   └─ Section "My Tasks"
   └─ Shows all assigned tasks
   └─ Each task displays:
      - Title
      - Description
      - Status badge
      - Creation date

5. SUBMITS REQUEST
   └─ Form: "Submit New Request"
   └─ Fields: Title, Description
   └─ Clicks "Submit Request"
   └─ See success message

6. CHECKS PERMISSIONS
   └─ Card shows:
      ✓ View tasks
      ✓ Submit requests
      ✗ Cannot manage tools
      ✗ Cannot approve requests

7. LOGS OUT
   └─ Clicks "Logout"
   └─ Returns to login page
```

### Journey 2: Karbantartó (Maintenance Worker)

```
1. ARRIVES → LOGS IN
   └─ karbantarto@test.com / test123

2. DASHBOARD
   └─ Shows: "Karbantartó"
   └─ Header: "Welcome, [Name]"

3. VIEWS TASKS
   └─ Section: "Assigned Maintenance Tasks"
   └─ Lists all tasks assigned to worker
   └─ Can see task details

4. REQUESTS TOOLS
   └─ Form: "Request Tools"
   └─ Fields:
      - Tool Name (what to request)
      - Quantity (how many)
      - Reason (why needed)
   └─ Submits request
   └─ Status changes to "pending"

5. TRACKS REQUESTS
   └─ Section: "My Tool Requests"
   └─ Shows all submitted requests
   └─ Status indicators:
      ⏳ Pending (waiting for approval)
      ✅ Approved (go get your tools)
      ❌ Rejected (try again)

6. CHECKS PERMISSIONS
   └─ Card shows what can/cannot do

7. LOGS OUT
   └─ Session ends
```

### Journey 3: Karbantartási Vezető (Manager)

```
1. ARRIVES → LOGS IN
   └─ vezeto@test.com / test123

2. DASHBOARD
   └─ Shows: "Karbantartási vezető"

3. MANAGES REQUESTS
   └─ Section: "Manage Tool Requests"
   └─ Filters:
      - Pending (awaiting action)
      - Approved (already approved)
      - Rejected (already rejected)
   └─ Switches between filters

4. REVIEWS REQUEST
   └─ Sees for each request:
      - Worker name who requested
      - Tool name
      - Quantity needed
      - Reason/description
      - Request date
   └─ Two buttons available:
      ✓ [Approve & Assign]
      ✗ [Reject]

5. APPROVES REQUEST
   └─ Clicks "✓ Approve & Assign"
   └─ Request updates to "approved"
   └─ Worker notified in their dashboard

6. VIEWS TEAM
   └─ Section: "My Team - Maintenance Workers"
   └─ Shows all Karbantartó users
   └─ For each worker:
      - Name
      - Email
      - Total requests count
      - Pending requests count

7. CHECKS PERMISSIONS
   └─ Can see all available permissions

8. LOGS OUT
   └─ Management session ends
```

### Journey 4: Adminisztrátor (Administrator)

```
1. ARRIVES → LOGS IN
   └─ admin@test.com / test123

2. DASHBOARD
   └─ Shows: "Adminisztrátor"
   └─ Most features available

3. VIEWS STATISTICS
   └─ Dashboard shows:
      📊 Total Users: [count]
      👨‍🎓 Egyetemista: [count]
      🔧 Karbantartó: [count]
      👷 Vezető: [count]
      👨‍💼 Admin: [count]
      📋 Total Tasks: [count]
      🛠️ Tool Requests: [count]
      ⏳ Pending Approval: [count]

4. CREATES NEW USER
   └─ Click "+ Add User"
   └─ Form appears:
      - Name: [input]
      - Email: [input]
      - Password: [input]
      - Role: [dropdown - select one]
   └─ Click "Create User"
   └─ Success message shows
   └─ New user appears in directory

5. VIEWS USER DIRECTORY
   └─ Table shows all users:
      - Name
      - Email
      - Role (with color badge)
      - Registration date

6. CHECKS ROLE PERMISSIONS
   └─ Reference section shows:
      "Egyetemista can:"
      - view_tasks
      - submit_requests
      
      "Karbantartó can:"
      - view_tasks
      - request_tools
      - submit_work_logs
      
      "Vezető can:"
      - All above +
      - manage_tool_requests
      - assign_tools
      - view_workers
      - view_reports
      
      "Adminisztrátor can:"
      - All above +
      - manage_users
      - manage_roles
      - system_settings
      - view_all_data

7. LOGS OUT
   └─ Session ends
```

---

## 🔄 Data Update Flows

### Approval Workflow (From DB Perspective)

```
BEFORE APPROVAL:
┌────────────────────────┐
│ Tool Request Record    │
├────────────────────────┤
│ id: "1234567890"      │
│ toolName: "Drill"      │
│ quantity: 2            │
│ reason: "Building..."  │
│ requestedBy: "w001"    │
│ status: "pending" ◄─── │
│ approvedBy: null       │
│ approvedAt: null       │
└────────────────────────┘

MANAGER CLICKS APPROVE
        ↓

AFTER APPROVAL:
┌────────────────────────┐
│ Tool Request Record    │
├────────────────────────┤
│ id: "1234567890"      │
│ toolName: "Drill"      │
│ quantity: 2            │
│ reason: "Building..."  │
│ requestedBy: "w001"    │
│ status: "approved" ◄── │
│ approvedBy: "m001"     │
│ approvedAt: "2024-03-04T11:00:00Z" │
└────────────────────────┘

WORKER SEES UPDATED REQUEST
        ↓

SHOWS: "✅ Approved - retrieve your tools"
```

---

## 🎯 Decision Points

### At Login
```
Does localStorage have 'hibavonal_current_user'?
    │
    ├─ YES → Skip login, show Dashboard
    │
    └─ NO → Show Login Page
```

### At Dashboard
```
Is user logged in?
    │
    ├─ YES → Route by role to correct dashboard
    │
    └─ NO → Redirect to login
```

### At Feature Display
```
Does user have permission?
    │
    ├─ YES → Show feature/button
    │
    └─ NO → Hide feature/button
```

### At Tool Request
```
Is worker logged in?
    │
    └─ YES → Can create request
    
Is manager approved?
    │
    └─ YES → Status changes to "approved"
```

---

## 📈 System State Changes

### After Login
```
State Before: { user: null }
        ↓
     LOGIN
        ↓
State After: { user: { id, email, name, role, ... } }
```

### After Creating User
```
State Before: { users: [user1, user2] }
        ↓
   ADMIN CREATES NEW USER
        ↓
State After: { users: [user1, user2, newUser] }
```

### After Approving Request
```
State Before: { 
  toolRequests: [
    { id: "123", status: "pending" }
  ]
}
        ↓
   MANAGER CLICKS APPROVE
        ↓
State After: {
  toolRequests: [
    { id: "123", status: "approved", approvedBy: "m001" }
  ]
}
```

---

This visual guide shows the complete user flows and system interactions in Hibavonal!
