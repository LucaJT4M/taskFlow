import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Droplets, Flame, Locate, Minus, Plus, Trees } from 'lucide-react'
import { useTheme } from '../../tasks/useTheme'
import { useGarden } from '../useGarden'
import { KIND_NAMES } from '../plantKinds'
import GardenDefs from '../GardenDefs'
import { burstLeaves } from '../../../components/decor/leafBurst'
import CloudTransition from './CloudTransition'
import WorldTerrain from './WorldTerrain'
import WorldLife from './WorldLife'
import WorldPlant, { plantRadius } from './WorldPlant'
import Gardener from './Gardener'
import WaterEffect from './WaterEffect'
import { MAP_H, MAP_W, PLANT_SPOTS } from './worldLayout'
import { SPAWN, SPEED, isBlocked, loadWatered, moveWithCollision, saveWatered } from './gardenerPhysics'
import './world.css'

const MAX_SCALE = 2.4
const KEYS = {
  ArrowUp: [0, -1], KeyW: [0, -1],
  ArrowDown: [0, 1], KeyS: [0, 1],
  ArrowLeft: [-1, 0], KeyA: [-1, 0],
  ArrowRight: [1, 0], KeyD: [1, 0],
}

function GardenWorldPage() {
  const { garden } = useGarden()
  const { theme } = useTheme()
  const navigate = useNavigate()

  const [phase, setPhase] = useState('reveal') // reveal -> world -> leaving
  const [hover, setHover] = useState(null)
  const [showHint, setShowHint] = useState(true)
  const [nearIndex, setNearIndex] = useState(null)
  const [effect, setEffect] = useState(null) // { index, x, y, r, petals, key }
  const [watered, setWatered] = useState(loadWatered)
  const [toast, setToast] = useState(null)

  const viewRef = useRef(null)
  const layerRef = useRef(null)
  const charRef = useRef(null)
  const stepsRef = useRef(null)
  const cam = useRef({ x: 0, y: 0, s: 1 })
  const drag = useRef(null)

  // Spielfigur
  const pos = useRef({ ...SPAWN })
  const facing = useRef(0)
  const target = useRef(null)
  const pressed = useRef(new Set())
  const follow = useRef(false)
  const lastStep = useRef({ ...SPAWN, side: 1 })

  // ---------- Pflanzen ----------
  const plants = useMemo(() => {
    if (!garden) return []
    return garden.plants.slice(0, PLANT_SPOTS.length).map((plant, i) => ({ plant, ...PLANT_SPOTS[i], r: plantRadius(plant) }))
  }, [garden])

  // Bäume und Büsche sind Hindernisse (Stamm-Bereich), Sprösslinge kann man umlaufen
  const obstacles = useMemo(
    () => plants.filter((p) => p.r >= 28).map((p) => ({ x: p.x, y: p.y, r: p.r * 0.55 + 14 })),
    [plants],
  )
  const obstaclesRef = useRef(obstacles)
  obstaclesRef.current = obstacles
  const plantsRef = useRef(plants)
  plantsRef.current = plants
  const nearRef = useRef(null)

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

  // Start: Kamera "landet" auf der Figur, danach folgt sie ihr
  useLayoutEffect(() => {
    const zoom = minScale() * 1.6
    centerOn(SPAWN.x, SPAWN.y, zoom * 0.78, false)
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => centerOn(SPAWN.x, SPAWN.y, zoom, true)))
    const t = setTimeout(() => { follow.current = true }, 2300)
    return () => { cancelAnimationFrame(raf); clearTimeout(t) }
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

  // ---------- Spiel-Schleife (60 fps) ----------
  useEffect(() => {
    let raf
    let last = performance.now()

    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now

      // Richtung aus Tastatur oder Klick-Ziel
      let dx = 0
      let dy = 0
      for (const code of pressed.current) {
        const k = KEYS[code]
        if (k) { dx += k[0]; dy += k[1] }
      }
      if (dx || dy) {
        target.current = null
      } else if (target.current) {
        const tx = target.current.x - pos.current.x
        const ty = target.current.y - pos.current.y
        const d = Math.hypot(tx, ty)
        if (d < target.current.stop + 4) target.current = null
        else { dx = tx / d; dy = ty / d }
      }

      const moving = dx !== 0 || dy !== 0
      if (moving) {
        const len = Math.hypot(dx, dy)
        dx /= len
        dy /= len
        const before = pos.current
        pos.current = moveWithCollision(before, dx * SPEED * dt, dy * SPEED * dt, obstaclesRef.current)
        if (pos.current === before) target.current = null // festgelaufen
        facing.current = (Math.atan2(dy, dx) * 180) / Math.PI + 90
        follow.current = follow.current || !drag.current
        dropFootstep()
      }

      // Figur zeichnen
      const el = charRef.current
      if (el) {
        el.setAttribute('transform', `translate(${pos.current.x.toFixed(1)} ${pos.current.y.toFixed(1)}) scale(1.4)`)
        el.querySelector('.g-body')?.setAttribute('transform', `rotate(${facing.current.toFixed(1)})`)
        el.classList.toggle('walking', moving)
      }

      // Kamera folgt weich
      if (follow.current && !drag.current) {
        const c = cam.current
        const wx = window.innerWidth / 2 - pos.current.x * c.s
        const wy = window.innerHeight / 2 - pos.current.y * c.s
        c.x += (wx - c.x) * Math.min(1, dt * 5)
        c.y += (wy - c.y) * Math.min(1, dt * 5)
        clampCam()
        apply(false)
      }

      // Nächste Pflanze in Reichweite?
      let best = null
      let bestD = Infinity
      for (const p of plantsRef.current) {
        const d = Math.hypot(p.x - pos.current.x, p.y - pos.current.y) - p.r
        if (d < 60 && d < bestD) { best = p.plant.index; bestD = d }
      }
      if (best !== nearRef.current) {
        nearRef.current = best
        setNearIndex(best)
      }

      raf = requestAnimationFrame(tick)
    }

    function dropFootstep() {
      const l = lastStep.current
      if (Math.hypot(pos.current.x - l.x, pos.current.y - l.y) < 26) return
      const g = stepsRef.current
      if (!g) return
      l.side *= -1
      const a = ((facing.current - 90) * Math.PI) / 180
      const ox = Math.cos(a + Math.PI / 2) * 6 * l.side
      const oy = Math.sin(a + Math.PI / 2) * 6 * l.side
      const step = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse')
      step.setAttribute('cx', (pos.current.x + ox).toFixed(1))
      step.setAttribute('cy', (pos.current.y + oy).toFixed(1))
      step.setAttribute('rx', '3.2')
      step.setAttribute('ry', '5')
      step.setAttribute('transform', `rotate(${facing.current.toFixed(0)} ${(pos.current.x + ox).toFixed(1)} ${(pos.current.y + oy).toFixed(1)})`)
      step.setAttribute('class', 'footstep')
      step.addEventListener('animationend', () => step.remove())
      g.appendChild(step)
      l.x = pos.current.x
      l.y = pos.current.y
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [apply])

  // ---------- Gießen ----------
  const wateredRef = useRef(watered)
  wateredRef.current = watered

  const waterPlant = useCallback((index) => {
    const p = plantsRef.current.find((q) => q.plant.index === index)
    if (!p) return
    const name = KIND_NAMES[p.plant.kind]
    if (wateredRef.current.has(index)) {
      setToast({ text: `${name} wurde heute schon gegossen 🌤️`, key: Date.now() })
      return
    }
    const next = new Set(wateredRef.current)
    next.add(index)
    wateredRef.current = next
    saveWatered(next)
    setWatered(next)
    setEffect({ index, x: p.x, y: p.y, r: p.r, petals: p.plant.stage === 'bloom', key: Date.now() })
    setToast({ text: `${name} freut sich über das Wasser! 💧`, key: Date.now() })
  }, [])

  useEffect(() => {
    if (!effect) return
    const t = setTimeout(() => setEffect(null), 1800)
    return () => clearTimeout(t)
  }, [effect])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2600)
    return () => clearTimeout(t)
  }, [toast])

  // ---------- Eingaben ----------
  function leave() {
    setPhase('leaving')
  }

  useEffect(() => {
    const t = setTimeout(() => setShowHint(false), 9000)
    const down = (e) => {
      if (e.key === 'Escape') return leave()
      if (KEYS[e.code]) {
        e.preventDefault()
        pressed.current.add(e.code)
        follow.current = true
        setShowHint(false)
      }
      if ((e.code === 'KeyE' || e.code === 'Space' || e.code === 'Enter') && nearRef.current !== null) {
        e.preventDefault()
        waterPlant(nearRef.current)
      }
    }
    const up = (e) => pressed.current.delete(e.code)
    const blur = () => pressed.current.clear()
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    window.addEventListener('blur', blur)
    return () => {
      clearTimeout(t)
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      window.removeEventListener('blur', blur)
    }
  }, [waterPlant])

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

  // Bildschirm-Punkt -> Welt-Koordinaten
  const toWorld = (cx, cy) => ({ x: (cx - cam.current.x) / cam.current.s, y: (cy - cam.current.y) / cam.current.s })

  function onPointerDown(e) {
    if (e.button !== 0) return
    drag.current = { sx: e.clientX, sy: e.clientY, x: cam.current.x, y: cam.current.y, moved: false }
    const move = (ev) => {
      const d = drag.current
      if (!d) return
      const dx = ev.clientX - d.sx
      const dy = ev.clientY - d.sy
      if (!d.moved && Math.abs(dx) + Math.abs(dy) > 6) { d.moved = true; follow.current = false; setHover(null); setShowHint(false) }
      if (!d.moved) return
      cam.current.x = d.x + dx
      cam.current.y = d.y + dy
      clampCam()
      apply()
    }
    const up = (ev) => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      const d = drag.current
      // kurzer Klick auf die Wiese -> dorthin laufen
      if (d && !d.moved && !ev.target.closest?.('.world-plant')) {
        const w = toWorld(ev.clientX, ev.clientY)
        if (!isBlocked(w.x, w.y, [])) {
          target.current = { ...w, stop: 0 }
          follow.current = true
          showMarker(w)
        }
      }
      setTimeout(() => { drag.current = null }, 0)
      viewRef.current?.classList.remove('dragging')
    }
    viewRef.current?.classList.add('dragging')
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  const [marker, setMarker] = useState(null)
  function showMarker(w) {
    setMarker({ ...w, key: Date.now() })
  }

  // Klick auf eine Pflanze: hinlaufen (und Blätter wirbeln lassen)
  function onPlantClick(e, p) {
    if (drag.current?.moved) return
    burstLeaves(e.currentTarget, 6)
    const dx = pos.current.x - p.x
    const dy = pos.current.y - p.y
    const d = Math.hypot(dx, dy) || 1
    target.current = { x: p.x + (dx / d) * (p.r + 30), y: p.y + (dy / d) * (p.r + 30), stop: 0 }
    follow.current = true
  }

  const night = theme === 'dark'
  const current = garden?.current
  const near = plants.find((p) => p.plant.index === nearIndex)

  return (
    <div className="app-dark garden-world" data-theme={theme}>
      <div className="world-view" ref={viewRef} onPointerDown={onPointerDown}>
        <svg className="world-svg" width="100%" height="100%">
          <GardenDefs />
          <g ref={layerRef} className="world-layer">
            <WorldTerrain />
            <g ref={stepsRef} className="footsteps" />
            {marker && <circle key={marker.key} className="walk-marker" cx={marker.x} cy={marker.y} r="14" />}
            {plants
              .slice()
              .sort((a, b) => a.y - b.y)
              .map((p) => (
                <WorldPlant
                  key={p.plant.index}
                  plant={p.plant}
                  x={p.x}
                  y={p.y}
                  current={p.plant.index === current?.index}
                  near={p.plant.index === nearIndex}
                  happy={effect?.index === p.plant.index}
                  watered={watered.has(p.plant.index)}
                  onHover={(e) => !drag.current && setHover({ plant: p.plant, cx: e.clientX, cy: e.clientY })}
                  onLeave={() => setHover(null)}
                  onClick={(e) => onPlantClick(e, p)}
                />
              ))}
            <Gardener ref={charRef} />
            {effect && <WaterEffect key={effect.key} {...effect} />}
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
              <span title="Heute gegossen"><Droplets size={14} /> {watered.size}</span>
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
        <button type="button" className="world-btn icon" title="Zur Figur" onClick={() => { follow.current = true }}>
          <Locate size={18} />
        </button>
      </div>

      {/* Aktion, wenn die Figur bei einer Pflanze steht */}
      {near && phase === 'world' && (
        <div className="world-action" key={near.plant.index}>
          <div>
            <strong>{KIND_NAMES[near.plant.kind]} · {near.plant.stage_name}</strong>
            <span>
              {near.plant.index === current?.index
                ? `Wächst gerade · ${near.plant.growth}/${garden.plant_size} Aufgaben`
                : `Ausgewachsen · ${garden.plant_size} Aufgaben`}
            </span>
          </div>
          {watered.has(near.plant.index) ? (
            <span className="world-done"><Droplets size={15} /> Heute gegossen</span>
          ) : (
            <button type="button" className="world-water" onClick={() => waterPlant(near.plant.index)}>
              <Droplets size={16} /> Gießen <kbd>E</kbd>
            </button>
          )}
        </div>
      )}

      {toast && <div className="world-toast" key={toast.key}>{toast.text}</div>}

      {showHint && phase === 'world' && !near && (
        <div className="world-hint">WASD / Pfeiltasten: laufen · Klick: hingehen · E: gießen · Esc: verlassen</div>
      )}

      {garden && garden.total_completed === 0 && phase === 'world' && (
        <div className="world-empty">Erledige deine erste Aufgabe – dann keimt hier dein erster Samen. 🌱</div>
      )}

      {hover && (
        <div className="world-tooltip" style={{ left: hover.cx, top: hover.cy }}>
          <strong>{KIND_NAMES[hover.plant.kind]} · {hover.plant.stage_name}</strong>
          <span>Klicken, um hinzugehen</span>
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
