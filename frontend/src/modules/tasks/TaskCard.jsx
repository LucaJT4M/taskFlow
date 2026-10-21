import { useState } from 'react'
import { Check } from 'lucide-react'
import { STATUSES } from './taskStatus'
import { burstLeaves } from '../../components/decor/leafBurst'
import DueBadge from './DueBadge'
import TaskMenu from './TaskMenu'
import PriorityBadge from './PriorityBadge'
import PriorityPicker from './PriorityPicker'
import { usePrioritySuggestion } from './priority'
import { dueInfo } from './dueDate'
import AssigneeChip from '../teams/AssigneeChip'
import { t } from '../../i18n'

// Klicks auf diese Elemente sollen die Karte NICHT in den Bearbeiten-Modus schalten
const INTERACTIVE = 'button, a, input, select, textarea, .task-menu'

/**
 * Eine Aufgabe auf dem Board.
 * - Kreis links: direkt erledigen / wieder öffnen
 * - Klick auf die Karte: bearbeiten
 * - "⋯": bearbeiten, verschieben, löschen
 * - ziehen (Drag & Drop) in eine andere Spalte
 * members: nur bei Team-Aufgaben (zeigt und ändert, wer zuständig ist)
 */
function TaskCard({ task, onMove, onDelete, onEdit, members, onDragStart, onDragEnd, dragging }) {
  const statusTitle = STATUSES.find((s) => s.status === task.status)?.title
  const tone = dueInfo(task.due_date, task.status)?.tone
  const isDone = task.status === 'done'

  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitel] = useState(task.title)
  const [description, setDescription] = useState(task.description ?? '')
  const [dueDate, setDueDate] = useState(task.due_date ?? '')
  const [assignee, setAssignee] = useState(task.assignee_id ?? '')
  const [priority, setPriority] = useState('auto')
  const suggestion = usePrioritySuggestion({ title, description, due_date: dueDate }, isEditing && priority === 'auto')

  // Beim Öffnen immer die aktuellen Werte der Aufgabe übernehmen
  function startEditing() {
    setTitel(task.title)
    setDescription(task.description ?? '')
    setDueDate(task.due_date ?? '')
    setAssignee(task.assignee_id ?? '')
    setPriority(task.priority_auto === false ? task.priority : 'auto')
    setIsEditing(true)
  }

  function handleSave() {
    const newTitle = title.trim()
    if (!newTitle) return

    onEdit(task, {
      title: newTitle,
      description: description.trim() || null,
      due_date: dueDate || null,
      ...(members && { assignee_id: assignee ? Number(assignee) : null }),
      ...priorityChange(priority),
    })
    setIsEditing(false)
  }

  // Nur schicken, was sich an der Wichtigkeit wirklich geändert hat
  function priorityChange(value) {
    if (value === 'auto') return task.priority_auto === false ? { priority_auto: true } : {}
    return task.priority_auto !== false || task.priority !== value ? { priority: value } : {}
  }

  function setPriorityDirect(value) {
    onEdit(task, priorityChange(value))
  }

  function handleCancel() {
    setIsEditing(false)
  }

  function moveTo(status, event) {
    if (status === 'done' && event?.currentTarget) burstLeaves(event.currentTarget)
    onMove(task, status)
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
          placeholder={t('form.title')}
          autoFocus
        />
        <textarea
          className="edit-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onKeyDown={(e) => e.key === 'Escape' && handleCancel()}
          placeholder={t('form.description')}
          rows={3}
        />
        <label className="edit-date">
          {t('form.due')}
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
          {dueDate && (
            <button type="button" className="link-clear" onClick={() => setDueDate('')}>
              {t('card.removeDate')}
            </button>
          )}
        </label>
        <label className="edit-date">
          {t('prio.label')}
          <PriorityPicker value={priority} onChange={setPriority} suggestion={suggestion} fallback={task.priority} compact />
        </label>
        {members && (
          <label className="edit-date">
            {t('form.assignee')}
            <select value={assignee} onChange={(e) => setAssignee(e.target.value)}>
              <option value="">{t('form.nobody')}</option>
              {members.map((m) => (
                <option key={m.user_id} value={m.user_id}>{m.username}</option>
              ))}
            </select>
          </label>
        )}
        <div className="edit-actions">
          <button className="btn-ghost" onClick={handleCancel}>
            {t('common.cancel')}
          </button>
          <button className="btn-save" onClick={() => handleSave()}>
            {t('common.save')}
          </button>
        </div>
      </article>
    )
  }

  return (
    <article
      className={`card ${task.status} ${tone ? `due-${tone}` : ''} ${dragging ? 'dragging' : ''}`}
      draggable={Boolean(onDragStart)}
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = 'move'
        e.dataTransfer.setData('text/plain', String(task.id))
        onDragStart?.(task)
      }}
      onDragEnd={() => onDragEnd?.()}
      onClick={(e) => { if (!e.target.closest(INTERACTIVE)) startEditing() }}
      onKeyDown={(e) => { if (e.key === 'Enter' && e.target === e.currentTarget) startEditing() }}
      tabIndex={0}
      aria-label={`${task.title} – ${t('card.editHint')}`}
    >
      <div className="card-head">
        <button
          type="button"
          className={`card-check ${isDone ? 'checked' : ''}`}
          title={isDone ? t('task.markOpen') : t('task.markDone')}
          aria-label={isDone ? t('task.markOpen') : t('task.markDone')}
          onClick={(e) => moveTo(isDone ? 'todo' : 'done', e)}
        >
          <Check size={12} strokeWidth={3} />
        </button>
        <div className="card-title">{task.title}</div>
        <TaskMenu task={task} onEdit={startEditing} onMove={moveTo} onDelete={() => onDelete(task)} onPriority={setPriorityDirect} />
      </div>

      {task.description && <p className="card-desc">{task.description}</p>}

      {!isDone && (
        <div className="card-meta">
          <PriorityBadge task={task} />
          <DueBadge task={task} />
          <AssigneeChip task={task} members={members} />
        </div>
      )}

      <div className="card-footer">
        <span className="status-label">
          <span className={`dot ${task.status}`} />
          {statusTitle}
        </span>
      </div>
    </article>
  )
}

export default TaskCard
