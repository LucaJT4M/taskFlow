import { useEffect } from 'react'
import { X } from 'lucide-react'
import Plant from './Plant'
import GardenDefs from './GardenDefs'

/**
 * Kleine Meldung unten rechts, wenn eine erledigte Aufgabe
 * den Garten wachsen lässt.
 */
function GrowthToast({ info, onClose, onOpenGarden }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000)
    return () => clearTimeout(timer)
  }, [info, onClose])

  return (
    <div className="growth-toast" role="status">
      <svg className="growth-toast-art" viewBox="-62 -142 124 150" aria-hidden="true">
        <GardenDefs />
        <Plant kind={info.plant.kind} stage={info.plant.stage} seed={info.plant.index} />
      </svg>
      <div className="growth-toast-text">
        <strong>{info.title}</strong>
        <p>{info.text}</p>
        <button type="button" className="link-btn" onClick={onOpenGarden}>
          Zum Garten →
        </button>
      </div>
      <button type="button" className="icon-btn" onClick={onClose} title="Schließen">
        <X size={15} strokeWidth={1.75} />
      </button>
    </div>
  )
}

export default GrowthToast
