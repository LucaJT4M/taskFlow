import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../tasks/useTheme'
import DecorLayer from '../../components/decor/DecorLayer'
import BrandIcon from '../../components/BrandIcon'
import { t } from '../../i18n'
import LanguageToggle from '../../i18n/LanguageToggle'

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
        title={theme === 'light' ? t('theme.dark') : t('theme.light')}
      >
        {theme === 'light' ? <Moon size={17} strokeWidth={1.75} /> : <Sun size={17} strokeWidth={1.75} />}
      </button>
      <LanguageToggle />

      <div className="brand auth-brand">
        <BrandIcon />
        TaskFlow
      </div>

      <section className="auth-shell" aria-label={ariaLabel}>
        {children}
      </section>
    </div>
  )
}

export default AuthLayout
