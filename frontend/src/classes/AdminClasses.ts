export type UserItem = {
    id: number;
    username: string;
    role: "user" | "admin";
};

export type TaskItem = {
    id: number;
    userId: number;
    title: string;
    status: "To Do" | "In Progress" | "Done";
};