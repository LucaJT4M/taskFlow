import { FormEvent, useEffect, useState } from "react";
import type {
    ConfirmActionModalProps,
    CreateTaskModalProps,
    CreateUserModalProps,
    EditTaskModalProps,
    EditUserModalProps,
    TaskStatusApi,
} from "../../classes/AdminPopUpClasses";

function stopBackdropClose(event: FormEvent<HTMLDivElement>) {
    event.stopPropagation();
}

export function AddUserModal({ isOpen, onClose, onSubmit }: CreateUserModalProps) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    if (!isOpen) {
        return null;
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        await onSubmit(username.trim(), password);
        setUsername("");
        setPassword("");
    }

    return (
        <div className="admin-modal-backdrop" role="dialog" aria-modal="true" aria-label="Create user popup" onClick={onClose}>
            <div className="admin-modal" onClick={stopBackdropClose}>
                <div className="admin-modal-header">
                    <h3>Create User</h3>
                    <button type="button" className="admin-modal-close" onClick={onClose}>x</button>
                </div>
                <form className="admin-modal-form" onSubmit={handleSubmit}>
                    <label htmlFor="new-username">Username</label>
                    <input id="new-username" type="text" placeholder="Enter username" value={username} onChange={(event) => setUsername(event.target.value)} />

                    <label htmlFor="new-password">Password</label>
                    <input id="new-password" type="password" placeholder="Enter password" value={password} onChange={(event) => setPassword(event.target.value)} />

                    <div className="admin-modal-actions">
                        <button type="button" className="admin-btn admin-btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="admin-btn admin-btn-primary">Create User</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export function EditUserModal({ isOpen, onClose, user, onSubmit }: EditUserModalProps) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    useEffect(() => {
        if (!user) {
            setUsername("");
            setPassword("");
            return;
        }

        setUsername(user.username);
        setPassword("");
    }, [user]);

    if (!isOpen || !user) {
        return null;
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        await onSubmit(username.trim(), password);
        setPassword("");
    }

    return (
        <div className="admin-modal-backdrop" role="dialog" aria-modal="true" aria-label="Edit user popup" onClick={onClose}>
            <div className="admin-modal" onClick={stopBackdropClose}>
                <div className="admin-modal-header">
                    <h3>Edit User</h3>
                    <button type="button" className="admin-modal-close" onClick={onClose}>x</button>
                </div>
                <form className="admin-modal-form" onSubmit={handleSubmit}>
                    <label htmlFor="edit-username">Username</label>
                    <input id="edit-username" type="text" placeholder="Enter username" value={username} onChange={(event) => setUsername(event.target.value)} />

                    <label htmlFor="edit-password">Password</label>
                    <input id="edit-password" type="password" placeholder="Leave empty to keep current password" value={password} onChange={(event) => setPassword(event.target.value)} />

                    <div className="admin-modal-actions">
                        <button type="button" className="admin-btn admin-btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="admin-btn admin-btn-primary">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export function CreateTaskModal({ isOpen, onClose, users, selectedUserId, onSubmit }: CreateTaskModalProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState<TaskStatusApi>("todo");
    const [ownerId, setOwnerId] = useState<number>(selectedUserId || 0);

    useEffect(() => {
        setOwnerId(selectedUserId || users[0]?.id || 0);
    }, [selectedUserId, users]);

    if (!isOpen) {
        return null;
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        await onSubmit(title.trim(), description.trim(), status, ownerId);
        setTitle("");
        setDescription("");
        setStatus("todo");
    }

    return (
        <div className="admin-modal-backdrop" role="dialog" aria-modal="true" aria-label="Create task popup" onClick={onClose}>
            <div className="admin-modal" onClick={stopBackdropClose}>
                <div className="admin-modal-header">
                    <h3>Create Task</h3>
                    <button type="button" className="admin-modal-close" onClick={onClose}>x</button>
                </div>
                <form className="admin-modal-form" onSubmit={handleSubmit}>
                    <label htmlFor="new-task-title">Title</label>
                    <input id="new-task-title" type="text" placeholder="Task title" value={title} onChange={(event) => setTitle(event.target.value)} />

                    <label htmlFor="new-task-description">Description</label>
                    <textarea id="new-task-description" rows={3} placeholder="Task description" value={description} onChange={(event) => setDescription(event.target.value)} />

                    <div className="admin-modal-grid">
                        <div>
                            <label htmlFor="new-task-user">Assign To</label>
                            <select
                                id="new-task-user"
                                value={String(ownerId || "")}
                                onChange={(event) => setOwnerId(Number(event.target.value))}
                            >
                                {users.map((user) => (
                                    <option key={user.id} value={user.id}>{user.username}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="new-task-status">Status</label>
                            <select id="new-task-status" value={status} onChange={(event) => setStatus(event.target.value as TaskStatusApi)}>
                                <option value="todo">To Do</option>
                                <option value="in_progress">In Progress</option>
                                <option value="done">Done</option>
                            </select>
                        </div>
                    </div>

                    <div className="admin-modal-actions">
                        <button type="button" className="admin-btn admin-btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="admin-btn admin-btn-primary">Create Task</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export function EditTaskModal({ isOpen, onClose, task, onSubmit }: EditTaskModalProps) {
    const [title, setTitle] = useState("");
    const [status, setStatus] = useState<TaskStatusApi>("todo");

    useEffect(() => {
        if (!task) {
            setTitle("");
            setStatus("todo");
            return;
        }

        setTitle(task.title);
        if (task.status === "Done") {
            setStatus("done");
        } else if (task.status === "In Progress") {
            setStatus("in_progress");
        } else {
            setStatus("todo");
        }
    }, [task]);

    if (!isOpen || !task) {
        return null;
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        await onSubmit(title.trim(), status);
    }

    return (
        <div className="admin-modal-backdrop" role="dialog" aria-modal="true" aria-label="Edit task popup" onClick={onClose}>
            <div className="admin-modal" onClick={stopBackdropClose}>
                <div className="admin-modal-header">
                    <h3>Edit Task</h3>
                    <button type="button" className="admin-modal-close" onClick={onClose}>x</button>
                </div>
                <form className="admin-modal-form" onSubmit={handleSubmit}>
                    <label htmlFor="edit-task-title">Title</label>
                    <input
                        id="edit-task-title"
                        type="text"
                        placeholder="Task title"
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                    />

                    <label htmlFor="edit-task-status">Status</label>
                    <select
                        id="edit-task-status"
                        value={status}
                        onChange={(event) => setStatus(event.target.value as TaskStatusApi)}
                    >
                        <option value="todo">To Do</option>
                        <option value="in_progress">In Progress</option>
                        <option value="done">Done</option>
                    </select>

                    <div className="admin-modal-actions">
                        <button type="button" className="admin-btn admin-btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="admin-btn admin-btn-primary">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export function ConfirmActionModal({
    isOpen,
    onClose,
    title,
    description,
    confirmLabel = "Delete",
    onConfirm,
}: ConfirmActionModalProps) {
    if (!isOpen) {
        return null;
    }

    async function handleConfirm() {
        await onConfirm();
    }

    return (
        <div className="admin-modal-backdrop" role="dialog" aria-modal="true" aria-label={title} onClick={onClose}>
            <div className="admin-modal" onClick={stopBackdropClose}>
                <div className="admin-modal-header">
                    <h3>{title}</h3>
                    <button type="button" className="admin-modal-close" onClick={onClose}>x</button>
                </div>
                <div className="admin-modal-form">
                    <p className="admin-subtitle">{description}</p>
                    <div className="admin-modal-actions">
                        <button type="button" className="admin-btn admin-btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="button" className="admin-btn admin-btn-primary" onClick={handleConfirm}>
                            {confirmLabel}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
