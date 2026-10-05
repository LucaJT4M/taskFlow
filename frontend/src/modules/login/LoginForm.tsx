import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { login } from "../../services/authService";
import AuthLayout from "./AuthLayout";
import { blowLeavesAway } from "../../components/decor/pageTransition";

function LoginForm() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const success = await login(username, password);
        if (success) {
            await blowLeavesAway();
            navigate("/dashboard");
        }
    }

    return (
        <AuthLayout ariaLabel="Anmelden">
            <h1 className="auth-title">Willkommen zurück</h1>
            <p className="auth-subtitle">Melde dich an, um mit TaskFlow weiterzumachen.</p>

            <form className="auth-card" onSubmit={handleSubmit}>
                <label htmlFor="login-username" className="auth-label">Benutzername</label>
                <input
                    id="login-username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    placeholder="Dein Benutzername"
                    className="auth-input"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />

                <label htmlFor="login-password" className="auth-label">Passwort</label>
                <div className="auth-input-row">
                    <input
                        id="login-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        placeholder="Dein Passwort"
                        className="auth-input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                        type="button"
                        className="auth-toggle"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={showPassword ? "Passwort verbergen" : "Passwort anzeigen"}
                    >
                        {showPassword ? <EyeOff size={17} strokeWidth={1.75} /> : <Eye size={17} strokeWidth={1.75} />}
                    </button>
                </div>

                <button type="submit" className="auth-button">Anmelden</button>
            </form>

            <p className="auth-switch-text">
                Noch kein Konto?{" "}
                <Link className="auth-switch-link" to="/signup">Registrieren</Link>
            </p>
        </AuthLayout>
    );
}

export default LoginForm;
