import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Moon, Sun } from 'lucide-react'
import { useTheme } from '../tasks/useTheme'
import { getCurrentUser } from '../../services/authService'
import DecorLayer from '../../components/decor/DecorLayer'
import IntroSplash from '../../components/decor/IntroSplash'
import Grass from './Grass'
import FallingLeaves from './FallingLeaves'
import './landing.css'
import BrandIcon from '../../components/BrandIcon'

const LEAVE_MS = 550 // so lange sinkt der Inhalt "in die Erde"

/**
 * Startseite: kurzer Begrüßungstext und ein Button.
 * Nach dem Klick sinkt der Inhalt weg, das Samen-Intro läuft
 * und danach geht es zum Login (oder direkt zum Board).
 */
function LandingPage() {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const [loggedIn, setLoggedIn] = useState(false)
  const [phase, setPhase] = useState('idle') // 'idle' | 'leaving' | 'intro'

  // Ist schon jemand angemeldet? Dann führt der Button direkt zum Board.
  useEffect(() => {
    getCurrentUser()
      .then((user) => setLoggedIn(Boolean(user)))
      .catch(() => setLoggedIn(false))
  }, [])

  const target = loggedIn ? '/dashboard' : '/login'

  function handleStart() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      navigate(target)
      return
    }
    setPhase('leaving')
    setTimeout(() => setPhase('intro'), LEAVE_MS)
  }

  return (
    <div className={`app-dark landing phase-${phase}`} data-theme={theme}>
      <DecorLayer variant="auth" grow />
      <FallingLeaves />
      <Grass />

      <button
        type="button"
        className="theme-toggle landing-theme"
        onClick={toggleTheme}
        title={theme === 'light' ? 'Dunkles Design' : 'Helles Design'}
      >
        {theme === 'light' ? <Moon size={17} strokeWidth={1.75} /> : <Sun size={17} strokeWidth={1.75} />}
      </button>

      <main className="landing-hero">
        <div className="brand landing-brand">
          <BrandIcon />
          TaskFlow
        </div>

        <h1 className="landing-title">
          Deine Aufgaben.
          <br />
          <span>In Ruhe wachsen lassen.</span>
        </h1>

        <p className="landing-text">
          TaskFlow ist dein ruhiges Kanban-Board: Aufgaben anlegen, verschieben,
          erledigen – und dabei den Überblick behalten.
        </p>

        <button type="button" className="landing-cta" onClick={handleStart} disabled={phase !== 'idle'}>
          <span className="cta-sprout" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path className="cta-stem" d="M12 24 C 12 19, 11.5 15, 12 10" />
              <path className="cta-leaf" d="M12 16 C 8 16, 5 13.5, 4.5 10 C 8 10, 11.5 12, 12 16 Z" />
              <path className="cta-leaf" d="M12 13 C 15.5 13, 19 10.5, 19.5 7 C 16 7, 12.5 9, 12 13 Z" />
            </svg>
          </span>
          {loggedIn ? 'Zum Board' : 'Loslegen'}
          <ArrowRight size={18} strokeWidth={2} />
        </button>

        {!loggedIn && (
          <p className="landing-note">
            Noch kein Konto? <Link to="/signup">Registrieren</Link>
          </p>
        )}
      </main>

      {phase === 'intro' && (
        <IntroSplash onDone={() => navigate(target)} onSkip={() => navigate(target)} />
      )}
    </div>
  )
}

export default LandingPage
