import { useEffect, useState } from 'react'
import KanbanBoard from './KanbanBoard'
import TaskList from './TaskList'
import TaskForm from './TaskForm'
import { getTasks, createTask, updateTask, deleteTask } from './tasksApi'

function TasksPage() {
  const [tasks, setTasks] = useState([])
  const [error, setError] = useState(null)
  const [view, setView] = useState('board') // 'board' | 'list'

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

  async function handleUpdate(task, changes) {
    try {
      const updated = await updateTask(task.id, changes)
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
    <div className="tasks-page">
      <header className="tasks-header">
        <h1>Task-Flow</h1>
        <div className="view-switch">
          <button className={view === 'list' ? 'active' : ''} onClick={() => setView('list')}>Liste</button>
          <button className={view === 'board' ? 'active' : ''} onClick={() => setView('board')}>Board</button>
        </div>
      </header>

      {error && <p className="error">Fehler: {error}</p>}
      <TaskForm onCreate={handleCreate} />

      {view === 'board'
        ? <KanbanBoard tasks={tasks} onUpdate={handleUpdate} onDelete={handleDelete} />
        : <TaskList tasks={tasks} onUpdate={handleUpdate} onDelete={handleDelete} />}
    </div>
  )
}

export default TasksPage