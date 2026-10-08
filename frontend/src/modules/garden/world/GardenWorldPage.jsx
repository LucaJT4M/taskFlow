import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Flame, Locate, Minus, Plus, Trees } from 'lucide-react'
import { useTheme } from '../../tasks/useTheme'
import { useGarden } from '../useGarden'
import { KIND_NAMES } from '../plantKinds'
import GardenDefs from '../GardenDefs'
import { burstLeaves } from '../../../components/decor/leafBurst'
import CloudTransition from './CloudTransition'
import WorldTerrain from './WorldTerrain'
import WorldLife from './WorldLife'
import WorldPlant from './WorldPlant'
import { CENTER, MAP_H, MAP_W, PLANT_SPOTS } from './worldLayout'
import './world.css'

const MAX_SCALE = 2.4

function GardenWorldPage() {
  const { garden } = useGarden()
  const { theme } = useTheme()
  const navigate = useNavigate()

  const [phase, setPhase] = useState('reveal') // reveal -> world -> leaving
  const [hover, setHover] = useState(null)
  const [showHint, setShowHint] = useState(true)

  const viewRef = useRef(null)
  const layerRef = useRef(null)
  const cam = useRef({ x: 0, y: 0, s: 1 })
  const drag = useRef(null)

  // ---------- Kamera ----------
  const minScale = () => Math.max(window.innerWidth / MAP_W, window.innerHeight / MAP_H)

  const apply = useCallback((animate = false) => {
    const { x, y, s } = cam.current
    const el = layerRef.current
    if (!el) return
    el.classList.toggle('animate', animate)
    el.style.transform = `translate(${x}px, ${y}px) scale(${s})`
  }, [])

  const clampCam = () => {
    const c = cam.current
    c.s = Math.min(MAX_SCALE, Math.max(minScale(), c.s))
    c.x = Math.min(0, Math.max(window.innerWidth - MAP_W * c.s, c.x))
    c.y = Math.min(0, Math.max(window.innerHeight - MAP_H * c.s, c.y))
  }

  const centerOn = useCallback((px, py, s, animate) => {
    cam.current = { s, x: window.innerWidth / 2 - px * s, y: window.innerHeight / 2 - py * s }
    clampCam()
    apply(animate)
  }, [apply])

  // Start: etwas weiter weg, dann "landet" die Kamera (passend zu den Wolken)
  useLayoutEffect(() => {
    const target = minScale() * 1.35
    centerOn(CENTER.x, CENTER.y, target * 0.82, false)
    const t = requestAnimationFrame(() => requestAnimationFrame(() => centerOn(CENTER.x, CENTER.y, target, true)))
    return () => cancelAnimationFrame(t)
  }, [centerOn])

  function zoomAt(factor, mx = window.innerWidth / 2, my = window.innerHeight / 2, animate = false) {
    const c = cam.current
    const s = Math.min(MAX_SCALE, Math.max(minScale(), c.s * factor))
    c.x = mx - ((mx - c.x) * s) / c.s
    c.y = my - ((my - c.y) * s) / c.s
    c.s = s
    clampCam()
    apply(animate)
  }

  // Mausrad (nicht-passiv, damit die Seite nicht scrollt)
  useEffect(() => {
    const el = viewRef.current
    const onWheel = (e) => {
      e.preventDefault()
      zoomAt(e.deltaY < 0 ? 1.12 : 1 / 1.12, e.clientX, e.clientY)
      setShowHint(false)
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    const onResize = () => { clampCam(); apply() }
    window.addEventListener('resize', onResize)
    return () => { el.removeEventListener('wheel', onWheel); window.removeEventListener('resize', onResize) }
  })

  function onPointerDown(e) {
    if (e.button !== 0) return
    drag.current = { sx: e.clientX, sy: e.clientY, x: cam.current.x, y: cam.current.y, moved: false }
    const move = (ev) => {
      const d = drag.current
      if (!d) return
      const dx = ev.clientX - d.sx
      const dy = ev.clientY - d.sy
      if (Math.abs(dx) + Math.abs(dy) > 5) { d.moved = true; setHover(null); setShowHint(false) }
      cam.current.x = d.x + dx
      cam.current.y = d.y + dy
      clampCam()
      apply()
    }
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      setTimeout(() => { drag.current = null }, 0)
      viewRef.current?.classList.remove('dragging')
    }
    viewRef.current?.classList.add('dragging')
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  // ---------- Pflanzen ----------
  const plants = useMemo(() => {
    if (!garden) return []
    return garden.plants.slice(0, PLANT_SPOTS.length).map((plant, i) => ({ plant, ...PLANT_SPOTS[i] }))
  }, [garden])

  function leave() {
    setPhase('leaving')
  }

  useEffect(() => {
    const t = setTimeout(() => setShowHint(false), 6000)
    const onKey = (e) => { if (e.key === 'Escape') leave() }
    window.addEventListener('keydown', onKey)
    return () => { clearTimeout(t); window.removeEventListener('keydown', onKey) }
  }, [])

  const night = theme === 'dark'
  const current = garden?.current

  return (
    <div className="app-dark garden-world" data-theme={theme}>
      <div className="world-view" ref={viewRef} onPointerDown={onPointerDown}>
        <svg className="world-svg" width="100%" height="100%">
          <GardenDefs />
          <g ref={layerRef} className="world-layer">
            <WorldTerrain />
            {plants
              .slice()
              .sort((a, b) => a.y - b.y)
              .map(({ plant, x, y }) => (
                <WorldPlant
                  key={plant.index}
                  plant={plant}
                  x={x}
                  y={y}
                  current={plant.index === current?.index}
                  onHover={(e) => !drag.current && setHover({ plant, cx: e.clientX, cy: e.clientY })}
                  onLeave={() => setHover(null)}
                  onClick={(e) => { if (!drag.current?.moved) burstLeaves(e.currentTarget, 8) }}
                />
              ))}
            <WorldLife night={night} />
          </g>
        </svg>
      </div>

      {/* ---------- Oberfläche ---------- */}
      <div className="world-ui top-left">
        <button type="button" className="world-btn" onClick={leave}>
          <ArrowLeft size={16} strokeWidth={2} /> Zurück
        </button>
        <div className="world-card">
          <strong>Mein Garten</strong>
          {garden && (
            <div className="world-stats">
              <span title="Erledigte Aufgaben"><CheckCircle2 size={14} /> {garden.total_completed}</span>
              <span title="Ausgewachsene Pflanzen"><Trees size={14} /> {garden.grown_plants}</span>
              <span title="Tage in Folge"><Flame size={14} /> {garden.streak_days}</span>
            </div>
          )}
          {current && current.next_stage_name && (
            <p className="world-next">
              {KIND_NAMES[current.kind]} wächst · noch {current.tasks_to_next} bis „{current.next_stage_name}“
            </p>
          )}
        </div>
      </div>

      <div className="world-ui bottom-right">
        <button type="button" className="world-btn icon" title="Hineinzoomen" onClick={() => zoomAt(1.3, undefined, undefined, true)}><Plus size={18} /></button>
        <button type="button" className="world-btn icon" title="Herauszoomen" onClick={() => zoomAt(1 / 1.3, undefined, undefined, true)}><Minus size={18} /></button>
        <button
          type="button"
          className="world-btn icon"
          title="Zur Mitte"
          onClick={() => centerOn(CENTER.x, CENTER.y, minScale() * 1.35, true)}
        >
          <Locate size={18} />
        </button>
      </div>

      {showHint && phase === 'world' && (
        <div className="world-hint">Ziehen zum Bewegen · Scrollen zum Zoomen · Esc zum Verlassen</div>
      )}

      {garden && garden.total_completed === 0 && phase === 'world' && (
        <div className="world-empty">Erledige deine erste Aufgabe – dann keimt hier dein erster Samen. 🌱</div>
      )}

      {hover && (
        <div className="world-tooltip" style={{ left: hover.cx, top: hover.cy }}>
          <strong>{KIND_NAMES[hover.plant.kind]} · {hover.plant.stage_name}</strong>
          <span>
            {hover.plant.index === current?.index ? 'Wächst gerade' : `${garden.plant_size} erledigte Aufgaben`}
          </span>
        </div>
      )}

      {phase === 'reveal' && <CloudTransition mode="reveal" onDone={() => setPhase('world')} />}
      {phase === 'leaving' && (
        <CloudTransition mode="cover" onDone={() => navigate('/garden', { state: { fromWorld: true } })} />
      )}
    </div>
  )
}

export default GardenWorldPage
