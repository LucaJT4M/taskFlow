/** Drei kleine Balken – so viele gefüllt, wie die Aufgabe wichtig ist */
function PriorityBars({ level = 2, size = 14 }) {
  return (
    <svg className={`prio-bars level-${level}`} width={size} height={size} viewBox="0 0 14 14" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <rect key={i} x={1 + i * 4.5} y={9 - i * 3.5} width="3" height={4 + i * 3.5} rx="1" className={i < level ? 'on' : 'off'} />
      ))}
    </svg>
  )
}

export default PriorityBars
