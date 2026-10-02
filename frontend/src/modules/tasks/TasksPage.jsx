import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import KanbanBoard from './KanbanBoard'
import TaskList from './TaskList'
import TaskForm from './TaskForm'
import { getTasks, createTask, updateTask, deleteTask } from './tasksApi'
import { logout } from '../../services/authService'

function TasksPage() {
  const [tasks, setTasks] = useState([])
  const [error, setError] = useState(null)
  const [view, setView] = useState('board') // 'board' | 'list'
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light')
  const navigate = useNavigate()

  useEffect(() => {
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    getTasks().then(setTasks).catch((err) => setError(err.message))
  }, [])

  function toggleTheme() {
    setTheme((t) => (t === 'light' ? 'dark' : 'light'))
  }

  function handleLogout() {
    logout()
    navigate('/')
  }

  async function handleCreate(data) {
    try {
      const created = await createTask(data)
      setTasks((prev) => [...prev, created])
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleUpdate(task, changes) {
    try {
      const updated = await updateTask(task.id, changes)
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleDelete(task) {
    try {
      await deleteTask(task.id)
      setTasks((prev) => prev.filter((t) => t.id !== task.id))
    } catch (err) {
      setError(err.message)
    }
  }

  const today = new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })
  const doneCount = tasks.filter((t) => t.status === 'done').length

  return (
    <div className="app-dark" data-theme={theme}>
      <div className="tasks-page">

        <nav className="topbar">
          <div className="brand">
            <span className="brand-mark">✓</span>
            TaskFlow
          </div>
          <div className="topbar-actions">
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              title={theme === 'light' ? 'Dunkles Design' : 'Helles Design'}
            >
              {theme === 'light' ? '☾' : '☀'}
            </button>
            <button className="btn-ghost" onClick={handleLogout}>Logout</button>
          </div>
        </nav>

        <header className="tasks-header">
          <div>
            <p className="eyebrow">{today}</p>
            <h1>Meine Aufgaben</h1>
            <p className="subtitle">{tasks.length - doneCount} offen · {doneCount} erledigt</p>
          </div>
          <div className="view-switch">
            <button className={view === 'list' ? 'active' : ''} onClick={() => setView('list')}>Liste</button>
            <button className={view === 'board' ? 'active' : ''} onClick={() => setView('board')}>Board</button>
          </div>
        </header>

        {error && <p className="error">Fehler: {error}</p>}
        <TaskForm onCreate={handleCreate} />

        {view === 'board'
          ? <KanbanBoard tasks={tasks} onUpdate={handleUpdate} onDelete={handleDelete} />
          : <TaskList tasks={tasks} onUpdate={handleUpdate} onDelete={handleDelete} />}
      </div>
    </div>
  )
}

export default TasksPage