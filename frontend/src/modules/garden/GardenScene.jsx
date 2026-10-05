import { Fragment, useState } from 'react'
import Plant, { STAGE_HEIGHT } from './Plant'
import GardenDefs from './GardenDefs'
import { KIND_NAMES } from './plantKinds'
import { seededRandom } from './random'
import { Critters, ForegroundGrass, FrontMeadow, Ground, Sky, Texture, scenePhase } from './SceneBackdrop'
import { burstLeaves } from '../../components/decor/leafBurst'

const PER_ROW = 7
const MAX_PLANTS = 28
const ROWS = [
  { y: 340, scale: 1.15 },
  { y: 294, scale: 0.92 },
  { y: 262, scale: 0.76 },
  { y: 240, scale: 0.64 },
]
const VIEW_H = 380
const FLOWER_COLORS = ['var(--bloom-pink)', 'var(--bloom-gold)', 'var(--bloom-coral)']

// Feste Plätze: vordere Reihe zuerst, weitere Reihen dahinter.
// Eine nicht volle Reihe wird mittig ausgerichtet.
function slot(position, total) {
  const row = Math.floor(position / PER_ROW)
  const col = position % PER_ROW
  const inRow = Math.min(PER_ROW, total - row * PER_ROW)
  const offset = ((PER_ROW - inRow) * 130) / 2
  const jitter = (seededRandom(position + 40)() - 0.5) * 24
  return {
    row,
    x: 110 + offset + col * 130 + (row % 2) * 60 + jitter,
    ...ROWS[row],
  }
}

function StreakFlower({ x, color, i }) {
  return (
    <g transform={`translate(${x} 376)`}>
      <g className="streak-flower" style={{ '--b': i }}>
        <path className="stem" d="M0 0 Q 1 -8 0 -15" />
        <path className="leaf" d="M0 -6 C -3 -6, -6 -8, -7 -11 C -4 -11.5, -1 -9, 0 -6 Z" />
        {[0, 72, 144, 216, 288].map((a) => (
          <ellipse key={a} cx="0" cy="-19" rx="2.2" ry="3.2" transform={`rotate(${a} 0 -16)`} fill={color} />
        ))}
        <circle className="blossom-center" cx="0" cy="-16" r="1.6" />
      </g>
    </g>
  )
}

function tooltipText(plant, garden) {
  const isCurrent = plant.index === garden.current.index
  return {
    title: `${KIND_NAMES[plant.kind]} · ${plant.stage_name}`,
    text: isCurrent
      ? plant.next_stage_name
        ? `Wächst gerade · noch ${plant.tasks_to_next} bis „${plant.next_stage_name}“`
        : 'Wächst gerade'
      : `Ausgewachsen · ${garden.plant_size} erledigte Aufgaben`,
  }
}

function GardenScene({ garden, theme }) {
  const [hover, setHover] = useState(null)
  const phase = scenePhase(theme)

  const shown = garden.plants.slice(-MAX_PLANTS)
  const items = shown.map((plant, position) => ({
    plant,
    delay: 0.15 + position * 0.08,
    ...slot(position, shown.length),
  }))
  const rows = [3, 2, 1, 0].map((r) => items.filter((it) => it.row === r))
  const flowers = Math.min(garden.streak_days, 12)

  const renderPlant = ({ plant, x, y, scale, delay }) => (
    <Plant
      key={plant.index}
      kind={plant.kind}
      stage={plant.stage}
      seed={plant.index}
      x={x}
      y={y}
      scale={scale}
      delay={delay}
      current={plant.index === garden.current.index}
      onHover={() => setHover({ plant, x, top: y - STAGE_HEIGHT[plant.stage] * scale })}
      onLeave={() => setHover(null)}
      onClick={(e) => burstLeaves(e.currentTarget, 7)}
    />
  )

  const tip = hover && tooltipText(hover.plant, garden)

  return (
    <div className="garden-card">
      <svg className={`garden-scene phase-${phase}`} viewBox={`0 0 1000 ${VIEW_H}`} role="img" aria-label="Dein Garten">
        <GardenDefs />
        <Sky phase={phase} />
        <Ground />

        {rows.map((rowItems, i) => (
          <Fragment key={i}>
            {/* Dunst zwischen hinteren und vorderen Reihen = Tiefe */}
            {i === 2 && <rect x="0" y="170" width="1000" height="140" fill="url(#gd-mist)" />}
            {i === 3 && <FrontMeadow />}
            <g className={i < 2 ? 'far-row' : ''}>{rowItems.map(renderPlant)}</g>
          </Fragment>
        ))}
        {rows[3].length === 0 && <FrontMeadow />}

        <Critters phase={phase} />
        <ForegroundGrass />

        {/* Wildblumen für die Serie (ein Tag = eine Blume) */}
        {Array.from({ length: flowers }, (_, i) => (
          <StreakFlower key={i} x={500 - (flowers - 1) * 39 + i * 78} color={FLOWER_COLORS[i % FLOWER_COLORS.length]} i={i} />
        ))}

        <Texture />
      </svg>

      {tip && (
        <div
          className="garden-tooltip"
          style={{ left: `${hover.x / 10}%`, top: `${(hover.top / VIEW_H) * 100}%` }}
        >
          <strong>{tip.title}</strong>
          <span>{tip.text}</span>
        </div>
      )}

      {garden.total_completed === 0 && (
        <p className="garden-hint">
          Erledige deine erste Aufgabe – dann keimt hier dein erster Samen.
        </p>
      )}
    </div>
  )
}

export default GardenScene
