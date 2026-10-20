import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { login } from "../../services/authService";
import AuthLayout from "./AuthLayout";
import { blowLeavesAway } from "../../components/decor/pageTransition";
import { t } from "../../i18n";

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
        <AuthLayout ariaLabel={t('login.aria')}>
            <h1 className="auth-title">{t('login.title')}</h1>
            <p className="auth-subtitle">{t('login.subtitle')}</p>

            <form className="auth-card" onSubmit={handleSubmit}>
                <label htmlFor="login-username" className="auth-label">{t('auth.username')}</label>
                <input
                    id="login-username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    placeholder={t('login.usernamePh')}
                    className="auth-input"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />

                <label htmlFor="login-password" className="auth-label">{t('auth.password')}</label>
                <div className="auth-input-row">
                    <input
                        id="login-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        placeholder={t('login.passwordPh')}
                        className="auth-input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                        type="button"
                        className="auth-toggle"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                    >
                        {showPassword ? <EyeOff size={17} strokeWidth={1.75} /> : <Eye size={17} strokeWidth={1.75} />}
                    </button>
                </div>

                <button type="submit" className="auth-button">{t('login.submit')}</button>
            </form>

            <p className="auth-switch-text">
                {t('landing.noAccount')}{" "}
                <Link className="auth-switch-link" to="/signup">{t('landing.register')}</Link>
            </p>
        </AuthLayout>
    );
}

export default LoginForm;
