import { seededRandom } from './random'

// Tageszeit der Szene: morgens / tagsüber / abends; im dunklen Design immer Nacht
export function scenePhase(theme) {
  const forced = new URLSearchParams(window.location.search).get('zeit')
  const map = { morgen: 'morning', tag: 'day', abend: 'evening', nacht: 'night' }
  if (map[forced]) return map[forced]
  if (theme === 'dark') return 'night'
  const h = new Date().getHours()
  if (h >= 5 && h < 10) return 'morning'
  if (h >= 10 && h < 17) return 'day'
  return 'evening'
}

const SUN = { morning: [170, 150, 30], day: [840, 70, 24], evening: [820, 168, 38] }

const CLOUDS = [
  { x: 120, y: 58, s: 1, dur: 140 },
  { x: 520, y: 96, s: 0.7, dur: 180 },
  { x: 760, y: 42, s: 0.85, dur: 160 },
]

function Cloud({ x, y, s, dur }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g className="cloud" style={{ '--x0': `${x}px`, '--dur': `${dur}s` }}>
        <ellipse cx="0" cy="0" rx="46" ry="13" />
        <ellipse cx="-16" cy="-9" rx="20" ry="14" />
        <ellipse cx="10" cy="-13" rx="24" ry="17" />
        <ellipse cx="30" cy="-4" rx="16" ry="10" />
      </g>
    </g>
  )
}

/** Himmel, Sonne/Mond, Wolken, Sterne – alles hinter dem Garten */
export function Sky({ phase }) {
  const rand = seededRandom(3)
  const stars = phase === 'night'
    ? Array.from({ length: 46 }, () => [rand() * 1000, rand() * 190, 0.5 + rand() * 1.1, rand()])
    : []

  return (
    <g className="sky">
      <defs>
        <linearGradient id="gd-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: 'var(--sky-top)' }} />
          <stop offset="1" style={{ stopColor: 'var(--sky-bottom)' }} />
        </linearGradient>
        <radialGradient id="gd-glow">
          <stop offset="0" style={{ stopColor: 'var(--sun)', stopOpacity: 0.5 }} />
          <stop offset="1" style={{ stopColor: 'var(--sun)', stopOpacity: 0 }} />
        </radialGradient>
        <mask id="gd-moon">
          <rect x="700" y="0" width="200" height="200" fill="white" />
          <circle cx="842" cy="62" r="20" fill="black" />
        </mask>
      </defs>

      <rect width="1000" height="270" fill="url(#gd-sky)" />

      {stars.map(([sx, sy, r, t], i) => (
        <circle key={i} className={`star ${t > 0.6 ? 'twinkle' : ''}`} cx={sx} cy={sy} r={r} style={{ '--i': t * 4 }} />
      ))}

      {phase === 'night' ? (
        <g>
          <circle cx="830" cy="72" r="70" fill="url(#gd-glow)" opacity="0.5" />
          <circle className="moon" cx="830" cy="72" r="22" mask="url(#gd-moon)" />
        </g>
      ) : (
        <g>
          <circle cx={SUN[phase][0]} cy={SUN[phase][1]} r={SUN[phase][2] * 3.2} fill="url(#gd-glow)" />
          <circle className="sun" cx={SUN[phase][0]} cy={SUN[phase][1]} r={SUN[phase][2]} />
        </g>
      )}

      {phase === 'evening' && (
        <g className="birds">
          <path d="M0 0 q 5 -5 10 0 q 5 -5 10 0" />
          <path d="M26 10 q 4 -4 8 0 q 4 -4 8 0" />
          <path d="M-18 14 q 3.5 -3.5 7 0 q 3.5 -3.5 7 0" />
        </g>
      )}

      {CLOUDS.map((c, i) => <Cloud key={i} {...c} />)}
    </g>
  )
}

const BANDS = {
  far: 'M0 205 C 90 160, 200 152, 310 180 S 520 150, 640 172 S 860 140, 1000 176 V380 H0 Z',
  mid: 'M0 222 C 150 196, 300 214, 450 204 S 760 188, 1000 210 V380 H0 Z',
  back: 'M0 236 C 220 224, 420 242, 620 230 S 880 222, 1000 234 V380 H0 Z',
  front: 'M0 302 C 200 290, 420 308, 640 298 S 880 292, 1000 302 V380 H0 Z',
}
const EDGES = {
  mid: 'M0 222 C 150 196, 300 214, 450 204 S 760 188, 1000 210',
  back: 'M0 236 C 220 224, 420 242, 620 230 S 880 222, 1000 234',
  front: 'M0 302 C 200 290, 420 308, 640 298 S 880 292, 1000 302',
}

function Tuft({ x, y, h, rand }) {
  const blades = 3 + Math.floor(rand() * 3)
  return (
    <g>
      {Array.from({ length: blades }, (_, i) => {
        const dx = (i - (blades - 1) / 2) * 3 + (rand() - 0.5) * 2
        const hh = h * (0.6 + rand() * 0.5)
        return <path key={i} d={`M${x + dx * 0.4} ${y} q ${dx * 0.3} ${-hh * 0.6} ${dx} ${-hh}`} />
      })}
    </g>
  )
}

/** Hügel, Wiese, Grasbüschel und Steine */
export function Ground() {
  const rand = seededRandom(11)
  const tufts = Array.from({ length: 16 }, () => ({ x: rand() * 1000, y: 250 + rand() * 40, h: 5 + rand() * 3 }))

  return (
    <g className="ground">
      <defs>
        <linearGradient id="gd-meadow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: 'var(--meadow)' }} />
          <stop offset="1" style={{ stopColor: 'var(--meadow-front)' }} />
        </linearGradient>
        <linearGradient id="gd-meadow-back" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: 'var(--meadow-back)' }} />
          <stop offset="1" style={{ stopColor: 'var(--meadow)' }} />
        </linearGradient>
        <linearGradient id="gd-mist" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: 'var(--mist)', stopOpacity: 0 }} />
          <stop offset="0.6" style={{ stopColor: 'var(--mist)', stopOpacity: 0.35 }} />
          <stop offset="1" style={{ stopColor: 'var(--mist)', stopOpacity: 0 }} />
        </linearGradient>
        <pattern id="gd-hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
          <line x1="0" y1="0" x2="0" y2="5" />
        </pattern>
      </defs>

      <path className="band far" d={BANDS.far} />
      <path className="band mid" d={BANDS.mid} />
      <path className="hatch" d={BANDS.mid} fill="url(#gd-hatch)" />
      <path className="edge soft" d={EDGES.mid} />
      <path className="band" d={BANDS.back} fill="url(#gd-meadow-back)" />
      <path className="edge soft" d={EDGES.back} />
      <g className="tufts">{tufts.map((t, i) => <Tuft key={i} {...t} rand={rand} />)}</g>
    </g>
  )
}

/** Vordere Wiese – wird über den hinteren Pflanzenreihen gezeichnet */
export function FrontMeadow() {
  const rand = seededRandom(23)
  const tufts = Array.from({ length: 22 }, () => ({ x: rand() * 1000, y: 314 + rand() * 50, h: 8 + rand() * 5 }))
  const stones = Array.from({ length: 6 }, () => ({ x: 40 + rand() * 920, y: 320 + rand() * 44, r: 3 + rand() * 4 }))

  return (
    <g className="ground">
      <path className="band" d={BANDS.front} fill="url(#gd-meadow)" />
      <path className="hatch strong" d={BANDS.front} fill="url(#gd-hatch)" />
      <path className="edge" d={EDGES.front} />
      <g className="tufts">{tufts.map((t, i) => <Tuft key={i} {...t} rand={rand} />)}</g>
      {stones.map((s, i) => (
        <g key={i} className="stone">
          <ellipse cx={s.x} cy={s.y} rx={s.r * 1.4} ry={s.r} />
          <path d={`M${s.x - s.r * 0.8} ${s.y - s.r * 0.3} q ${s.r * 0.5} ${-s.r * 0.6} ${s.r} ${-s.r * 0.55}`} />
        </g>
      ))}
    </g>
  )
}

/** Grashalme ganz vorne am Rand */
export function ForegroundGrass() {
  const rand = seededRandom(5)
  const blades = Array.from({ length: 150 }, (_, i) => {
    const x = i * 6.7 + rand() * 4
    const h = 7 + rand() * 12
    return `M${x} 383 q ${(rand() - 0.5) * 4} ${-h * 0.6} ${(rand() - 0.4) * 6} ${-h}`
  })
  return <path className="foreground-grass" d={blades.join(' ')} />
}

/** Schmetterlinge (Tag), Glühwürmchen (Nacht) */
export function Critters({ phase }) {
  const rand = seededRandom(9)
  if (phase === 'night') {
    return (
      <g className="fireflies">
        <defs>
          <filter id="gd-glow-blur" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="2.2" />
          </filter>
        </defs>
        {Array.from({ length: 16 }, (_, i) => {
          const x = 40 + rand() * 920
          const y = 200 + rand() * 150
          return (
            <g key={i} transform={`translate(${x} ${y})`}>
              <g className="firefly" style={{ '--i': rand() * 6, '--dx': `${(rand() - 0.5) * 50}px`, '--dy': `${-10 - rand() * 30}px` }}>
                <circle r="4.5" filter="url(#gd-glow-blur)" />
                <circle r="1.4" className="core" />
              </g>
            </g>
          )
        })}
      </g>
    )
  }

  return (
    <g>
      {[0, 1].map((i) => (
        <g key={i} className="butterfly-path" style={{ '--i': i }}>
          <g transform={`translate(${i ? 640 : 300} ${i ? 230 : 250}) scale(1.7)`}>
            <g className="butterfly">
              <path className="wing" d="M0 0 C -7 -9, -12 -3, -8 1 C -11 5, -5 8, 0 2" fill={i ? 'var(--bloom-gold)' : 'var(--bloom-pink)'} />
              <path className="wing right" d="M0 0 C 7 -9, 12 -3, 8 1 C 11 5, 5 8, 0 2" fill={i ? 'var(--bloom-gold)' : 'var(--bloom-pink)'} />
              <path className="body" d="M0 -3 V4" />
            </g>
          </g>
        </g>
      ))}
    </g>
  )
}

/** Papierkorn + leichte Vignette über der ganzen Szene */
export function Texture() {
  return (
    <g className="texture" pointerEvents="none">
      <defs>
        <filter id="gd-grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <radialGradient id="gd-vignette" cx=".5" cy=".45" r=".75">
          <stop offset=".6" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.14" />
        </radialGradient>
      </defs>
      <rect className="tint" width="1000" height="380" />
      <rect className="grain" width="1000" height="380" filter="url(#gd-grain)" />
      <rect width="1000" height="380" fill="url(#gd-vignette)" />
    </g>
  )
}
