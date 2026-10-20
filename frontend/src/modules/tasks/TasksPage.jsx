import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { LayoutList, Kanban } from 'lucide-react'
import Sidebar from './Sidebar'
import KanbanBoard from './KanbanBoard'
import TaskList from './TaskList'
import TaskForm from './TaskForm'
import ExportImportMenu from './ExportImportMenu'
import { useTasks } from './useTasks'
import { useTheme } from './useTheme'
import { logout } from '../../services/authService'
import { useCurrentUser } from './useCurrentUser'
import DecorLayer from '../../components/decor/DecorLayer'
import GrowthToast from '../garden/GrowthToast'
import { useGarden } from '../garden/useGarden'
import { describeGrowth } from '../garden/growth'
import { t, locale } from '../../i18n'

const FILTERS = ['all', 'todo', 'in_progress', 'done']
const filterLabel = (key) => (key === 'all' ? t('filter.all') : t(`status.${key}`))

function TasksPage() {
  const { garden, refresh: refreshGarden } = useGarden()
  const [growth, setGrowth] = useState(null)
  const { tasks, error, addTask, editTask, removeTask, importTasks } = useTasks({ onTaskCompleted: handleTaskCompleted })
  const { theme, toggleTheme } = useTheme()
  const user = useCurrentUser()
  const [view, setView] = useState('board') // 'board' | 'list'
  const location = useLocation()
  const [filter, setFilter] = useState(location.state?.filter ?? 'all') // 'all' | 'todo' | 'in_progress' | 'done'
  const navigate = useNavigate()

  // Eine Aufgabe wurde erledigt: Garten neu laden und zeigen, was gewachsen ist
  async function handleTaskCompleted() {
    const before = garden
    const after = await refreshGarden()
    const info = describeGrowth(before, after)
    if (info) setGrowth(info)
  }

  function handleLogout() {
    logout()
    navigate('/')
  }

  const countBy = (status) => tasks.filter((task) => task.status === status).length
  const counts = {
    all: tasks.length,
    todo: countBy('todo'),
    in_progress: countBy('in_progress'),
    done: countBy('done'),
  }

  const visibleTasks = filter === 'all' ? tasks : tasks.filter((task) => task.status === filter)
  const today = new Date().toLocaleDateString(locale(), { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="app-dark app-layout" data-theme={theme}>
      <DecorLayer variant="app" />
      <Sidebar
        activePage="tasks"
        openCount={counts.all - counts.done}
        username={user?.username}
        isAdmin={user?.role === 'admin'}
        theme={theme}
        onToggleTheme={toggleTheme}
        onLogout={handleLogout}
      />

      <main className="app-main">
        <div className="tasks-page">
          <header className="tasks-header">
            <div>
              <p className="eyebrow">{today}</p>
              <h1>{t('tasks.title')}</h1>
              <p className="subtitle">{t('tasks.summary', { open: counts.all - counts.done, done: counts.done })}</p>
            </div>
          </header>

          {error && <p className="error">{t('common.error', { msg: error })}</p>}
          <TaskForm onCreate={addTask} />

          {/* Filter nach Status + Ansicht wechseln */}
          <div className="task-toolbar">
            <div className="filter-tabs" role="tablist" aria-label={t('tasks.filterAria')}>
              {FILTERS.map((key) => (
                <button
                  key={key}
                  role="tab"
                  aria-selected={filter === key}
                  className={`filter-tab ${filter === key ? 'active' : ''}`}
                  onClick={() => setFilter(key)}
                >
                  {key !== 'all' && <span className={`dot ${key}`} />}
                  {filterLabel(key)}
                  <span className="filter-count">{counts[key]}</span>
                </button>
              ))}
            </div>

            <div className="toolbar-right">
              <ExportImportMenu tasks={tasks} onImport={importTasks} />
              <div className="view-switch">
                <button className={view === 'list' ? 'active' : ''} onClick={() => setView('list')}>
                  <LayoutList size={15} strokeWidth={1.75} />
                  {t('view.list')}
                </button>
                <button className={view === 'board' ? 'active' : ''} onClick={() => setView('board')}>
                  <Kanban size={15} strokeWidth={1.75} />
                  {t('view.board')}
                </button>
              </div>
            </div>
          </div>

          {view === 'board'
            ? <KanbanBoard tasks={visibleTasks} onUpdate={editTask} onDelete={removeTask} />
            : <TaskList tasks={visibleTasks} onUpdate={editTask} onDelete={removeTask} />}
        </div>
      </main>

      {growth && (
        <GrowthToast
          info={growth}
          onClose={() => setGrowth(null)}
          onOpenGarden={() => navigate('/garden')}
        />
      )}
    </div>
  )
}

export default TasksPage