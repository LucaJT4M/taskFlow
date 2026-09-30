import { useEffect, useState } from 'react'
import TaskCard from './TaskCard'
import TaskForm from './TaskForm'
import { getTasks, createTask, updateTask, deleteTask } from './tasksApi'

const COLUMNS = [
  { status: 'todo', title: 'To Do' },
  { status: 'in_progress', title: 'In Arbeit' },
  { status: 'done', title: 'Erledigt' },
]

function KanbanBoard() {
  const [tasks, setTasks] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    getTasks().then(setTasks).catch((err) => setError(err.message))
  }, [])

  async function handleCreate(data) {
    try {
      const created = await createTask(data)
      setTasks((prev) => [...prev, created])
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleMove(task, newStatus) {
    try {
      const updated = await updateTask(task.id, { status: newStatus })
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleDelete(task) {
    try {
      await deleteTask(task.id)
      setTasks((prev) => prev.filter((t) => t.id !== task.id))
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <>
      {error && <p className="error">Fehler: {error}</p>}
      <TaskForm onCreate={handleCreate} />
      <div className="board">
        {COLUMNS.map((col) => (
          <div key={col.status} className="column">
            <h3>{col.title}</h3>
            {tasks
              .filter((task) => task.status === col.status)
              .map((task) => (
                <TaskCard key={task.id} task={task} onMove={handleMove} onDelete={handleDelete} />
              ))}
          </div>
        ))}
      </div>
    </>
  )
}

export default KanbanBoard