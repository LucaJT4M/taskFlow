import { useEffect, useRef, useState } from 'react'
import { Check, Sparkles } from 'lucide-react'
import PriorityBars from './PriorityBars'
import { LEVELS, levelKey, levelName, reasonText } from './priority'
import { t } from '../../i18n'

/**
 * Auswahl der Wichtigkeit: "auto" oder 1/2/3.
 * suggestion: Vorschlag vom Backend { priority, reasons } – wird bei "auto" angezeigt.
 */
function PriorityPicker({ value, onChange, suggestion, fallback = 2, compact = false }) {
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

  const isAuto = value === 'auto'
  const shown = isAuto ? suggestion?.priority ?? fallback : value
  const reasons = isAuto && suggestion?.reasons?.length ? suggestion.reasons.map(reasonText).join(', ') : null
  const pick = (v) => { onChange(v); setOpen(false) }

  return (
    <div className={`prio-picker ${compact ? 'compact' : ''}`} ref={ref}>
      <button
        type="button"
        className={`prio-trigger ${levelKey(shown)} ${isAuto ? 'is-auto' : ''}`}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        title={`${t('prio.label')}: ${levelName(shown)}${isAuto ? ` (${t('prio.auto')})` : ''}${reasons ? ` – ${reasons}` : ''}`}
      >
        {isAuto ? <Sparkles size={13} strokeWidth={2} className="prio-auto" /> : <PriorityBars level={shown} size={13} />}
        <span>{levelName(shown)}</span>
      </button>

      {open && (
        <div className="prio-menu" role="menu">
          <p className="prio-menu-label">{t('prio.label')}</p>
          <button type="button" role="menuitemradio" aria-checked={isAuto} onClick={() => pick('auto')}>
            <Sparkles size={14} strokeWidth={2} className="prio-auto" />
            <span className="prio-opt">
              {t('prio.auto')}
              <small>
                {suggestion
                  ? `${t('prio.suggests', { level: levelName(suggestion.priority) })}${suggestion.reasons.length ? ` · ${suggestion.reasons.map(reasonText).join(', ')}` : ''}`
                  : t('prio.autoHint')}
              </small>
            </span>
            {isAuto && <Check size={14} className="prio-check" />}
          </button>
          {LEVELS.map((level) => (
            <button key={level} type="button" role="menuitemradio" aria-checked={value === level} onClick={() => pick(level)}>
              <PriorityBars level={level} size={14} />
              <span className="prio-opt">
                {levelName(level)}
                <small>{t('prio.points', { n: level })}</small>
              </span>
              {value === level && <Check size={14} className="prio-check" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default PriorityPicker
