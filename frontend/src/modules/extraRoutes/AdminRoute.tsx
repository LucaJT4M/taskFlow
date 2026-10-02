import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getCurrentUser } from "../../services/authService";

function AdminRoute() {
    const [authenticated, setAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        async function checkAuthentication() {
            const user = await getCurrentUser();

            if (user.username === "admin") {
                setAuthenticated(user !== null);
            } else {
                setAuthenticated(false);
            }
        }

        checkAuthentication();
    }, []);

    // Still checking the backend
    if (authenticated === null) {
        return <p>Loading...</p>;
    }

    // Not authenticated
    if (!authenticated) {
        toast.error("Unauthorized. No rights for this site.");
        return <Navigate to="/dashboard" replace />;
    }

    // Authenticated
    return <Outlet />;
}

export default AdminRoute;