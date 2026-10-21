import Plant from './Plant'
import GardenDefs from './GardenDefs'
import { KIND_NAMES } from './plantKinds'
import { t, stageName } from '../../i18n'

function CurrentPlantCard({ garden }) {
  const plant = garden.current
  const percent = Math.round((plant.growth / garden.plant_size) * 100)

  return (
    <section className="current-plant">
      <svg className="current-plant-art" viewBox="-62 -142 124 150" aria-hidden="true">
        <GardenDefs />
        <Plant kind={plant.kind} stage={plant.stage} seed={plant.index} />
      </svg>

      <div className="current-plant-info">
        <p className="eyebrow">{t('garden.growing')}</p>
        <h2>{KIND_NAMES[plant.kind]} · {stageName(plant.stage_name)}</h2>
        <p className="subtitle">
          {plant.next_stage_name
            ? t('garden.untilStage', { n: plant.points_to_next, stage: stageName(plant.next_stage_name) })
            : t('garden.grown')}
        </p>

        <div className="growth-bar" aria-label={t('garden.barAria', { g: plant.growth, s: garden.plant_size })}>
          <div className="growth-fill" style={{ width: `${percent}%` }} />
          {garden.stages.map((s) => (
            <span
              key={s.key}
              className={`growth-mark ${plant.growth >= s.min_points ? 'reached' : ''}`}
              style={{ left: `${(s.min_points / garden.plant_size) * 100}%` }}
              title={t('garden.markTitle', { stage: stageName(s.name), n: s.min_points })}
            />
          ))}
        </div>
        <div className="growth-labels">
          {garden.stages.map((s) => (
            <span key={s.key} style={{ left: `${(s.min_points / garden.plant_size) * 100}%` }}>{stageName(s.name)}</span>
          ))}
        </div>
      </div>
    </section>
  )
}

export default CurrentPlantCard
