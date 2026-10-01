import { STATUSES } from './taskStatus'

function TaskList({ tasks, onUpdate, onDelete }) {
  if (tasks.length === 0) {
    return <div className="empty">Noch keine Aufgaben – leg oben deine erste an.</div>
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
              onClick={() => onUpdate(task, { status: isDone ? 'todo' : 'done' })}
            >
              {isDone && '✓'}
            </button>

            <div className="task-main">
              <div className="task-title">{task.title}</div>
              {task.description && <div className="task-desc">{task.description}</div>}
            </div>

            <span className={`dot ${task.status}`} />
            <select
              className="status-select"
              value={task.status}
              onChange={(e) => onUpdate(task, { status: e.target.value })}
            >
              {STATUSES.map((s) => (
                <option key={s.status} value={s.status}>{s.title}</option>
              ))}
            </select>

            <button className="icon-btn delete" title="Löschen" onClick={() => onDelete(task)}>✕</button>
          </div>
        )
      })}
    </div>
  )
}

export default TaskList