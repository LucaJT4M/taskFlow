import { CalendarClock } from 'lucide-react'
import { dueInfo } from './dueDate'

/** Kleines Etikett mit dem Fälligkeitsdatum einer Aufgabe */
function DueBadge({ task }) {
  const info = dueInfo(task.due_date, task.status)
  if (!info) return null

  return (
    <span className={`due-badge ${info.tone}`} title={`Fällig am ${info.full}`}>
      <CalendarClock size={13} strokeWidth={2} />
      {info.label}
    </span>
  )
}

export default DueBadge
