import { t, toggleLang } from './index'

/** Runder Knopf "EN" / "DE" (Startseite, Login) – zeigt die Sprache, zu der man wechselt */
function LanguageToggle({ className = '' }) {
  return (
    <button type="button" className={`theme-toggle lang-toggle ${className}`} onClick={toggleLang} title={t('lang.title')}>
      {t('lang.short')}
    </button>
  )
}

export default LanguageToggle
