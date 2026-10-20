import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { CheckCircle2, Flame, Trees, Sparkles } from 'lucide-react'
import Sidebar from '../tasks/Sidebar'
import { useTheme } from '../tasks/useTheme'
import { useCurrentUser } from '../tasks/useCurrentUser'
import { logout } from '../../services/authService'
import DecorLayer from '../../components/decor/DecorLayer'
import GardenScene from './GardenScene'
import CurrentPlantCard from './CurrentPlantCard'
import { useGarden } from './useGarden'
import CloudTransition from './world/CloudTransition'
import { t } from '../../i18n'

function GardenPage() {
  const { garden, error } = useGarden()
  const { theme, toggleTheme } = useTheme()
  const user = useCurrentUser()
  const navigate = useNavigate()
  const location = useLocation()
  // Wolken: "cover" beim Betreten der Gartenwelt, "reveal" beim Zurückkommen
  const [clouds, setClouds] = useState(location.state?.fromWorld ? 'reveal' : null)


  function handleLogout() {
    logout()
    navigate('/')
  }


  return (
    <div className="app-dark app-layout" data-theme={theme}>
      <DecorLayer variant="app" />
      <Sidebar
        username={user?.username}
        isAdmin={user?.role === 'admin'}
        activePage="garden"
        theme={theme}
        onToggleTheme={toggleTheme}
        onLogout={handleLogout}
      />

      <main className="app-main">
        <div className="tasks-page garden-page">
          <header className="tasks-header">
            <div>
              <p className="eyebrow">{t('garden.eyebrow')}</p>
              <h1>{t('garden.title')}</h1>
              <p className="subtitle">{t('garden.subtitle')}</p>
            </div>
            <button type="button" className="enter-world" onClick={() => setClouds('cover')}>
              <Sparkles size={16} strokeWidth={2} />
              {t('garden.enter')}
            </button>
          </header>

          {error && <p className="error">{t('common.error', { msg: error })}</p>}

          {!garden ? (
            <p className="empty">{t('garden.loading')}</p>
          ) : (
            <>
              <div className="garden-stats">
                <div className="stat">
                  <CheckCircle2 size={18} strokeWidth={1.75} />
                  <strong>{garden.total_completed}</strong>
                  <span>{t('garden.statDone', { n: garden.total_completed })}</span>
                </div>
                <div className="stat">
                  <Trees size={18} strokeWidth={1.75} />
                  <strong>{garden.grown_plants}</strong>
                  <span>{t('garden.statPlants', { n: garden.grown_plants })}</span>
                </div>
                <div className="stat">
                  <Flame size={18} strokeWidth={1.75} />
                  <strong>{garden.streak_days}</strong>
                  <span>{t('garden.statStreak', { n: garden.streak_days })}</span>
                </div>
              </div>

              <GardenScene garden={garden} theme={theme} />
              <CurrentPlantCard garden={garden} />
            </>
          )}
        </div>
      </main>

      {clouds === 'cover' && <CloudTransition mode="cover" onDone={() => navigate('/garden/world')} />}
      {clouds === 'reveal' && (
        <CloudTransition
          mode="reveal"
          onDone={() => {
            setClouds(null)
            navigate(location.pathname, { replace: true, state: null })
          }}
        />
      )}
    </div>
  )
}

export default GardenPage
