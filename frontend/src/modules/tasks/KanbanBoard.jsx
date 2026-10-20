import TaskCard from './TaskCard'
import { STATUSES } from './taskStatus'
import Sprout from '../../components/decor/Sprout'
import { t } from '../../i18n'

function KanbanBoard({ tasks, onUpdate, onDelete, members }) {
  return (
    <div className="board">
      {STATUSES.map((col) => {
        const columnTasks = tasks.filter((task) => task.status === col.status)
        return (
          <section key={col.status} className="column">
            <div className="column-header">
              <span className={`dot ${col.status}`} />
              <h3>{col.title}</h3>
              <span className="count">{columnTasks.length}</span>
            </div>
            <div className="column-body">
              {columnTasks.length === 0 && (
                <div className="column-empty">
                  <Sprout />
                  {t('board.empty')}
                </div>
              )}
              {columnTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onMove={(task, newStatus) => onUpdate(task, { status: newStatus })}
                  onDelete={onDelete}
                  onEdit={onUpdate}
                  members={members}
                />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}

export default KanbanBoard