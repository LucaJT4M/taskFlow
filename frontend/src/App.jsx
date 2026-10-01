import { useState } from 'react'
import KanbanBoard from './modules/tasks/KanbanBoard'
import LoginPage from './modules/auth/LoginPage'
import { getToken, logout } from './modules/auth/authApi'

function App() {
  const [token, setToken] = useState(getToken())

  function handleLogout() {
    logout()
    setToken(null)
  }

  if (!token) return <LoginPage onLogin={setToken} />

  return (
    <div>
      <header className="app-header">
        <h1>Task-Flow</h1>
        <button onClick={handleLogout}>Abmelden</button>
      </header>
      <KanbanBoard />
    </div>
  )
}

export default App