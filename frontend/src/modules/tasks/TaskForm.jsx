import { useState } from 'react'
import { Plus } from 'lucide-react'
import { todayISO } from './dueDate'

// members: nur im Team – dann kann man direkt jemanden zuständig machen
function TaskForm({ onCreate, members }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [assignee, setAssignee] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) return
    onCreate({
      title: title.trim(),
      description: description.trim() || null,
      due_date: dueDate || null,
      ...(members && { assignee_id: assignee ? Number(assignee) : null }),
    })
    setTitle('')
    setDescription('')
    setDueDate('')
    setAssignee('')
  }

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <input
        placeholder="Titel"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        placeholder="Beschreibung (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <input
        type="date"
        className={`date-input ${dueDate ? 'filled' : ''}`}
        title="Fällig am (optional)"
        aria-label="Fällig am"
        min={todayISO()}
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
      />
      {members && (
        <select
          className={`assignee-select ${assignee ? 'filled' : ''}`}
          aria-label="Zuständig"
          title="Wer ist zuständig?"
          value={assignee}
          onChange={(e) => setAssignee(e.target.value)}
        >
          <option value="">Niemand</option>
          {members.map((m) => (
            <option key={m.user_id} value={m.user_id}>{m.username}</option>
          ))}
        </select>
      )}
      <button type="submit">
        <Plus size={16} strokeWidth={2} />
        Hinzufügen
      </button>
    </form>
  )
}

export default TaskForm
