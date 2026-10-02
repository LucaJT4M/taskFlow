import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import KanbanBoard from './KanbanBoard'
import TaskList from './TaskList'
import TaskForm from './TaskForm'
import { getTasks, createTask, updateTask, deleteTask } from './tasksApi'
import { logout } from '../../services/authService'
import { Check, Moon, Sun, LogOut, LayoutList, Kanban } from 'lucide-react'

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
            <span className="brand-mark"><Check size={15} strokeWidth={3} /></span>
            TaskFlow
          </div>
          <div className="topbar-actions">
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              title={theme === 'light' ? 'Dunkles Design' : 'Helles Design'}
            >
            {theme === 'light' ? <Moon size={17} strokeWidth={1.75} /> : <Sun size={17} strokeWidth={1.75} />}
            </button>
            <button className="btn-ghost" onClick={handleLogout}>
              <LogOut size={15} strokeWidth={1.75} />
              Logout
            </button>
          </div>
        </nav>

        <header className="tasks-header">
          <div>
            <p className="eyebrow">{today}</p>
            <h1>Meine Aufgaben</h1>
            <p className="subtitle">{tasks.length - doneCount} offen · {doneCount} erledigt</p>
          </div>
          <div className="view-switch">
            <button className={view === 'list' ? 'active' : ''} onClick={() => setView('list')}>
              <LayoutList size={15} strokeWidth={1.75} />
              Liste
            </button>
            <button className={view === 'board' ? 'active' : ''} onClick={() => setView('board')}>
              <Kanban size={15} strokeWidth={1.75} />
              Board
            </button>
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