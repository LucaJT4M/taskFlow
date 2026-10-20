import { API_URL } from '../../config'
import { serverMessage } from '../../i18n'

export async function request(path, options = {}) {
  const token = localStorage.getItem('access_token')

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  // Token abgelaufen oder ungültig → zurück zum Login
  if (res.status === 401) {
    localStorage.removeItem('access_token')
    window.location.href = '/login'
    throw new Error('Sitzung abgelaufen')
  }

  if (!res.ok) {
    // Fehlermeldung vom Backend übernehmen (z. B. "Kein Team mit diesem Einladungscode gefunden")
    let message = `HTTP ${res.status}`
    try {
      const body = await res.json()
      if (typeof body.detail === 'string') message = serverMessage(body.detail)
    } catch {
      // keine JSON-Antwort
    }
    const error = new Error(message)
    error.status = res.status
    throw error
  }
  return res.status === 204 ? null : res.json()
}

export const getTasks = () => request('/tasks')

export const createTask = (task) =>
  request('/tasks', { method: 'POST', body: JSON.stringify(task) })

export const createTaskAsAdmin = (task) =>
  request('/tasks/create_as_admin', { method: 'POST', body: JSON.stringify(task) })

export const updateTask = (id, changes) =>
  request(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(changes) })

export const deleteTask = (id) =>
  request(`/tasks/${id}`, { method: 'DELETE', keepalive: true }) // keepalive: klappt auch, wenn die Seite gerade geschlossen wird