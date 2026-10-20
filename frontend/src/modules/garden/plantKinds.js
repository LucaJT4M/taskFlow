import { t, stageName } from '../../i18n'

// Anzeigenamen der Pflanzenarten (die Art kommt vom Backend).
// Getter: Name wird bei jedem Zugriff in der aktuellen Sprache gelesen.
export const KIND_NAMES = {
  get eiche() { return t('kind.eiche') },
  get kirsche() { return t('kind.kirsche') },
  get tanne() { return t('kind.tanne') },
  get birke() { return t('kind.birke') },
}

export const BLOOM_COLORS = {
  eiche: 'var(--bloom-gold)',
  kirsche: 'var(--bloom-pink)',
  tanne: 'var(--bloom-coral)',
  birke: 'var(--bloom-gold)',
}

export function plantLabel(plant, plantSize = 10) {
  return `${KIND_NAMES[plant.kind] ?? t('kind.plant')} · ${stageName(plant.stage_name)} (${plant.growth}/${plantSize})`
}
