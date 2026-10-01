import { useNavigate, Link } from "react-router-dom";
import React, { useState } from "react";

function RegisterForm() {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
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

            navigate("/board")
        } catch (error) {
            console.error(error);
        }
    }

	return (
		<section
			id="register-form"
			aria-label="Register"
			style={{
				maxWidth: 520,
				margin: "16px auto",
				padding: 24,
				borderRadius: 20,
				background: "linear-gradient(140deg, #f6fff8 0%, #eef6ff 100%)",
				boxShadow: "0 12px 32px rgba(16, 24, 40, 0.1)",
			}}
		>
			<h2 style={{ margin: "0 0 6px", fontSize: 28, color: "#17324d" }}>Create account</h2>
			<p style={{ margin: "0 0 18px", color: "#4d6179" }}>Join TaskFlow in a few seconds.</p>

			<form
				style={{
					border: "1px solid #d6e3f3",
					borderRadius: 14,
					padding: 16,
					background: "#ffffff",
					boxShadow: "0 4px 14px rgba(0, 18, 42, 0.08)",
				}}
                onSubmit={handleSubmit}
			>
				<h3 style={{ margin: "0 0 12px", color: "#17324d" }}>Register</h3>

				<label htmlFor="register-username" style={{ fontSize: 14, color: "#3f556f" }}>
					Username
				</label>
				<input
					id="register-username"
					name="username"
					type="text"
					placeholder="choose username"
					style={{
						display: "block",
						width: "100%",
						boxSizing: "border-box",
						margin: "6px 0 10px",
						padding: "10px 12px",
						border: "1px solid #c8d8ec",
						borderRadius: 10,
						outline: "none",
					}}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
				/>

				<label htmlFor="register-password" style={{ fontSize: 14, color: "#3f556f" }}>
					Password
				</label>
				<input
					id="register-password"
					name="password"
					type="password"
					placeholder="choose password"
					style={{
						display: "block",
						width: "100%",
						boxSizing: "border-box",
						margin: "6px 0 10px",
						padding: "10px 12px",
						border: "1px solid #c8d8ec",
						borderRadius: 10,
						outline: "none",
					}}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
				/>

				<label htmlFor="register-password-repeat" style={{ fontSize: 14, color: "#3f556f" }}>
					Repeat password
				</label>
				<input
					id="register-password-repeat"
					name="password-repeat"
					type="password"
					placeholder="repeat password"
					style={{
						display: "block",
						width: "100%",
						boxSizing: "border-box",
						margin: "6px 0 12px",
						padding: "10px 12px",
						border: "1px solid #c8d8ec",
						borderRadius: 10,
						outline: "none",
					}}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
				/>

				<button
					type="submit"
					style={{
						width: "100%",
						padding: "10px 12px",
						borderRadius: 10,
						border: "1px solid #a8c7e8",
						color: "#17324d",
						background: "#eef6ff",
						cursor: "pointer",
						transition: "background 0.2s ease",
					}}
				>
					Create account
				</button>

				<p style={{ margin: "12px 0 0", fontSize: 14, color: "#4d6179" }}>
					Already have an account?{" "}
					<Link to="/">Back to login</Link>
				</p>
			</form>
		</section>
	);
}

export default RegisterForm;
