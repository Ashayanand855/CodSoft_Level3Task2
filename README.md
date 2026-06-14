# 🏢 ProManage — Enterprise Project Management Tool

> A full-stack, role-based project management application with **separate portals for Employees, Departments, and IT Admins**. Built with **React.js**, **Node.js (Express)**, and **SQLite** (local SQL database via Prisma ORM).

---

## 📌 Project Overview

**ProManage** is a premium, enterprise-grade project management tool designed for organizations where different levels of access are required across teams. The system implements a strict **Role-Based Access Control (RBAC)** model with **three distinct user roles**, each with their own view and set of permissions:

| Role | Portal / Access | What They Can Do |
|:---|:---|:---|
| **EMPLOYEE** | ❌ Cannot log in to the management dashboard | Employees are work recipients only. They are assigned tasks by Departments or IT Admin. They do **not** have dashboard access. |
| **DEPARTMENT** | ✅ Department Portal (Standard Dashboard) | Can log in, view dashboard, browse projects, view & manage tasks (create, assign to employees, update status), and see team workloads. |
| **ADMIN (IT)** | ✅ Full System Access (Master Admin) | Has everything a Department user has, **plus**: Access Control panel to create/delete any user, grant roles, revoke credentials, and delete projects from the listing page. The IT Admin manages everything in the system. |

### 🔑 Key Distinction — Employee vs Department vs Admin

- **Employees** are the workforce. They get tasks assigned to them but they **do NOT have login access** to the ProManage dashboard. The login page explicitly blocks Employee-role accounts with the message _"Access denied. Please use the Employee portal."_

- **Department** users are team leads or managers. They log in through the **Department Portal** login screen. Once authenticated, they see the full dashboard: projects, Kanban boards, tasks, and team members. They can create projects, assign tasks to employees, set deadlines, and track progress.

- **IT Admin** is the system superuser. They see everything a Department user sees **plus** an extra sidebar menu called **"Access Control"** (🛡️ icon). This panel shows a table of all users in the system with their roles and email addresses. The Admin can **add new members** (with any role), **set passwords**, and **delete/revoke access** for any non-admin user. The Admin can also **delete projects** directly from the project listing cards.

---

## 🛠️ Tech Stack — Languages, Frameworks, Libraries & Tools Used

### Frontend (Client-Side)
| Technology | Purpose |
|:---|:---|
| **React.js v19** | UI component library for building the interactive single-page application |
| **Vite v8** | Lightning-fast development server and production bundler for React |
| **JavaScript (JSX)** | Primary scripting language used across all frontend components |
| **Vanilla CSS** | Custom hand-written stylesheet — dark-mode glassmorphism theme with CSS custom properties, `@keyframes` animations, `backdrop-filter`, gradients, and custom scrollbars |
| **Lucide React** | Modern SVG icon library used for sidebar icons, buttons, badges, and visual indicators |
| **Google Fonts (Plus Jakarta Sans, Outfit)** | Premium web typography imported via `@import url()` in CSS |
| **Fetch API** | Native browser HTTP client used for all REST API calls (no Axios) |

### Backend (Server-Side)
| Technology | Purpose |
|:---|:---|
| **Node.js v22** | JavaScript server runtime |
| **Express.js v5** | Web framework handling REST API routing, middleware, and error handling |
| **Prisma ORM v5** | Object-Relational Mapper that generates type-safe database queries from a schema file |
| **SQLite** | Lightweight, file-based local SQL database — no external database server needed |
| **bcryptjs** | Password hashing library — all user passwords are salted and hashed before storage |
| **jsonwebtoken (JWT)** | Token-based authentication — generates a signed 24-hour session token on login |
| **cors** | Cross-Origin Resource Sharing middleware — allows the React frontend to communicate with the Express backend |
| **dotenv** | Loads environment variables from `.env` files |
| **nodemon** | Development utility that auto-restarts the server on file changes |
| **concurrently** | Runs the frontend dev server and backend server simultaneously from one command |

### Database (Local SQL)
| Technology | Purpose |
|:---|:---|
| **SQLite** | The entire database is a single file (`backend/prisma/dev.db`). No PostgreSQL, no MongoDB, no external servers. Pure local SQL. |
| **Prisma Schema Language** | Declarative data modeling language used in `schema.prisma` to define tables, columns, relationships, constraints, and defaults |
| **SQL Operations** | Prisma translates all operations to raw SQL queries: `CREATE TABLE`, `INSERT`, `SELECT`, `UPDATE`, `DELETE`, foreign key constraints (`ON DELETE CASCADE`, `ON DELETE SET NULL`), unique indexes, UUID generation |

---

## 🗄️ Database Schema (SQL Tables)

The database contains **3 tables** defined in `backend/prisma/schema.prisma`:

### `User` Table
```
┌─────────────┬──────────┬────────────────────────────────────┐
│ Column       │ Type     │ Details                            │
├─────────────┼──────────┼────────────────────────────────────┤
│ id           │ STRING   │ Primary Key, UUID auto-generated   │
│ name         │ STRING   │ Full name of the user              │
│ email        │ STRING   │ Unique, used as login identifier   │
│ password     │ STRING   │ bcrypt hashed, never stored plain  │
│ role         │ STRING   │ "EMPLOYEE" / "DEPARTMENT" / "ADMIN"│
│ avatarColor  │ STRING   │ HEX color for UI avatar circle     │
│ createdAt    │ DATETIME │ Auto-generated on creation         │
│ updatedAt    │ DATETIME │ Auto-updated on modification       │
└─────────────┴──────────┴────────────────────────────────────┘
```

### `Project` Table
```
┌─────────────┬──────────┬────────────────────────────────────────────────┐
│ Column       │ Type     │ Details                                        │
├─────────────┼──────────┼────────────────────────────────────────────────┤
│ id           │ STRING   │ Primary Key, UUID auto-generated               │
│ name         │ STRING   │ Project title                                  │
│ description  │ STRING?  │ Optional project description                   │
│ status       │ STRING   │ "PLANNING" / "IN_PROGRESS" / "ON_HOLD" / "COMPLETED" │
│ priority     │ STRING   │ "LOW" / "MEDIUM" / "HIGH"                      │
│ startDate    │ DATETIME?│ Optional project start date                    │
│ endDate      │ DATETIME?│ Optional project deadline                      │
│ createdAt    │ DATETIME │ Auto-generated                                 │
│ updatedAt    │ DATETIME │ Auto-updated                                   │
└─────────────┴──────────┴────────────────────────────────────────────────┘
```

### `Task` Table
```
┌─────────────┬──────────┬──────────────────────────────────────────────────┐
│ Column       │ Type     │ Details                                          │
├─────────────┼──────────┼──────────────────────────────────────────────────┤
│ id           │ STRING   │ Primary Key, UUID auto-generated                 │
│ title        │ STRING   │ Task name                                        │
│ description  │ STRING?  │ Optional task description                        │
│ status       │ STRING   │ "TODO" / "IN_PROGRESS" / "REVIEW" / "DONE"       │
│ priority     │ STRING   │ "LOW" / "MEDIUM" / "HIGH"                        │
│ dueDate      │ DATETIME?│ Optional task deadline                           │
│ projectId    │ STRING   │ Foreign Key → Project.id (ON DELETE CASCADE)      │
│ assigneeId   │ STRING?  │ Foreign Key → User.id (ON DELETE SET NULL)        │
│ createdAt    │ DATETIME │ Auto-generated                                   │
│ updatedAt    │ DATETIME │ Auto-updated                                     │
└─────────────┴──────────┴──────────────────────────────────────────────────┘
```

**Relationships:**
- A **Project** has many **Tasks** (one-to-many). Deleting a project cascades and deletes all its tasks.
- A **User** can be assigned to many **Tasks** (one-to-many). Deleting a user sets `assigneeId` to NULL on their tasks (tasks are preserved).

---

## 🔌 REST API Endpoints

| Method | Endpoint | Description |
|:---|:---|:---|
| `POST` | `/api/auth/login` | Authenticate a DEPARTMENT or ADMIN user; returns JWT token |
| `GET` | `/api/projects` | Retrieve all projects with task counts and completion percentage |
| `GET` | `/api/projects/:id` | Retrieve a single project with full task details and assignee info |
| `POST` | `/api/projects` | Create a new project |
| `PUT` | `/api/projects/:id` | Update project name, description, status, priority, or dates |
| `DELETE` | `/api/projects/:id` | Delete a project and cascade-delete all its tasks |
| `GET` | `/api/tasks` | Retrieve all tasks (supports `?projectId=`, `?assigneeId=`, `?status=` query filters) |
| `POST` | `/api/projects/:projectId/tasks` | Create a new task under a specific project |
| `PUT` | `/api/tasks/:id` | Update task title, status, priority, assignee, or due date |
| `DELETE` | `/api/tasks/:id` | Delete a specific task |
| `GET` | `/api/users` | Retrieve all users with computed workload statistics |
| `POST` | `/api/users` | Create a new user (name, email, password, role) — password is bcrypt hashed |
| `DELETE` | `/api/users/:id` | Delete a user account and revoke their system access |
| `GET` | `/health` | Server health check endpoint |

---

## 📁 Complete Project File Structure

```
Level3-task2/
│
├── package.json                          # Root: runs frontend + backend concurrently
│
├── backend/
│   ├── package.json                      # Backend dependencies & scripts
│   ├── server.js                         # Express app entry point (middleware, routes, port)
│   ├── prisma/
│   │   ├── schema.prisma                 # Database schema definition (User, Project, Task)
│   │   ├── seed.js                       # Seeds database with sample IT Admin, Department, Employee, projects & tasks
│   │   └── dev.db                        # SQLite database file (auto-generated, do NOT commit)
│   ├── controllers/
│   │   ├── authController.js             # Login logic — email/password verification, JWT generation, role gate
│   │   ├── projectController.js          # CRUD for projects — includes progress % computation
│   │   ├── taskController.js             # CRUD for tasks — supports filtering by project/assignee/status
│   │   └── userController.js             # CRUD for users — bcrypt hashing, role assignment, workload stats
│   └── routes/
│       ├── authRoutes.js                 # POST /api/auth/login
│       ├── projectRoutes.js              # GET/POST /api/projects, GET/PUT/DELETE /api/projects/:id
│       ├── taskRoutes.js                 # GET /api/tasks, PUT/DELETE /api/tasks/:id
│       └── userRoutes.js                 # GET/POST /api/users, DELETE /api/users/:id
│
└── frontend/
    ├── package.json                      # Frontend dependencies & Vite scripts
    ├── index.html                        # Root HTML document
    ├── vite.config.js                    # Vite configuration
    └── src/
        ├── main.jsx                      # React DOM mount point
        ├── App.jsx                       # Root component — routing, state management, modals, CRUD handlers
        ├── App.css                       # Cleared (all styles in index.css)
        ├── index.css                     # Full design system — dark glassmorphism theme, animations, components
        ├── utils/
        │   └── api.js                    # HTTP client wrapper — all fetch calls to backend REST API
        └── components/
            ├── Login.jsx                 # Login portal page (email + password, blocks Employees)
            ├── Sidebar.jsx               # Navigation sidebar (conditionally shows Access Control for Admin)
            ├── Dashboard.jsx             # Stats overview, active project cards, "My Tasks" panel
            ├── ProjectDetail.jsx         # Kanban board (4 columns: Todo → In Progress → Review → Done)
            ├── TeamManager.jsx           # Team roster with workload bars (assigned/done/pending per user)
            └── AccessControl.jsx         # Admin-only panel — user table with roles, emails, delete actions
```

---

## ⚙️ Environment Requirements

**You need the following installed on your machine before running the project:**

| Requirement | Minimum Version | Check Command |
|:---|:---|:---|
| **Node.js** | v18 or higher | `node -v` |
| **npm** | v9 or higher (comes with Node.js) | `npm -v` |

> **That's it.** No PostgreSQL. No MongoDB. No Docker. No Redis. The database is **SQLite** — a single file auto-generated inside `backend/prisma/dev.db`. Prisma handles everything.

---

## 🚀 **HOW TO RUN THE PROJECT**

### **Step 1 — Clone or navigate to the project directory**
```bash
cd Level3-task2
```

### **Step 2 — Install ALL dependencies (root + backend + frontend)**
```bash
npm run install-all
```
**This single command installs packages for:**
- The root directory (`concurrently`)
- The `backend/` directory (`express`, `prisma`, `@prisma/client`, `bcryptjs`, `jsonwebtoken`, `cors`, `dotenv`, `nodemon`)
- The `frontend/` directory (`react`, `react-dom`, `vite`, `lucide-react`)

### **Step 3 — Initialize the database and seed it with sample data**
```bash
cd backend
npx prisma db push
node prisma/seed.js
cd ..
```
**`npx prisma db push`** — Creates the SQLite database file (`dev.db`) and generates the Prisma Client.

**`node prisma/seed.js`** — Populates the database with 3 default users, 2 projects, and 5 tasks.

### **Step 4 — Start the application**
```bash
npm run dev
```
**This starts BOTH servers concurrently:**
- 🖥️ **Frontend (React):** `http://localhost:5173`
- 🔧 **Backend (Express API):** `http://localhost:5001`

### **Step 5 — Login with these pre-seeded credentials**

| Role | Email | Password | Access Level |
|:---|:---|:---|:---|
| **IT Admin** | `IT@promanage.com` | `password@123` | Full system access + Access Control panel |
| **Department** | `bob@example.com` | `password123` | Standard dashboard (projects, tasks, team) |
| **Employee** | `charlie@example.com` | `password123` | ❌ **Cannot log in** — will see "Access denied" |

---

## 📂 Extra Files Required / Auto-Generated

| File | Location | How It's Created | Purpose |
|:---|:---|:---|:---|
| `dev.db` | `backend/prisma/dev.db` | Auto-generated by `npx prisma db push` | The SQLite database file containing all tables and data |
| `node_modules/` | `./`, `backend/`, `frontend/` | Auto-generated by `npm install` | Package dependencies (do NOT commit to Git) |
| `package-lock.json` | `./`, `backend/`, `frontend/` | Auto-generated by `npm install` | Dependency lock files |

> **No `.env` file is required.** The app uses a hardcoded JWT secret for this exercise. If deploying to production, create a `backend/.env` file with:
> ```
> PORT=5001
> JWT_SECRET=your_secure_secret_here
> ```

---

## 🖥️ Application Screenshots & Views

### Login Portal (Department/Admin only)
- Glassmorphism card centered on screen
- Email + Password fields with icon decorations
- Blocks Employee accounts with a clear error message
- Shows "Department Portal Access" label

### Dashboard (After Login)
- **Stats Bar:** Total Projects, Active Tasks, Completed Tasks, Overdue Tasks
- **Project Progress Cards:** Clickable cards with progress bars, priority badges, and deadlines
- **My Active Tasks:** Tasks specifically assigned to the logged-in user

### Kanban Board (Inside a Project)
- **4 Columns:** To Do → In Progress → In Review → Done
- Inline status dropdowns to move tasks between columns
- Inline assignee dropdowns to reassign tasks to any Employee
- Priority badges (LOW / MEDIUM / HIGH) with color coding
- Overdue date highlighting with ⚠️ warning icons
- Add Task modal with title, description, priority, due date, and assignee fields

### Team Members Page
- Avatar cards for each user with workload statistics
- Progress bars showing completion rates per person
- Stats: Total Assigned / Done / Pending

### Access Control (Admin Only — 🛡️ Shield Icon)
- Full user table with Name, Role Badge, Email Address
- Admin can **Add Member / Email** → opens a modal with Name, Email, Password, and Role selector
- Admin can **Delete** any non-admin user (revokes their access)
- Role options: Employee (Limited Access) / Department (Standard Dashboard) / Master Admin (Full System Access)

---

## 🔐 Authentication & Security

1. **Password Hashing:** All passwords are hashed using `bcryptjs` with 10 salt rounds before being stored in the database. Plain-text passwords are **never** stored.
2. **JWT Tokens:** On successful login, the server issues a JSON Web Token valid for 24 hours. The token contains the user's `id`, `email`, and `role`.
3. **Role Gating at Login:** The login API endpoint explicitly checks the user's role. Only `DEPARTMENT` and `ADMIN` roles are allowed through. `EMPLOYEE` accounts receive a 403 Forbidden response.
4. **Frontend Route Protection:** The React app conditionally renders the Login component until `isAuthenticated` is `true`. Admin-only features (Access Control sidebar item, Delete Project buttons) are conditionally rendered based on `activeUser.role === 'ADMIN'`.

---

## 📋 Summary

| Aspect | Detail |
|:---|:---|
| **Frontend Language** | JavaScript (JSX) |
| **Frontend Framework** | React.js v19 + Vite v8 |
| **Styling** | Vanilla CSS (dark glassmorphism, custom properties, keyframes) |
| **Icons** | Lucide React |
| **Backend Language** | JavaScript (Node.js) |
| **Backend Framework** | Express.js v5 |
| **Database** | SQLite (local SQL file — no external DB server) |
| **ORM** | Prisma v5 |
| **Schema Language** | Prisma Schema Language (compiles to SQL DDL) |
| **Authentication** | bcryptjs + JSON Web Tokens (JWT) |
| **API Architecture** | RESTful (MVC pattern: Controllers → Routes → Server) |
| **Package Manager** | npm |
| **Dev Tools** | nodemon (auto-restart), concurrently (parallel processes), Vite HMR |

---

**Built as CodSoft Level 3 — Task 2: Project Management Tool**
