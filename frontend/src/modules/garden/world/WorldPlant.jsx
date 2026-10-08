import { seededRandom } from '../random'

const RADIUS = { eiche: 64, kirsche: 54, tanne: 50, birke: 44 }
const FILL = {
  eiche: 'url(#gd-crown)',
  kirsche: 'url(#gd-crown-kirsche)',
  birke: 'url(#gd-crown-birke)',
}
const BLOSSOM = { eiche: 'var(--bloom-gold)', kirsche: 'var(--bloom-pink)', tanne: 'var(--bloom-coral)', birke: 'var(--bloom-gold)' }

// Baumkrone von oben = mehrere überlappende Kreise
function canopyBlobs(R, rand) {
  const blobs = [[0, 0, R * 0.62]]
  const n = 6
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + rand() * 0.5
    const d = R * (0.42 + rand() * 0.14)
    blobs.push([Math.cos(a) * d, Math.sin(a) * d, R * (0.4 + rand() * 0.12)])
  }
  return blobs
}

function star(R, points, inner, rot) {
  return Array.from({ length: points * 2 }, (_, i) => {
    const a = (i / (points * 2)) * Math.PI * 2 + rot
    const r = i % 2 ? R * inner : R
    return `${(Math.cos(a) * r).toFixed(1)},${(Math.sin(a) * r).toFixed(1)}`
  }).join(' ')
}

function Canopy({ kind, R, rand, bloom }) {
  if (kind === 'tanne') {
    return (
      <g className="wp-canopy">
        <polygon className="wp-fir" points={star(R, 11, 0.7, 0)} fill="var(--fir-dark)" />
        <polygon className="wp-fir" points={star(R * 0.7, 9, 0.68, 0.3)} fill="url(#gd-fir)" />
        <polygon className="wp-fir" points={star(R * 0.42, 7, 0.65, 0.6)} fill="var(--fir-light)" />
        {bloom && [0, 1, 2, 3, 4].map((i) => (
          <circle key={i} cx={Math.cos(i * 1.3) * R * 0.5} cy={Math.sin(i * 1.3) * R * 0.5} r="4.5" fill={BLOSSOM.tanne} />
        ))}
      </g>
    )
  }
  const blobs = canopyBlobs(R, rand)
  const spots = bloom
    ? Array.from({ length: 12 }, () => {
        const [bx, by, br] = blobs[Math.floor(rand() * blobs.length)]
        const a = rand() * Math.PI * 2
        const d = br * rand() * 0.7
        return [bx + Math.cos(a) * d, by + Math.sin(a) * d]
      })
    : []
  return (
    <g className="wp-canopy">
      <g className="wp-outline">{blobs.map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} />)}</g>
      <g fill={FILL[kind]}>{blobs.map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} />)}</g>
      <circle cx={-R * 0.28} cy={-R * 0.3} r={R * 0.16} fill="#fff" opacity=".18" />
      {spots.map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          {[0, 72, 144, 216, 288].map((a) => (
            <circle key={a} cx="0" cy="-3.2" r="2.6" transform={`rotate(${a})`} fill={BLOSSOM[kind]} />
          ))}
          <circle r="1.6" fill="#FFF6DA" />
        </g>
      ))}
    </g>
  )
}

/** Eine Pflanze im Gartenmodus "von oben" */
function WorldPlant({ plant, x, y, current, onHover, onLeave, onClick }) {
  const rand = seededRandom(plant.index * 13 + 5)
  const { stage, kind } = plant
  const tree = stage === 'tree' || stage === 'bloom'
  const R = tree ? RADIUS[kind] : stage === 'bush' ? 28 : 16

  return (
    <g
      className="world-plant"
      transform={`translate(${x} ${y})`}
      style={{ '--i': plant.index % 7 }}
      onPointerEnter={onHover}
      onPointerLeave={onLeave}
      onClick={onClick}
    >
      {current && <circle className="wp-ring" r={R + 16} />}
      <ellipse className="wp-shadow" cx={R * 0.22} cy={R * 0.28} rx={R * 1.02} ry={R * 0.92} />

      {(stage === 'seed' || stage === 'sprout') && <circle r={R} fill="var(--soil)" opacity=".9" />}
      {stage === 'seed' && <ellipse rx="5" ry="3.6" fill="var(--bark)" transform="rotate(-20)" />}
      {stage === 'sprout' && (
        <g className="wp-canopy">
          <ellipse cx="-6" cy="-2" rx="8" ry="4.5" transform="rotate(-25 -6 -2)" fill="var(--crown-mid)" stroke="var(--crown-line)" strokeWidth="1.2" />
          <ellipse cx="6" cy="-4" rx="9" ry="5" transform="rotate(20 6 -4)" fill="var(--crown-light)" stroke="var(--crown-line)" strokeWidth="1.2" />
        </g>
      )}
      {stage === 'bush' && <Canopy kind="eiche" R={R} rand={rand} bloom={false} />}
      {tree && <Canopy kind={kind} R={R} rand={rand} bloom={stage === 'bloom'} />}
    </g>
  )
}

export default WorldPlant
