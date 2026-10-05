import { useEffect, useRef } from 'react'
import Branch from './Branch'
import './decor.css'

// Wo die Zweige auf welcher Seite sitzen.
// depth = wie stark der Zweig der Maus folgt (Parallax).
const LAYOUTS = {
  app: [
    { pos: 'tr', size: 260, depth: 1 },
    { pos: 'br', size: 200, depth: 0.6 },
  ],
  auth: [
    { pos: 'bl', size: 360, depth: 1 },
    { pos: 'tr', size: 320, depth: 0.7 },
  ],
}

/**
 * Dekor-Ebene mit Zweigen.
 * grow = Zweige wachsen beim Laden (Stiel zeichnet sich, Blätter öffnen sich).
 */
function DecorLayer({ variant = 'app', grow = false }) {
  const layerRef = useRef(null)

  useEffect(() => {
    const layer = layerRef.current
    if (!layer) return
    // Wer im System "Bewegung reduzieren" eingestellt hat, bekommt keine Effekte
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const branches = [...layer.querySelectorAll('.decor-branch')]
    let frame = null

    function handleMouseMove(event) {
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = null

        // 1) Parallax: Zweige bewegen sich leicht mit der Maus
        const mx = event.clientX / window.innerWidth - 0.5
        const my = event.clientY / window.innerHeight - 0.5
        layer.style.setProperty('--mx', mx.toFixed(3))
        layer.style.setProperty('--my', my.toFixed(3))

        // 2) Rascheln: Blätter zittern, wenn die Maus den Zweig erreicht
        for (const branch of branches) {
          const r = branch.getBoundingClientRect()
          const inside =
            event.clientX > r.left && event.clientX < r.right &&
            event.clientY > r.top && event.clientY < r.bottom

          if (inside && branch.dataset.inside !== '1') {
            branch.dataset.inside = '1'
            branch.classList.remove('rustle')
            void branch.offsetWidth // Animation neu starten
            branch.classList.add('rustle')
          } else if (!inside) {
            branch.dataset.inside = '0'
          }
        }
      })
    }

    function handleAnimationEnd(event) {
      if (event.animationName === 'leaf-rustle') {
        event.target.closest('.decor-branch')?.classList.remove('rustle')
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    layer.addEventListener('animationend', handleAnimationEnd)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      layer.removeEventListener('animationend', handleAnimationEnd)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [variant])

  return (
    <div ref={layerRef} className={`decor-layer ${grow ? 'grow' : ''}`} aria-hidden="true">
      {LAYOUTS[variant].map((b, i) => (
        <div
          key={i}
          className={`decor-branch pos-${b.pos}`}
          style={{ '--size': `${b.size}px`, '--depth': b.depth, '--b': i }}
        >
          <Branch />
        </div>
      ))}
    </div>
  )
}

export default DecorLayer
