import { Check, Moon, Sun } from 'lucide-react'
import { useTheme } from '../tasks/useTheme'
import DecorLayer from '../../components/decor/DecorLayer'

/**
 * Gemeinsamer Rahmen für Login und Registrierung:
 * Theme, Dekor, Logo und Theme-Umschalter.
 * Das Samen-Intro läuft vorher auf der Startseite.
 */
function AuthLayout({ ariaLabel, children }) {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="app-dark auth-page" data-theme={theme}>
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
