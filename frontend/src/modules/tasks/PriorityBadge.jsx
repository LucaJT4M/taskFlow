import { Sparkles } from 'lucide-react'
import PriorityBars from './PriorityBars'
import { levelKey, levelName } from './priority'
import { t } from '../../i18n'

/** Etikett auf der Karte: Wichtigkeit + wie viel der Garten wächst */
function PriorityBadge({ task }) {
  const level = task.priority ?? 2
  const title = `${t('prio.label')}: ${levelName(level)} (${task.priority_auto ? t('prio.auto') : t('prio.manual')}) · ${t('prio.points', { n: level })}`
  return (
    <span className={`prio-badge ${levelKey(level)}`} title={title}>
      <PriorityBars level={level} size={12} />
      {levelName(level)}
      {task.priority_auto && <Sparkles size={11} strokeWidth={2} className="prio-auto" />}
    </span>
  )
}

export default PriorityBadge
