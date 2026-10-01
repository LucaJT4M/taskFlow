import TaskCard from './TaskCard'
import { STATUSES } from './taskStatus'

function KanbanBoard({ tasks, onUpdate, onDelete }) {
  return (
    <div className="board">
      {STATUSES.map((col) => {
        const columnTasks = tasks.filter((task) => task.status === col.status)
        return (
          <div key={col.status} className="column">
            <h3>{col.title} ({columnTasks.length})</h3>
            {columnTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onMove={(t, newStatus) => onUpdate(t, { status: newStatus })}
                onDelete={onDelete}
              />
            ))}
          </div>
        )
      })}
    </div>
  )
}

export default KanbanBoard