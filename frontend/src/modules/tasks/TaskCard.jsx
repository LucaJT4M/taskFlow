import { STATUSES } from './taskStatus'
import { ChevronLeft, ChevronRight, Edit2, Trash2 } from 'lucide-react'
import { burstLeaves } from '../../components/decor/leafBurst'
import { useState } from 'react'
import DueBadge from './DueBadge'
import { dueInfo } from './dueDate'

const ORDER = STATUSES.map((s) => s.status)


function TaskCard({ task, onMove, onDelete, onEdit }) {
  const index = ORDER.indexOf(task.status)
  const statusTitle = STATUSES[index]?.title
  const overdue = dueInfo(task.due_date, task.status)?.tone === 'overdue'

  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitel] = useState(task.title)
  const [description, setDescription] = useState(task.description ?? '')
  const [dueDate, setDueDate] = useState(task.due_date ?? '')

  function handleSave() {
    const newTitle = title.trim()
    if (!newTitle) return

    onEdit(task, {
      title: newTitle,
      description: description.trim() || null,
      due_date: dueDate || null,
    })
    setIsEditing(false)
  }

  function handleCancel() {
    setTitel(task.title)
    setDescription(task.description ?? '')
    setDueDate(task.due_date ?? '')
    setIsEditing(false)
  }


  if (isEditing) {
    return (
      <article className={`card card-edit ${task.status}`}>
        <input className="edit-title"
          value={title}
          onChange={(e) => setTitel(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave()
            if (e.key === 'Escape') handleCancel()
          }}
          placeholder="Titel"
          autoFocus
        />
        <textarea
          className="edit-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Beschreibung (optional)"
          rows={3}
        />
        <label className="edit-date">
          Fällig am
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
          {dueDate && (
            <button type="button" className="link-clear" onClick={() => setDueDate('')}>
              entfernen
            </button>
          )}
        </label>
        <div className="edit-actions">
          <button className="btn-ghost" onClick={handleCancel}>
            Abbrechen
          </button>
          <button className="btn-save" onClick={() => handleSave()}>
            Speichern
          </button>
        </div>
      </article>
    )
  }

  return (
    <article className={`card ${task.status} ${overdue ? 'overdue' : ''}`}>
      <div className="card-title">{task.title}</div>
      {task.description && <p>{task.description}</p>}
      <DueBadge task={task} />

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
          <button className="icon-btn edit" title="Bearbeiten"
            onClick={() => setIsEditing(true)}>
            <Edit2 size={15} strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </article>
  )
}

export default TaskCard
