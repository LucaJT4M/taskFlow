import { MAP_H, MAP_W, POND } from './worldLayout'

export const SPEED = 270 // Welteinheiten pro Sekunde
export const SPAWN = { x: 1175, y: 1010 } // auf dem Weg, neben der Bank

/** Darf die Figur an diesem Punkt stehen? */
export function isBlocked(x, y, obstacles) {
  if (x < 95 || y < 95 || x > MAP_W - 95 || y > MAP_H - 95) return true // Hecke
  if (Math.hypot(x - POND.x, y - POND.y) < POND.r + 16) return true // Teich
  return obstacles.some((o) => Math.hypot(x - o.x, y - o.y) < o.r)
}

/** Bewegt die Figur; an Hindernissen "rutscht" sie entlang statt stehen zu bleiben */
export function moveWithCollision(pos, dx, dy, obstacles) {
  const nx = pos.x + dx
  const ny = pos.y + dy
  if (!isBlocked(nx, ny, obstacles)) return { x: nx, y: ny }
  if (!isBlocked(nx, pos.y, obstacles)) return { x: nx, y: pos.y }
  if (!isBlocked(pos.x, ny, obstacles)) return { x: pos.x, y: ny }
  return pos
}

// ---- "Heute gegossen" (nur im Browser gespeichert, rein kosmetisch) ----
const KEY = 'garden-watered'
const today = () => new Date().toISOString().slice(0, 10)

export function loadWatered() {
  try {
    const data = JSON.parse(localStorage.getItem(KEY) || '{}')
    return data.date === today() ? new Set(data.ids) : new Set()
  } catch {
    return new Set()
  }
}

export function saveWatered(set) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ date: today(), ids: [...set] }))
  } catch {
    /* privat-Modus o. ä. – dann eben nur für diese Sitzung */
  }
}
