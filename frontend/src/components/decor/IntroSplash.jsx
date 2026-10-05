import { useEffect } from 'react'
import './intro.css'

const LETTERS = 'TaskFlow'.split('')

/**
 * Intro beim ersten Öffnen: Ein Samen fällt, keimt,
 * zwei Blätter öffnen sich und daraus wird das TaskFlow-Logo.
 * Klick oder Taste überspringt das Intro.
 */
function IntroSplash({ onDone, onSkip }) {
  useEffect(() => {
    function skip() {
      onSkip()
    }
    window.addEventListener('keydown', skip)
    return () => window.removeEventListener('keydown', skip)
  }, [onSkip])

  function handleAnimationEnd(event) {
    if (event.animationName === 'intro-out') onDone()
  }

  return (
    <div className="intro" onClick={onSkip} onAnimationEnd={handleAnimationEnd} aria-hidden="true">
      <div className="intro-center">
        <svg className="intro-svg" viewBox="0 0 120 120" focusable="false">
          {/* Erde */}
          <path className="intro-ground" d="M40 86 H80" pathLength="1" />

          {/* Sprössling */}
          <g className="intro-sprout">
            <ellipse className="intro-seed" cx="60" cy="83" rx="5" ry="3.5" />
            <path className="intro-stem" d="M60 84 C 60 72, 59 62, 60 48" pathLength="1" />
            <g className="intro-leaf left">
              <path d="M60 64 C 50 64, 43 58, 42 50 C 51 50, 59 55, 60 64 Z" />
            </g>
            <g className="intro-leaf right">
              <path d="M60 56 C 68 56, 76 49, 77 41 C 68 41, 61 47, 60 56 Z" />
            </g>
          </g>

          {/* Logo */}
          <g className="intro-logo">
            <rect className="intro-mark" x="38" y="38" width="44" height="44" rx="12" />
            <path className="intro-check" d="M49 61 L57 69 L72 52" pathLength="1" />
          </g>
        </svg>

        <div className="intro-word">
          {LETTERS.map((letter, i) => (
            <span key={i} style={{ '--l': i }}>{letter}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default IntroSplash
