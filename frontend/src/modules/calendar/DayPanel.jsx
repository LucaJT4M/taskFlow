import { useState } from 'react'
import { Check, Plus } from 'lucide-react'
import { STATUSES } from '../tasks/taskStatus'
import { burstLeaves } from '../../components/decor/leafBurst'
import { dayTitle } from './calendarUtils'

/** Rechte Spalte: Aufgaben des gewählten Tages + schnell eine neue anlegen */
function DayPanel({ iso, tasks, todayIso, onToggle, onCreate }) {
  const [title, setTitle] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) return
    onCreate({ title: title.trim(), description: null, due_date: iso })
    setTitle('')
  }

  return (
    <aside className="day-panel">
      <p className="eyebrow">{iso === todayIso ? 'Heute' : 'Ausgewählter Tag'}</p>
      <h2>{dayTitle(iso)}</h2>

      {tasks.length === 0 ? (
        <p className="day-empty">Für diesen Tag ist nichts geplant.</p>
      ) : (
        <ul className="day-list">
          {tasks.map((task) => {
            const isDone = task.status === 'done'
            const overdue = iso < todayIso && !isDone
            return (
              <li key={task.id} className={`day-item ${task.status} ${overdue ? 'overdue' : ''}`}>
                <button
                  type="button"
                  className={`checkbox ${isDone ? 'checked' : ''}`}
                  title={isDone ? 'Als offen markieren' : 'Als erledigt markieren'}
                  onClick={(e) => {
                    if (!isDone) burstLeaves(e.currentTarget)
                    onToggle(task, { status: isDone ? 'todo' : 'done' })
                  }}
                >
                  {isDone && <Check size={12} strokeWidth={3} />}
                </button>
                <div className="day-item-main">
                  <div className="day-item-title">{task.title}</div>
                  {task.description && <div className="day-item-desc">{task.description}</div>}
                  <span className="status-label">
                    <span className={`dot ${task.status}`} />
                    {overdue ? 'Überfällig' : STATUSES.find((s) => s.status === task.status)?.title}
                  </span>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <form className="day-add" onSubmit={handleSubmit}>
        <input
          placeholder="Neue Aufgabe für diesen Tag"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button type="submit" title="Hinzufügen" disabled={!title.trim()}>
          <Plus size={16} strokeWidth={2} />
        </button>
      </form>
    </aside>
  )
}

export default DayPanel
