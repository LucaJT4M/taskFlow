import { CalendarClock } from 'lucide-react'
import { dueInfo } from './dueDate'
import { t } from '../../i18n'

/** Kleines Etikett mit dem Fälligkeitsdatum einer Aufgabe */
function DueBadge({ task }) {
  const info = dueInfo(task.due_date, task.status)
  if (!info) return null

  return (
    <span className={`due-badge ${info.tone}`} title={t('due.title', { date: info.full })}>
      <CalendarClock size={13} strokeWidth={2} />
      {info.label}
    </span>
  )
}

export default DueBadge
