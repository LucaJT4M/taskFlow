import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { getCurrentUser } from "../../services/authService";

function ProtectedRoute() {
    const [authenticated, setAuthenticated] = useState<boolean | null>(null);
    const hasShownUnauthorizedToast = useRef(false);

    useEffect(() => {
        async function checkAuthentication() {
            const user = await getCurrentUser();

            setAuthenticated(user !== null);
        }

        checkAuthentication();
    }, []);

    useEffect(() => {
        if (authenticated === false && !hasShownUnauthorizedToast.current) {
            toast.error("Unauthorized. Please log in to continue.");
            hasShownUnauthorizedToast.current = true;
        }
    }, [authenticated]);

    // Still checking the backend
    if (authenticated === null) {
        return <p>Loading...</p>;
    }

    // Not authenticated
    if (!authenticated) {
        return <Navigate to="/" replace />;
    }

    // Authenticated
    return <Outlet />;
}

export default ProtectedRoute;