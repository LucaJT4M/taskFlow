import { useEffect, useState } from 'react'
import TaskCard from './TaskCard'

const API_URL = 'http://localhost:8000'

const COLUMNS = [
  { status: 'todo', title: 'To Do' },
  { status: 'in_progress', title: 'In Arbeit' },
  { status: 'done', title: 'Erledigt' },
]

function KanbanBoard() {
  const [tasks, setTasks] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch(`${API_URL}/tasks`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then(setTasks)
      .catch((err) => setError(err.message))
  }, [])

  if (error) return <p>Fehler: {error}</p>

  return (
    <div className="board">
      {COLUMNS.map((col) => (
        <div key={col.status} className="column">
          <h3>{col.title}</h3>
          {tasks
            .filter((task) => task.status === col.status)
            .map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
        </div>
      ))}
    </div>
  )
}

export default KanbanBoard