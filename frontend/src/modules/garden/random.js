// Kleiner Zufallsgenerator mit festem Startwert:
// dieselbe Pflanze sieht bei jedem Laden gleich aus.
export function seededRandom(seed) {
  let a = (seed + 1) * 0x9e3779b9
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
