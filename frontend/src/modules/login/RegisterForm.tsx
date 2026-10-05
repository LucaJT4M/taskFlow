import { useNavigate, Link } from "react-router-dom";
import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { sign_up } from "../../services/authService";
import AuthLayout from "./AuthLayout";
import { blowLeavesAway } from "../../components/decor/pageTransition";

function RegisterForm() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const success = await sign_up(username, password, confirmPassword);
        if (success) {
            await blowLeavesAway();
            navigate("/dashboard");
        }
    }

    return (
        <AuthLayout ariaLabel="Registrieren">
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
        </AuthLayout>
    );
}

export default RegisterForm;
