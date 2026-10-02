import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Moon, Sun, LogOut, LayoutList, Kanban } from 'lucide-react'
import KanbanBoard from './KanbanBoard'
import TaskList from './TaskList'
import TaskForm from './TaskForm'
import { useTasks } from './useTasks'
import { useTheme } from './useTheme'
import { logout } from '../../services/authService'

function TasksPage() {
  const { tasks, error, addTask, editTask, removeTask } = useTasks()
  const { theme, toggleTheme } = useTheme()
  const [view, setView] = useState('board') // 'board' | 'list'
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
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
        <TaskForm onCreate={addTask} />

        {view === 'board'
          ? <KanbanBoard tasks={tasks} onUpdate={editTask} onDelete={removeTask} />
          : <TaskList tasks={tasks} onUpdate={editTask} onDelete={removeTask} />}
      </div>
    </div>
  )
}

export default TasksPage