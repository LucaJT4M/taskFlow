import { useState } from 'react'
import { Plus } from 'lucide-react'
import { todayISO } from './dueDate'
import { t } from '../../i18n'

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
        placeholder={t('form.title')}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        placeholder={t('form.description')}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <input
        type="date"
        className={`date-input ${dueDate ? 'filled' : ''}`}
        title={t('form.dueTitle')}
        aria-label={t('form.due')}
        min={todayISO()}
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
      />
      {members && (
        <select
          className={`assignee-select ${assignee ? 'filled' : ''}`}
          aria-label={t('form.assignee')}
          title={t('form.assigneeTitle')}
          value={assignee}
          onChange={(e) => setAssignee(e.target.value)}
        >
          <option value="">{t('form.nobody')}</option>
          {members.map((m) => (
            <option key={m.user_id} value={m.user_id}>{m.username}</option>
          ))}
        </select>
      )}
      <button type="submit">
        <Plus size={16} strokeWidth={2} />
        {t('common.add')}
      </button>
    </form>
  )
}

export default TaskForm
