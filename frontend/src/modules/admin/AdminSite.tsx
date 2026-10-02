import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getUsers, getTasks } from "../../services/AdminService";

const users = [
    { id: 1, name: "Lena Fischer", role: "Frontend Developer", total: 6, done: 3 },
    { id: 2, name: "Noah Bauer", role: "Backend Developer", total: 5, done: 2 },
    { id: 3, name: "Mia Becker", role: "QA Engineer", total: 4, done: 4 },
    { id: 4, name: "Jonas Klein", role: "Product Owner", total: 3, done: 1 },
];

const tasks = [
    {
        id: 1,
        title: "Create API error mapping",
        user: "Noah Bauer",
        status: "To Do",
        dueDate: "2026-10-10",
        priority: "High",
    },
    {
        id: 2,
        title: "Update login empty-state copy",
        user: "Lena Fischer",
        status: "In Progress",
        dueDate: "2026-10-05",
        priority: "Medium",
    },
    {
        id: 3,
        title: "Regression pass on auth flow",
        user: "Mia Becker",
        status: "Done",
        dueDate: "2026-10-03",
        priority: "Low",
    },
    {
        id: 4,
        title: "Define sprint acceptance notes",
        user: "Jonas Klein",
        status: "To Do",
        dueDate: "2026-10-11",
        priority: "Medium",
    },
];

function AdminSite() {
    const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
    const [users, setUsers] = useState(() => getUsers())
    const [tasks, setTasks] = useState(() => getTasks())

    useEffect(() => {
        localStorage.setItem("theme", theme);
    }, [theme]);

    function toggleTheme() {
        setTheme((currentTheme) => (currentTheme === "light" ? "dark" : "light"));
    }

    return (
        <div className="app-dark admin-page-wrap" data-theme={theme}>
            <div className="admin-page">
                <nav className="topbar admin-topbar">
                    <div className="brand">
                        <span className="brand-mark">✓</span>
                        TaskFlow Admin
                    </div>
                    <div className="topbar-actions">
                        <button
                            type="button"
                            className="theme-toggle"
                            onClick={toggleTheme}
                            title={theme === "light" ? "Dunkles Design" : "Helles Design"}
                        >
                            {theme === "light" ? "☾" : "☀"}
                        </button>
                    </div>
                </nav>

                <header className="admin-header">
                    <div>
                        <p className="admin-overline">Admin Panel</p>
                        <h1>Users and Task Control Center</h1>
                        <p className="admin-subtitle">
                            Manage users and prepare task operations. Buttons and forms are UI-only.
                        </p>
                    </div>
                    <div className="admin-header-actions">
                        <button type="button" className="admin-btn admin-btn-secondary">
                            Export View
                        </button>
                        <Link to="/dashboard" className="admin-btn admin-btn-primary">
                            Back to Dashboard
                        </Link>
                    </div>
                </header>

                <section className="admin-stats" aria-label="overview">
                    <article>
                        <p>Users</p>
                        <strong>{users.length}</strong>
                    </article>
                    <article>
                        <p>Tasks</p>
                        <strong>{tasks.length}</strong>
                    </article>
                    <article>
                        <p>In Progress</p>
                        <strong>{tasks.filter((task) => task.status === "In Progress").length}</strong>
                    </article>
                    <article>
                        <p>Done</p>
                        <strong>{tasks.filter((task) => task.status === "Done").length}</strong>
                    </article>
                </section>

                <main className="admin-layout">
                    <aside className="admin-users" aria-label="users list">
                        <div className="admin-panel-header">
                            <h2>Users</h2>
                            <button type="button" className="admin-text-btn">
                                + Add User
                            </button>
                        </div>

                        <label htmlFor="userSearch" className="admin-field-label">
                            Search users
                        </label>
                        <input id="userSearch" type="text" placeholder="Type a name..." />

                        <ul className="admin-user-list">
                            {users.map((user) => {
                                const progress = Math.round((user.done / user.total) * 100);

                                return (
                                    <li key={user.id}>
                                        <div className="admin-user-row">
                                            <div>
                                                <h3>{user.name}</h3>
                                                <p>{user.role}</p>
                                            </div>
                                            <button type="button" className="admin-mini-btn">
                                                View
                                            </button>
                                        </div>

                                        <div className="admin-progress-meta">
                                            <span>{user.done} done</span>
                                            <span>{user.total - user.done} open</span>
                                        </div>
                                        <div className="admin-progress-track" aria-hidden="true">
                                            <span style={{ width: `${progress}%` }} />
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </aside>

                    <section className="admin-tasks" aria-label="task management">
                        <div className="admin-panel-header">
                            <h2>Tasks</h2>
                            <div className="admin-inline-actions">
                                <button type="button" className="admin-mini-btn">Filter</button>
                                <button type="button" className="admin-btn admin-btn-primary">+ Create Task</button>
                            </div>
                        </div>

                        <form className="admin-task-form" action="#" method="post">
                            <div>
                                <label htmlFor="taskTitle">Task Title</label>
                                <input id="taskTitle" type="text" placeholder="Write task title" />
                            </div>
                            <div>
                                <label htmlFor="taskUser">Assign User</label>
                                <select id="taskUser" defaultValue="">
                                    <option value="" disabled>
                                        Select user
                                    </option>
                                    {users.map((user) => (
                                        <option key={user.id} value={user.name}>
                                            {user.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="taskStatus">Status</label>
                                <select id="taskStatus" defaultValue="To Do">
                                    <option>To Do</option>
                                    <option>In Progress</option>
                                    <option>Done</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="taskDate">Due Date</label>
                                <input id="taskDate" type="date" />
                            </div>
                            <button type="button" className="admin-btn admin-btn-primary admin-form-btn">
                                Save Task
                            </button>
                        </form>

                        <div className="admin-table-wrap">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Task</th>
                                        <th>User</th>
                                        <th>Status</th>
                                        <th>Due</th>
                                        <th>Priority</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tasks.map((task) => (
                                        <tr key={task.id}>
                                            <td>{task.title}</td>
                                            <td>{task.user}</td>
                                            <td>
                                                <span className={`admin-badge admin-badge-${task.status.toLowerCase().replace(" ", "-")}`}>
                                                    {task.status}
                                                </span>
                                            </td>
                                            <td>{task.dueDate}</td>
                                            <td>{task.priority}</td>
                                            <td>
                                                <div className="admin-actions">
                                                    <button type="button" className="admin-mini-btn">
                                                        Edit
                                                    </button>
                                                    <button type="button" className="admin-mini-btn admin-danger-btn">
                                                        Delete
                                                    </button>
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
        </div>
    );
}

export default AdminSite;