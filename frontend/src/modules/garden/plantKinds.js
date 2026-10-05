// Anzeigenamen der Pflanzenarten (die Art kommt vom Backend)
export const KIND_NAMES = {
  eiche: 'Eiche',
  kirsche: 'Kirschbaum',
  tanne: 'Tanne',
  birke: 'Birke',
}

export const BLOOM_COLORS = {
  eiche: 'var(--bloom-gold)',
  kirsche: 'var(--bloom-pink)',
  tanne: 'var(--bloom-coral)',
  birke: 'var(--bloom-gold)',
}

export function plantLabel(plant, plantSize = 10) {
  return `${KIND_NAMES[plant.kind] ?? 'Pflanze'} · ${plant.stage_name} (${plant.growth}/${plantSize})`
}
