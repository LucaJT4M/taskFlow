import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../tasks/useTheme";
import DecorLayer from "../../components/decor/DecorLayer";
import { TaskItem, UserItem } from "../../classes/AdminClasses";
import { useUsers } from "./useUsers";
import { useTasks } from "../tasks/useTasks";
import { convertTasksToTaskItems } from "../../services/AdminService";
import { AddUserModal, ConfirmActionModal, CreateTaskModal, EditTaskModal, EditUserModal } from "./AdminPopups";

function AdminSite() {
    const { users, userError, addUser, editUser, removeUser } = useUsers();
    const { tasks, error, addTaskAsAdmin, editTask, removeTask } = useTasks()

    const taskList = convertTasksToTaskItems(tasks)

    const { theme, toggleTheme } = useTheme();
    const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
    const [isEditUserOpen, setIsEditUserOpen] = useState(false);
    const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
    const [isEditTaskOpen, setIsEditTaskOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<number>(users[0]?.id ?? 0);
    const [editingUser, setEditingUser] = useState<UserItem | null>(null);
    const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
    const [deleteUserCandidate, setDeleteUserCandidate] = useState<UserItem | null>(null);
    const [deleteTaskCandidate, setDeleteTaskCandidate] = useState<TaskItem | null>(null);

    useEffect(() => {
        if (users.length === 0) {
            return;
        }

        const selectedUserExists = users.some((user) => user.id === selectedUserId);
        if (!selectedUserExists) {
            setSelectedUserId(users[0].id);
        }
    }, [users, selectedUserId]);
    
    const selectedUser = users.find((user) => user.id === selectedUserId) ?? null;
    const visibleTasks = taskList.filter((task) => Number(task.userId) === Number(selectedUserId));

    async function handleCreateUser(username: string, password: string) {
        if (!username || !password) {
            return;
        }

        await addUser(username, password);
        setIsCreateUserOpen(false);
    }

    function openEditUser(user: UserItem) {
        setEditingUser(user);
        setIsEditUserOpen(true);
    }

    async function handleEditUser(username: string, password: string) {
        if (!editingUser) {
            return;
        }

        await editUser(editingUser.username, username, password);
        setIsEditUserOpen(false);
        setEditingUser(null);
    }

    async function handleCreateTask(title: string, description: string, status: "todo" | "in_progress" | "done", owner_id: number) {
        if (!title) {
            return;
        }

        await addTaskAsAdmin({
            title,
            description: description || null,
            status,
            owner_id,
        })

        setIsCreateTaskOpen(false);
    }

    function openEditTask(task: TaskItem) {
        setEditingTask(task);
        setIsEditTaskOpen(true);
    }

    async function handleEditTask(title: string, status: "todo" | "in_progress" | "done") {
        if (!editingTask || !title) {
            return;
        }

        await editTask(editingTask, {
            title,
            status,
        });

        setIsEditTaskOpen(false);
        setEditingTask(null);
    }

    async function confirmDeleteUser() {
        if (!deleteUserCandidate) {
            return;
        }

        await removeUser(deleteUserCandidate.username);
        setDeleteUserCandidate(null);
    }

    async function confirmDeleteTask() {
        if (!deleteTaskCandidate) {
            return;
        }

        await removeTask(deleteTaskCandidate);
        setDeleteTaskCandidate(null);
    }

    return (
        <div className="app-dark admin-shell" data-theme={theme}>
            <DecorLayer variant="app" />
            <div className="admin-page">
                <header className="admin-header">
                    <div>
                        <p className="admin-overline">Admin</p>
                        <h1>User and Task Management</h1>
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

                        {userError && <p className="admin-subtitle">{userError}</p>}

                        <ul className="admin-user-list">
                            {users.map((user) => {
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
                                            <button type="button" className="admin-mini-btn" onClick={() => openEditUser(user)}>
                                                Edit
                                            </button>
                                            <button type="button" className="admin-mini-btn admin-danger-btn" onClick={() => setDeleteUserCandidate(user)}>
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

                        {error && <p className="admin-subtitle">{error}</p>}

                        <div className="admin-table-wrap">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Title</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {visibleTasks.length === 0 && (
                                        <tr>
                                            <td colSpan={3} className="admin-empty-cell">No tasks for this user yet.</td>
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
                                            <td>
                                                <div className="admin-actions">
                                                    <button type="button" className="admin-mini-btn" onClick={() => openEditTask(task)}>Edit</button>
                                                    <button
                                                        type="button"
                                                        className="admin-mini-btn admin-danger-btn"
                                                        onClick={() => setDeleteTaskCandidate(task)}
                                                    >
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

            <AddUserModal
                isOpen={isCreateUserOpen}
                onClose={() => setIsCreateUserOpen(false)}
                onSubmit={handleCreateUser}
            />

            <EditUserModal
                isOpen={isEditUserOpen}
                onClose={() => {
                    setIsEditUserOpen(false);
                    setEditingUser(null);
                }}
                user={editingUser}
                onSubmit={handleEditUser}
            />

            <CreateTaskModal
                isOpen={isCreateTaskOpen}
                onClose={() => setIsCreateTaskOpen(false)}
                users={users}
                selectedUserId={selectedUserId}
                onSubmit={handleCreateTask}
            />

            <EditTaskModal
                isOpen={isEditTaskOpen}
                onClose={() => {
                    setIsEditTaskOpen(false);
                    setEditingTask(null);
                }}
                task={editingTask}
                onSubmit={handleEditTask}
            />

            <ConfirmActionModal
                isOpen={deleteUserCandidate !== null}
                onClose={() => setDeleteUserCandidate(null)}
                title="Delete user"
                description={deleteUserCandidate ? `Do you really want to delete ${deleteUserCandidate.username}?` : ""}
                confirmLabel="Delete User"
                onConfirm={confirmDeleteUser}
            />

            <ConfirmActionModal
                isOpen={deleteTaskCandidate !== null}
                onClose={() => setDeleteTaskCandidate(null)}
                title="Delete task"
                description={deleteTaskCandidate ? `Do you really want to delete \"${deleteTaskCandidate.title}\"?` : ""}
                confirmLabel="Delete Task"
                onConfirm={confirmDeleteTask}
            />
        </div>
    );
}

export default AdminSite;
