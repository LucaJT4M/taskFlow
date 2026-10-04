import { useEffect, useState } from 'react'
import { getTasks, createTask, createTaskAsAdmin, updateTask, deleteTask } from './tasksApi'

export function useTasks() {
  const [tasks, setTasks] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    getTasks()
      .then((data) => setTasks(Array.isArray(data) ? data : []))
      .catch((err) => setError(err.message))
  }, [])

  // Gemeinsame Fehlerbehandlung für alle Aktionen
  async function run(action) {
    try {
      setError(null)
      await action()
    } catch (err) {
      setError(err.message)
    }
  }

  const addTask = (data) =>
    run(async () => {
      const created = await createTask(data)
      setTasks((prev) => [...prev, created])
    })

  const addTaskAsAdmin = (data) =>
    run(async () => {
      const created = await createTaskAsAdmin(data)
      setTasks((prev) => [...prev, created])
    })

  const editTask = (task, changes) =>
    run(async () => {
      const updated = await updateTask(task.id, changes)
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
    })

  const removeTask = (task) =>
    run(async () => {
      await deleteTask(task.id)
      setTasks((prev) => prev.filter((t) => t.id !== task.id))
    })
  
  return { tasks, error, addTask, addTaskAsAdmin, editTask, removeTask }
}