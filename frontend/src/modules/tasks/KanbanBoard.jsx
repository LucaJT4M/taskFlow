import TaskCard from './TaskCard'
import { STATUSES } from './taskStatus'
import TaskForm from './TaskForm'
import { getTasks, createTask, updateTask, deleteTask } from './tasksApi'
import { useNavigate } from 'react-router-dom'
import { logout } from '../../services/authService'

const COLUMNS = [
  { status: 'todo', title: 'To Do' },
  { status: 'in_progress', title: 'In Arbeit' },
  { status: 'done', title: 'Erledigt' },
]

function KanbanBoard({ tasks, onUpdate, onDelete }) {
function KanbanBoard() {
  const [tasks, setTasks] = useState([])
  const [error, setError] = useState(null)

  const navigate = useNavigate()

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
    <div className="board">
      {STATUSES.map((col) => {
        const columnTasks = tasks.filter((task) => task.status === col.status)
        return (
    <>
      <button onClick={(e) => logout()}>
        Logout
      </button>
      {error && <p className="error">Fehler: {error}</p>}
      <TaskForm onCreate={handleCreate} />
      <div className="board">
        {COLUMNS.map((col) => (
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