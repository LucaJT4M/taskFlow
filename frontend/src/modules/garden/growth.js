import { t, stageName } from '../../i18n'

function nextStepText(plant) {
  if (!plant.next_stage_name) return t('garden.grown')
  return t('garden.until', { n: plant.tasks_to_next, stage: stageName(plant.next_stage_name) })
}

/**
 * Vergleicht den Garten vor und nach einer erledigten Aufgabe
 * und beschreibt, was gewachsen ist. null = nichts Neues.
 */
export function describeGrowth(before, after) {
  if (!after) return null
  if (before && after.total_completed <= before.total_completed) return null

  const plant = after.current

  if (before && after.grown_plants > before.grown_plants) {
    const grown = after.plants[after.plants.length - 2] ?? plant
    return { title: t('growth.grownTitle'), text: t('growth.newSeed'), plant: grown }
  }
  if (!before || plant.stage !== before.current.stage) {
    return { title: t('growth.newStage', { stage: stageName(plant.stage_name) }), text: nextStepText(plant), plant }
  }
  return { title: t('growth.growing'), text: nextStepText(plant), plant }
}
