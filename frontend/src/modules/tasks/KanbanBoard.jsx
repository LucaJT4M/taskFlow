import { useState } from 'react'
import { Plus } from 'lucide-react'
import TaskCard from './TaskCard'
import { STATUSES } from './taskStatus'
import { sortByPriority } from './priority'
import Sprout from '../../components/decor/Sprout'
import { burstLeaves } from '../../components/decor/leafBurst'
import { t } from '../../i18n'
import './board.css'

// In diesen Spalten kann man direkt unten eine Aufgabe anlegen
const QUICK_ADD = ['todo', 'in_progress']

function KanbanBoard({ tasks, onUpdate, onDelete, onCreate, members }) {
  const [dragged, setDragged] = useState(null) // Aufgabe, die gerade gezogen wird
  const [over, setOver] = useState(null) // Spalte unter der Maus
  const [adding, setAdding] = useState(null) // Spalte mit offenem "+"-Feld
  const [newTitle, setNewTitle] = useState('')

  function handleDrop(e, status) {
    e.preventDefault()
    setOver(null)
    if (dragged && dragged.status !== status) {
      if (status === 'done') burstLeaves(e.currentTarget.querySelector('.column-header') ?? e.currentTarget)
      onUpdate(dragged, { status })
    }
    setDragged(null)
  }

  function submitNew(e, status) {
    e.preventDefault()
    if (!newTitle.trim()) return
    onCreate({ title: newTitle.trim(), status })
    setNewTitle('') // Feld bleibt offen -> mehrere Aufgaben hintereinander
  }

  function closeAdd() {
    setAdding(null)
    setNewTitle('')
  }

  return (
    <div className={`board ${dragged ? 'is-dragging' : ''}`}>
      {STATUSES.map((col) => {
        // wichtige Aufgaben oben, erledigte in der Reihenfolge, wie sie kamen
        const inColumn = tasks.filter((task) => task.status === col.status)
        const columnTasks = col.status === 'done' ? inColumn : sortByPriority(inColumn)
        const isTarget = dragged && over === col.status && dragged.status !== col.status
        return (
          <section
            key={col.status}
            className={`column ${isTarget ? 'drop-target' : ''}`}
            onDragOver={(e) => {
              if (!dragged) return
              e.preventDefault()
              e.dataTransfer.dropEffect = 'move'
              if (over !== col.status) setOver(col.status)
            }}
            onDragLeave={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget)) setOver((o) => (o === col.status ? null : o))
            }}
            onDrop={(e) => handleDrop(e, col.status)}
          >
            <div className="column-header">
              <span className={`dot ${col.status}`} />
              <h3>{col.title}</h3>
              <span className="count">{columnTasks.length}</span>
            </div>
            <div className="column-body">
              {columnTasks.length === 0 && !isTarget && adding !== col.status && (
                <div className="column-empty">
                  <Sprout />
                  {t('board.empty')}
                </div>
              )}
              {columnTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onMove={(task, newStatus) => onUpdate(task, { status: newStatus })}
                  onDelete={onDelete}
                  onEdit={onUpdate}
                  members={members}
                  dragging={dragged?.id === task.id}
                  onDragStart={setDragged}
                  onDragEnd={() => { setDragged(null); setOver(null) }}
                />
              ))}
              {isTarget && <div className="drop-hint">{t('board.drop')}</div>}

              {onCreate && QUICK_ADD.includes(col.status) && (
                adding === col.status ? (
                  <form className="column-add-form" onSubmit={(e) => submitNew(e, col.status)}>
                    <input
                      autoFocus
                      value={newTitle}
                      placeholder={t('board.addPh')}
                      onChange={(e) => setNewTitle(e.target.value)}
                      onKeyDown={(e) => e.key === 'Escape' && closeAdd()}
                      onBlur={() => !newTitle.trim() && closeAdd()}
                    />
                    <button type="submit" className="btn-save" disabled={!newTitle.trim()}>{t('common.add')}</button>
                  </form>
                ) : (
                  <button type="button" className="column-add" onClick={() => { setAdding(col.status); setNewTitle('') }}>
                    <Plus size={14} strokeWidth={2} /> {t('board.add')}
                  </button>
                )
              )}
            </div>
          </section>
        )
      })}
    </div>
  )
}

export default KanbanBoard
