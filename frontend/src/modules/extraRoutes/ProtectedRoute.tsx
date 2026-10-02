import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getCurrentUser } from "../../services/authService";

function ProtectedRoute() {
    const [authenticated, setAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        async function checkAuthentication() {
            const user = await getCurrentUser();

            setAuthenticated(user !== null);
        }

        checkAuthentication();
    }, []);

    // Still checking the backend
    if (authenticated === null) {
        return <p>Loading...</p>;
    }

    // Not authenticated
    if (!authenticated) {
        toast.error("Unauthorized. Please log in to continue.");
        return <Navigate to="/" replace />;
    }

    // Authenticated
    return <Outlet />;
}

export default ProtectedRoute;