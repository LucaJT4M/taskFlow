import { useNavigate, Link } from "react-router-dom";
import React, { useState } from "react";
import { Check, Eye, EyeOff, Moon, Sun } from "lucide-react";
import { sign_up } from "../../services/authService";
import { useTheme } from "../tasks/useTheme";
import DecorLayer from "../../components/decor/DecorLayer";

function RegisterForm() {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const success = await sign_up(username, password, confirmPassword);
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

            <section className="auth-shell" aria-label="Registrieren">
                <h1 className="auth-title">Konto erstellen</h1>
                <p className="auth-subtitle">In wenigen Sekunden startklar.</p>

                <form className="auth-card" onSubmit={handleSubmit}>
                    <label htmlFor="register-username" className="auth-label">Benutzername</label>
                    <input
                        id="register-username"
                        name="username"
                        type="text"
                        autoComplete="username"
                        placeholder="Benutzername wählen"
                        className="auth-input"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />

                    <label htmlFor="register-password" className="auth-label">Passwort</label>
                    <div className="auth-input-row">
                        <input
                            id="register-password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="new-password"
                            placeholder="Passwort wählen"
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

                    <label htmlFor="register-password-repeat" className="auth-label">Passwort wiederholen</label>
                    <div className="auth-input-row">
                        <input
                            id="register-password-repeat"
                            name="password-repeat"
                            type={showConfirmPassword ? "text" : "password"}
                            autoComplete="new-password"
                            placeholder="Passwort wiederholen"
                            className="auth-input"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <button
                            type="button"
                            className="auth-toggle"
                            onClick={() => setShowConfirmPassword((prev) => !prev)}
                            aria-label={showConfirmPassword ? "Passwort verbergen" : "Passwort anzeigen"}
                        >
                            {showConfirmPassword ? <EyeOff size={17} strokeWidth={1.75} /> : <Eye size={17} strokeWidth={1.75} />}
                        </button>
                    </div>

                    <button type="submit" className="auth-button">Konto erstellen</button>
                </form>

                <p className="auth-switch-text">
                    Schon ein Konto?{" "}
                    <Link className="auth-switch-link" to="/">Zur Anmeldung</Link>
                </p>
            </section>
        </div>
    );
}

export default RegisterForm;