/** Gießkanne + Wassertropfen + Herzchen über einer Pflanze */
function WaterEffect({ x, y, r, petals }) {
  return (
    <g className="water-effect" transform={`translate(${x} ${y})`} pointerEvents="none">
      <g className="we-can" transform={`translate(${r * 0.6} ${-r - 26})`}>
        <path d="M-16 -8 h22 v18 a4 4 0 0 1 -4 4 h-14 a4 4 0 0 1 -4 -4 Z" fill="#6E9AA8" stroke="#48707C" strokeWidth="2" />
        <path d="M6 -4 L24 -16" stroke="#48707C" strokeWidth="5" strokeLinecap="round" />
        <path d="M-12 -8 a9 8 0 0 1 14 0" fill="none" stroke="#48707C" strokeWidth="3" />
      </g>
      {Array.from({ length: 9 }, (_, i) => (
        <circle key={i} className="we-drop" cx={r * 0.6 + 22 - (i % 3) * 8} cy={-r - 40} r="3.2" style={{ '--i': i }} />
      ))}
      {['💧', '✨', '💚'].map((s, i) => (
        <text key={i} className="we-float" x={(i - 1) * 22} y={-r - 6} style={{ '--i': i }}>{s}</text>
      ))}
      {petals && Array.from({ length: 10 }, (_, i) => (
        <ellipse key={i} className="we-petal" cx={(i - 5) * 9} cy={-r * 0.3} rx="3" ry="4.5" style={{ '--i': i }} />
      ))}
    </g>
  )
}

export default WaterEffect
