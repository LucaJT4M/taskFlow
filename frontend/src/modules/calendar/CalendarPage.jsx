import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Sidebar from '../tasks/Sidebar'
import { useTasks } from '../tasks/useTasks'
import { useTheme } from '../tasks/useTheme'
import { useCurrentUser } from '../tasks/useCurrentUser'
import { logout } from '../../services/authService'
import DecorLayer from '../../components/decor/DecorLayer'
import MonthGrid from './MonthGrid'
import DayPanel from './DayPanel'
import { groupByDueDate, monthDays, monthTitle, toISO } from './calendarUtils'
import './calendar.css'

function CalendarPage() {
  const { tasks, error, addTask, editTask } = useTasks()
  const { theme, toggleTheme } = useTheme()
  const user = useCurrentUser()
  const navigate = useNavigate()

  const todayIso = toISO(new Date())
  const [month, setMonth] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })
  const [selected, setSelected] = useState(todayIso)

  const countBy = (status) => tasks.filter((t) => t.status === status).length
  const counts = {
    all: tasks.length,
    todo: countBy('todo'),
    in_progress: countBy('in_progress'),
    done: countBy('done'),
  }

  const days = monthDays(month.getFullYear(), month.getMonth())
  const tasksByDay = groupByDueDate(tasks)
  const inThisMonth = days
    .filter((d) => d.inMonth)
    .reduce((sum, d) => sum + (tasksByDay[d.iso]?.length ?? 0), 0)
  const withoutDate = tasks.filter((t) => !t.due_date && t.status !== 'done').length

  function changeMonth(step) {
    setMonth((m) => new Date(m.getFullYear(), m.getMonth() + step, 1))
  }

  function goToday() {
    const now = new Date()
    setMonth(new Date(now.getFullYear(), now.getMonth(), 1))
    setSelected(todayIso)
  }

  // Klick auf einen Tag aus dem Vor-/Folgemonat wechselt auch den Monat
  function selectDay(iso) {
    setSelected(iso)
    const [y, m] = iso.split('-').map(Number)
    if (y !== month.getFullYear() || m - 1 !== month.getMonth()) setMonth(new Date(y, m - 1, 1))
  }

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <div className="app-dark app-layout" data-theme={theme}>
      <DecorLayer variant="app" />
      <Sidebar
        filter={null}
        onFilterChange={(filter) => navigate('/dashboard', { state: { filter } })}
        counts={counts}
        username={user?.username}
        isAdmin={user?.username === 'admin'}
        activePage="calendar"
        theme={theme}
        onToggleTheme={toggleTheme}
        onLogout={handleLogout}
      />

      <main className="app-main">
        <div className="tasks-page calendar-page">
          <header className="tasks-header">
            <div>
              <p className="eyebrow">Kalender</p>
              <h1>{monthTitle(month)}</h1>
              <p className="subtitle">
                {inThisMonth} {inThisMonth === 1 ? 'Aufgabe' : 'Aufgaben'} in diesem Monat
                {withoutDate > 0 && ` · ${withoutDate} offen ohne Datum`}
              </p>
            </div>
            <div className="month-nav">
              <button type="button" className="icon-btn" title="Vorheriger Monat" onClick={() => changeMonth(-1)}>
                <ChevronLeft size={18} strokeWidth={1.75} />
              </button>
              <button type="button" className="btn-ghost" onClick={goToday}>Heute</button>
              <button type="button" className="icon-btn" title="Nächster Monat" onClick={() => changeMonth(1)}>
                <ChevronRight size={18} strokeWidth={1.75} />
              </button>
            </div>
          </header>

          {error && <p className="error">Fehler: {error}</p>}

          <div className="calendar-layout">
            <MonthGrid
              days={days}
              tasksByDay={tasksByDay}
              todayIso={todayIso}
              selected={selected}
              onSelect={selectDay}
            />
            <DayPanel
              iso={selected}
              tasks={tasksByDay[selected] ?? []}
              todayIso={todayIso}
              onToggle={editTask}
              onCreate={addTask}
            />
          </div>
        </div>
      </main>
    </div>
  )
}

export default CalendarPage
