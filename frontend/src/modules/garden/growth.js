function nextStepText(plant) {
  if (!plant.next_stage_name) return 'Ausgewachsen'
  const word = plant.tasks_to_next === 1 ? 'Aufgabe' : 'Aufgaben'
  return `Noch ${plant.tasks_to_next} ${word} bis „${plant.next_stage_name}“`
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
    return { title: 'Pflanze ausgewachsen!', text: 'Ein neuer Samen ist gesät.', plant: grown }
  }
  if (!before || plant.stage !== before.current.stage) {
    return { title: `Neue Stufe: ${plant.stage_name}`, text: nextStepText(plant), plant }
  }
  return { title: 'Dein Garten wächst', text: nextStepText(plant), plant }
}
