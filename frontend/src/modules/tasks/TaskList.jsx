import { STATUSES } from './taskStatus'
import { Check, Trash2 } from 'lucide-react'
import Sprout from '../../components/decor/Sprout'
import { burstLeaves } from '../../components/decor/leafBurst'
import DueBadge from './DueBadge'

function TaskList({ tasks, onUpdate, onDelete }) {
  if (tasks.length === 0) {
    return (
      <div className="empty">
        <Sprout />
        Noch keine Aufgaben – leg oben deine erste an.
      </div>
    )
  }

  return (
    <div className="task-list">
      {tasks.map((task) => {
        const isDone = task.status === 'done'
        return (
          <div key={task.id} className={`task-row ${task.status}`}>
            <button
              className={`checkbox ${isDone ? 'checked' : ''}`}
              title={isDone ? 'Als offen markieren' : 'Als erledigt markieren'}
              onClick={(e) => {
                if (!isDone) burstLeaves(e.currentTarget)
                onUpdate(task, { status: isDone ? 'todo' : 'done' })
              }}
            >
              {isDone && <Check size={12} strokeWidth={3} />}
            </button>

            <div className="task-main">
              <div className="task-title">{task.title}</div>
              {task.description && <div className="task-desc">{task.description}</div>}
            </div>

            <DueBadge task={task} />

            <span className={`dot ${task.status}`} />
            <select
              className="status-select"
              value={task.status}
              onChange={(e) => {
                if (e.target.value === 'done') burstLeaves(e.currentTarget)
                onUpdate(task, { status: e.target.value })
              }}
            >
              {STATUSES.map((s) => (
                <option key={s.status} value={s.status}>{s.title}</option>
              ))}
            </select>

            <button className="icon-btn delete" title="Löschen" onClick={() => onDelete(task)}><Trash2 size={15} strokeWidth={1.75} /></button>
          </div>
        )
      })}
    </div>
  )
}

export default TaskList