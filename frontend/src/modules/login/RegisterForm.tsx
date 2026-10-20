import { useNavigate, Link } from "react-router-dom";
import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { sign_up } from "../../services/authService";
import AuthLayout from "./AuthLayout";
import { blowLeavesAway } from "../../components/decor/pageTransition";
import { t } from "../../i18n";

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
        <AuthLayout ariaLabel={t('register.aria')}>
            <h1 className="auth-title">{t('register.title')}</h1>
            <p className="auth-subtitle">{t('register.subtitle')}</p>

            <form className="auth-card" onSubmit={handleSubmit}>
                <label htmlFor="register-username" className="auth-label">{t('auth.username')}</label>
                <input
                    id="register-username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    placeholder={t('register.usernamePh')}
                    className="auth-input"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />

                <label htmlFor="register-password" className="auth-label">{t('auth.password')}</label>
                <div className="auth-input-row">
                    <input
                        id="register-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder={t('register.passwordPh')}
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

                <label htmlFor="register-password-repeat" className="auth-label">{t('register.repeat')}</label>
                <div className="auth-input-row">
                    <input
                        id="register-password-repeat"
                        name="password-repeat"
                        type={showConfirmPassword ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder={t('register.repeat')}
                        className="auth-input"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <button
                        type="button"
                        className="auth-toggle"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        aria-label={showConfirmPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                    >
                        {showConfirmPassword ? <EyeOff size={17} strokeWidth={1.75} /> : <Eye size={17} strokeWidth={1.75} />}
                    </button>
                </div>

                <button type="submit" className="auth-button">{t('register.title')}</button>
            </form>

            <p className="auth-switch-text">
                {t('register.haveAccount')}{" "}
                <Link className="auth-switch-link" to="/login">{t('register.toLogin')}</Link>
            </p>
        </AuthLayout>
    );
}

export default RegisterForm;
