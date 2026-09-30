const ORDER = ['todo', 'in_progress', 'done']

function TaskCard({ task, onMove, onDelete }) {
  const index = ORDER.indexOf(task.status)

  return (
    <div className="card">
      <strong>{task.title}</strong>
      {task.description && <p>{task.description}</p>}
      <div className="card-actions">
        <button disabled={index === 0} onClick={() => onMove(task, ORDER[index - 1])}>←</button>
        <button disabled={index === ORDER.length - 1} onClick={() => onMove(task, ORDER[index + 1])}>→</button>
        <button onClick={() => onDelete(task)}>✕</button>
      </div>
    </div>
  )
}

export default TaskCard