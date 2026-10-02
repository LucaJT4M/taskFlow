import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getUsers, getTasks } from "../../services/AdminService";

type AdminUser = {
    id: number;
    name: string;
    role: string;
    total: number;
    done: number;
};

type AdminTask = {
    id: number;
    title: string;
    user: string;
    status: "To Do" | "In Progress" | "Done";
    dueDate: string;
    priority: "Low" | "Medium" | "High";
};

function toUiStatus(status: unknown): AdminTask["status"] {
    if (status === "done" || status === "Done") {
        return "Done";
    }

    if (status === "in_progress" || status === "In Progress") {
        return "In Progress";
    }

    return "To Do";
}

function toUiPriority(priority: unknown): AdminTask["priority"] {
    if (priority === "High" || priority === "high") {
        return "High";
    }

    if (priority === "Low" || priority === "low") {
        return "Low";
    }

    return "Medium";
}

function AdminSite() {
    const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [tasks, setTasks] = useState<AdminTask[]>([]);

    useEffect(() => {
        localStorage.setItem("theme", theme);
    }, [theme]);

    useEffect(() => {
        async function loadAdminData() {
            const [usersData, tasksData] = await Promise.all([getUsers(), getTasks()]);

            const normalizedTasks: AdminTask[] = (Array.isArray(tasksData) ? tasksData : []).map((task: any, index: number) => ({
                id: Number(task.id ?? index + 1),
                title: typeof task.title === "string" && task.title.trim() ? task.title : "Untitled task",
                user:
                    typeof task.user === "string" && task.user.trim()
                        ? task.user
                        : typeof task.username === "string" && task.username.trim()
                            ? task.username
                            : "Unassigned",
                status: toUiStatus(task.status),
                dueDate: typeof task.dueDate === "string" && task.dueDate.trim() ? task.dueDate : "-",
                priority: toUiPriority(task.priority),
            }));

            const normalizedUsers: AdminUser[] = (Array.isArray(usersData) ? usersData : []).map((user: any, index: number) => {
                const name =
                    typeof user.name === "string" && user.name.trim()
                        ? user.name
                        : typeof user.username === "string" && user.username.trim()
                            ? user.username
                            : `User ${index + 1}`;

                const total = normalizedTasks.filter((task) => task.user === name).length;
                const done = normalizedTasks.filter((task) => task.user === name && task.status === "Done").length;

                return {
                    id: Number(user.id ?? index + 1),
                    name,
                    role: typeof user.role === "string" && user.role.trim() ? user.role : "Team Member",
                    total,
                    done,
                };
            });

            setTasks(normalizedTasks);
            setUsers(normalizedUsers);
        }

        loadAdminData();
    }, []);

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
                                const progress = user.total > 0 ? Math.round((user.done / user.total) * 100) : 0;

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