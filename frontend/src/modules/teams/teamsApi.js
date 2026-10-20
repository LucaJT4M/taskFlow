import { request } from '../tasks/tasksApi'

// ---------- Teams ----------
export const getTeams = () => request('/teams')
export const getTeam = (id) => request(`/teams/${id}`)
export const createTeam = (name) => request('/teams', { method: 'POST', body: JSON.stringify({ name }) })
export const joinTeam = (inviteCode) =>
  request('/teams/join', { method: 'POST', body: JSON.stringify({ invite_code: inviteCode }) })
export const renameTeam = (id, name) => request(`/teams/${id}`, { method: 'PATCH', body: JSON.stringify({ name }) })
export const newInviteCode = (id) => request(`/teams/${id}/invite-code`, { method: 'POST' })
export const deleteTeam = (id) => request(`/teams/${id}`, { method: 'DELETE' })
export const removeMember = (id, userId) => request(`/teams/${id}/members/${userId}`, { method: 'DELETE' })

// ---------- Aufgaben im Team ----------
export const getTeamTasks = (id) => request(`/teams/${id}/tasks`)
export const createTeamTask = (id, task) =>
  request(`/teams/${id}/tasks`, { method: 'POST', body: JSON.stringify(task) })
export const updateTeamTask = (id, taskId, changes) =>
  request(`/teams/${id}/tasks/${taskId}`, { method: 'PATCH', body: JSON.stringify(changes) })
export const deleteTeamTask = (id, taskId) => request(`/teams/${id}/tasks/${taskId}`, { method: 'DELETE' })

/** "PKB5ZRDL" -> "PKB5-ZRDL" (besser lesbar) */
export const formatCode = (code = '') => code.replace(/(.{4})(?=.)/g, '$1-')
