import { useEffect, useRef, useState } from 'react'

const UNDO_MS = 5000

// Wartende Löschungen merken wir uns im Browser – falls die Seite in den 5 Sekunden
// neu geladen oder geschlossen wird, löschen wir sie beim nächsten Öffnen.
function readStored(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? []
  } catch {
    return []
  }
}
function writeStored(key, list) {
  try {
    if (list.length) localStorage.setItem(key, JSON.stringify(list))
    else localStorage.removeItem(key)
  } catch {
    // Speicher nicht verfügbar – dann eben ohne
  }
}

/**
 * Löschen mit "Rückgängig":
 * Die Aufgabe verschwindet sofort aus der Ansicht, wird aber erst nach 5 Sekunden
 * wirklich gelöscht. Bis dahin kann man sie zurückholen.
 * Wechselt man vorher die Seite, wird sofort gelöscht.
 *
 * remove: Funktion, die die Aufgabe wirklich löscht (z. B. removeTask aus useTasks)
 * storageKey: eigener Schlüssel pro Liste (persönlich / pro Team)
 */
export function useUndoDelete(remove, storageKey) {
  const [pending, setPending] = useState([]) // Aufgaben, die gleich gelöscht werden
  const [leftovers] = useState(() => readStored(storageKey)) // vom letzten Besuch übrig
  const timers = useRef(new Map()) // id -> { timer, task }
  const removeRef = useRef(remove)
  const leftoversDone = useRef(false) // React StrictMode ruft Effekte doppelt auf
  removeRef.current = remove

  function store() {
    writeStored(storageKey, [...timers.current.values()].map(({ task }) => ({ id: task.id, title: task.title })))
  }

  function commit(task) {
    timers.current.delete(task.id)
    store()
    setPending((list) => list.filter((x) => x.id !== task.id))
    removeRef.current(task)
  }

  function requestDelete(task) {
    if (timers.current.has(task.id)) return
    const timer = setTimeout(() => commit(task), UNDO_MS)
    timers.current.set(task.id, { timer, task })
    store()
    setPending((list) => [...list, task])
  }

  function undo() {
    const last = pending[pending.length - 1]
    if (!last) return
    clearTimeout(timers.current.get(last.id)?.timer)
    timers.current.delete(last.id)
    store()
    setPending((list) => list.filter((x) => x.id !== last.id))
  }

  useEffect(() => {
    // Übrig gebliebene Löschungen vom letzten Mal (Seite wurde neu geladen) jetzt ausführen
    if (!leftoversDone.current) {
      leftoversDone.current = true
      for (const task of leftovers) removeRef.current(task)
      writeStored(storageKey, [])
    }

    // Andere Seite in der App geöffnet: alles, was noch wartet, sofort löschen
    const map = timers.current
    return () => {
      for (const { timer, task } of map.values()) {
        clearTimeout(timer)
        removeRef.current(task)
      }
      map.clear()
      writeStored(storageKey, [])
    }
  }, [leftovers, storageKey])

  const hiddenIds = new Set([...pending, ...leftovers].map((x) => x.id))
  return { requestDelete, undo, last: pending[pending.length - 1] ?? null, isHidden: (task) => hiddenIds.has(task.id) }
}
