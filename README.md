# 🎓 TimeTable Allocation System

A full-stack MERN (MongoDB, Express.js, React.js, Node.js) application for academic timetable management with role-based access control.

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MongoDB (local or MongoDB Atlas)
- npm

### 1. Clone & Install

```bash
git clone <repo-url>
cd timetable-system

# Install root dependencies (concurrently)
npm install

# Install backend & frontend dependencies
npm run install:all
```

### 2. Configure Environment

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/timetable_system
JWT_SECRET=your_super_secret_key_change_this
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

**Using MongoDB Atlas (Cloud)?**
Replace `MONGODB_URI` with your Atlas connection string:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/timetable_system?retryWrites=true&w=majority
```

### 3. Seed Sample Data

```bash
npm run seed
```

This creates these test accounts:

| Role    | Email                  | Password    |
|---------|------------------------|-------------|
| Admin   | admin@school.edu       | admin123    |
| Manager | manager@school.edu     | manager123  |
| Staff   | alice@school.edu       | staff123    |
| Staff   | bob@school.edu         | staff123    |

### 4. Run Development Servers

```bash
npm run dev
```

- **Backend**: http://localhost:5000
- **Frontend**: http://localhost:3000

---

## 📁 Project Structure

```
timetable-system/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js              # MongoDB connection
│   │   │   └── seed.js            # Sample data seeder
│   │   ├── models/
│   │   │   ├── User.js            # User schema (admin/manager/staff/student)
│   │   │   ├── TimeTable.js       # Timetable schema with schedule
│   │   │   └── SubjectExpectation.js  # Staff preferences schema
│   │   ├── controllers/
│   │   │   ├── authController.js  # Login, JWT generation
│   │   │   ├── userController.js  # CRUD for users
│   │   │   ├── timetableController.js  # Timetable CRUD + PDF
│   │   │   └── expectationController.js  # Subject preferences
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── userRoutes.js
│   │   │   ├── timetableRoutes.js
│   │   │   └── expectationRoutes.js
│   │   ├── middleware/
│   │   │   ├── auth.js            # JWT verification + role guard
│   │   │   └── errorHandler.js    # Global error handler
│   │   └── server.js              # Express app entry point
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── context/
    │   │   └── AuthContext.js     # JWT auth state (React Context)
    │   ├── services/
    │   │   └── api.js             # Axios API client with interceptors
    │   ├── components/
    │   │   ├── Sidebar.js         # Role-aware navigation
    │   │   └── ProtectedRoute.js  # Route guard by role
    │   ├── pages/
    │   │   ├── LoginPage.js       # JWT login form
    │   │   ├── DashboardPage.js   # Role-specific overview
    │   │   ├── UsersPage.js       # Admin: manage users
    │   │   ├── TimetablesPage.js  # List all timetables
    │   │   ├── TimetableViewPage.js    # View schedule grid
    │   │   ├── TimetableEditorPage.js  # Create/edit timetable
    │   │   ├── PreferencesPage.js # Staff: subject preferences
    │   │   ├── ExpectationsPage.js # Admin: view all expectations
    │   │   └── StaffPage.js       # Manager: staff directory
    │   ├── App.js                 # React Router with protected routes
    │   ├── index.js
    │   └── index.css              # Global dark theme styles
    └── package.json
```

---

## 🔐 API Endpoints

### Auth
| Method | Route           | Access  | Description          |
|--------|-----------------|---------|----------------------|
| POST   | /api/auth/login | Public  | Login, returns JWT   |
| GET    | /api/auth/me    | Private | Get current user     |

### Users
| Method | Route              | Access  | Description        |
|--------|--------------------|---------|--------------------|
| POST   | /api/users         | Admin   | Create user        |
| GET    | /api/users         | Admin   | List all users     |
| GET    | /api/users/staff   | Admin+Mgr | List staff members |
| PUT    | /api/users/:id     | Admin   | Update user        |
| DELETE | /api/users/:id     | Admin   | Delete user        |

### Timetables
| Method | Route                   | Access      | Description         |
|--------|-------------------------|-------------|---------------------|
| POST   | /api/timetables         | Admin+Mgr   | Create timetable    |
| GET    | /api/timetables         | All auth    | List timetables     |
| GET    | /api/timetables/:id     | All auth    | Get timetable       |
| PUT    | /api/timetables/:id     | Admin+Mgr   | Update timetable    |
| DELETE | /api/timetables/:id     | Admin only  | Delete timetable    |
| GET    | /api/timetables/:id/pdf | All auth    | Download PDF        |

### Subject Expectations
| Method | Route                  | Access  | Description              |
|--------|------------------------|---------|--------------------------|
| POST   | /api/expectations      | Staff   | Submit/update preferences |
| GET    | /api/expectations/me   | Staff   | Get own preference       |
| GET    | /api/expectations      | Admin   | Get all preferences      |
| DELETE | /api/expectations/:id  | Admin   | Delete preference        |

---

## 👥 Role Permissions

| Feature                    | Admin | Manager | Staff | Student |
|----------------------------|-------|---------|-------|---------|
| Create users               | ✅    | ❌      | ❌    | ❌      |
| Delete users               | ✅    | ❌      | ❌    | ❌      |
| Create timetable           | ✅    | ✅      | ❌    | ❌      |
| Update timetable           | ✅    | ✅      | ❌    | ❌      |
| Delete timetable           | ✅    | ❌      | ❌    | ❌      |
| View timetable             | ✅    | ✅      | ✅    | ✅      |
| Download PDF               | ✅    | ✅      | ✅    | ✅      |
| Submit subject preferences | ❌    | ❌      | ✅    | ❌      |
| View all expectations      | ✅    | ❌      | ❌    | ❌      |

---

## 🛡️ Security Features

- **JWT Authentication** — tokens expire in 7 days
- **bcryptjs password hashing** — 12 salt rounds
- **Role-based middleware** — server-side route protection
- **CORS configured** — restricts to frontend origin
- **Global error handler** — standardized error responses
- **Input validation** — mongoose schema validators

---

## 🏗️ MongoDB Schemas

### User
```js
{ name, email, password(hashed), role, department, subjects[], isActive }
```

### TimeTable
```js
{ title, department, semester, section, academicYear, schedule[{ day, slots[{ period, startTime, endTime, subject, staffId, staffName, classroom, type }] }], createdBy }
```

### SubjectExpectation
```js
{ staffId, staffName, department, preferredTheorySubjects[max 3], preferredLabSubject, additionalNotes, academicYear }
```

---

## 📄 PDF Generation

Timetable PDFs are generated server-side using **PDFKit**:
- Landscape A4 format
- Color-coded cells (breaks, theory, lab)
- Staff names and classroom info
- Department/semester header
- Auto-download via blob URL in browser

---

## 🧪 Timetable Validation

Before saving, the system validates:
1. **Staff double-booking** — same staff cannot be in two places at the same time
2. **Classroom conflicts** — same classroom cannot have two classes at the same time
3. **Required fields** — title, department, semester, academicYear

---

## 🎨 Tech Stack

| Layer     | Technology          |
|-----------|---------------------|
| Frontend  | React 18, React Router 6 |
| Styling   | Custom CSS (dark theme, Sora font) |
| State     | React Context + useState |
| HTTP      | Axios with interceptors |
| Backend   | Node.js + Express.js |
| Database  | MongoDB + Mongoose  |
| Auth      | JWT + bcryptjs      |
| PDF       | PDFKit              |
| Dev Tools | Nodemon, Concurrently |

---

## 📝 Notes

- Student login is supported (role = 'student') with read-only timetable access
- The seed script creates sample users; run it once after first setup
- Staff can update their preferences any time before timetable is finalized
- The timetable editor has an inline cell-click interface for building schedules
