// Datum -> "YYYY-MM-DD" (lokale Zeit, so wie due_date im Backend gespeichert ist)
export function toISO(date) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export const WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

/**
 * Alle Tage, die in der Monatsansicht sichtbar sind:
 * volle Wochen von Montag bis Sonntag, inkl. Tage aus Vor- und Folgemonat.
 */
export function monthDays(year, month) {
  const first = new Date(year, month, 1)
  const offset = (first.getDay() + 6) % 7 // Montag = 0
  const start = new Date(year, month, 1 - offset)
  const last = new Date(year, month + 1, 0)
  const total = Math.ceil((offset + last.getDate()) / 7) * 7

  return Array.from({ length: total }, (_, i) => {
    const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i)
    return { date, iso: toISO(date), inMonth: date.getMonth() === month }
  })
}

/** Aufgaben nach Fälligkeitsdatum gruppieren: { "2026-10-08": [task, ...] } */
export function groupByDueDate(tasks) {
  const map = {}
  for (const task of tasks) {
    if (!task.due_date) continue
    ;(map[task.due_date] ??= []).push(task)
  }
  // offene Aufgaben zuerst, erledigte am Ende
  for (const list of Object.values(map)) {
    list.sort((a, b) => (a.status === 'done') - (b.status === 'done'))
  }
  return map
}

export function monthTitle(date) {
  return date.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })
}

export function dayTitle(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })
}
