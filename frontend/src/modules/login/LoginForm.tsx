import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { Check, Eye, EyeOff, Moon, Sun } from "lucide-react";
import { login } from "../../services/authService";
import { useTheme } from "../tasks/useTheme";
import DecorLayer from "../../components/decor/DecorLayer";

function LoginForm() {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const success = await login(username, password);
        if (success) {
            navigate("/dashboard");
        }
    }

    return (
        <div className="app-dark auth-page" data-theme={theme}>
            <DecorLayer variant="auth" />
            <button
                type="button"
                className="theme-toggle"
                onClick={toggleTheme}
                title={theme === "light" ? "Dunkles Design" : "Helles Design"}
            >
                {theme === "light" ? <Moon size={17} strokeWidth={1.75} /> : <Sun size={17} strokeWidth={1.75} />}
            </button>

            <div className="brand auth-brand">
                <span className="brand-mark"><Check size={15} strokeWidth={3} /></span>
                TaskFlow
            </div>

            <section className="auth-shell" aria-label="Anmelden">
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
            </section>
        </div>
    );
}

export default LoginForm;