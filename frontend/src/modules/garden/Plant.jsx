import { BLOOM_COLORS } from './plantKinds'
import './garden.css'

// Blütenpositionen je Krone (Koordinaten relativ zum Fuß der Pflanze)
const BLOSSOMS = {
  round: [[-18, -86], [14, -96], [24, -72], [-6, -62], [-26, -66], [4, -104]],
  tanne: [[-10, -58], [12, -70], [0, -92], [-20, -44], [20, -46], [-4, -106]],
  birke: [[-10, -96], [8, -108], [12, -80], [-12, -72], [2, -60], [-2, -116]],
}

function Crown({ kind }) {
  if (kind === 'tanne') {
    return (
      <g className="crown">
        <path d="M0 -78 L34 -34 L-34 -34 Z" />
        <path d="M0 -98 L28 -54 L-28 -54 Z" />
        <path d="M0 -120 L22 -76 L-22 -76 Z" />
      </g>
    )
  }
  if (kind === 'birke') {
    return (
      <g className="crown">
        <ellipse cx="0" cy="-86" rx="24" ry="40" />
      </g>
    )
  }
  return (
    <g className="crown">
      <circle cx="0" cy="-78" r="34" />
      {kind === 'kirsche' && <circle className="crown-inner" cx="-12" cy="-72" r="16" />}
    </g>
  )
}

/**
 * Eine Pflanze im Garten, gezeichnet ab dem Boden (y = 0) nach oben.
 * stage: seed | sprout | bush | tree | bloom
 */
function Plant({ kind, stage, x = 0, y = 0, scale = 1, current = false, delay = 0, label }) {
  const trunkTop = kind === 'tanne' ? -36 : kind === 'birke' ? -54 : -48
  const blossoms = BLOSSOMS[kind] ?? BLOSSOMS.round

  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <g className={`plant ${current ? 'current' : ''}`} style={{ '--delay': `${delay}s` }}>
        {label && <title>{label}</title>}
        {current && <circle className="plant-halo" cx="0" cy={stage === 'tree' || stage === 'bloom' ? -60 : -22} r="48" />}
        <ellipse className="plant-shadow" cx="0" cy="2" rx="26" ry="5" />

        {stage === 'seed' && <ellipse className="seed" cx="0" cy="-4" rx="7" ry="5" />}

        {stage === 'sprout' && (
          <g className="sway">
            <path className="stem" d="M0 0 C 0 -10, -1 -18, 0 -28" />
            <path className="leaf" d="M0 -14 C -10 -14, -17 -20, -18 -28 C -9 -28, -1 -23, 0 -14 Z" />
            <path className="leaf" d="M0 -20 C 10 -20, 17 -26, 18 -34 C 9 -34, 1 -29, 0 -20 Z" />
          </g>
        )}

        {stage === 'bush' && (
          <g className="sway">
            <path className="stem" d="M0 0 V-14" />
            <ellipse className="crown-fill" cx="0" cy="-30" rx="30" ry="22" />
            <path className="vein" d="M-14 -26 Q -6 -40 0 -42 M14 -26 Q 6 -38 0 -40" />
          </g>
        )}

        {(stage === 'tree' || stage === 'bloom') && (
          <g>
            <path className={`trunk ${kind}`} d={`M0 0 V${trunkTop}`} />
            <g className="sway">
              <Crown kind={kind} />
              {stage === 'bloom' &&
                blossoms.map(([bx, by], i) => (
                  <circle
                    key={i}
                    className="blossom"
                    cx={bx}
                    cy={by}
                    r="5"
                    fill={BLOOM_COLORS[kind]}
                    style={{ '--b': i }}
                  />
                ))}
            </g>
          </g>
        )}
      </g>
    </g>
  )
}

export default Plant
