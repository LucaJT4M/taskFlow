import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Crown, Kanban, LayoutList, LogOut, MoreHorizontal, Pencil, Trash2, UserPlus, X } from 'lucide-react'
import Sidebar from '../tasks/Sidebar'
import KanbanBoard from '../tasks/KanbanBoard'
import TaskList from '../tasks/TaskList'
import TaskForm from '../tasks/TaskForm'
import UndoToast from '../tasks/UndoToast'
import { useUndoDelete } from '../tasks/useUndoDelete'
import { useTheme } from '../tasks/useTheme'
import { useCurrentUser } from '../tasks/useCurrentUser'
import { logout } from '../../services/authService'
import DecorLayer from '../../components/decor/DecorLayer'
import Sprout from '../../components/decor/Sprout'
import MemberAvatar from './MemberAvatar'
import InvitePanel from './InvitePanel'
import { useTeam } from './useTeam'
import './teams.css'
import { t } from '../../i18n'

const FILTERS = [
  { key: 'all', labelKey: 'filter.all' },
  { key: 'mine', labelKey: 'team.filterMine' },
  { key: 'open', labelKey: 'team.filterOpen' },
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
  const tm = useTeam(teamId)
  const { team } = tm
  const deletion = useUndoDelete(tm.removeTask, `taskflow-pending-delete-team-${teamId}`)
  const tasks = tm.tasks.filter((x) => !deletion.isHidden(x))

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

  if (tm.notFound) {
    return (
      <Shell theme={theme} toggleTheme={toggleTheme} user={user} navigate={navigate}>
        <div className="empty">
          <Sprout />
          {t('team.notFound')}
          <Link to="/teams" className="link-btn">{t('team.toTeams')}</Link>
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
    if (await tm.leave(me.user_id)) navigate('/teams')
  }
  async function handleDelete() {
    if (await tm.deleteTeam()) navigate('/teams')
  }
  async function handleRename(e) {
    e.preventDefault()
    if (newName.trim() && newName.trim() !== team.name) await tm.rename(newName.trim())
    setRenaming(false)
  }

  return (
    <Shell theme={theme} toggleTheme={toggleTheme} user={user} navigate={navigate}>
      <Link to="/teams" className="back-link"><ArrowLeft size={14} strokeWidth={2} /> {t('team.allTeams')}</Link>

      <header className="tasks-header team-header">
        <div>
          <p className="eyebrow">{t('team.eyebrow')}</p>
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
              ? t('team.summary', { members: team.members.length, open, done: tasks.length - open })
              : t('common.loading')}
          </p>
        </div>

        {team && (
          <div className="header-actions">
            <div className="popover-anchor" ref={inviteRef}>
              <button className="btn-invite" onClick={() => setInviteOpen((o) => !o)} aria-expanded={inviteOpen}>
                <UserPlus size={16} strokeWidth={1.75} /> {t('team.invite')}
              </button>
              {inviteOpen && (
                <div className="popover">
                  <InvitePanel team={team} isOwner={isOwner} onNewCode={tm.newCode} />
                </div>
              )}
            </div>

            <div className="popover-anchor" ref={menuRef}>
              <button className="icon-btn big" title={t('team.settings')} onClick={() => setMenuOpen((o) => !o)}>
                <MoreHorizontal size={18} strokeWidth={1.75} />
              </button>
              {menuOpen && (
                <div className="popover menu">
                  {isOwner && (
                    <button onClick={() => { setNewName(team.name); setRenaming(true); setMenuOpen(false) }}>
                      <Pencil size={15} strokeWidth={1.75} /> {t('team.rename')}
                    </button>
                  )}
                  {confirm === 'leave' ? (
                    <button className="danger confirm" onClick={handleLeave}>
                      <LogOut size={15} strokeWidth={1.75} /> {t('team.leaveConfirm')}
                    </button>
                  ) : (
                    <button onClick={() => setConfirm('leave')}>
                      <LogOut size={15} strokeWidth={1.75} /> {t('team.leave')}
                    </button>
                  )}
                  {isOwner && (confirm === 'delete' ? (
                    <button className="danger confirm" onClick={handleDelete}>
                      <Trash2 size={15} strokeWidth={1.75} /> {t('team.deleteConfirm')}
                    </button>
                  ) : (
                    <button className="danger" onClick={() => setConfirm('delete')}>
                      <Trash2 size={15} strokeWidth={1.75} /> {t('team.delete')}
                    </button>
                  ))}
                  {confirm && (
                    <p className="menu-hint">
                      {confirm === 'delete'
                        ? t('team.hintDelete')
                        : isOwner && team.members.length > 1
                          ? t('team.hintOwnerLeave')
                          : team.members.length === 1 ? t('team.hintLast') : t('team.hintLeave')}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {tm.error && <p className="error">{t('common.error', { msg: tm.error })}</p>}

      {team && (
        <>
          <ul className="member-strip">
            {team.members.map((m) => (
              <li key={m.user_id} className={`member-chip ${m.user_id === me?.user_id ? 'me' : ''}`}>
                <MemberAvatar name={m.username} size={30} />
                <span className="member-info">
                  <span className="member-name">
                    {m.username}
                    {m.user_id === me?.user_id && <span className="you"> {t('team.you')}</span>}
                    {m.role === 'owner' && <Crown size={12} strokeWidth={2} className="crown" aria-label={t('teams.owner')} />}
                  </span>
                  <span className="member-load">{t('teams.open', { n: openByMember(m.user_id) })}</span>
                </span>
                {isOwner && m.user_id !== me?.user_id && (
                  <button className="member-remove" title={t('team.remove', { name: m.username })} onClick={() => tm.removeMember(m.user_id)}>
                    <X size={13} strokeWidth={2} />
                  </button>
                )}
              </li>
            ))}
            {team.members.length === 1 && (
              <li className="member-chip invite-hint" onClick={() => setInviteOpen(true)}>
                <UserPlus size={16} strokeWidth={1.75} /> {t('team.inviteHint')}
              </li>
            )}
          </ul>

          <TaskForm onCreate={tm.addTask} members={team.members} />

          <div className="task-toolbar">
            <div className="filter-tabs" role="tablist" aria-label={t('tasks.filterAria')}>
              {FILTERS.map(({ key, labelKey }) => (
                <button
                  key={key}
                  role="tab"
                  aria-selected={filter === key}
                  className={`filter-tab ${filter === key ? 'active' : ''}`}
                  onClick={() => setFilter(key)}
                >
                  {t(labelKey)}
                  <span className="filter-count">{counts[key]}</span>
                </button>
              ))}
            </div>
            <div className="view-switch">
              <button className={view === 'list' ? 'active' : ''} onClick={() => setView('list')}>
                <LayoutList size={15} strokeWidth={1.75} /> {t('view.list')}
              </button>
              <button className={view === 'board' ? 'active' : ''} onClick={() => setView('board')}>
                <Kanban size={15} strokeWidth={1.75} /> {t('view.board')}
              </button>
            </div>
          </div>

          {view === 'board'
            ? <KanbanBoard tasks={visible} onUpdate={tm.editTask} onDelete={deletion.requestDelete} onCreate={tm.addTask} members={team.members} />
            : <TaskList tasks={visible} onUpdate={tm.editTask} onDelete={deletion.requestDelete} members={team.members} />}
        </>
      )}
      <UndoToast key={deletion.last?.id} task={deletion.last} onUndo={deletion.undo} />
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
