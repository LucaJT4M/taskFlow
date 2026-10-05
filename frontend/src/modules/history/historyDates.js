// Das Backend speichert die Zeit in UTC, aber ohne "Z" am Ende.
// Ohne "Z" würde der Browser sie als lokale Zeit lesen (2 Stunden falsch).
export function parseUtc(value) {
  const hasZone = /Z$|[+-]\d\d:\d\d$/.test(value)
  return new Date(hasZone ? value : `${value}Z`)
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
}

export function dayLabel(date) {
  const diff = Math.round((startOfDay(new Date()) - startOfDay(date)) / 86400000)
  if (diff === 0) return 'Heute'
  if (diff === 1) return 'Gestern'
  return date.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })
}

export function timeLabel(date) {
  return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
}

/** Gruppiert Einträge nach Tag: [{ label, items }] – neueste zuerst */
export function groupByDay(entries) {
  const groups = []
  const sorted = [...entries].sort((a, b) => parseUtc(b.deleted_date) - parseUtc(a.deleted_date))
  for (const entry of sorted) {
    const label = dayLabel(parseUtc(entry.deleted_date))
    const last = groups[groups.length - 1]
    if (last && last.label === label) last.items.push(entry)
    else groups.push({ label, items: [entry] })
  }
  return groups
}
