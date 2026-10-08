import { useEffect, useRef } from 'react'
import './clouds.css'

// Feste Wolken-Positionen (in % des Bildschirms) – gleich beim Zuziehen und Aufziehen,
// damit der Wechsel zwischen den Seiten nahtlos aussieht.
const PUFFS = [
  { x: -12, y: -14, s: 1.3, side: -1 }, { x: 22, y: -18, s: 1.1, side: -1 }, { x: 52, y: -16, s: 1.2, side: 1 },
  { x: 80, y: -10, s: 1.3, side: 1 }, { x: -18, y: 18, s: 1.2, side: -1 }, { x: 14, y: 22, s: 1.0, side: -1 },
  { x: 44, y: 14, s: 1.25, side: 1 }, { x: 74, y: 24, s: 1.1, side: 1 }, { x: -10, y: 52, s: 1.3, side: -1 },
  { x: 24, y: 50, s: 1.15, side: -1 }, { x: 52, y: 48, s: 1.0, side: 1 }, { x: 82, y: 56, s: 1.3, side: 1 },
  { x: 2, y: 80, s: 1.2, side: -1 }, { x: 36, y: 82, s: 1.3, side: -1 }, { x: 66, y: 80, s: 1.2, side: 1 },
]

/**
 * Vollbild-Wolken.
 * mode "cover":  Wolken ziehen zusammen (vor dem Seitenwechsel)
 * mode "reveal": Wolken reißen auf und geben die Welt frei
 */
function CloudTransition({ mode, onDone }) {
  // aktuelle Callback-Funktion merken, damit ein Neu-Rendern den Timer nicht neu startet
  const done = useRef(onDone)
  done.current = onDone

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const ms = reduce ? 0 : mode === 'cover' ? 1000 : 2100
    const timer = setTimeout(() => done.current?.(), ms)
    return () => clearTimeout(timer)
  }, [mode])

  return (
    <div className={`cloud-transition ${mode}`} aria-hidden="true">
      <div className="cloud-fog" />
      {PUFFS.map((p, i) => (
        <div
          key={i}
          className="cloud-puff"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            '--s': p.s,
            '--side': p.side,
            '--d': `${(i % 5) * 0.06}s`,
          }}
        >
          <span /><span /><span /><span /><span />
        </div>
      ))}
    </div>
  )
}

export default CloudTransition
