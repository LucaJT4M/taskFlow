import { useCallback, useEffect, useState } from 'react'
import * as api from './teamsApi'

/** Lädt ein Team mit Mitgliedern und Aufgaben und bietet alle Aktionen dafür an. */
export function useTeam(teamId) {
  const [team, setTeam] = useState(null)
  const [tasks, setTasks] = useState([])
  const [error, setError] = useState(null)
  const [notFound, setNotFound] = useState(false)

  const load = useCallback(async () => {
    try {
      const [t, list] = await Promise.all([api.getTeam(teamId), api.getTeamTasks(teamId)])
      setTeam(t)
      setTasks(list)
    } catch (err) {
      if (err.status === 404) setNotFound(true)
      else setError(err.message)
    }
  }, [teamId])

  useEffect(() => {
    setTeam(null)
    setNotFound(false)
    load()
  }, [load])

  async function run(action) {
    try {
      setError(null)
      return await action()
    } catch (err) {
      setError(err.message)
      return null
    }
  }

  return {
    team,
    tasks,
    error,
    notFound,
    reload: load,
    addTask: (data) => run(async () => {
      const created = await api.createTeamTask(teamId, data)
      setTasks((prev) => [...prev, created])
    }),
    editTask: (task, changes) => run(async () => {
      const updated = await api.updateTeamTask(teamId, task.id, changes)
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
    }),
    removeTask: (task) => run(async () => {
      await api.deleteTeamTask(teamId, task.id)
      setTasks((prev) => prev.filter((t) => t.id !== task.id))
    }),
    rename: (name) => run(async () => setTeam(await api.renameTeam(teamId, name))),
    newCode: () => run(async () => setTeam(await api.newInviteCode(teamId))),
    removeMember: (userId) => run(async () => {
      await api.removeMember(teamId, userId)
      await load() // Zuständigkeiten der Aufgaben haben sich evtl. geändert
    }),
    leave: (userId) => run(async () => {
      await api.removeMember(teamId, userId)
      return true
    }),
    deleteTeam: () => run(async () => {
      await api.deleteTeam(teamId)
      return true
    }),
  }
}
