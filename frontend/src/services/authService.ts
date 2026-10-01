import { useNavigate } from "react-router-dom";

const navigate = useNavigate();

export async function getCurrentUser() {
    const token = localStorage.getItem("access_token");

    if (!token) {
        return null;
    }

    const response = await fetch("http://localhost:8000/auth/me", {
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
    navigate("/")
}