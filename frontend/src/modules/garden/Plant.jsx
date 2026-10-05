import { seededRandom } from './random'
import { BLOOM_COLORS } from './plantKinds'
import './garden.css'

// Kronen aus mehreren "Wolken" (x, y, Radius) – relativ zur Kronenmitte
const CROWNS = {
  eiche: { cy: -80, trunk: -70, blobs: [[-28, 4, 20], [28, 4, 20], [-16, -14, 22], [16, -16, 22], [0, -30, 19], [0, 6, 24], [-38, -8, 13], [38, -8, 13]] },
  kirsche: { cy: -76, trunk: -64, blobs: [[-20, 4, 19], [20, 4, 19], [0, -18, 23], [-18, -14, 16], [18, -14, 16], [0, 10, 20]] },
  birke: { cy: -84, trunk: -66, blobs: [[0, -36, 14], [-10, -18, 17], [10, -20, 17], [-12, 2, 17], [12, 0, 17], [0, 20, 16], [0, -6, 19]] },
}
const BUSH = [[-17, 4, 12], [17, 4, 12], [0, -6, 15], [-9, -2, 12], [9, -4, 12], [0, 6, 12]]
const BUSH_CY = -18
// Tannen-Etagen: oben, halbe Breite, Höhe
const FIR_TIERS = [[-72, 38, 40], [-94, 30, 36], [-114, 22, 32], [-132, 14, 28]]

// Höhe je Stufe (für Tooltip-Position)
export const STAGE_HEIGHT = { seed: 14, sprout: 42, bush: 44, tree: 135, bloom: 135 }

const LEAF = 'M0 0 C 3 -3.4, 8 -3.4, 10 0 C 8 3.4, 3 3.4, 0 0 Z'

/* ---------------- Krone aus Wolken (Eiche, Kirsche, Birke, Busch) ---------------- */
function BlobCrown({ circles, fill, rand, leaves = 6, ticks = 14 }) {
  const cx = circles.reduce((s, c) => s + c[0], 0) / circles.length
  const cy = circles.reduce((s, c) => s + c[1], 0) / circles.length

  // Blätter, die am Rand herausschauen
  const edge = Array.from({ length: leaves }, (_, i) => {
    const a = -Math.PI * 0.95 + (i / Math.max(1, leaves - 1)) * Math.PI * 1.9 + (rand() - 0.5) * 0.4
    const dir = [Math.cos(a - Math.PI / 2), Math.sin(a - Math.PI / 2)]
    const best = circles.reduce((b, c) => {
      const p = (c[0] - cx) * dir[0] + (c[1] - cy) * dir[1] + c[2]
      return p > b.p ? { p, c } : b
    }, { p: -Infinity, c: circles[0] }).c
    const x = best[0] + dir[0] * (best[2] - 3)
    const y = best[1] + dir[1] * (best[2] - 3)
    return { x, y, angle: (Math.atan2(dir[1], dir[0]) * 180) / Math.PI }
  })

  // Punkt-Schattierung (Stippling) auf der Schattenseite unten rechts
  const marks = Array.from({ length: ticks * 3 }, () => {
    const [bx, by, br] = circles[Math.floor(rand() * circles.length)]
    const a = ((-15 + rand() * 120) * Math.PI) / 180
    const d = br * (0.45 + rand() * 0.45)
    return [bx + Math.cos(a) * d, by + Math.sin(a) * d, 0.5 + rand() * 0.6]
  })

  // Lichtkanten oben links
  const lights = circles
    .filter((c) => c[1] <= cy)
    .slice(0, 3)
    .map(([x, y, r]) => {
      const a1 = (205 * Math.PI) / 180
      const a2 = (250 * Math.PI) / 180
      const rr = r * 0.68
      return `M${x + Math.cos(a1) * rr} ${y + Math.sin(a1) * rr} A ${rr} ${rr} 0 0 1 ${x + Math.cos(a2) * rr} ${y + Math.sin(a2) * rr}`
    })

  return (
    <g className="crown">
      <g className="crown-outline">
        {circles.map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} />)}
      </g>
      {edge.map((l, i) => (
        <g key={i} transform={`translate(${l.x} ${l.y}) rotate(${l.angle})`}>
          <path className="edge-leaf" d={LEAF} style={{ '--i': i }} />
        </g>
      ))}
      <g className="crown-fill" fill={fill}>
        {circles.map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} />)}
      </g>
      <g className="crown-marks">
        {marks.map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} />)}
      </g>
      <g className="crown-light">
        {lights.map((d, i) => <path key={i} d={d} />)}
      </g>
    </g>
  )
}

/* ---------------- Tanne ---------------- */
function tierPath(top, hw, h) {
  const bottom = top + h
  const n = Math.max(3, Math.round(hw / 7))
  let d = `M0 ${top} Q ${hw * 0.3} ${top + h * 0.55} ${hw} ${bottom}`
  for (let i = 1; i <= n; i++) {
    const xm = hw - (2 * hw * (i - 0.5)) / n
    const x = hw - (2 * hw * i) / n
    d += ` L ${xm} ${bottom - 4} L ${x} ${bottom}`
  }
  return d + ` Q ${-hw * 0.3} ${top + h * 0.55} 0 ${top} Z`
}

function FirCrown() {
  return (
    <g className="crown fir">
      {FIR_TIERS.map(([top, hw, h], i) => (
        <g key={i}>
          <path className="fir-tier" d={tierPath(top, hw, h)} />
          {/* Nadeln */}
          {Array.from({ length: 4 }, (_, k) => {
            const x = -hw * 0.55 + (k * hw * 1.1) / 3
            const y = top + h * 0.78
            return <path key={k} className="needles" d={`M${x - 3} ${y - 2} L ${x} ${y + 1} L ${x + 3} ${y - 2}`} />
          })}
        </g>
      ))}
    </g>
  )
}

/* ---------------- Stamm ---------------- */
function Trunk({ kind, top }) {
  const birch = kind === 'birke'
  const w0 = birch ? 4 : kind === 'tanne' ? 4.5 : 5.5
  const w1 = birch ? 2.4 : 3
  const d = `M${-w0} 0 C ${-w0} ${top * 0.4}, ${-w1 - 1} ${top * 0.7}, ${-w1} ${top} L ${w1} ${top} C ${w1 + 1} ${top * 0.7}, ${w0} ${top * 0.4}, ${w0} 0 Z`

  return (
    <g className={`trunk ${birch ? 'birch' : ''}`}>
      <path className="root" d={`M${-w0 + 1} -1 Q ${-w0 - 4} 0 ${-w0 - 9} 3`} />
      <path className="root" d={`M${w0 - 1} -1 Q ${w0 + 4} 0 ${w0 + 9} 3`} />
      {kind !== 'tanne' && (
        <>
          <path className="branch" d={`M0 ${top * 0.62} Q -10 ${top * 0.8} -19 ${top * 1.02}`} />
          <path className="branch" d={`M0 ${top * 0.72} Q 9 ${top * 0.88} 17 ${top * 1.06}`} />
        </>
      )}
      <path className="trunk-body" d={d} fill={birch ? 'url(#gd-birch)' : 'url(#gd-trunk)'} />
      {birch
        ? [0.18, 0.36, 0.52, 0.7, 0.86].map((f, i) => (
            <path key={i} className="birch-mark" d={`M${i % 2 ? -0.5 : -3} ${top * f} h ${i % 2 ? 3 : 2.5}`} />
          ))
        : (
          <>
            <path className="bark" d={`M-1.6 -4 Q -2.6 ${top * 0.3} -1.2 ${top * 0.55}`} />
            <path className="bark" d={`M2 ${top * 0.18} Q 2.8 ${top * 0.36} 1.6 ${top * 0.52}`} />
          </>
        )}
    </g>
  )
}

/* ---------------- Blüten ---------------- */
function blossomSpots(kind, rand, count) {
  if (kind === 'tanne') {
    return Array.from({ length: count }, () => {
      const [top, hw, h] = FIR_TIERS[Math.floor(rand() * FIR_TIERS.length)]
      const f = 0.45 + rand() * 0.45
      return [(rand() * 2 - 1) * hw * f * 0.8, top + h * f]
    })
  }
  const { cy, blobs } = CROWNS[kind]
  return Array.from({ length: count }, () => {
    const [bx, by, br] = blobs[Math.floor(rand() * blobs.length)]
    const a = rand() * Math.PI * 2
    const d = br * (0.35 + rand() * 0.5)
    return [bx + Math.cos(a) * d, cy + by + Math.sin(a) * d]
  })
}

function Blossom({ x, y, color, i }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className="blossom" style={{ '--b': i }}>
        {[0, 72, 144, 216, 288].map((a) => (
          <ellipse key={a} cx="0" cy="-2.5" rx="1.9" ry="2.6" transform={`rotate(${a})`} fill={color} />
        ))}
        <circle className="blossom-center" r="1.2" />
      </g>
    </g>
  )
}

/* ---------------- Pflanze ---------------- */
/**
 * Eine Pflanze, gezeichnet ab dem Boden (y = 0) nach oben.
 * stage: seed | sprout | bush | tree | bloom
 * seed: Startwert für kleine Unterschiede zwischen gleichen Pflanzen
 */
function Plant({
  kind, stage, seed = 0, x = 0, y = 0, scale = 1, current = false, delay = 0,
  onHover, onLeave, onClick,
}) {
  const rand = seededRandom(seed * 7 + kind.length)
  const isTree = stage === 'tree' || stage === 'bloom'
  const crown = CROWNS[kind]
  const color = BLOOM_COLORS[kind]
  const spots = stage === 'bloom' ? blossomSpots(kind, rand, 9) : []
  const interactive = Boolean(onHover || onClick)
  const shadowRx = { seed: 12, sprout: 14, bush: 26, tree: 34, bloom: 34 }[stage]

  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <g
        className={`plant ${current ? 'current' : ''} ${interactive ? 'interactive' : ''}`}
        style={{ '--delay': `${delay}s` }}
        onMouseEnter={onHover}
        onMouseLeave={onLeave}
        onClick={onClick}
      >
        {current && <ellipse className="plant-ring" cx="0" cy="1" rx={shadowRx + 12} ry="7" />}
        <ellipse className="plant-shadow" cx={isTree ? 6 : 2} cy="1" rx={shadowRx} ry="4.5" />

        {(stage === 'seed' || stage === 'sprout') && (
          <g className="soil">
            <path d="M-17 1 Q -8 -7 0 -7 Q 8 -7 17 1 Z" />
            <circle className="pebble" cx="-8" cy="-2" r="1.2" />
            <circle className="pebble" cx="9" cy="-1.5" r="1" />
          </g>
        )}

        {stage === 'seed' && (
          <g className="sway">
            <ellipse className="seed" cx="0" cy="-7" rx="6" ry="4.4" transform="rotate(-18 0 -7)" />
            <path className="seed-line" d="M-3 -8.5 Q 0 -6 3.4 -6.6" />
            <path className="stem" d="M1.5 -10.5 q 1 -3.5 4 -5" />
          </g>
        )}

        {stage === 'sprout' && (
          <g className="sway">
            <path className="stem" d="M0 -5 C 1 -14, -2 -22, 0 -32" />
            <path className="leaf" d="M0 -18 C -6 -16, -16 -20, -19 -30 C -10 -32, -3 -26, 0 -18 Z" />
            <path className="leaf-vein" d="M0 -18 Q -9 -23 -16 -29" />
            <path className="leaf" d="M0 -25 C 6 -25, 16 -31, 19 -41 C 9 -42, 2 -35, 0 -25 Z" />
            <path className="leaf-vein" d="M0 -25 Q 9 -32 16 -39" />
            <path className="leaf" d="M0 -31 C -2.5 -35, -1.5 -40, 1 -42 C 3 -38, 2.5 -34, 0 -31 Z" />
          </g>
        )}

        {stage === 'bush' && (
          <g className="sway">
            <path className="stem" d="M-3 0 Q -3 -6 -6 -10 M3 0 Q 3 -6 6 -10" />
            <BlobCrown circles={BUSH.map(([bx, by, r]) => [bx, BUSH_CY + by, r])} fill="url(#gd-crown)" rand={rand} leaves={5} ticks={8} />
          </g>
        )}

        {isTree && (
          <g className="sway">
            <Trunk kind={kind} top={kind === 'tanne' ? -40 : crown.trunk} />
            {kind === 'tanne'
              ? <FirCrown />
              : (
                <BlobCrown
                  circles={crown.blobs.map(([bx, by, r]) => [bx, crown.cy + by, r])}
                  fill={kind === 'eiche' ? 'url(#gd-crown)' : `url(#gd-crown-${kind})`}
                  rand={rand}
                />
              )}
            {spots.map(([bx, by], i) => <Blossom key={i} x={bx} y={by} color={color} i={i} />)}
          </g>
        )}

        {/* fallende Blütenblätter */}
        {stage === 'bloom' &&
          spots.slice(0, 3).map(([bx, by], i) => (
            <ellipse
              key={i}
              className="petal-fall"
              cx={bx}
              cy={by}
              rx="1.8"
              ry="2.6"
              fill={color}
              style={{ '--i': i + rand(), '--fall': `${-by - 2}px`, '--dx': `${(rand() - 0.3) * 40}px` }}
            />
          ))}
      </g>
    </g>
  )
}

export default Plant
