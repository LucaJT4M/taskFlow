function TaskCard({ task }) {
  return (
    <div className="card">
      <strong>{task.title}</strong>
      <p>{task.description}</p>
    </div>
  )
}

export default TaskCard