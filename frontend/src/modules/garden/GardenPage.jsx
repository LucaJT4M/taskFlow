import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Flame, Trees } from 'lucide-react'
import Sidebar from '../tasks/Sidebar'
import { useTheme } from '../tasks/useTheme'
import { useCurrentUser } from '../tasks/useCurrentUser'
import { logout } from '../../services/authService'
import DecorLayer from '../../components/decor/DecorLayer'
import GardenScene from './GardenScene'
import CurrentPlantCard from './CurrentPlantCard'
import { useGarden } from './useGarden'

function GardenPage() {
  const { garden, error } = useGarden()
  const { theme, toggleTheme } = useTheme()
  const user = useCurrentUser()
  const navigate = useNavigate()


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
              <p className="eyebrow">Belohnungen</p>
              <h1>Mein Garten</h1>
              <p className="subtitle">Jede erledigte Aufgabe lässt deinen Garten wachsen.</p>
            </div>
          </header>

          {error && <p className="error">Fehler: {error}</p>}

          {!garden ? (
            <p className="empty">Garten wird geladen …</p>
          ) : (
            <>
              <div className="garden-stats">
                <div className="stat">
                  <CheckCircle2 size={18} strokeWidth={1.75} />
                  <strong>{garden.total_completed}</strong>
                  <span>Aufgaben erledigt</span>
                </div>
                <div className="stat">
                  <Trees size={18} strokeWidth={1.75} />
                  <strong>{garden.grown_plants}</strong>
                  <span>{garden.grown_plants === 1 ? 'Pflanze' : 'Pflanzen'} ausgewachsen</span>
                </div>
                <div className="stat">
                  <Flame size={18} strokeWidth={1.75} />
                  <strong>{garden.streak_days}</strong>
                  <span>{garden.streak_days === 1 ? 'Tag' : 'Tage'} in Folge</span>
                </div>
              </div>

              <GardenScene garden={garden} theme={theme} />
              <CurrentPlantCard garden={garden} />
            </>
          )}
        </div>
      </main>
    </div>
  )
}

export default GardenPage
