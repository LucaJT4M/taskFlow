import Plant from './Plant'
import { plantLabel } from './plantKinds'

const PER_ROW = 7
const MAX_PLANTS = 28
const FLOWER_COLORS = ['var(--bloom-pink)', 'var(--bloom-gold)', 'var(--bloom-coral)']

// Feste Plätze: zuerst die vordere Reihe, weitere Reihen dahinter (kleiner).
// Eine nicht volle Reihe wird mittig ausgerichtet.
function slot(position, total) {
  const row = Math.floor(position / PER_ROW)
  const col = position % PER_ROW
  const inRow = Math.min(PER_ROW, total - row * PER_ROW)
  const offset = ((PER_ROW - inRow) * 130) / 2
  return {
    row,
    x: 110 + offset + col * 130 + (row % 2) * 60,
    y: 336 - row * 56,
    scale: 1.2 - row * 0.16,
  }
}

function GardenScene({ garden }) {
  const shown = garden.plants.slice(-MAX_PLANTS)
  const items = shown.map((plant, position) => ({
    plant,
    delay: 0.15 + position * 0.08,
    ...slot(position, shown.length),
  }))
  // hintere Reihen zuerst zeichnen, damit die vorderen davor stehen
  const drawOrder = [...items].sort((a, b) => b.row - a.row)
  const flowers = Math.min(garden.streak_days, 12)

  return (
    <div className="garden-card">
      <svg className="garden-scene" viewBox="0 120 1000 310" role="img" aria-label="Dein Garten">
        <path className="hill back" d="M0 290 C 180 262, 380 292, 560 276 S 860 262, 1000 282 V430 H0 Z" />
        <path className="hill" d="M0 340 C 200 322, 420 352, 620 336 S 880 326, 1000 342 V430 H0 Z" />

        {drawOrder.map(({ plant, x, y, scale, delay }) => (
          <Plant
            key={plant.index}
            kind={plant.kind}
            stage={plant.stage}
            x={x}
            y={y}
            scale={scale}
            delay={delay}
            current={plant.index === garden.current.index}
            label={plantLabel(plant, garden.plant_size)}
          />
        ))}

        {/* Wildblumen für die Serie (ein Tag = eine Blume) */}
        {Array.from({ length: flowers }, (_, i) => (
          <g key={i} transform={`translate(${500 - (flowers - 1) * 39 + i * 78} 398)`}>
            <g className="streak-flower" style={{ '--b': i }}>
              <title>{`Serie: ${garden.streak_days} ${garden.streak_days === 1 ? 'Tag' : 'Tage'}`}</title>
              <path className="stem" d="M0 0 V-14" />
              <circle cx="0" cy="-17" r="4.5" fill={FLOWER_COLORS[i % FLOWER_COLORS.length]} />
            </g>
          </g>
        ))}
      </svg>

      {garden.total_completed === 0 && (
        <p className="garden-hint">
          Erledige deine erste Aufgabe – dann keimt hier dein erster Samen.
        </p>
      )}
    </div>
  )
}

export default GardenScene
