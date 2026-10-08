import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  LayoutDashboard, CalendarDays, Sprout, History, Shield,
  Moon, Sun, LogOut, PanelLeftClose, PanelLeftOpen,
} from 'lucide-react'
import BrandIcon from '../../components/BrandIcon'

// Hauptseiten der App (Filter wie "To Do" sind jetzt direkt auf dem Dashboard)
const PAGES = [
  { key: 'tasks', to: '/dashboard', label: 'Aufgaben', icon: LayoutDashboard },
  { key: 'calendar', to: '/calendar', label: 'Kalender', icon: CalendarDays },
  { key: 'garden', to: '/garden', label: 'Mein Garten', icon: Sprout },
  { key: 'history', to: '/history', label: 'Verlauf', icon: History },
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
          title={collapsed ? 'Seitenleiste öffnen' : 'Seitenleiste schließen'}
        >
          {collapsed ? <PanelLeftOpen size={17} strokeWidth={1.75} /> : <PanelLeftClose size={17} strokeWidth={1.75} />}
        </button>
      </div>

      <nav className="sidebar-nav">
        {PAGES.map(({ key, to, label, icon: Icon }) => (
          <Link
            key={key}
            to={to}
            className={`nav-item ${activePage === key ? 'active' : ''}`}
            title={collapsed ? label : undefined}
          >
            <Icon size={17} strokeWidth={1.75} />
            <span className="sidebar-label">{label}</span>
            {key === 'tasks' && openCount > 0 && (
              <span className="nav-count sidebar-label" title="Offene Aufgaben">{openCount}</span>
            )}
          </Link>
        ))}

        {isAdmin && (
          <Link to="/admin" className="nav-item" title={collapsed ? 'Admin' : undefined}>
            <Shield size={17} strokeWidth={1.75} />
            <span className="sidebar-label">Admin</span>
          </Link>
        )}
      </nav>

      <div className="sidebar-footer">
        <button
          className="nav-item"
          onClick={onToggleTheme}
          title={collapsed ? 'Design wechseln' : undefined}
        >
          {theme === 'light' ? <Moon size={17} strokeWidth={1.75} /> : <Sun size={17} strokeWidth={1.75} />}
          <span className="sidebar-label">{theme === 'light' ? 'Dunkles Design' : 'Helles Design'}</span>
        </button>

        <div className="user-row">
          <span className="avatar">{username ? username[0] : '?'}</span>
          <span className="user-name sidebar-label">{username || '…'}</span>
          <button className="icon-btn" onClick={onLogout} title="Abmelden">
            <LogOut size={16} strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar