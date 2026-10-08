import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import Sidebar from '../tasks/Sidebar'
import { useTheme } from '../tasks/useTheme'
import { useCurrentUser } from '../tasks/useCurrentUser'
import { logout } from '../../services/authService'
import DecorLayer from '../../components/decor/DecorLayer'
import Sprout from '../../components/decor/Sprout'
import HistoryEntry from './HistoryEntry'
import { useHistory } from './useHistory'
import { groupByDay } from './historyDates'
import './history.css'

function HistoryPage() {
  const { entries, error } = useHistory()
  const { theme, toggleTheme } = useTheme()
  const user = useCurrentUser()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')


  function handleLogout() {
    logout()
    navigate('/')
  }

  const search = query.trim().toLowerCase()
  const filtered = (entries ?? []).filter(
    (e) => !search || `${e.title} ${e.description ?? ''}`.toLowerCase().includes(search),
  )
  const groups = groupByDay(filtered)

  return (
    <div className="app-dark app-layout" data-theme={theme}>
      <DecorLayer variant="app" />
      <Sidebar
        username={user?.username}
        isAdmin={user?.username === 'admin'}
        activePage="history"
        theme={theme}
        onToggleTheme={toggleTheme}
        onLogout={handleLogout}
      />

      <main className="app-main">
        <div className="tasks-page history-page">
          <header className="tasks-header">
            <div>
              <p className="eyebrow">Verlauf</p>
              <h1>Gelöschte Aufgaben</h1>
              <p className="subtitle">
                {entries
                  ? `${entries.length} ${entries.length === 1 ? 'Eintrag' : 'Einträge'}`
                  : 'Wird geladen …'}
              </p>
            </div>
            {entries?.length > 0 && (
              <label className="history-search">
                <Search size={15} strokeWidth={1.75} />
                <input
                  placeholder="Im Verlauf suchen"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
            )}
          </header>

          {error && <p className="error">Fehler: {error}</p>}

          {entries && entries.length === 0 && (
            <div className="empty">
              <Sprout />
              Noch nichts gelöscht – gelöschte Aufgaben erscheinen hier.
            </div>
          )}

          {entries && entries.length > 0 && groups.length === 0 && (
            <p className="empty">Keine Treffer für „{query}“.</p>
          )}

          {groups.map((group) => (
            <section key={group.label} className="history-group">
              <h2 className="history-day">{group.label}</h2>
              <ul className="history-timeline">
                {group.items.map((entry) => <HistoryEntry key={entry.id} entry={entry} />)}
              </ul>
            </section>
          ))}
        </div>
      </main>
    </div>
  )
}

export default HistoryPage
