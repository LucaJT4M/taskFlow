import { WEEKDAYS } from './calendarUtils'

const MAX_VISIBLE = 3

function MonthGrid({ days, tasksByDay, todayIso, selected, onSelect }) {
  return (
    <div className="month-grid" role="grid">
      {WEEKDAYS.map((d, i) => (
        <div key={d} className={`weekday ${i >= 5 ? 'weekend' : ''}`}>{d}</div>
      ))}

      {days.map(({ date, iso, inMonth }) => {
        const tasks = tasksByDay[iso] ?? []
        const hidden = tasks.length - MAX_VISIBLE
        const isPast = iso < todayIso

        return (
          <button
            key={iso}
            type="button"
            className={[
              'day',
              inMonth ? '' : 'outside',
              iso === todayIso ? 'today' : '',
              iso === selected ? 'selected' : '',
            ].join(' ')}
            onClick={() => onSelect(iso)}
          >
            <span className="day-number">{date.getDate()}</span>
            <span className="day-tasks">
              {tasks.slice(0, MAX_VISIBLE).map((t) => (
                <span
                  key={t.id}
                  className={`day-chip ${t.status} ${isPast && t.status !== 'done' ? 'overdue' : ''}`}
                  title={t.title}
                >
                  {t.title}
                </span>
              ))}
              {hidden > 0 && <span className="day-more">+{hidden} weitere</span>}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export default MonthGrid
