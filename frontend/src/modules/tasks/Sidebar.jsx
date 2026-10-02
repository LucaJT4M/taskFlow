import { useEffect, useState } from 'react'
import {
  Check, ListTodo, Circle, CircleDot, CircleCheck,
  Moon, Sun, LogOut, PanelLeftClose, PanelLeftOpen,
} from 'lucide-react'

const NAV_ITEMS = [
  { key: 'all', label: 'Alle Aufgaben', icon: ListTodo },
  { key: 'todo', label: 'To Do', icon: Circle },
  { key: 'in_progress', label: 'In Arbeit', icon: CircleDot },
  { key: 'done', label: 'Erledigt', icon: CircleCheck },
]

function Sidebar({ filter, onFilterChange, counts, username, theme, onToggleTheme, onLogout }) {
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('sidebar') === 'collapsed')

  useEffect(() => {
    localStorage.setItem('sidebar', collapsed ? 'collapsed' : 'open')
  }, [collapsed])

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="brand">
          <span className="brand-mark"><Check size={15} strokeWidth={3} /></span>
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

      <p className="sidebar-section sidebar-label">Aufgaben</p>
      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            className={`nav-item ${filter === key ? 'active' : ''}`}
            onClick={() => onFilterChange(key)}
            title={collapsed ? label : undefined}
          >
            <Icon size={17} strokeWidth={1.75} />
            <span className="sidebar-label">{label}</span>
            <span className="nav-count sidebar-label">{counts[key]}</span>
          </button>
        ))}
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