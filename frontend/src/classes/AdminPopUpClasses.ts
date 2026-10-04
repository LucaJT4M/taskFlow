import { TaskItem, UserItem } from "./AdminClasses";

export type TaskStatusApi = "todo" | "in_progress" | "done";

export type BaseModalProps = {
    isOpen: boolean;
    onClose: () => void;
};

export type CreateUserModalProps = BaseModalProps & {
    onSubmit: (username: string, password: string) => Promise<void> | void;
};

export type EditUserModalProps = BaseModalProps & {
    user: UserItem | null;
    onSubmit: (username: string, password: string) => Promise<void> | void;
};

export type CreateTaskModalProps = BaseModalProps & {
    users: UserItem[];
    selectedUserId: number;
    onSubmit: (title: string, description: string, status: TaskStatusApi, owner_id: number) => Promise<void> | void;
};

export type EditTaskModalProps = BaseModalProps & {
    task: TaskItem | null;
    onSubmit: (title: string, status: TaskStatusApi) => Promise<void> | void;
};

export type ConfirmActionModalProps = BaseModalProps & {
    title: string;
    description: string;
    confirmLabel?: string;
    onConfirm: () => Promise<void> | void;
};
