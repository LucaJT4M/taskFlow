import { Undo2 } from 'lucide-react'
import { t } from '../../i18n'

/** Leiste unten: „Aufgabe gelöscht · Rückgängig" */
function UndoToast({ task, onUndo }) {
  if (!task) return null
  return (
    <div className="undo-toast" role="status" key={task.id}>
      <span className="undo-text">{t('undo.deleted', { title: task.title })}</span>
      <button type="button" onClick={onUndo}>
        <Undo2 size={14} strokeWidth={2} /> {t('undo.undo')}
      </button>
      <span className="undo-timer" />
    </div>
  )
}

export default UndoToast
