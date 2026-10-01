const API_URL = 'http://localhost:8000'

export async function login(username, password) {
  const res = await fetch(`${API_URL}/auth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ username, password }),
  })
  if (!res.ok) throw new Error('Benutzername oder Passwort falsch')
  const data = await res.json()
  localStorage.setItem('token', data.access_token)
  return data.access_token
}

export async function register(username, password) {
  const res = await fetch(`${API_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || 'Registrierung fehlgeschlagen')
  }
}

export const getToken = () => localStorage.getItem('token')
export const logout = () => localStorage.removeItem('token')