import { Trash2 } from 'lucide-react'
import { STATUSES } from '../tasks/taskStatus'
import { parseUtc, timeLabel } from './historyDates'

function HistoryEntry({ entry }) {
  const status = STATUSES.find((s) => s.status === entry.status)

  return (
    <li className={`history-entry ${entry.status}`}>
      <span className="history-node">
        <Trash2 size={12} strokeWidth={2} />
      </span>
      <div className="history-card">
        <div className="history-main">
          <div className="history-title">{entry.title}</div>
          {entry.description && <p className="history-desc">{entry.description}</p>}
        </div>
        <div className="history-meta">
          <span className="status-label">
            <span className={`dot ${entry.status}`} />
            {status?.title ?? entry.status}
          </span>
          <time dateTime={entry.deleted_date}>gelöscht um {timeLabel(parseUtc(entry.deleted_date))}</time>
        </div>
      </div>
    </li>
  )
}

export default HistoryEntry
