import { useEffect, useState } from 'react'
import { request } from './tasksApi'
import { t } from '../../i18n'

// Wichtigkeit einer Aufgabe: 1 niedrig, 2 mittel, 3 hoch
// = so viele Wachstumspunkte bekommt der Garten beim Erledigen
export const LEVELS = [3, 2, 1]
export const levelKey = (level) => ({ 1: 'low', 2: 'medium', 3: 'high' })[level] ?? 'medium'
export const levelName = (level) => t(`prio.${levelKey(level)}`)

export const suggestPriority = (data) =>
  request('/tasks/priority/suggest', { method: 'POST', body: JSON.stringify(data) })

/** Begründung vom Backend lesbar machen: "keyword:prüfung" -> „prüfung“ */
export function reasonText(reason) {
  const [type, value] = reason.split(':')
  if (type === 'keyword' || type === 'low') return t('prio.word', { word: value })
  if (type === 'due') return t(`prio.due.${value}`)
  if (type === 'emphasis') return t('prio.emphasis')
  return reason
}

/** Live-Vorschlag beim Tippen (kurz gewartet, damit nicht jeder Buchstabe eine Anfrage ist) */
export function usePrioritySuggestion({ title, description, due_date }, enabled = true) {
  const [suggestion, setSuggestion] = useState(null)
  useEffect(() => {
    if (!enabled || !title.trim()) {
      setSuggestion(null)
      return
    }
    let cancelled = false
    const timer = setTimeout(() => {
      suggestPriority({ title, description: description || null, due_date: due_date || null })
        .then((s) => !cancelled && setSuggestion(s))
        .catch(() => {})
    }, 350)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [title, description, due_date, enabled])
  return suggestion
}

/** Sortierung: wichtig zuerst, dann nach Fälligkeit, dann wie angelegt */
export function sortByPriority(tasks) {
  return [...tasks].sort(
    (a, b) =>
      (b.priority ?? 2) - (a.priority ?? 2) ||
      (a.due_date ?? '9999').localeCompare(b.due_date ?? '9999') ||
      a.id - b.id,
  )
}
