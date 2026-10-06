const DAY = 24 * 60 * 60 * 1000

// "2026-10-10" -> lokales Datum (ohne Zeitzonen-Verschiebung)
export function parseDate(value) {
  if (!value) return null
  const [y, m, d] = value.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function startOfToday() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

/**
 * Beschreibt ein Fälligkeitsdatum für die Anzeige.
 * tone: overdue | today | soon | later | done
 */
export function dueInfo(value, status) {
  const date = parseDate(value)
  if (!date) return null

  const days = Math.round((date - startOfToday()) / DAY)
  const short = date.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })
  const full = date.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  if (status === 'done') return { label: short, tone: 'done', full }
  if (days < 0) return { label: days === -1 ? 'Seit gestern überfällig' : `Überfällig · ${short}`, tone: 'overdue', full }
  if (days === 0) return { label: 'Heute fällig', tone: 'today', full }
  if (days === 1) return { label: 'Morgen fällig', tone: 'soon', full }
  if (days < 7) return { label: date.toLocaleDateString('de-DE', { weekday: 'long' }), tone: 'soon', full }
  return { label: short, tone: 'later', full }
}

// Heute als "YYYY-MM-DD" (für das min-Attribut im Datumsfeld)
export function todayISO() {
  const d = startOfToday()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
