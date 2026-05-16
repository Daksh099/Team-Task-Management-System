# TaskFlow - Modern Task Management System 🚀

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-4EA94B?style=for-the-badge&logo=mongodb)

TaskFlow is a powerful, full-stack Task Management System built with the latest web technologies. It provides a seamless experience for teams to assign, track, and manage their daily tasks with robust role-based access control (Admin vs. Member).

## ✨ Key Features

- **Authentication & Security:** Secure JWT-based authentication with Edge Middleware protection.
- **Role-Based Access Control (RBAC):** Distinct dashboards and permissions for Admins and Members.
- **Task Management:** Create, read, update, and track statuses of tasks.
- **Activity Logging:** Comprehensive tracking of all actions taken within the system.
- **Notifications:** Real-time system notifications for task updates and assignments.
- **Reschedule Requests:** Dedicated workflow for members to request deadline extensions.
- **Modern UI:** Built with Tailwind CSS and Shadcn UI components for a beautiful, responsive, and accessible interface.
- **Dark Mode:** Built-in theme toggling for light and dark preferences.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js (App Router)
- **Library:** React
- **Styling:** Tailwind CSS & Shadcn UI
- **State Management:** Zustand
- **Form Handling:** React Hook Form & Zod (Validation)

### Backend
- **Framework:** Next.js Route Handlers (`/api`)
- **Database:** MongoDB Atlas
- **ORM/ODM:** Mongoose
- **Auth:** JSON Web Tokens (JWT) & bcryptjs

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed on your machine:
- [Node.js](https://nodejs.org/en/) (v18 or higher)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account and cluster setup.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/Task-Manager.git
   cd Task-Manager
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env` file in the root directory and add the following variables. *(Make sure to replace the `<db_password>` and database URL with your actual MongoDB credentials!)*

   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?appName=Cluster0
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open the application:**
   Navigate to (https://team-task-management-system-production.up.railway.app/) in your browser.

---

## 📂 Project Structure

```text
Task-Manager/
├── public/                 # Static assets (images, icons, etc.)
├── src/                    # Main application source code
│   ├── app/                # Next.js App Router (Pages, Layouts, APIs)
│   │   ├── (pages)/        # UI Routes (e.g., /login, /register, /dashboard)
│   │   ├── api/            # Backend API Route Handlers
│   │   ├── globals.css     # Global Tailwind CSS styles
│   │   └── layout.tsx      # Root application layout
│   │
│   ├── components/         # Reusable React components
│   │   ├── ui/             # Shadcn UI basic components (Buttons, Inputs)
│   │   └── providers.tsx   # Global Context Providers (Theme, Auth)
│   │
│   ├── lib/                # Utility functions and configurations
│   │   ├── api.ts          # Axios setup for frontend requests
│   │   ├── db.ts           # MongoDB connection logic
│   │   ├── jwt.ts          # Authentication token utilities
│   │   └── validations.ts  # Zod schema definitions
│   │
│   ├── models/             # Mongoose Database Schemas
│   │   ├── ActivityLog.ts  # System activity tracking
│   │   ├── Notification.ts # User notifications
│   │   ├── RescheduleRequest.ts # Task deadline extension requests
│   │   ├── Task.ts         # Core task data structure
│   │   └── User.ts         # User profiles and authentication data
│   │
│   ├── store/              # Global State Management
│   │   └── authStore.ts    # Zustand store for User Authentication State
│   │
│   └── middleware/         # Next.js Edge Middleware (Route Protection)
│
├── .env                    # Environment variables (Do not commit!)
├── tailwind.config.ts      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Project dependencies and scripts
```

---

## 🔒 Security Notes
- Passwords are automatically hashed using `bcryptjs` before being saved to the database.
- Next.js Edge Middleware prevents unauthorized access to protected routes like `/dashboard`.
- Always ensure your IP address is whitelisted in MongoDB Atlas under **Network Access** when running locally!

## 📜 License

This project is licensed under the MIT License.
