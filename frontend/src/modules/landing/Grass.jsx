// Grasstreifen am unteren Rand. Positionen sind berechnet (kein Zufall),
// damit die Wiese bei jedem Laden gleich aussieht.
const BLADES = Array.from({ length: 72 }, (_, i) => {
  const x = i * 20 + ((i * 37) % 11)
  const h = 22 + ((i * 53) % 30)
  const lean = ((i * 29) % 15) - 7
  return { x, h, lean }
})

function Grass() {
  return (
    <svg className="grass" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      {BLADES.map((b, i) => (
        <path
          key={i}
          className="blade"
          style={{ '--i': i }}
          d={`M${b.x} 80 Q ${b.x + b.lean * 0.4} ${80 - b.h * 0.6}, ${b.x + b.lean} ${80 - b.h}`}
        />
      ))}
      <path className="ground" d="M0 79.5 H1440" />
    </svg>
  )
}

export default Grass
