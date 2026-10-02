import { toast } from "react-toastify";
const base_url = "http://localhost:8000";

export async function getUsers() {
    // Gets all the users for the admin dashboard
    try {
        const token = localStorage.getItem("access_token");

        if (!token) {
            throw new Error("Not authenticated");
        }

        const response = await fetch(base_url + "/user", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const error = await response.json();
            const detail = Array.isArray(error.detail)
                ? error.detail.map((d: { msg?: string }) => d.msg).filter(Boolean).join(", ")
                : error.detail;
            throw new Error(detail || "couldnt get user data");
        }

        return await response.json();
    } catch (error) {
        const message = error instanceof Error ? error.message : "Login failed";
        toast.error(message);
        console.error(error);
        return false;
    }
}

export async function getTasks() {
    // Gets all the tasks for the admin dashboard
}