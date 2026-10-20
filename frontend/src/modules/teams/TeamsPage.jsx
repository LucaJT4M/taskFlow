import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRight, Crown, KeyRound, Plus, Users } from 'lucide-react'
import Sidebar from '../tasks/Sidebar'
import { useTheme } from '../tasks/useTheme'
import { useCurrentUser } from '../tasks/useCurrentUser'
import { logout } from '../../services/authService'
import DecorLayer from '../../components/decor/DecorLayer'
import Sprout from '../../components/decor/Sprout'
import { createTeam, getTeams, joinTeam } from './teamsApi'
import './teams.css'

/** Übersicht: eigene Teams, neues Team erstellen, mit Code beitreten */
function TeamsPage() {
  const { theme, toggleTheme } = useTheme()
  const user = useCurrentUser()
  const navigate = useNavigate()
  const [params] = useSearchParams()

  const [teams, setTeams] = useState(null)
  const [error, setError] = useState(null)
  const [name, setName] = useState('')
  const [code, setCode] = useState(params.get('join') ?? '') // Einladungslink: /teams?join=CODE
  const [busy, setBusy] = useState(null)

  useEffect(() => {
    getTeams().then(setTeams).catch((err) => setError(err.message))
  }, [])

  async function handleCreate(e) {
    e.preventDefault()
    if (!name.trim()) return
    setBusy('create')
    try {
      const team = await createTeam(name.trim())
      navigate(`/teams/${team.id}`, { state: { justCreated: true } })
    } catch (err) {
      setError(err.message)
      setBusy(null)
    }
  }

  async function handleJoin(e) {
    e.preventDefault()
    if (!code.trim()) return
    setBusy('join')
    try {
      const team = await joinTeam(code.trim())
      navigate(`/teams/${team.id}`)
    } catch (err) {
      setError(err.message)
      setBusy(null)
    }
  }

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
        activePage="teams"
        theme={theme}
        onToggleTheme={toggleTheme}
        onLogout={handleLogout}
      />

      <main className="app-main">
        <div className="tasks-page teams-page">
          <header className="tasks-header">
            <div>
              <p className="eyebrow">Teams</p>
              <h1>Gemeinsam arbeiten</h1>
              <p className="subtitle">
                {teams ? `${teams.length} ${teams.length === 1 ? 'Team' : 'Teams'}` : 'Wird geladen …'}
                {' · '}Aufgaben teilen, verteilen und zusammen erledigen
              </p>
            </div>
          </header>

          {error && <p className="error">Fehler: {error}</p>}

          <div className="team-actions">
            <form className="team-action-card" onSubmit={handleCreate}>
              <div className="team-action-icon"><Plus size={18} strokeWidth={1.75} /></div>
              <div className="team-action-body">
                <h2>Neues Team</h2>
                <p>Du wirst Besitzer und kannst andere einladen.</p>
                <div className="inline-field">
                  <input
                    placeholder="z. B. Projekt LF10"
                    maxLength={60}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <button type="submit" disabled={!name.trim() || busy}>Erstellen</button>
                </div>
              </div>
            </form>

            <form className="team-action-card" onSubmit={handleJoin}>
              <div className="team-action-icon"><KeyRound size={18} strokeWidth={1.75} /></div>
              <div className="team-action-body">
                <h2>Team beitreten</h2>
                <p>Mit dem Einladungscode aus deinem Team.</p>
                <div className="inline-field">
                  <input
                    className="code-input"
                    placeholder="ABCD-1234"
                    maxLength={20}
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    autoFocus={!!params.get('join')}
                  />
                  <button type="submit" disabled={!code.trim() || busy}>Beitreten</button>
                </div>
              </div>
            </form>
          </div>

          {teams && teams.length === 0 && (
            <div className="empty">
              <Sprout />
              Du bist noch in keinem Team – erstelle eins oder tritt mit einem Code bei.
            </div>
          )}

          {teams?.length > 0 && (
            <section className="team-grid">
              {teams.map((team) => (
                <Link key={team.id} to={`/teams/${team.id}`} className="team-card">
                  <div className="team-card-top">
                    <span className="team-badge" style={{ '--hue': (team.id * 67) % 360 }}>
                      {team.name[0]}
                    </span>
                    {team.my_role === 'owner' && (
                      <span className="role-pill"><Crown size={12} strokeWidth={2} /> Besitzer</span>
                    )}
                  </div>
                  <h3>{team.name}</h3>
                  <div className="team-card-meta">
                    <span><Users size={14} strokeWidth={1.75} /> {team.member_count} {team.member_count === 1 ? 'Mitglied' : 'Mitglieder'}</span>
                    <span>{team.open_tasks} offen</span>
                  </div>
                  <ArrowRight className="team-card-arrow" size={16} strokeWidth={1.75} />
                </Link>
              ))}
            </section>
          )}
        </div>
      </main>
    </div>
  )
}

export default TeamsPage
