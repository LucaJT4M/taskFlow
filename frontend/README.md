# TaskFlow Frontend

React + Vite frontend for TaskFlow.

## Start

From project root:

```bash
npm --prefix frontend install
npm --prefix frontend run dev
```

Default dev URL is usually:

```text
http://127.0.0.1:5173
```

## Main Routes

- `/` login
- `/signup` registration
- `/dashboard` authenticated task dashboard
- `/admin` admin-only management area

## Current Feature Set

### Dashboard

- List and board views for tasks
- Task create/edit/delete
- Status filtering (`To Do`, `In Progress`, `Done`)
- Theme toggle
- Admin menu entry in sidebar (visible only for admin)

### Admin Area

- User list with task filtering by selected user
- Create user popup
- Edit user popup (username/password)
- Delete user confirmation popup
- Create task popup with assign-to selection
- Edit task popup (title/status)
- Delete task confirmation popup

## Admin Modules

Admin UI was split into reusable modules:

- `src/modules/admin/AdminSite.tsx` page container and orchestration
- `src/modules/admin/AdminPopups.tsx` popup components
- `src/modules/admin/useUsers.ts` user actions/state
- `src/classes/AdminClasses.ts` shared user/task domain types
- `src/classes/AdminPopUpClasses.ts` popup prop/type definitions

## Service/API Layer

- `src/modules/tasks/tasksApi.js`
  - `getTasks`
  - `createTask`
  - `createTaskAsAdmin`
  - `updateTask`
  - `deleteTask`
- `src/modules/tasks/useTasks.js`
  - `addTask`
  - `addTaskAsAdmin`
  - `editTask`
  - `removeTask`

## Backend Dependency Notes

Frontend expects backend at:

```text
http://localhost:8000
```

Admin task creation uses:

```http
POST /tasks/create_as_admin
```

with payload including `owner_id`.
