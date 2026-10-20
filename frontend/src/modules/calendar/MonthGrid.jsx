import { weekdays } from './calendarUtils'
import { t } from '../../i18n'

const MAX_VISIBLE = 3

function MonthGrid({ days, tasksByDay, todayIso, selected, onSelect }) {
  return (
    <div className="month-grid" role="grid">
      {weekdays().map((d, i) => (
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
              {tasks.slice(0, MAX_VISIBLE).map((task) => (
                <span
                  key={task.id}
                  className={`day-chip ${task.status} ${isPast && task.status !== 'done' ? 'overdue' : ''}`}
                  title={task.title}
                >
                  {task.title}
                </span>
              ))}
              {hidden > 0 && <span className="day-more">{t('cal.more', { n: hidden })}</span>}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export default MonthGrid
