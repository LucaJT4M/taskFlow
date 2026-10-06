import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { API_URL } from "../config";

export async function getCurrentUser() {
    const token = localStorage.getItem("access_token");

    if (!token) {
        return null;
    }

    const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        localStorage.removeItem("access_token");
        return null;
    }

    return await response.json();
}

export function logout() {
    localStorage.removeItem("access_token"); // Logs the user out
}

export async function login(username: string, password: string) {
    try {
            const body = new URLSearchParams();

            body.append("username", username);
            body.append("password", password);

            const response = await fetch(`${API_URL}/auth/token`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: body.toString(),
            });

            if (!response.ok) {
                const error = await response.json();
                const detail = Array.isArray(error.detail)
                    ? error.detail.map((d: { msg?: string }) => d.msg).filter(Boolean).join(", ")
                    : error.detail;
                throw new Error(detail || "Login failed");
            }

            const data = await response.json();
            localStorage.setItem("access_token", data.access_token);

            return true;
        } catch (error) {
            const message = error instanceof Error ? error.message : "Login failed";
            toast.error(message);
            console.error(error);
            return false;
        }
}

export async function sign_up(username: string, password: string, confirmPassword: string) {
    try {
            if (password !== confirmPassword) {
                throw new Error("Password and confirm password not same");
            }

            const response = await fetch(`${API_URL}/user`, {
                method: "POST",
                headers: {
					"Content-Type": "application/json",
                },
				body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                const error = await response.json();
				const detail = Array.isArray(error.detail)
					? error.detail.map((d: { msg?: string }) => d.msg).filter(Boolean).join(", ")
					: error.detail;
				throw new Error(detail || "Signup failed");
            }

			return await login(username, password)
        } catch (error) {
			const message = error instanceof Error ? error.message : "Registration failed";
			toast.error(message);
            console.error(error);
            return false;
        }
}