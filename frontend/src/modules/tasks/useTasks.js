import { useEffect, useState } from 'react'
import { getTasks, createTask, updateTask, deleteTask } from './tasksApi'

export const normalizeTask = (task = {}) => {
  const rawStatus = typeof task.status === 'string' ? task.status : ''
  const status =
    rawStatus === 'done' || rawStatus === 'Done'
      ? 'Done'
      : rawStatus === 'in_progress' || rawStatus === 'In Progress'
        ? 'In Progress'
        : 'To Do'

  return {
    id: Number(task.id ?? 0),
    title: typeof task.title === 'string' && task.title.trim() ? task.title : 'Untitled task',
    user:
      typeof task.user === 'string' && task.user.trim()
        ? task.user
        : typeof task.username === 'string' && task.username.trim()
          ? task.username
          : 'Unassigned',
    status,
    dueDate: typeof task.dueDate === 'string' && task.dueDate.trim() ? task.dueDate : '-',
  }
}

export const normalizeTasks = (tasks) =>
  Array.isArray(tasks) ? tasks.map((task) => normalizeTask(task)) : []

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

  return { tasks, error, addTask, editTask, removeTask, normalizeTask, normalizeTasks }
}