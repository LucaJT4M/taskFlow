import Plant from './Plant'
import { KIND_NAMES } from './plantKinds'

function CurrentPlantCard({ garden }) {
  const plant = garden.current
  const percent = Math.round((plant.growth / garden.plant_size) * 100)

  return (
    <section className="current-plant">
      <svg className="current-plant-art" viewBox="-60 -130 120 140" aria-hidden="true">
        <Plant kind={plant.kind} stage={plant.stage} />
      </svg>

      <div className="current-plant-info">
        <p className="eyebrow">Wächst gerade</p>
        <h2>{KIND_NAMES[plant.kind]} · {plant.stage_name}</h2>
        <p className="subtitle">
          {plant.next_stage_name
            ? `Noch ${plant.tasks_to_next} ${plant.tasks_to_next === 1 ? 'Aufgabe' : 'Aufgaben'} bis zur Stufe „${plant.next_stage_name}“`
            : 'Ausgewachsen'}
        </p>

        <div className="growth-bar" aria-label={`${plant.growth} von ${garden.plant_size} Aufgaben`}>
          <div className="growth-fill" style={{ width: `${percent}%` }} />
          {garden.stages.map((s) => (
            <span
              key={s.key}
              className={`growth-mark ${plant.growth >= s.min_tasks ? 'reached' : ''}`}
              style={{ left: `${(s.min_tasks / garden.plant_size) * 100}%` }}
              title={`${s.name}: ab ${s.min_tasks} ${s.min_tasks === 1 ? 'Aufgabe' : 'Aufgaben'}`}
            />
          ))}
        </div>
        <div className="growth-labels">
          {garden.stages.map((s) => (
            <span key={s.key} style={{ left: `${(s.min_tasks / garden.plant_size) * 100}%` }}>{s.name}</span>
          ))}
        </div>
      </div>
    </section>
  )
}

export default CurrentPlantCard
