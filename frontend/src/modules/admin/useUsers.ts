import { useEffect, useState } from "react";
import { UserItem } from "../../classes/AdminClasses";

import { API_URL } from '../../config'

async function getUsers() {
    const token = localStorage.getItem("access_token");

    if (!token) {
        return null;
    }

    const response = await fetch(API_URL + "/user", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const userList: UserItem[] = await response.json();
    return userList
}

async function addUserRequest(username: string, password: string) {
    const response = await fetch(API_URL + "/user", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
    })

    if (!response.ok) {
        const error = await response.json();
        const detail = Array.isArray(error.detail)
            ? error.detail.map((d: { msg?: string }) => d.msg).filter(Boolean).join(", ")
            : error.detail;
        throw new Error(detail || "User create failed");
    }

    return (await response.json()) as UserItem;
}

async function updateUserRequest(targetUsername: string, username: string, password: string) {
    const token = localStorage.getItem("access_token");

    const body: { username?: string; password?: string } = {};
    if (username.trim()) {
        body.username = username.trim();
    }
    if (password.trim()) {
        body.password = password;
    }

    if (Object.keys(body).length === 0) {
        throw new Error("No changes provided");
    }

    const response = await fetch(API_URL + `/user/${encodeURIComponent(targetUsername)}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const error = await response.json();
        const detail = Array.isArray(error.detail)
            ? error.detail.map((d: { msg?: string }) => d.msg).filter(Boolean).join(", ")
            : error.detail;
        throw new Error(detail || "User update failed");
    }

    return (await response.json()) as UserItem;
}

async function deleteUserRequest(username: string) {
    const token = localStorage.getItem("access_token");

    const response = await fetch(API_URL + `/user/${encodeURIComponent(username)}`, {
        method: "DELETE",
        headers: {
            Authorization: token ? `Bearer ${token}` : "",
        },
    });

    if (!response.ok) {
        const error = await response.json();
        const detail = Array.isArray(error.detail)
            ? error.detail.map((d: { msg?: string }) => d.msg).filter(Boolean).join(", ")
            : error.detail;
        throw new Error(detail || "User delete failed");
    }
}

export function useUsers() {
    const [users, setUsers] = useState<UserItem[]>([])
    const [userError, setError] = useState<string | null>(null)

    async function  run<T>(action: () => Promise<T>): Promise<T | undefined> {
        try {
            setError(null);
            return await action();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Unknown error";
            setError(message);
            return undefined;
        }
    }

    const refreshUsers = () =>
        run(async () => {
            const data = await getUsers();
            setUsers(data ?? []);
            return data;
        });

    const addUser = (username: string, password: string) =>
        run(async () => {
            const created = await addUserRequest(username, password)
            await refreshUsers();
            return created;
        })

    const editUser = (targetUsername: string, username: string, password: string) =>
        run(async () => {
            const updated = await updateUserRequest(targetUsername, username, password)
            await refreshUsers();
            return updated;
        })

    const removeUser = (username: string) =>
        run(async () => {
            await deleteUserRequest(username)
            setUsers((prev) => prev.filter((user) => user.username !== username))
        })

    useEffect(() => {
        void refreshUsers();
    }, []);

    return { users, userError, addUser, editUser, removeUser, refreshUsers }
}