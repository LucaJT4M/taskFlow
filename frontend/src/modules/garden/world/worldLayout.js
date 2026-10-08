import { seededRandom } from '../random'

export const MAP_W = 2400
export const MAP_H = 1600
export const CENTER = { x: 1150, y: 860 }
export const POND = { x: 1760, y: 470, r: 175 }

// Weg als kubische Bézier-Segmente: [Start, Kontroll1, Kontroll2, Ende]
const PATH_SEGMENTS = [
  [[1180, 1660], [1160, 1450], [1000, 1300], [1060, 1120]],
  [[1060, 1120], [1120, 940], [1300, 820], [1200, 700]],
  [[1200, 700], [1100, 580], [900, 300], [980, -60]],
]

export const PATH_D =
  `M ${PATH_SEGMENTS[0][0].join(' ')} ` +
  PATH_SEGMENTS.map(([, c1, c2, p]) => `C ${c1.join(' ')}, ${c2.join(' ')}, ${p.join(' ')}`).join(' ')

function bezier([p0, p1, p2, p3], t) {
  const u = 1 - t
  return [0, 1].map((k) => u * u * u * p0[k] + 3 * u * u * t * p1[k] + 3 * u * t * t * p2[k] + t * t * t * p3[k])
}

export const PATH_POINTS = PATH_SEGMENTS.flatMap((seg) => Array.from({ length: 24 }, (_, i) => bezier(seg, i / 23)))

const dist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by)
const distToPath = (x, y) => Math.min(...PATH_POINTS.map(([px, py]) => dist(x, y, px, py)))

/** Ist an dieser Stelle Platz (nicht im Teich, nicht auf dem Weg, nicht in der Hecke)? */
export function isFree(x, y, pathGap = 95, pondGap = 120, border = 150) {
  if (x < border || y < border || x > MAP_W - border || y > MAP_H - border) return false
  if (dist(x, y, POND.x, POND.y) < POND.r + pondGap) return false
  return distToPath(x, y) > pathGap
}

/**
 * Feste Pflanzplätze: von der Mitte nach außen sortiert –
 * der Garten wächst also vom Zentrum aus.
 */
export const PLANT_SPOTS = (() => {
  const rand = seededRandom(77)
  const spots = []
  for (let y = 210; y < MAP_H - 150; y += 150) {
    for (let x = 200; x < MAP_W - 150; x += 165) {
      const px = x + (rand() - 0.5) * 70 + ((y / 150) % 2) * 60
      const py = y + (rand() - 0.5) * 60
      if (isFree(px, py)) spots.push({ x: px, y: py })
    }
  }
  return spots.sort((a, b) => dist(a.x, a.y, CENTER.x, CENTER.y) - dist(b.x, b.y, CENTER.x, CENTER.y))
})()

/** Zufällige freie Punkte für Deko (Blumen, Grasbüschel …) */
export function scatter(count, seed, gaps) {
  const rand = seededRandom(seed)
  const out = []
  let guard = 0
  while (out.length < count && guard++ < count * 20) {
    const x = rand() * MAP_W
    const y = rand() * MAP_H
    if (isFree(x, y, ...(gaps ?? [40, 30, 60]))) out.push({ x, y, r: rand() })
  }
  return out
}

/** Unregelmäßige, weiche Form (für Teich, Beete …) */
export function blobPath(cx, cy, r, seed, points = 12, wobble = 0.18) {
  const rand = seededRandom(seed)
  const pts = Array.from({ length: points }, (_, i) => {
    const a = (i / points) * Math.PI * 2
    const rr = r * (1 - wobble / 2 + rand() * wobble)
    return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]
  })
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
  let d = `M ${mid(pts[points - 1], pts[0]).join(' ')}`
  pts.forEach((p, i) => {
    const m = mid(p, pts[(i + 1) % points])
    d += ` Q ${p.join(' ')} ${m.join(' ')}`
  })
  return d + ' Z'
}
