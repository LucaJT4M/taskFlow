import { STATUSES } from './taskStatus'

const ORDER = STATUSES.map((s) => s.status)

function TaskCard({ task, onMove, onDelete }) {
  const index = ORDER.indexOf(task.status)
  const statusTitle = STATUSES[index]?.title

  return (
    <article className={`card ${task.status}`}>
      <div className="card-title">{task.title}</div>
      {task.description && <p>{task.description}</p>}

      <div className="card-footer">
        <span className="status-label">
          <span className={`dot ${task.status}`} />
          {statusTitle}
        </span>
        <div className="card-actions">
          <button className="icon-btn" title="Zurück" disabled={index === 0}
            onClick={() => onMove(task, ORDER[index - 1])}>←</button>
          <button className="icon-btn" title="Weiter" disabled={index === ORDER.length - 1}
            onClick={() => onMove(task, ORDER[index + 1])}>→</button>
          <button className="icon-btn delete" title="Löschen"
            onClick={() => onDelete(task)}>✕</button>
        </div>
      </div>
    </article>
  )
}

export default TaskCard