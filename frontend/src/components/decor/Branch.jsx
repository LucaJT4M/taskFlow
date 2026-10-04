// Eine gezeichnete Zweig-Illustration (Linienstil passend zu den Lucide-Icons).
// Jedes Blatt ist eine eigene Gruppe, damit es einzeln schwingen kann.

const STEM = 'M 20 300 C 40 240, 52 190, 95 140 C 138 92, 175 70, 215 22'
const LEAF = 'M0 0 C 10 -11, 28 -12, 40 0 C 28 12, 10 11, 0 0 Z'
const RIB = 'M3 0 Q 20 -1 36 0'

// Position, Drehung und Größe der Blätter entlang des Stiels
const LEAVES = [
  { x: 34, y: 257, r: -22, s: 1.0 },
  { x: 46, y: 224, r: -119, s: 1.05 },
  { x: 62, y: 188, r: -12, s: 1.1 },
  { x: 81, y: 158, r: -104, s: 1.0 },
  { x: 114, y: 120, r: 5, s: 1.0 },
  { x: 142, y: 94, r: -92, s: 0.95 },
  { x: 168, y: 70, r: 8, s: 0.85 },
  { x: 191, y: 48, r: -95, s: 0.75 },
  { x: 213, y: 25, r: -50, s: 0.7 },
]

function Branch() {
  return (
    <svg className="branch-svg" viewBox="0 0 240 310" aria-hidden="true" focusable="false">
      <path className="branch-stem" d={STEM} />
      {LEAVES.map((leaf, i) => (
        <g key={i} transform={`translate(${leaf.x} ${leaf.y}) rotate(${leaf.r}) scale(${leaf.s})`}>
          <g className="branch-leaf" style={{ '--i': i }}>
            <path className="leaf-body" d={LEAF} />
            <path className="leaf-rib" d={RIB} />
          </g>
        </g>
      ))}
    </svg>
  )
}

export default Branch
