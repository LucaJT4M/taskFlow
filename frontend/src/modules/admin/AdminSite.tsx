import { useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../tasks/useTheme";
import { UserItem, TaskItem } from "../../classes/AdminClasses";

const demoUsers: UserItem[] = [
    { id: 1, username: "admin" },
    { id: 2, username: "emma" },
    { id: 3, username: "liam" },
];

const demoTasks: TaskItem[] = [
    { id: 1, userId: 1, title: "Review project structure", status: "In Progress", dueDate: "2026-10-08" },
    { id: 2, userId: 2, title: "Write API tests", status: "To Do", dueDate: "2026-10-10" },
    { id: 3, userId: 2, title: "Fix signup edge case", status: "Done", dueDate: "2026-10-03" },
    { id: 4, userId: 3, title: "Refine dashboard copy", status: "To Do", dueDate: "2026-10-12" },
];

function AdminSite() {
    const { theme, toggleTheme } = useTheme();
    const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
    const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<number>(demoUsers[0]?.id ?? 0);

    const selectedUser = demoUsers.find((user) => user.id === selectedUserId) ?? null;
    const visibleTasks = demoTasks.filter((task) => task.userId === selectedUserId);

    return (
        <div className="app-dark admin-shell" data-theme={theme}>
            <div className="admin-page">
                <header className="admin-header">
                    <div>
                        <p className="admin-overline">Admin</p>
                        <h1>User and Task Management</h1>
                        <p className="admin-subtitle">UI-only scaffold: wire your own logic for CRUD actions.</p>
                    </div>
                    <div className="admin-header-actions">
                        <button
                            type="button"
                            className="theme-toggle"
                            onClick={toggleTheme}
                            title={theme === "light" ? "Dunkles Design" : "Helles Design"}
                        >
                            {theme === "light" ? "☾" : "☀"}
                        </button>
                        <Link to="/dashboard" className="admin-btn admin-btn-secondary">Back to Dashboard</Link>
                    </div>
                </header>

                <main className="admin-layout">
                    <section className="admin-panel" aria-label="user management">
                        <div className="admin-panel-header">
                            <h2>Users</h2>
                            <button type="button" className="admin-btn admin-btn-primary" onClick={() => setIsCreateUserOpen(true)}>
                                + Create User
                            </button>
                        </div>

                        <ul className="admin-user-list">
                            {demoUsers.map((user) => {
                                const isActive = user.id === selectedUserId;

                                return (
                                    <li key={user.id} className={isActive ? "is-active" : ""}>
                                        <div className="admin-user-main">
                                            <h3>{user.username}</h3>
                                        </div>
                                        <div className="admin-actions">
                                            <button type="button" className="admin-mini-btn" onClick={() => setSelectedUserId(user.id)}>
                                                Show Tasks
                                            </button>
                                            <button type="button" className="admin-mini-btn">
                                                Edit
                                            </button>
                                            <button type="button" className="admin-mini-btn admin-danger-btn">
                                                Delete
                                            </button>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </section>

                    <section className="admin-panel" aria-label="task management">
                        <div className="admin-panel-header">
                            <h2>{selectedUser ? `${selectedUser.username}'s Tasks` : "Tasks"}</h2>
                            <button type="button" className="admin-btn admin-btn-primary" onClick={() => setIsCreateTaskOpen(true)}>
                                + Create Task
                            </button>
                        </div>

                        <div className="admin-table-wrap">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Title</th>
                                        <th>Status</th>
                                        <th>Due Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {visibleTasks.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="admin-empty-cell">No tasks for this user yet.</td>
                                        </tr>
                                    )}
                                    {visibleTasks.map((task) => (
                                        <tr key={task.id}>
                                            <td>{task.title}</td>
                                            <td>
                                                <span className={`admin-badge admin-badge-${task.status.toLowerCase().replace(" ", "-")}`}>
                                                    {task.status}
                                                </span>
                                            </td>
                                            <td>{task.dueDate}</td>
                                            <td>
                                                <div className="admin-actions">
                                                    <button type="button" className="admin-mini-btn">Edit</button>
                                                    <button type="button" className="admin-mini-btn admin-danger-btn">Delete</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </main>
            </div>

            {isCreateUserOpen && (
                <div className="admin-modal-backdrop" role="dialog" aria-modal="true" aria-label="Create user popup" onClick={() => setIsCreateUserOpen(false)}>
                    <div className="admin-modal" onClick={(event) => event.stopPropagation()}>
                        <div className="admin-modal-header">
                            <h3>Create User</h3>
                            <button type="button" className="admin-modal-close" onClick={() => setIsCreateUserOpen(false)}>x</button>
                        </div>
                        <form className="admin-modal-form">
                            <label htmlFor="new-username">Username</label>
                            <input id="new-username" type="text" placeholder="Enter username" />

                            <label htmlFor="new-password">Password</label>
                            <input id="new-password" type="password" placeholder="Enter password" />

                            <div className="admin-modal-actions">
                                <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setIsCreateUserOpen(false)}>
                                    Cancel
                                </button>
                                <button type="button" className="admin-btn admin-btn-primary">Create User</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isCreateTaskOpen && (
                <div className="admin-modal-backdrop" role="dialog" aria-modal="true" aria-label="Create task popup" onClick={() => setIsCreateTaskOpen(false)}>
                    <div className="admin-modal" onClick={(event) => event.stopPropagation()}>
                        <div className="admin-modal-header">
                            <h3>Create Task</h3>
                            <button type="button" className="admin-modal-close" onClick={() => setIsCreateTaskOpen(false)}>x</button>
                        </div>
                        <form className="admin-modal-form">
                            <label htmlFor="new-task-title">Title</label>
                            <input id="new-task-title" type="text" placeholder="Task title" />

                            <label htmlFor="new-task-description">Description</label>
                            <textarea id="new-task-description" rows={3} placeholder="Task description" />

                            <div className="admin-modal-grid">
                                <div>
                                    <label htmlFor="new-task-user">Assign To</label>
                                    <select id="new-task-user" defaultValue={String(selectedUserId || "")}> 
                                        {demoUsers.map((user) => (
                                            <option key={user.id} value={user.id}>{user.username}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="new-task-status">Status</label>
                                    <select id="new-task-status" defaultValue="To Do">
                                        <option>To Do</option>
                                        <option>In Progress</option>
                                        <option>Done</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="new-task-date">Due Date</label>
                                    <input id="new-task-date" type="date" />
                                </div>
                            </div>

                            <div className="admin-modal-actions">
                                <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setIsCreateTaskOpen(false)}>
                                    Cancel
                                </button>
                                <button type="button" className="admin-btn admin-btn-primary">Create Task</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminSite;
