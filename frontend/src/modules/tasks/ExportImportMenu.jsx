import { useEffect, useRef, useState } from 'react'
import { ArrowDownToLine, ArrowUpFromLine, FileJson, FileSpreadsheet, Upload, X } from 'lucide-react'
import { exportCSV, exportJSON, readImportFile } from './exportImport'
import { t } from '../../i18n'

/** Knopf mit Menü: Aufgaben als JSON/CSV exportieren oder aus einer Datei importieren */
function ExportImportMenu({ tasks, onImport }) {
  const [open, setOpen] = useState(false)
  const [preview, setPreview] = useState(null) // { fileName, valid, duplicates, invalid }
  const [status, setStatus] = useState(null) // null | 'importing' | { done: n }
  const [error, setError] = useState(null)
  const fileRef = useRef(null)
  const menuRef = useRef(null)

  // Menü schließen bei Klick daneben oder Escape
  useEffect(() => {
    if (!open) return
    const close = (e) => { if (!menuRef.current?.contains(e.target)) setOpen(false) }
    const esc = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', close)
    document.addEventListener('keydown', esc)
    return () => { document.removeEventListener('pointerdown', close); document.removeEventListener('keydown', esc) }
  }, [open])

  async function handleFile(e) {
    const file = e.target.files?.[0]
    e.target.value = '' // gleiche Datei nochmal wählbar
    if (!file) return
    setError(null)
    setStatus(null)
    try {
      const result = await readImportFile(file, tasks)
      setPreview({ fileName: file.name, ...result })
    } catch (err) {
      setPreview({ fileName: file.name, valid: [], duplicates: 0, invalid: [] })
      setError(err.message)
    }
  }

  async function confirmImport() {
    setStatus('importing')
    const count = await onImport(preview.valid)
    setStatus({ done: count })
  }

  function closeDialog() {
    setPreview(null)
    setStatus(null)
    setError(null)
  }

  return (
    <div className="io-menu" ref={menuRef}>
      <button type="button" className="btn-ghost io-trigger" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <ArrowDownToLine size={15} strokeWidth={1.75} />
        {t('io.button')}
      </button>

      {open && (
        <div className="io-dropdown" role="menu">
          <p className="io-label">{t('io.exportAll', { n: tasks.length })}</p>
          <button type="button" role="menuitem" disabled={!tasks.length} onClick={() => { exportJSON(tasks); setOpen(false) }}>
            <FileJson size={16} strokeWidth={1.75} /> {t('io.json')}
          </button>
          <button type="button" role="menuitem" disabled={!tasks.length} onClick={() => { exportCSV(tasks); setOpen(false) }}>
            <FileSpreadsheet size={16} strokeWidth={1.75} /> {t('io.csv')}
          </button>
          <div className="io-sep" />
          <button type="button" role="menuitem" onClick={() => { fileRef.current?.click(); setOpen(false) }}>
            <ArrowUpFromLine size={16} strokeWidth={1.75} /> {t('io.importFrom')}
          </button>
        </div>
      )}

      <input ref={fileRef} type="file" accept=".json,.csv,application/json,text/csv" hidden onChange={handleFile} />

      {preview && (
        <div className="io-backdrop" onPointerDown={(e) => e.target === e.currentTarget && status !== 'importing' && closeDialog()}>
          <div className="io-dialog" role="dialog" aria-modal="true" aria-label={t('io.dialogTitle')}>
            <header>
              <h2><Upload size={18} strokeWidth={1.75} /> {t('io.dialogTitle')}</h2>
              <button type="button" className="icon-btn" onClick={closeDialog} disabled={status === 'importing'} title={t('common.close')}>
                <X size={16} />
              </button>
            </header>
            <p className="io-file">{preview.fileName}</p>

            {error ? (
              <p className="io-error">{error}</p>
            ) : status && status !== 'importing' ? (
              <p className="io-success">{t('io.success', { n: status.done })}</p>
            ) : (
              <>
                <ul className="io-summary">
                  <li><strong>{preview.valid.length}</strong> {t('io.newTasks', { n: preview.valid.length })}</li>
                  {preview.duplicates > 0 && <li><strong>{preview.duplicates}</strong> {t('io.duplicates')}</li>}
                  {preview.invalid.length > 0 && <li className="bad"><strong>{preview.invalid.length}</strong> {t('io.invalid')}</li>}
                </ul>

                {preview.valid.length > 0 && (
                  <ul className="io-preview">
                    {preview.valid.slice(0, 5).map((task, i) => (
                      <li key={i}>
                        <span className={`dot ${task.status}`} />
                        <span className="io-title">{task.title}</span>
                        {task.due_date && <span className="io-date">{task.due_date.split('-').reverse().join('.')}</span>}
                      </li>
                    ))}
                    {preview.valid.length > 5 && <li className="io-more">{t('io.more', { n: preview.valid.length - 5 })}</li>}
                  </ul>
                )}

                {preview.invalid.length > 0 && (
                  <details className="io-invalid">
                    <summary>{t('io.showInvalid')}</summary>
                    <ul>
                      {preview.invalid.slice(0, 10).map((x) => <li key={x.line}>{t('io.entry', { line: x.line, error: x.error })}</li>)}
                    </ul>
                  </details>
                )}
              </>
            )}

            <footer>
              {status && status !== 'importing' || error ? (
                <button type="button" className="btn-save" onClick={closeDialog}>{t('common.done')}</button>
              ) : (
                <>
                  <button type="button" className="btn-ghost" onClick={closeDialog} disabled={status === 'importing'}>{t('common.cancel')}</button>
                  <button
                    type="button"
                    className="btn-save"
                    onClick={confirmImport}
                    disabled={!preview.valid.length || status === 'importing'}
                  >
                    {status === 'importing' ? t('io.importing') : t('io.importN', { n: preview.valid.length })}
                  </button>
                </>
              )}
            </footer>
          </div>
        </div>
      )}
    </div>
  )
}

export default ExportImportMenu
