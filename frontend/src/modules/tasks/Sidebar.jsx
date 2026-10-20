import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  LayoutDashboard, CalendarDays, Users, Sprout, History, Shield,
  Moon, Sun, LogOut, PanelLeftClose, PanelLeftOpen, Languages,
} from 'lucide-react'
import { t, toggleLang } from '../../i18n'
import BrandIcon from '../../components/BrandIcon'

// Hauptseiten der App (Filter wie "To Do" sind jetzt direkt auf dem Dashboard)
const PAGES = [
  { key: 'tasks', to: '/dashboard', icon: LayoutDashboard },
  { key: 'calendar', to: '/calendar', icon: CalendarDays },
  { key: 'teams', to: '/teams', icon: Users },
  { key: 'garden', to: '/garden', icon: Sprout },
  { key: 'history', to: '/history', icon: History },
]

function Sidebar({ username, isAdmin, activePage = null, openCount, theme, onToggleTheme, onLogout }) {
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('sidebar') === 'collapsed')

  useEffect(() => {
    localStorage.setItem('sidebar', collapsed ? 'collapsed' : 'open')
  }, [collapsed])

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="brand">
          <BrandIcon />
          <span className="sidebar-label">TaskFlow</span>
        </div>
        <button
          className="icon-btn"
          onClick={() => setCollapsed((c) => !c)}
          title={collapsed ? t('sidebar.open') : t('sidebar.close')}
        >
          {collapsed ? <PanelLeftOpen size={17} strokeWidth={1.75} /> : <PanelLeftClose size={17} strokeWidth={1.75} />}
        </button>
      </div>

      <nav className="sidebar-nav">
        {PAGES.map(({ key, to, icon: Icon }) => {
          const label = t(`nav.${key}`)
          return (
          <Link
            key={key}
            to={to}
            className={`nav-item ${activePage === key ? 'active' : ''}`}
            title={collapsed ? label : undefined}
          >
            <Icon size={17} strokeWidth={1.75} />
            <span className="sidebar-label">{label}</span>
            {key === 'tasks' && openCount > 0 && (
              <span className="nav-count sidebar-label" title={t('sidebar.openTasks')}>{openCount}</span>
            )}
          </Link>
          )
        })}

        {isAdmin && (
          <Link to="/admin" className="nav-item" title={collapsed ? 'Admin' : undefined}>
            <Shield size={17} strokeWidth={1.75} />
            <span className="sidebar-label">Admin</span>
          </Link>
        )}
      </nav>

      <div className="sidebar-footer">
        <button className="nav-item" onClick={toggleLang} title={collapsed ? t('lang.title') : undefined}>
          <Languages size={17} strokeWidth={1.75} />
          <span className="sidebar-label">{t('lang.other')}</span>
        </button>

        <button
          className="nav-item"
          onClick={onToggleTheme}
          title={collapsed ? t('theme.switch') : undefined}
        >
          {theme === 'light' ? <Moon size={17} strokeWidth={1.75} /> : <Sun size={17} strokeWidth={1.75} />}
          <span className="sidebar-label">{theme === 'light' ? t('theme.dark') : t('theme.light')}</span>
        </button>

        <div className="user-row">
          <span className="avatar">{username ? username[0] : '?'}</span>
          <span className="user-name sidebar-label">{username || '…'}</span>
          <button className="icon-btn" onClick={onLogout} title={t('sidebar.logout')}>
            <LogOut size={16} strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar