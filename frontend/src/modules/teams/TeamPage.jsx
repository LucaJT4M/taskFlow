import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Crown, Kanban, LayoutList, LogOut, MoreHorizontal, Pencil, Trash2, UserPlus, X } from 'lucide-react'
import Sidebar from '../tasks/Sidebar'
import KanbanBoard from '../tasks/KanbanBoard'
import TaskList from '../tasks/TaskList'
import TaskForm from '../tasks/TaskForm'
import { useTheme } from '../tasks/useTheme'
import { useCurrentUser } from '../tasks/useCurrentUser'
import { logout } from '../../services/authService'
import DecorLayer from '../../components/decor/DecorLayer'
import Sprout from '../../components/decor/Sprout'
import MemberAvatar from './MemberAvatar'
import InvitePanel from './InvitePanel'
import { useTeam } from './useTeam'
import './teams.css'

const FILTERS = [
  { key: 'all', label: 'Alle' },
  { key: 'mine', label: 'Mir zugewiesen' },
  { key: 'open', label: 'Nicht zugewiesen' },
]

/** Hook: Popover schließen bei Klick daneben oder Escape */
function useDismiss(open, setOpen) {
  const ref = useRef(null)
  useEffect(() => {
    if (!open) return
    const close = (e) => { if (!ref.current?.contains(e.target)) setOpen(false) }
    const esc = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', close)
    document.addEventListener('keydown', esc)
    return () => { document.removeEventListener('pointerdown', close); document.removeEventListener('keydown', esc) }
  }, [open, setOpen])
  return ref
}

function TeamPage() {
  const { teamId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const user = useCurrentUser()
  const t = useTeam(teamId)
  const { team, tasks } = t

  const [view, setView] = useState('board')
  const [filter, setFilter] = useState('all')
  const [inviteOpen, setInviteOpen] = useState(!!location.state?.justCreated)
  const [menuOpen, setMenuOpen] = useState(false)
  const [confirm, setConfirm] = useState(null) // 'leave' | 'delete'
  const [renaming, setRenaming] = useState(false)
  const [newName, setNewName] = useState('')
  const inviteRef = useDismiss(inviteOpen, setInviteOpen)
  const menuRef = useDismiss(menuOpen, (v) => { setMenuOpen(v); if (!v) setConfirm(null) })

  // "gerade erstellt" nur einmal auswerten – beim Neuladen soll die Einladung nicht wieder aufgehen
  useEffect(() => {
    if (location.state?.justCreated) navigate(location.pathname, { replace: true, state: null })
  }, [location, navigate])

  if (t.notFound) {
    return (
      <Shell theme={theme} toggleTheme={toggleTheme} user={user} navigate={navigate}>
        <div className="empty">
          <Sprout />
          Dieses Team gibt es nicht (mehr) oder du bist kein Mitglied.
          <Link to="/teams" className="link-btn">Zu meinen Teams</Link>
        </div>
      </Shell>
    )
  }

  const me = team?.members.find((m) => m.username === user?.username)
  const isOwner = team?.my_role === 'owner'
  const open = tasks.filter((x) => x.status !== 'done').length
  const counts = {
    all: tasks.length,
    mine: tasks.filter((x) => me && x.assignee_id === me.user_id).length,
    open: tasks.filter((x) => !x.assignee_id).length,
  }
  const visible = tasks.filter((x) =>
    filter === 'mine' ? me && x.assignee_id === me.user_id : filter === 'open' ? !x.assignee_id : true,
  )
  const openByMember = (id) => tasks.filter((x) => x.assignee_id === id && x.status !== 'done').length

  async function handleLeave() {
    if (await t.leave(me.user_id)) navigate('/teams')
  }
  async function handleDelete() {
    if (await t.deleteTeam()) navigate('/teams')
  }
  async function handleRename(e) {
    e.preventDefault()
    if (newName.trim() && newName.trim() !== team.name) await t.rename(newName.trim())
    setRenaming(false)
  }

  return (
    <Shell theme={theme} toggleTheme={toggleTheme} user={user} navigate={navigate}>
      <Link to="/teams" className="back-link"><ArrowLeft size={14} strokeWidth={2} /> Alle Teams</Link>

      <header className="tasks-header team-header">
        <div>
          <p className="eyebrow">Team</p>
          {renaming ? (
            <form onSubmit={handleRename} className="rename-form">
              <input
                autoFocus
                maxLength={60}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Escape' && setRenaming(false)}
                onBlur={handleRename}
              />
            </form>
          ) : (
            <h1>{team?.name ?? '…'}</h1>
          )}
          <p className="subtitle">
            {team
              ? `${team.members.length} ${team.members.length === 1 ? 'Mitglied' : 'Mitglieder'} · ${open} offen · ${tasks.length - open} erledigt`
              : 'Wird geladen …'}
          </p>
        </div>

        {team && (
          <div className="header-actions">
            <div className="popover-anchor" ref={inviteRef}>
              <button className="btn-invite" onClick={() => setInviteOpen((o) => !o)} aria-expanded={inviteOpen}>
                <UserPlus size={16} strokeWidth={1.75} /> Einladen
              </button>
              {inviteOpen && (
                <div className="popover">
                  <InvitePanel team={team} isOwner={isOwner} onNewCode={t.newCode} />
                </div>
              )}
            </div>

            <div className="popover-anchor" ref={menuRef}>
              <button className="icon-btn big" title="Team-Einstellungen" onClick={() => setMenuOpen((o) => !o)}>
                <MoreHorizontal size={18} strokeWidth={1.75} />
              </button>
              {menuOpen && (
                <div className="popover menu">
                  {isOwner && (
                    <button onClick={() => { setNewName(team.name); setRenaming(true); setMenuOpen(false) }}>
                      <Pencil size={15} strokeWidth={1.75} /> Umbenennen
                    </button>
                  )}
                  {confirm === 'leave' ? (
                    <button className="danger confirm" onClick={handleLeave}>
                      <LogOut size={15} strokeWidth={1.75} /> Wirklich verlassen?
                    </button>
                  ) : (
                    <button onClick={() => setConfirm('leave')}>
                      <LogOut size={15} strokeWidth={1.75} /> Team verlassen
                    </button>
                  )}
                  {isOwner && (confirm === 'delete' ? (
                    <button className="danger confirm" onClick={handleDelete}>
                      <Trash2 size={15} strokeWidth={1.75} /> Endgültig löschen?
                    </button>
                  ) : (
                    <button className="danger" onClick={() => setConfirm('delete')}>
                      <Trash2 size={15} strokeWidth={1.75} /> Team löschen
                    </button>
                  ))}
                  {confirm && (
                    <p className="menu-hint">
                      {confirm === 'delete'
                        ? 'Alle Team-Aufgaben werden gelöscht. Dein Garten bleibt.'
                        : isOwner && team.members.length > 1
                          ? 'Das Team geht an das Mitglied, das am längsten dabei ist.'
                          : team.members.length === 1 ? 'Du bist das letzte Mitglied – das Team wird gelöscht.' : 'Deine Aufgaben werden niemandem mehr zugewiesen.'}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {t.error && <p className="error">Fehler: {t.error}</p>}

      {team && (
        <>
          <ul className="member-strip">
            {team.members.map((m) => (
              <li key={m.user_id} className={`member-chip ${m.user_id === me?.user_id ? 'me' : ''}`}>
                <MemberAvatar name={m.username} size={30} />
                <span className="member-info">
                  <span className="member-name">
                    {m.username}
                    {m.user_id === me?.user_id && <span className="you"> (du)</span>}
                    {m.role === 'owner' && <Crown size={12} strokeWidth={2} className="crown" aria-label="Besitzer" />}
                  </span>
                  <span className="member-load">{openByMember(m.user_id)} offen</span>
                </span>
                {isOwner && m.user_id !== me?.user_id && (
                  <button className="member-remove" title={`${m.username} entfernen`} onClick={() => t.removeMember(m.user_id)}>
                    <X size={13} strokeWidth={2} />
                  </button>
                )}
              </li>
            ))}
            {team.members.length === 1 && (
              <li className="member-chip invite-hint" onClick={() => setInviteOpen(true)}>
                <UserPlus size={16} strokeWidth={1.75} /> Lade jemanden ein
              </li>
            )}
          </ul>

          <TaskForm onCreate={t.addTask} members={team.members} />

          <div className="task-toolbar">
            <div className="filter-tabs" role="tablist" aria-label="Aufgaben filtern">
              {FILTERS.map(({ key, label }) => (
                <button
                  key={key}
                  role="tab"
                  aria-selected={filter === key}
                  className={`filter-tab ${filter === key ? 'active' : ''}`}
                  onClick={() => setFilter(key)}
                >
                  {label}
                  <span className="filter-count">{counts[key]}</span>
                </button>
              ))}
            </div>
            <div className="view-switch">
              <button className={view === 'list' ? 'active' : ''} onClick={() => setView('list')}>
                <LayoutList size={15} strokeWidth={1.75} /> Liste
              </button>
              <button className={view === 'board' ? 'active' : ''} onClick={() => setView('board')}>
                <Kanban size={15} strokeWidth={1.75} /> Board
              </button>
            </div>
          </div>

          {view === 'board'
            ? <KanbanBoard tasks={visible} onUpdate={t.editTask} onDelete={t.removeTask} members={team.members} />
            : <TaskList tasks={visible} onUpdate={t.editTask} onDelete={t.removeTask} members={team.members} />}
        </>
      )}
    </Shell>
  )
}

/** Gemeinsamer Rahmen mit Seitenleiste */
function Shell({ theme, toggleTheme, user, navigate, children }) {
  return (
    <div className="app-dark app-layout" data-theme={theme}>
      <DecorLayer variant="app" />
      <Sidebar
        username={user?.username}
        isAdmin={user?.role === 'admin'}
        activePage="teams"
        theme={theme}
        onToggleTheme={toggleTheme}
        onLogout={() => { logout(); navigate('/') }}
      />
      <main className="app-main">
        <div className="tasks-page team-page">{children}</div>
      </main>
    </div>
  )
}

export default TeamPage
