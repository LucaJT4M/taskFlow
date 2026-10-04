import './decor.css'

const LEAF_SVG =
  '<svg viewBox="0 0 24 24" aria-hidden="true">' +
  '<path d="M2 12 C 6 4, 18 4, 22 12 C 18 20, 6 20, 2 12 Z" />' +
  '<path d="M3 12 H 20" fill="none" />' +
  '</svg>'

const COLORS = ['var(--accent)', 'var(--done)', 'var(--leaf)']

/**
 * Lässt kleine Blätter aus einem Element aufsteigen und herabfallen.
 * Wird aufgerufen, wenn eine Aufgabe erledigt wird.
 */
export function burstLeaves(target, count = 9) {
  if (!target) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const rect = target.getBoundingClientRect()
  const x = rect.left + rect.width / 2
  const y = rect.top + rect.height / 2
  // Im Theme-Container einfügen, damit die Farbvariablen gelten
  const host = target.closest('.app-dark') || document.body

  for (let i = 0; i < count; i++) {
    const leaf = document.createElement('span')
    leaf.className = 'leaf-particle'
    leaf.innerHTML = LEAF_SVG

    const s = leaf.style
    s.left = `${x}px`
    s.top = `${y}px`
    s.setProperty('--dx', `${(Math.random() - 0.5) * 170}px`)
    s.setProperty('--up', `${35 + Math.random() * 55}px`)
    s.setProperty('--fall', `${90 + Math.random() * 90}px`)
    s.setProperty('--rot', `${(Math.random() - 0.5) * 560}deg`)
    s.setProperty('--dur', `${1.1 + Math.random() * 0.7}s`)
    s.setProperty('--size', `${15 + Math.random() * 10}px`)
    s.color = COLORS[i % COLORS.length]

    leaf.addEventListener('animationend', () => leaf.remove())
    host.appendChild(leaf)
  }
}
