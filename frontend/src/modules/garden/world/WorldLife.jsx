import { memo } from 'react'
import { MAP_H, MAP_W, scatter } from './worldLayout'

/** Wolkenschatten, Schmetterlinge und (nachts) Glühwürmchen */
function WorldLife({ night }) {
  const flies = night ? scatter(40, 55, [10, 0, 80]) : []
  return (
    <g className="world-life" pointerEvents="none">
      <defs>
        <radialGradient id="wd-cloudshadow">
          <stop offset="0" stopColor="#1E3020" stopOpacity=".16" />
          <stop offset="1" stopColor="#1E3020" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="wd-glow">
          <stop offset="0" stopColor="#FFF6B8" stopOpacity="1" />
          <stop offset="1" stopColor="#FFF6B8" stopOpacity="0" />
        </radialGradient>
      </defs>

      {!night && [0, 1, 2].map((i) => (
        <ellipse key={i} className="wl-cloud" cx="0" cy={300 + i * 480} rx={420 - i * 60} ry={240 - i * 30}
          fill="url(#wd-cloudshadow)" style={{ '--i': i, '--w': `${MAP_W + 900}px` }} />
      ))}

      {!night && [0, 1, 2, 3].map((i) => (
        <g key={i} className="wl-butterfly-path" style={{ '--i': i }}>
          <g transform={`translate(${500 + i * 420} ${400 + (i % 2) * 520}) scale(1.6)`}>
            <g className="wl-butterfly">
              <ellipse className="wing l" cx="-7" cy="0" rx="8" ry="11" fill={i % 2 ? '#F2C14E' : '#E9A0B6'} />
              <ellipse className="wing r" cx="7" cy="0" rx="8" ry="11" fill={i % 2 ? '#F2C14E' : '#E9A0B6'} />
              <rect x="-1.5" y="-9" width="3" height="18" rx="1.5" fill="#4A443A" />
            </g>
          </g>
        </g>
      ))}

      {night && (
        <>
          <rect className="wl-night" width={MAP_W} height={MAP_H} />
          {flies.map((f, i) => (
            <g key={i} transform={`translate(${f.x} ${f.y})`}>
              <circle className="wl-firefly" r="14" fill="url(#wd-glow)" style={{ '--i': f.r * 6 }} />
            </g>
          ))}
        </>
      )}
    </g>
  )
}

export default memo(WorldLife)
