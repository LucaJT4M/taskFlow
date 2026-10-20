// Export und Import von Aufgaben als JSON oder CSV.
// Alles passiert im Browser – das Backend wird nur zum Anlegen der importierten Aufgaben genutzt.

import { t } from '../../i18n'

const FIELDS = ['title', 'description', 'status', 'due_date']
const STATUSES = ['todo', 'in_progress', 'done']
// auch deutsche Statusnamen beim Import verstehen (z. B. aus Excel)
const STATUS_ALIASES = {
  'to do': 'todo', todo: 'todo', offen: 'todo',
  'in arbeit': 'in_progress', in_progress: 'in_progress', 'in progress': 'in_progress',
  erledigt: 'done', done: 'done', fertig: 'done', open: 'todo',
}

// ---------------- Export ----------------

function stamp() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function download(content, filename, type) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

const pick = (task) => Object.fromEntries(FIELDS.map((f) => [f, task[f] ?? null]))

export function exportJSON(tasks) {
  const data = {
    app: 'TaskFlow',
    exported_at: new Date().toISOString(),
    tasks: tasks.map(pick),
  }
  download(JSON.stringify(data, null, 2), `${t('io.filePrefix')}-${stamp()}.json`, 'application/json')
}

// Semikolon als Trennzeichen: so öffnet ein deutsches Excel die Datei direkt richtig
const SEP = ';'

function csvCell(value) {
  const text = value == null ? '' : String(value)
  return /[";\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

export function exportCSV(tasks) {
  const rows = [FIELDS.join(SEP), ...tasks.map((task) => FIELDS.map((f) => csvCell(task[f])).join(SEP))]
  // ﻿ (BOM) = Excel erkennt Umlaute (ä, ö, ü) korrekt
  download('﻿' + rows.join('\r\n'), `${t('io.filePrefix')}-${stamp()}.csv`, 'text/csv;charset=utf-8')
}

// ---------------- Import ----------------

/** Einfacher CSV-Parser: Anführungszeichen, "" und Zeilenumbrüche in Zellen werden unterstützt */
function parseCSV(text) {
  const firstLine = text.split(/\r?\n/, 1)[0]
  const sep = [';', ',', '\t'].reduce((best, s) => (firstLine.split(s).length > firstLine.split(best).length ? s : best), ';')

  const rows = []
  let row = []
  let cell = ''
  let quoted = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++ }
      else if (c === '"') quoted = false
      else cell += c
    } else if (c === '"') quoted = true
    else if (c === sep) { row.push(cell); cell = '' }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++
      row.push(cell); rows.push(row); row = []; cell = ''
    } else cell += c
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row) }

  const [header, ...body] = rows.filter((r) => r.some((c) => c.trim() !== ''))
  if (!header) return []
  const keys = header.map((h) => h.trim().toLowerCase())
  return body.map((r) => Object.fromEntries(keys.map((k, i) => [k, r[i]])))
}

// Datum als "2026-10-24" oder "24.10.2026" akzeptieren
function normalizeDate(value) {
  if (!value) return null
  const v = String(value).trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v
  const m = v.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/)
  if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`
  return undefined // ungültig
}

function normalizeTask(raw) {
  const title = String(raw.title ?? raw.titel ?? '').trim()
  if (!title) return { error: t('io.err.noTitle') }
  if (title.length > 200) return { error: t('io.err.titleLong') }

  const statusRaw = String(raw.status ?? 'todo').trim().toLowerCase()
  const status = STATUS_ALIASES[statusRaw] ?? (STATUSES.includes(statusRaw) ? statusRaw : null)
  if (!status) return { error: t('io.err.status', { value: raw.status }) }

  const due = normalizeDate(raw.due_date ?? raw['fällig'] ?? raw.faellig)
  if (due === undefined) return { error: t('io.err.date', { value: raw.due_date }) }

  const description = String(raw.description ?? raw.beschreibung ?? '').trim() || null
  return { task: { title, description, status, due_date: due } }
}

const sameTask = (a, b) =>
  a.title === b.title && (a.description ?? null) === (b.description ?? null) && (a.due_date ?? null) === (b.due_date ?? null)

/**
 * Liest eine JSON- oder CSV-Datei und prüft jede Zeile.
 * Ergebnis: { valid: [...], duplicates: n, invalid: [{ line, error }] }
 */
export async function readImportFile(file, existingTasks) {
  const text = (await file.text()).replace(/^﻿/, '')
  let rawList
  if (file.name.toLowerCase().endsWith('.json') || text.trim().startsWith('{') || text.trim().startsWith('[')) {
    let data
    try {
      data = JSON.parse(text)
    } catch {
      throw new Error(t('io.err.badJson'))
    }
    rawList = Array.isArray(data) ? data : data.tasks
    if (!Array.isArray(rawList)) throw new Error(t('io.err.noList'))
  } else {
    rawList = parseCSV(text)
  }

  const valid = []
  const invalid = []
  let duplicates = 0
  rawList.forEach((raw, i) => {
    const { task, error } = normalizeTask(raw ?? {})
    if (error) return invalid.push({ line: i + 1, error })
    if (existingTasks.some((other) => sameTask(other, task)) || valid.some((other) => sameTask(other, task))) {
      duplicates++
      return
    }
    valid.push(task)
  })
  return { valid, duplicates, invalid }
}
