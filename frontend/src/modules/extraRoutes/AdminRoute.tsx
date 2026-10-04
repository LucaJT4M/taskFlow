import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { getCurrentUser } from "../../services/authService";

function AdminRoute() {
    const [authenticated, setAuthenticated] = useState<boolean | null>(null);
    const hasShownUnauthorizedToast = useRef(false);

    useEffect(() => {
        async function checkAuthentication() {
            const user = await getCurrentUser();

            if (!user) {
                setAuthenticated(false);
                return;
            } else {
                if (user.username === "admin") {
                    setAuthenticated(user !== null);
                } else {
                    setAuthenticated(false);
                }
            }
        }

        checkAuthentication();
    }, []);

    useEffect(() => {
        if (authenticated === false && !hasShownUnauthorizedToast.current) {
            toast.error("Unauthorized. No rights for this site.");
            hasShownUnauthorizedToast.current = true;
        }
    }, [authenticated]);

    // Still checking the backend
    if (authenticated === null) {
        return <p>Loading...</p>;
    }

    // Not authenticated
    if (!authenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    // Authenticated
    return <Outlet />;
}

export default AdminRoute;