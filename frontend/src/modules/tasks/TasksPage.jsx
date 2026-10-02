import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LayoutList, Kanban } from 'lucide-react'
import Sidebar from './Sidebar'
import KanbanBoard from './KanbanBoard'
import TaskList from './TaskList'
import TaskForm from './TaskForm'
import { useTasks } from './useTasks'
import { useTheme } from './useTheme'
import { logout } from '../../services/authService'
import { useCurrentUser } from './UseCurrentUser'

const FILTER_TITLES = {
  all: 'Meine Aufgaben',
  todo: 'To Do',
  in_progress: 'In Arbeit',
  done: 'Erledigt',
}

function TasksPage() {
  const { tasks, error, addTask, editTask, removeTask } = useTasks()
  const { theme, toggleTheme } = useTheme()
  const user = useCurrentUser()
  const [view, setView] = useState('board') // 'board' | 'list'
  const [filter, setFilter] = useState('all') // 'all' | 'todo' | 'in_progress' | 'done'
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  const countBy = (status) => tasks.filter((t) => t.status === status).length
  const counts = {
    all: tasks.length,
    todo: countBy('todo'),
    in_progress: countBy('in_progress'),
    done: countBy('done'),
  }

  const visibleTasks = filter === 'all' ? tasks : tasks.filter((t) => t.status === filter)
  const today = new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="app-dark app-layout" data-theme={theme}>
      <Sidebar
        filter={filter}
        onFilterChange={setFilter}
        counts={counts}
        username={user?.username}
        theme={theme}
        onToggleTheme={toggleTheme}
        onLogout={handleLogout}
      />

      <main className="app-main">
        <div className="tasks-page">
          <header className="tasks-header">
            <div>
              <p className="eyebrow">{today}</p>
              <h1>{FILTER_TITLES[filter]}</h1>
              <p className="subtitle">{counts.all - counts.done} offen · {counts.done} erledigt</p>
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
            ? <KanbanBoard tasks={visibleTasks} onUpdate={editTask} onDelete={removeTask} />
            : <TaskList tasks={visibleTasks} onUpdate={editTask} onDelete={removeTask} />}
        </div>
      </main>
    </div>
  )
}

export default TasksPage