import TaskCard from './TaskCard'
import { STATUSES } from './taskStatus'
import Sprout from '../../components/decor/Sprout'

function KanbanBoard({ tasks, onUpdate, onDelete }) {
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
                  Keine Aufgaben
                </div>
              )}
              {columnTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onMove={(t, newStatus) => onUpdate(t, { status: newStatus })}
                  onDelete={onDelete}
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