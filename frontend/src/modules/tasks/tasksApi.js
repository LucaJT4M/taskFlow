const API_URL = 'http://localhost:8000'

async function request(path, options = {}) {
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
    window.location.href = '/'
    throw new Error('Sitzung abgelaufen')
  }

  if (!res.ok) throw new Error(`HTTP ${res.status}`)
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
  request(`/tasks/${id}`, { method: 'DELETE' })