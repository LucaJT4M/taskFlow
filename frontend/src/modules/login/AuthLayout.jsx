import { useEffect, useState } from 'react'
import { Check, Moon, Sun } from 'lucide-react'
import { useTheme } from '../tasks/useTheme'
import DecorLayer from '../../components/decor/DecorLayer'
import IntroSplash from '../../components/decor/IntroSplash'

const INTRO_KEY = 'taskflow-intro-shown'
const INTRO_SECONDS = 1.9

// Das große Intro nur einmal pro Browser-Sitzung zeigen
function shouldShowIntro() {
  try {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
    return sessionStorage.getItem(INTRO_KEY) !== '1'
  } catch {
    return false
  }
}

/**
 * Gemeinsamer Rahmen für Login und Registrierung:
 * Theme, Dekor, Intro, Logo und Theme-Umschalter.
 */
function AuthLayout({ ariaLabel, children }) {
  const { theme, toggleTheme } = useTheme()
  const [showIntro, setShowIntro] = useState(shouldShowIntro)
  const [enterDelay, setEnterDelay] = useState(showIntro ? INTRO_SECONDS : 0)

  // Merken, dass das Intro in dieser Sitzung schon lief
  useEffect(() => {
    try {
      sessionStorage.setItem(INTRO_KEY, '1')
    } catch {
      /* z. B. privater Modus – dann eben jedes Mal */
    }
  }, [])

  function handleSkip() {
    setShowIntro(false)
    setEnterDelay(0)
  }

  return (
    <div
      className="app-dark auth-page"
      data-theme={theme}
      style={{ '--enter-delay': `${enterDelay}s` }}
    >
      {showIntro && <IntroSplash onDone={() => setShowIntro(false)} onSkip={handleSkip} />}

      <DecorLayer variant="auth" grow />

      <button
        type="button"
        className="theme-toggle"
        onClick={toggleTheme}
        title={theme === 'light' ? 'Dunkles Design' : 'Helles Design'}
      >
        {theme === 'light' ? <Moon size={17} strokeWidth={1.75} /> : <Sun size={17} strokeWidth={1.75} />}
      </button>

      <div className="brand auth-brand">
        <span className="brand-mark"><Check size={15} strokeWidth={3} /></span>
        TaskFlow
      </div>

      <section className="auth-shell" aria-label={ariaLabel}>
        {children}
      </section>
    </div>
  )
}

export default AuthLayout
