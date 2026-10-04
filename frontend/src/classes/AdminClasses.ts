export type UserItem = {
    id: number;
    username: string;
};

export type TaskItem = {
    id: number;
    userId: number;
    title: string;
    status: "To Do" | "In Progress" | "Done";
};