import { useState } from 'react'
import { Plus } from 'lucide-react'
import { todayISO } from './dueDate'

function TaskForm({ onCreate }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) return
    onCreate({
      title: title.trim(),
      description: description.trim() || null,
      due_date: dueDate || null,
    })
    setTitle('')
    setDescription('')
    setDueDate('')
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
      <button type="submit">
        <Plus size={16} strokeWidth={2} />
        Hinzufügen
      </button>
    </form>
  )
}

export default TaskForm
