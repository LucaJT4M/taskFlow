import { STATUSES } from './taskStatus'
import { ChevronLeft, ChevronRight, Edit2, Trash2 } from 'lucide-react'
import { burstLeaves } from '../../components/decor/leafBurst'
import { useState } from 'react'

const ORDER = STATUSES.map((s) => s.status)

function TaskCard({ task, onMove, onDelete, onEdit }) {
  const index = ORDER.indexOf(task.status)
  const statusTitle = STATUSES[index]?.title

  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitel] = useState(task.title)
  const [description, setDescription] = useState(task.description ?? '')


  if (isEditing) {
    return (
      <article className={`card ${task.status}`}>
      <input className="edit-tittle"
      value={title}
      onChange={(e) => setTitel(e.target.value)}
      placeholder="Tittle"
      autoFocus
      />
      <textarea
        className="edit-desc"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Beschreibung (optional)"
        rows={3}
      />
      <div className="edit-actions">
        <button className="btn-ghost" onClick={() => setIsEditing(false)}>
          Abbrechen
        </button>
        <button className="btn-save" onClick={() => setIsEditing(false)}>
          Speichern
        </button>
      </div> 
      </article>
    )
  }

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
            onClick={() => onMove(task, ORDER[index - 1])}>
            <ChevronLeft size={16} strokeWidth={1.75} />
          </button>
          <button className="icon-btn" title="Weiter" disabled={index === ORDER.length - 1}
            onClick={(e) => {
              const next = ORDER[index + 1]
              if (next === 'done') burstLeaves(e.currentTarget)
              onMove(task, next)
            }}>
            <ChevronRight size={16} strokeWidth={1.75} />
          </button>
          <button className="icon-btn delete" title="Löschen"
            onClick={() => onDelete(task)}>
            <Trash2 size={15} strokeWidth={1.75} />
          </button>
          <button className="icon-btn edit" title="Edit"
            onClick={() => setIsEditing(true)}>
              <Edit2 size={15} strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </article>
  )
}

export default TaskCard