# Workspace Manager 🚀

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://workspace-project-sandy.vercel.app/)
[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/ZainAwanCodes/workspace-project-)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-v2-764ABC?style=for-the-badge&logo=redux&logoColor=white)](https://redux-toolkit.js.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

**Workspace Manager** is a feature-rich, high-performance collaborative project management platform built with React 19, TypeScript, Redux Toolkit, and Tailwind CSS. Designed with Notion and Jira-level functionality, it provides dynamic Kanban boards, interactive list views, full-featured calendar scheduling, simulated real-time collaboration, role-based permissions, offline persistence, undo/redo history, and quick command palette navigation (`⌘K` / `Ctrl+K`).

---

## 🔗 Quick Links

- 🌐 **Live Application**: [https://workspace-project-sandy.vercel.app/](https://workspace-project-sandy.vercel.app/)
- 📦 **GitHub Repository**: [https://github.com/ZainAwanCodes/workspace-project-](https://github.com/ZainAwanCodes/workspace-project-)

---

## ✨ Features Overview

The application includes **70+ discrete features** grouped into **14 key domains**:

### 🔐 1. Auth & User Management (Simulated Client-Side)
- **Login / Signup Screen**: Login and registration with mock credential verification.
- **Session Persistence**: Persisted authentication state stored locally.
- **User Profiles**: Editable user profiles with avatars, names, and emails.
- **Multi-User Profile Switching**: Switch between multiple team member profiles (`Owner`, `Admin`, `Member`, `Viewer`) instantly to test permissions.
- **Session Reset**: Logout and session clearing.

### 🏢 2. Workspaces
- **Full Workspace Lifecycle**: Create, rename, customize, and delete workspaces.
- **Multi-Workspace Switching**: Switch between multiple workspaces with a single click.
- **Workspace Customization**: Assign custom names, icons, accent colors, and default project views.
- **Workspace Member Management**: View and invite team members with assigned roles.
- **Auto-Fallback Navigation**: Deleting a workspace automatically switches to the next available workspace or returns safely to home.

### 📁 3. Projects
- **Project Management**: Create, edit, archive, and delete projects within any workspace.
- **Tagging & Personalization**: Project color palettes, custom icons, and rich descriptions.
- **Member Assignment**: Assign specific workspace members to individual projects.
- **Project Templates**: Start projects quickly with predefined task column structures and templates.
- **Archived Projects Drawer**: Toggle and view archived projects separately.

### 📋 4. Tasks & Subtasks
- **Task Field Suite**: Title, description, status columns, priority levels (`low`, `medium`, `high`, `urgent`), due date range, assignees, and custom labels/tags.
- **Nested Checklist Subtasks**: Checklist items with completion tracking.
- **Task Detail Drawer & Expanded View**: Deep view with rich metadata, attachment support, and comment feeds.
- **Attachments**: Support for image & document attachments stored in client state.
- **Task Actions**: Duplicate tasks, convert subtasks to tasks (and vice-versa), mark complete.
- **Bulk Task Operations**: Multi-select tasks to perform bulk status updates, assignee changes, or deletions.

### 📊 5. Multiple Data Representations (Views)
- **Kanban Board View**: Drag-and-drop tasks between columns using `@dnd-kit`.
- **Customizable Columns**: Create, edit, reorder, and remove columns per project.
- **List / Table View**: Data table layout with sortable columns and group-by filters.
- **Calendar View**: Full-month schedule display showing task due dates.
- **View Persistence**: Saves last-used view preference per project.

### 🔍 6. Filtering, Search & Sorting
- **Global Search**: Search across tasks, projects, and workspaces instantly.
- **Multi-Criterion Filters**: Filter by assignee, labels, priority, status, and due date.
- **Sorting Options**: Sort by due date, priority, created date, or alphabetical order.
- **Saved Filter Presets**: Quick access to common filtering views.

### 🛡️ 7. Role-Based Access Controls (RBAC)
- **4 Permission Roles**: `Owner`, `Admin`, `Member`, and `Viewer`.
- **Permission-Gated UI**: Restricts editing/deletion options depending on role (e.g. Viewers are restricted to read-only views).
- **Access Control Tooltips**: Helpful context popups on disabled controls.

### 📜 8. Activity Log
- **Task Activity Feed**: Comprehensive history of task creation, edits, status changes, and comments.
- **Project-Level Aggregation**: Timeline feed of overall project activity.
- **Timestamps & Attribution**: Clear display of acting user and timestamp for every change.

### 💬 9. Comments & Collaboration
- **Task Discussion Threads**: Post, edit, and delete comments on tasks.
- **@Mention Autocomplete**: Tag team members with `@` autocomplete popup.
- **Simulated Real-Time Events**: Live event simulation for incoming comments and updates.

### ↩️ 10. Undo / Redo Stack & Optimistic UX
- **Action History Stack**: Full undo/redo support (`⌘Z` / `⌘Shift+Z`) for task updates and moves.
- **Optimistic UI Updates**: Immediate response on user interaction with automatic toast notifications.
- **Inline Toast Undo**: Revert changes directly from feedback notification toasts.

### 🔔 11. In-App Notifications
- **Notification Bell**: Unread indicator count badge in header.
- **Event Notifications**: Triggers on task assignment, @mentions, and approaching due dates.
- **Notification Controls**: Mark single/all as read, with event type preference toggles.

### 💾 12. Persistence & Offline Support
- **Full State Storage**: App state automatically persisted to `localStorage` / `IndexedDB`.
- **Rehydration**: Instant state rehydration on page refresh.
- **Offline Indicator**: Real-time connection status monitoring via `navigator.onLine`.
- **Data Export & Import**: Export workspace configuration and task state to JSON file and import back with schema validation.
- **Full Factory Reset**: Option to clear all data back to clean defaults.

### ⚡ 13. UI / UX Utilities
- **Command Palette (`⌘K` / `Ctrl+K`)**: Rapid navigation and action execution modal.
- **Keyboard Shortcuts**: Keyboard shortcuts for creating tasks, changing views, and toggling tools.
- **Theme Toggle**: Dark Mode and Light Mode with seamless CSS variable transitions.
- **Responsive Layout**: Mobile drawer sidebar navigation and mobile-optimized views.

### ⚙️ 14. Workspace & App Settings
- App-wide preferences, theme toggles, default view selection, and data management options.

---

## 🛠️ Tech Stack & Architecture

- **Frontend Framework**: React 19 + TypeScript
- **Build Tool**: Vite 6
- **State Management**: Redux Toolkit (`@reduxjs/toolkit` with entity adapters & custom persistence middleware)
- **Styling**: Tailwind CSS v4 + Vanilla CSS Custom Variables
- **Drag & Drop**: `@dnd-kit/core`, `@dnd-kit/sortable`
- **Icons**: Lucide React (`lucide-react`)
- **Animations**: Motion (`motion/react`) & GSAP
- **Date Formatting**: `date-fns`
- **Routing**: `react-router-dom` v7

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js (v18.x or higher)
- npm (v9.x or higher)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/ZainAwanCodes/workspace-project-.git
   cd workspace-project-
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:3000`.

4. **Build for production**:
   ```bash
   npm run build
   ```

5. **Preview production build**:
   ```bash
   npm run preview
   ```

---

## 📱 Screenshots & Demo

Visit the live production environment hosted on Vercel:  
👉 **[https://workspace-project-sandy.vercel.app/](https://workspace-project-sandy.vercel.app/)**

---

## 📄 License

This project is licensed under the MIT License.
