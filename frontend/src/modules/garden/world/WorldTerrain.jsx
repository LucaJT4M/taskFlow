import { memo } from 'react'
import { MAP_H, MAP_W, PATH_D, POND, blobPath, scatter } from './worldLayout'
import { seededRandom } from '../random'

const FLOWER_COLORS = ['var(--bloom-pink)', 'var(--bloom-gold)', 'var(--bloom-coral)', '#FFFFFF', '#B9A8E0']

/** Alles, was sich nie bewegt: Wiese, Weg, Teich, Hecke, Blumen */
function WorldTerrain() {
  const rand = seededRandom(31)
  const patches = Array.from({ length: 70 }, () => ({
    x: rand() * MAP_W, y: rand() * MAP_H, rx: 60 + rand() * 160, ry: 40 + rand() * 110, rot: rand() * 180, light: rand() > 0.5,
  }))
  const tufts = scatter(260, 8, [30, 20, 50])
  const flowers = scatter(140, 12, [45, 35, 70])
  const stones = scatter(26, 19, [40, 30, 80])

  // Hecke rund um den Garten
  const hedge = []
  const hr = seededRandom(4)
  for (let x = 30; x <= MAP_W - 30; x += 74) {
    hedge.push([x, 36 + hr() * 14, 46 + hr() * 14], [x + 30, MAP_H - 36 - hr() * 14, 46 + hr() * 14])
  }
  for (let y = 100; y <= MAP_H - 100; y += 74) {
    hedge.push([36 + hr() * 14, y, 46 + hr() * 14], [MAP_W - 36 - hr() * 14, y + 30, 46 + hr() * 14])
  }

  const pads = Array.from({ length: 6 }, (_, i) => {
    const a = i * 1.1 + 0.4
    const d = POND.r * (0.35 + (i % 3) * 0.18)
    return { x: POND.x + Math.cos(a) * d, y: POND.y + Math.sin(a) * d * 0.9, r: 16 + (i % 3) * 5, rot: i * 50 }
  })

  return (
    <g className="world-terrain">
      <defs>
        <radialGradient id="wd-grass" cx=".5" cy=".5" r=".75">
          <stop offset="0" stopColor="#B9C98F" />
          <stop offset="1" stopColor="#9FB57A" />
        </radialGradient>
        <radialGradient id="wd-water" cx=".42" cy=".38" r=".7">
          <stop offset="0" stopColor="#A9D3D6" />
          <stop offset=".7" stopColor="#7DB2B8" />
          <stop offset="1" stopColor="#5E949C" />
        </radialGradient>
        <pattern id="wd-dots" width="22" height="22" patternUnits="userSpaceOnUse">
          <circle cx="4" cy="5" r="1.3" fill="#8DA36A" opacity=".35" />
          <circle cx="15" cy="16" r="1" fill="#C9D6A3" opacity=".4" />
        </pattern>
      </defs>

      <rect width={MAP_W} height={MAP_H} fill="url(#wd-grass)" />
      {patches.map((p, i) => (
        <ellipse key={i} cx={p.x} cy={p.y} rx={p.rx} ry={p.ry} transform={`rotate(${p.rot} ${p.x} ${p.y})`}
          fill={p.light ? '#C6D49E' : '#93AA6E'} opacity=".35" />
      ))}
      <rect width={MAP_W} height={MAP_H} fill="url(#wd-dots)" />

      {/* Weg */}
      <path d={PATH_D} className="wt-path-edge" />
      <path d={PATH_D} className="wt-path" />
      <path d={PATH_D} className="wt-path-stones" />

      {/* Teich */}
      <path d={blobPath(POND.x, POND.y, POND.r + 22, 3)} fill="#D8CBA8" />
      <path d={blobPath(POND.x, POND.y, POND.r, 3)} fill="url(#wd-water)" stroke="#5E949C" strokeWidth="3" />
      {[0, 1, 2].map((i) => (
        <circle key={i} className="wt-ripple" cx={POND.x - 40 + i * 50} cy={POND.y + 20 - i * 30} r="26" style={{ '--i': i }} />
      ))}
      {pads.map((p, i) => (
        <g key={i} transform={`translate(${p.x} ${p.y}) rotate(${p.rot})`}>
          <path
            d={`M0 0 L ${p.r * Math.cos(-0.3)} ${p.r * Math.sin(-0.3)} A ${p.r} ${p.r} 0 1 0 ${p.r * Math.cos(0.3)} ${p.r * Math.sin(0.3)} Z`}
            fill="#7FA35E"
            stroke="#5F8443"
            strokeWidth="1.5"
          />
          {i % 2 === 0 && <circle cx={-p.r * 0.3} cy={-p.r * 0.2} r="5" fill="#F3C6D3" stroke="#D98FA6" />}
        </g>
      ))}

      {/* Steine */}
      {stones.map((s, i) => (
        <g key={i} transform={`translate(${s.x} ${s.y})`}>
          <ellipse cx="3" cy="4" rx={8 + s.r * 8} ry={6 + s.r * 6} fill="#000" opacity=".12" />
          <ellipse rx={8 + s.r * 8} ry={6 + s.r * 6} fill="#D5D2C4" stroke="#A9A595" strokeWidth="1.5" />
        </g>
      ))}

      {/* Grasbüschel */}
      <g className="wt-tufts">
        {tufts.map((t, i) => (
          <path key={i} d={`M${t.x - 6} ${t.y} l3 -9 M${t.x} ${t.y} l0 -11 M${t.x + 6} ${t.y} l-3 -9`} />
        ))}
      </g>

      {/* Wildblumen */}
      {flowers.map((f, i) => (
        <g key={i} transform={`translate(${f.x} ${f.y})`}>
          {[0, 72, 144, 216, 288].map((a) => (
            <circle key={a} cx="0" cy="-3.6" r="3" transform={`rotate(${a})`} fill={FLOWER_COLORS[i % FLOWER_COLORS.length]} />
          ))}
          <circle r="2" fill="#F2D27A" />
        </g>
      ))}

      {/* Bank am Weg */}
      <g transform="translate(1290 1010) rotate(-18)">
        <rect x="-44" y="-12" width="88" height="26" rx="4" fill="#000" opacity=".14" transform="translate(5 6)" />
        <rect x="-44" y="-12" width="88" height="26" rx="4" fill="#B08A5E" stroke="#7A5C3C" strokeWidth="2" />
        <path d="M-44 -4 H44 M-44 5 H44" stroke="#7A5C3C" strokeWidth="1.5" />
      </g>

      {/* Hecke */}
      <g className="wt-hedge">
        {hedge.map(([x, y, r], i) => (
          <g key={i}>
            <circle cx={x + 8} cy={y + 10} r={r} fill="#000" opacity=".12" />
            <circle cx={x} cy={y} r={r} fill="url(#gd-crown)" stroke="var(--crown-line)" strokeWidth="3" />
          </g>
        ))}
      </g>
    </g>
  )
}

export default memo(WorldTerrain)
