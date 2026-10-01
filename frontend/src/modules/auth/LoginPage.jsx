import { useState } from 'react'
import { login, register } from './authApi'

function LoginPage({ onLogin }) {
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    try {
      if (mode === 'register') await register(username, password)
      const token = await login(username, password)
      onLogin(token)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="login">
      <h2>{mode === 'login' ? 'Anmelden' : 'Registrieren'}</h2>
      <form onSubmit={handleSubmit}>
        <input placeholder="Benutzername" value={username} onChange={(e) => setUsername(e.target.value)} required />
        <input type="password" placeholder="Passwort" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">{mode === 'login' ? 'Anmelden' : 'Konto erstellen'}</button>
      </form>
      {error && <p className="error">{error}</p>}
      <button className="link" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
        {mode === 'login' ? 'Noch kein Konto? Registrieren' : 'Schon ein Konto? Anmelden'}
      </button>
    </div>
  )
}

export default LoginPage