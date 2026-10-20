import { useEffect, useRef, useState } from 'react'
import { ArrowRight, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { STATUSES } from './taskStatus'
import { t } from '../../i18n'

/** Das "⋯"-Menü einer Karte: bearbeiten, verschieben, löschen (funktioniert auch auf dem Handy) */
function TaskMenu({ task, onEdit, onMove, onDelete }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const close = (e) => { if (!ref.current?.contains(e.target)) setOpen(false) }
    const esc = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', close)
    document.addEventListener('keydown', esc)
    return () => { document.removeEventListener('pointerdown', close); document.removeEventListener('keydown', esc) }
  }, [open])

  // Klick auf einen Menüpunkt: erst Menü schließen, dann Aktion
  const pick = (action) => (e) => {
    e.stopPropagation()
    setOpen(false)
    action(e)
  }

  return (
    <div className="task-menu" ref={ref}>
      <button
        type="button"
        className="icon-btn menu-trigger"
        title={t('card.actions')}
        aria-label={t('card.actions')}
        aria-expanded={open}
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o) }}
      >
        <MoreHorizontal size={16} strokeWidth={1.75} />
      </button>

      {open && (
        <div className="task-menu-list" role="menu">
          <button type="button" role="menuitem" onClick={pick(() => onEdit())}>
            <Pencil size={14} strokeWidth={1.75} /> {t('common.edit')}
          </button>
          <p className="task-menu-label">{t('card.moveTo')}</p>
          {STATUSES.filter((s) => s.status !== task.status).map((s) => (
            <button key={s.status} type="button" role="menuitem" onClick={pick((e) => onMove(s.status, e))}>
              <span className={`dot ${s.status}`} /> {s.title}
              <ArrowRight size={13} strokeWidth={1.75} className="menu-arrow" />
            </button>
          ))}
          <div className="task-menu-sep" />
          <button type="button" role="menuitem" className="danger" onClick={pick(() => onDelete())}>
            <Trash2 size={14} strokeWidth={1.75} /> {t('common.delete')}
          </button>
        </div>
      )}
    </div>
  )
}

export default TaskMenu
