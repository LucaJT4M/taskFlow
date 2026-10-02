import { useEffect, useState } from "react";
import { getCurrentUser } from "../../services/authService";

export function useCurrentUser() {
    const [user, setUser] = useState(null);
    
    useEffect (() => {
        getCurrentUser().then(setUser)

    }, [])

    return user
}