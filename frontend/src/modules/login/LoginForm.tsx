import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";



function LoginForm() {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        console.log("Username:", username);
        console.log("Password:", password);
    }

    return (
        <section
            id="login-form"
            aria-label="Login"
            style={{
                maxWidth: 520,
                margin: "16px auto",
                padding: 24,
                borderRadius: 20,
                background: "linear-gradient(140deg, #f6fff8 0%, #eef6ff 100%)",
                boxShadow: "0 12px 32px rgba(16, 24, 40, 0.1)",
            }}
        >
            <h2 style={{ margin: "0 0 6px", fontSize: 28, color: "#17324d" }}>Welcome back</h2>
            <p style={{ margin: "0 0 18px", color: "#4d6179" }}>Sign in to continue with TaskFlow.</p>

            <form
                aria-label="Login"
                style={{
                    border: "1px solid #d6e3f3",
                    borderRadius: 14,
                    padding: 16,
                    background: "#ffffff",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    boxShadow: "0 4px 14px rgba(0, 18, 42, 0.08)",
                }}
            >
                <h3 style={{ margin: "0 0 12px", color: "#17324d" }}>Login</h3>

                <label htmlFor="login-username" style={{ fontSize: 14, color: "#3f556f" }}>
                    Username
                </label>
                <input
                    id="login-username"
                    name="username"
                    type="text"
                    placeholder="your username"
                    style={{
                        width: "100%",
                        margin: "6px 0 10px",
                        padding: "10px 12px",
                        border: "1px solid #c8d8ec",
                        borderRadius: 10,
                        outline: "none",
                    }}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />

                <label htmlFor="login-password" style={{ fontSize: 14, color: "#3f556f" }}>
                    Password
                </label>
                <input
                    id="login-password"
                    name="password"
                    type="password"
                    placeholder="your password"
                    style={{
                        width: "100%",
                        margin: "6px 0 12px",
                        padding: "10px 12px",
                        border: "1px solid #c8d8ec",
                        borderRadius: 10,
                        outline: "none",
                    }}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button
                    type="button"
                    style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: 10,
                        border: "none",
                        color: "#ffffff",
                        background: "linear-gradient(120deg, #1c7ed6 0%, #1f9c89 100%)",
                        cursor: "pointer",
                        transition: "filter 0.2s ease",
                    }}
                >
                    Login
                </button>

                <p style={{ margin: "12px 0 0", fontSize: 14, color: "#4d6179" }}>
                    No account yet?{" "}
                    <Link to="/signup">Sign Up</Link>
                </p>
            </form>
        </section>
    );
}

export default LoginForm;