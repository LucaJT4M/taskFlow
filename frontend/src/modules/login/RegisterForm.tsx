import { useNavigate, Link } from "react-router-dom";
import React, { useState } from "react";
import { toast } from "react-toastify";

function RegisterForm() {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
	const [showPassword, setShowPassword] = useState(false)
	const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const navigate = useNavigate()

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        try {
			const loginBody = new URLSearchParams();

            if (password !== confirmPassword) {
                throw new Error("Password and confirm password not same");
            }

            const response = await fetch("http://localhost:8000/user", {
                method: "POST",
                headers: {
					"Content-Type": "application/json",
                },
				body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                const error = await response.json();
				const detail = Array.isArray(error.detail)
					? error.detail.map((d: { msg?: string }) => d.msg).filter(Boolean).join(", ")
					: error.detail;
				throw new Error(detail || "Signup failed");
            }

			loginBody.append("username", username);
			loginBody.append("password", password);

            const login_response = await fetch("http://localhost:8000/auth/token", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
				body: loginBody.toString(),
            });

            if (!login_response.ok) {
				const error = await login_response.json();
				const detail = Array.isArray(error.detail)
					? error.detail.map((d: { msg?: string }) => d.msg).filter(Boolean).join(", ")
					: error.detail;
				throw new Error(detail || "Login failed");
            }

            const data = await login_response.json();
            localStorage.setItem("access_token", data.access_token);

            navigate("/dashboard")
        } catch (error) {
			const message = error instanceof Error ? error.message : "Registration failed";
			toast.error(message);
            console.error(error);
        }
    }

	return (
		<section id="register-form" aria-label="Register" className="auth-shell">
			<h2 className="auth-title">Create account</h2>
			<p className="auth-subtitle">Join TaskFlow in a few seconds.</p>

			<form className="auth-card" onSubmit={handleSubmit}>
				<h3 className="auth-card-title">Register</h3>

				<label htmlFor="register-username" className="auth-label">
					Username
				</label>
				<input
					id="register-username"
					name="username"
					type="text"
					placeholder="choose username"
                    className="auth-input"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
				/>

				<label htmlFor="register-password" className="auth-label">
					Password
				</label>
				<div className="auth-input-row">
					<input
						id="register-password"
						name="password"
						type={showPassword ? "text" : "password"}
						placeholder="choose password"
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

				<label htmlFor="register-password-repeat" className="auth-label">
					Repeat password
				</label>
				<div className="auth-input-row">
					<input
						id="register-password-repeat"
						name="password-repeat"
						type={showConfirmPassword ? "text" : "password"}
						placeholder="repeat password"
                    className="auth-input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
					/>
					<button
						type="button"
						className="auth-toggle"
						onClick={() => setShowConfirmPassword((prev) => !prev)}
						aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
					>
						{showConfirmPassword ? "Hide" : "Show"}
					</button>
				</div>

				<button type="submit" className="auth-button auth-button-secondary">
					Create account
				</button>

				<p className="auth-switch-text">
					Already have an account?{" "}
					<Link className="auth-switch-link" to="/">Back to login</Link>
				</p>
			</form>
		</section>
	);
}

export default RegisterForm;
