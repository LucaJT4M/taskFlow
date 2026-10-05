/**
 * Abschied von der Login-Seite: Der Wind weht die Blätter von den Zweigen,
 * die Karte schwebt nach oben weg. Danach wird navigiert.
 */
export function blowLeavesAway(duration = 650) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return Promise.resolve()
  }
  document.querySelectorAll('.decor-layer').forEach((layer) => layer.classList.add('blow'))
  document.querySelectorAll('.auth-page').forEach((page) => page.classList.add('leaving'))
  return new Promise((resolve) => setTimeout(resolve, duration))
}
