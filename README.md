# WorkTracker Pro — Task Management System

> **WorkTracker Pro** is a role-based task management app where admins create & assign tasks and employees track & update their progress through a clean, responsive dashboard.

---

## 📌 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Getting Started](#getting-started)
- [User Roles & Credentials](#user-roles--credentials)
- [Application Modules](#application-modules)
- [Database / Data Structure](#database--data-structure)
- [UI & Design](#ui--design)
- [Screenshots](#screenshots)
- [Author](#author)

---

## Overview

**WorkTracker Pro** is a clean, responsive, and production-ready task management web application designed to streamline team productivity and accountability. Built with **React** and **Tailwind CSS**, it offers a professional dashboard experience for both administrators and employees.

The platform features a **role-based authentication system** where admins and employees have clearly defined access levels. Administrators can create, assign, edit, and delete tasks, while employees can view their assigned tasks and update progress in real time. Data is persisted via **localStorage**, making it fully functional without a backend server — ideal for demos and prototyping.

---

## Features

### 🔐 Authentication
- Secure login with hashed passwords (`btoa` + salt)
- Role-based access control (Admin / Employee)
- Session persistence via `localStorage`
- Protected routes — employees cannot access admin pages
- Logout functionality

### ⚡ Admin Features
- View overall dashboard with stats (Total Tasks, Completed, Pending, Total Users)
- Create, edit, and delete tasks
- Assign tasks to specific employees
- Filter tasks by status, priority, and assignee
- Toggle between Grid and List view
- View employee performance metrics and completion rates

### 👤 Employee Features
- Personalized dashboard with completion progress
- Kanban-style task board (Pending → In Progress → Completed)
- Update task status with one click
- View full task details in a modal
- Overdue task alerts and urgent task notifications
- Search and filter personal tasks

### 📋 Task Module
Each task includes:
- **Title** — Short descriptive name
- **Description** — Detailed explanation
- **Priority** — Low / Medium / High
- **Deadline** — Due date
- **Status** — Pending / In Progress / Completed
- **Assigned To** — Employee reference
- **Created By** — Admin reference
- **Timestamps** — Created at & Updated at

---

## Tech Stack

| Layer        | Technology                     |
|--------------|-------------------------------|
| Frontend     | React 18 + TypeScript          |
| Styling      | Tailwind CSS                   |
| Build Tool   | Vite                           |
| State Mgmt   | React Context API + useState   |
| Persistence  | localStorage (browser-based)   |
| Icons/UI     | Emoji-based + custom CSS       |

---

## Folder Structure

```
worktracker-pro/
├── public/
│   └── vite.svg
├── src/
│   ├── App.tsx          # Complete self-contained application
│   ├── main.tsx         # React entry point
│   └── index.css        # Tailwind base styles
├── index.html           # HTML entry point
├── package.json         # Dependencies
├── tailwind.config.js   # Tailwind configuration
├── tsconfig.json        # TypeScript configuration
├── vite.config.ts       # Vite configuration
└── README.md            # Project documentation
```

### App.tsx Internal Structure

```
App.tsx
├── TYPES                 — User, Task, Role, Priority, Status
├── HELPERS               — Password hashing, UID generation, date formatting
├── SEED DATA             — Default users and tasks
├── CONTEXTS              — AuthCtx, TaskCtx (React Context API)
├── STYLE HELPERS         — Priority/Status badge color maps
├── COMPONENTS
│   ├── Av                — Avatar component
│   ├── PBadge            — Priority badge
│   ├── SBadge            — Status badge
│   ├── Modal             — Reusable modal
│   ├── TaskForm          — Create/Edit task form
│   ├── TaskDetail        — Task detail modal
│   ├── TaskCard          — Task card (grid/kanban)
│   ├── Sidebar           — Navigation sidebar
│   └── Header            — Top header bar
├── PAGES
│   ├── AdminDash         — Admin dashboard
│   ├── AdminTasks        — Admin task management
│   ├── AdminUsers        — Admin user management
│   ├── EmpDash           — Employee dashboard
│   ├── EmpTasks          — Employee Kanban board
│   └── Login             — Login page
└── ROOT
    └── App               — Root component with providers
```

---

## Getting Started

### Prerequisites
- **Node.js** v18 or higher → [Download](https://nodejs.org)
- **npm** v9 or higher (comes with Node.js)

### Installation & Running Locally

```bash
# 1. Clone the repository
git clone https://github.com/your-username/worktracker-pro.git

# 2. Navigate into the project folder
cd worktracker-pro

# 3. Install dependencies
npm install

# 4. Start the development server
npm run dev

# 5. Open in browser
# http://localhost:5173
```

### Build for Production

```bash
npm run build
```

The optimized output will be in the `dist/` folder, ready to be served by any static hosting provider (Vercel, Netlify, GitHub Pages, etc.).

---

## User Roles & Credentials

### Admin Account

| Field    | Value                          |
|----------|-------------------------------|
| Name     | Dyutishmaan Das                |
| Email    | `admin@worktrackerpro.com`     |
| Password | `admin123`                     |
| Role     | Admin                          |
| Dept     | Management                     |

### Employee Accounts

| Name           | Email                           | Password | Department  |
|----------------|--------------------------------|----------|-------------|
| Shiv Mishra    | `shiv@worktrackerpro.com`      | `emp123` | Engineering |
| Kush Bansal    | `kush@worktrackerpro.com`      | `emp123` | Design      |
| Lakshya Kumar  | `lakshya@worktrackerpro.com`   | `emp123` | Marketing   |
| Roshni Kumari  | `roshni@worktrackerpro.com`    | `emp123` | Engineering |

> **Note:** All data resets automatically when the app version changes. No manual cache clearing is needed.

---

## Application Modules

### 1. Login Page
- Email + password form with show/hide password toggle
- Error messages for invalid credentials
- Loading spinner on submit
- Secure hashed password comparison

### 2. Admin Dashboard
- **4 Stat Cards** — Total Tasks, Completed, Pending, Total Users
- **Task Overview** — Progress bars for each status
- **Alerts Panel** — Overdue count + High Priority count
- **Recent Tasks** — Latest 5 tasks with assignee avatars
- **Employee Performance** — Completion rate bars per employee

### 3. Admin — All Tasks
- Search bar (title + description)
- Filters: Status, Priority, Assigned User
- Grid view (cards) and List view (table)
- Create Task modal (full form validation)
- Edit Task modal (pre-filled form)
- Delete confirmation modal
- Task detail view modal

### 4. Admin — Users
- Summary stats: Total Employees, Tasks Assigned, Avg. Completion
- Employee cards showing: Name, Dept, Email, Completion %, Task counts
- Gradient progress bar per employee
- Recent 3 tasks per employee with status badges

### 5. Employee Dashboard
- Personalized welcome banner with overall completion progress
- **4 Stat Cards** — My Tasks, Completed, In Progress, Pending
- Overdue alert banner (if applicable)
- **Needs Attention** panel — High priority & overdue tasks
- **Recent Activity** panel — Latest updated tasks

### 6. Employee — My Tasks (Kanban Board)
- 3-column Kanban: Pending / In Progress / Completed
- Search and filter tasks
- Inline status update buttons on each card
- Task detail modal with status update option

---

## Database / Data Structure

Since this is a frontend-only app, data is stored in `localStorage`. The structure mirrors a relational database design:

### Users Table

```typescript
interface User {
  id: string;         // Unique identifier (e.g., "u1")
  name: string;       // Full name
  email: string;      // Login email (unique)
  hash: string;       // Hashed password (btoa + salt)
  role: "admin" | "employee";
  avatar: string;     // Initials (e.g., "DD")
  dept: string;       // Department name
}
```

### Tasks Table

```typescript
interface Task {
  id: string;         // Unique identifier (e.g., "t1")
  title: string;      // Task title
  desc: string;       // Full description
  priority: "Low" | "Medium" | "High";
  status: "Pending" | "In Progress" | "Completed";
  deadline: string;   // ISO date string
  assignedTo: string; // FK → User.id
  createdBy: string;  // FK → User.id
  createdAt: string;  // ISO timestamp
  updatedAt: string;  // ISO timestamp
}
```

### Relationships

```
Users (1) ──────< Tasks (many)   [assignedTo → User.id]
Users (1) ──────< Tasks (many)   [createdBy  → User.id]
```

---

## UI & Design

- **Color Scheme** — Slate/Violet primary palette with semantic colors (red=danger, green=success, amber=warning, blue=info)
- **Typography** — Inter font, clean hierarchy
- **Responsive** — Mobile-first design, works on all screen sizes
- **Sidebar** — Collapsible on mobile with overlay backdrop
- **Status Badges** — Color-coded pill badges for Priority and Status
- **Modals** — Smooth backdrop blur overlays
- **Cards** — Hover lift animations, shadow transitions
- **Kanban Board** — 3-column layout with task count headers

---

## Screenshots

| Screen              | Description                              |
|---------------------|------------------------------------------|
| Login Page          | Purple gradient header, email/password   |
| Admin Dashboard     | Stats, progress bars, alerts, recent     |
| All Tasks (Grid)    | Card grid with filters and search        |
| All Tasks (List)    | Tabular view with inline actions         |
| Users Page          | Employee cards with performance metrics  |
| Employee Dashboard  | Personal stats, urgent tasks, activity   |
| My Tasks (Kanban)   | 3-column board with status update btns   |

---

## Author

**Dyutishmaan Das**
- Role: Admin / Developer
- Email: `admin@worktrackerpro.com`

---

## License

This project is built for educational and demonstration purposes.

© 2025 WorkTracker Pro — All rights reserved.
