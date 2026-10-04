import './decor.css'

// Kleiner Sprössling im Topf für leere Zustände.
// Beim Überfahren mit der Maus wächst er und öffnet die Blätter.
function Sprout() {
  return (
    <svg className="sprout" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <path className="sprout-pot" d="M20 44 H44 L41 58 H23 Z" />
      <path className="sprout-soil" d="M19 44 H45" />
      <g className="sprout-plant">
        <path className="sprout-stem" d="M32 44 C 32 37, 31 30, 32 22" />
        <g className="sprout-leaf left">
          <path d="M32 31 C 24 31, 19 26, 18 20 C 25 20, 31 24, 32 31 Z" />
        </g>
        <g className="sprout-leaf right">
          <path d="M32 25 C 38 25, 44 20, 45 14 C 38 14, 33 18, 32 25 Z" />
        </g>
      </g>
    </svg>
  )
}

export default Sprout
