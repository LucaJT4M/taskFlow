import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { toast } from "react-toastify";

function LoginForm() {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const navigate = useNavigate()

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        try {
            const body = new URLSearchParams();

            body.append("username", username);
            body.append("password", password);

            const response = await fetch("http://localhost:8000/auth/token", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: body.toString(),
            });

            if (!response.ok) {
                const error = await response.json();
                const detail = Array.isArray(error.detail)
                    ? error.detail.map((d: { msg?: string }) => d.msg).filter(Boolean).join(", ")
                    : error.detail;
                throw new Error(detail || "Login failed");
            }

            const data = await response.json();
            localStorage.setItem("access_token", data.access_token);

            navigate("/dashboard")
        } catch (error) {
            const message = error instanceof Error ? error.message : "Login failed";
            toast.error(message);
            console.error(error);
        }
    }

    return (
        <section id="login-form" aria-label="Login" className="auth-shell">
            <h2 className="auth-title">Welcome back</h2>
            <p className="auth-subtitle">Sign in to continue with TaskFlow.</p>

            <form aria-label="Login" className="auth-card" onSubmit={handleSubmit}>
                <h3 className="auth-card-title">Login</h3>

                <label htmlFor="login-username" className="auth-label">
                    Username
                </label>
                <input
                    id="login-username"
                    name="username"
                    type="text"
                    placeholder="your username"
                    className="auth-input"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />

                <label htmlFor="login-password" className="auth-label">
                    Password
                </label>
                <div className="auth-input-row">
                    <input
                        id="login-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="your password"
                        className="auth-input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                        type="button"
                        className="auth-toggle"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                        {showPassword ? "Hide" : "Show"}
                    </button>
                </div>

                <button type="submit" className="auth-button auth-button-primary">
                    Login
                </button>

                <p className="auth-switch-text">
                    No account yet?{" "}
                    <Link className="auth-switch-link" to="/signup">Sign Up</Link>
                </p>
            </form>
        </section>
    );
}

export default LoginForm;