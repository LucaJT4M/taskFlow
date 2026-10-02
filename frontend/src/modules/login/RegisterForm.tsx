import { useNavigate, Link } from "react-router-dom";
import React, { useState } from "react";
import { sign_up } from "../../services/authService";

function RegisterForm() {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
	const [showPassword, setShowPassword] = useState(false)
	const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const navigate = useNavigate()

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

		const success = await sign_up(username, password, confirmPassword)
		if (success) {
			navigate("/dashboard")
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
