// Ein paar Blätter, die langsam von oben herabschweben.
const LEAVES = [
  { left: 12, size: 18, dur: 19, delay: -2 },
  { left: 31, size: 14, dur: 23, delay: -11 },
  { left: 58, size: 20, dur: 21, delay: -6 },
  { left: 77, size: 15, dur: 25, delay: -16 },
  { left: 90, size: 17, dur: 20, delay: -9 },
]

function FallingLeaves() {
  return (
    <div className="falling-leaves" aria-hidden="true">
      {LEAVES.map((leaf, i) => (
        <span
          key={i}
          className="falling-leaf"
          style={{
            left: `${leaf.left}%`,
            '--size': `${leaf.size}px`,
            '--dur': `${leaf.dur}s`,
            '--delay': `${leaf.delay}s`,
          }}
        >
          <svg viewBox="0 0 24 24">
            <path d="M2 12 C 6 4, 18 4, 22 12 C 18 20, 6 20, 2 12 Z" />
            <path d="M3 12 H 20" fill="none" />
          </svg>
        </span>
      ))}
    </div>
  )
}

export default FallingLeaves
