import { STATUSES } from './taskStatus'

function TaskList({ tasks, onUpdate, onDelete }) {
  if (tasks.length === 0) return <p className="empty">Noch keine Aufgaben.</p>

  return (
    <table className="task-list">
      <thead>
        <tr>
          <th>Titel</th>
          <th>Beschreibung</th>
          <th>Status</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {tasks.map((task) => (
          <tr key={task.id}>
            <td>{task.title}</td>
            <td>{task.description}</td>
            <td>
              <select value={task.status} onChange={(e) => onUpdate(task, { status: e.target.value })}>
                {STATUSES.map((s) => (
                  <option key={s.status} value={s.status}>{s.title}</option>
                ))}
              </select>
            </td>
            <td><button onClick={() => onDelete(task)}>✕</button></td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default TaskList