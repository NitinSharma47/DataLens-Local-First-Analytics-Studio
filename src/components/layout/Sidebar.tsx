import { NavLink } from 'react-router-dom';
import {
  BarChart3, Bookmark, ChevronLeft, ChevronRight, CircleHelp, Database, LayoutDashboard,
  PanelTop, Settings, Table2, X,
} from 'lucide-react';
import { useAppStore } from '../../store/app-store';
import './Sidebar.css';

const NAV_ITEMS = [
  { path: '/', label: 'Overview', icon: LayoutDashboard, end: true },
  { path: '/explore', label: 'Data Explorer', icon: Table2 },
  { path: '/charts', label: 'Chart Builder', icon: BarChart3 },
  { path: '/dashboards', label: 'Dashboards', icon: PanelTop },
  { path: '/views', label: 'Saved Views', icon: Bookmark },
];

export default function Sidebar() {
  const collapsed = useAppStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useAppStore((state) => state.toggleSidebar);
  const mobileSidebarOpen = useAppStore((state) => state.mobileSidebarOpen);
  const setMobileSidebarOpen = useAppStore((state) => state.setMobileSidebarOpen);
  const activeDataset = useAppStore((state) => state.activeDataset);

  return (
    <>
      {mobileSidebarOpen && <button className="sidebar-overlay" aria-label="Close navigation" type="button" onClick={() => setMobileSidebarOpen(false)} />}
      <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''} ${mobileSidebarOpen ? 'sidebar--mobile-open' : ''}`} aria-label="Main navigation">
        <div className="sidebar-header">
          <NavLink to="/" className="sidebar-logo" aria-label="DataLens overview" onClick={() => setMobileSidebarOpen(false)}>
            <span className="sidebar-logo-icon"><Database size={19} /></span>
            {!collapsed && <span className="sidebar-logo-text">DataLens<span>DATA EXPLORATION</span></span>}
          </NavLink>
          <button className="sidebar-close-mobile" type="button" aria-label="Close navigation" onClick={() => setMobileSidebarOpen(false)}><X size={19} /></button>
        </div>

        {!collapsed && <div className="sidebar-workspace-label">WORKSPACE</div>}
        {activeDataset && !collapsed && <div className="sidebar-dataset"><span className="sidebar-dataset-dot" /><div className="sidebar-dataset-info"><strong>{activeDataset.name}</strong><span>{activeDataset.rowCount.toLocaleString()} records</span></div></div>}

        <nav className="sidebar-nav" aria-label="Workspace">
          <ul className="sidebar-nav-list">
            {NAV_ITEMS.map(({ path, label, icon: Icon, end }) => (
              <li key={path}><NavLink to={path} end={end} title={collapsed ? label : undefined} className={({ isActive }) => `sidebar-nav-link ${isActive ? 'sidebar-nav-link--active' : ''}`} onClick={() => setMobileSidebarOpen(false)}><Icon size={18} /><span>{label}</span></NavLink></li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-nav-list">
            <NavLink to="/settings" title={collapsed ? 'Settings' : undefined} className={({ isActive }) => `sidebar-nav-link ${isActive ? 'sidebar-nav-link--active' : ''}`} onClick={() => setMobileSidebarOpen(false)}><Settings size={18} /><span>Settings</span></NavLink>
            <NavLink to="/help" title={collapsed ? 'Help & shortcuts' : undefined} className={({ isActive }) => `sidebar-nav-link ${isActive ? 'sidebar-nav-link--active' : ''}`} onClick={() => setMobileSidebarOpen(false)}><CircleHelp size={18} /><span>Help & shortcuts</span></NavLink>
          </div>
          {!collapsed && <div className="sidebar-local-note"><span><span className="local-dot" /> LOCAL WORKSPACE</span><small>Your data stays on this device</small></div>}
          <button className="sidebar-toggle" type="button" aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} onClick={toggleSidebar}>{collapsed ? <ChevronRight size={16} /> : <><ChevronLeft size={16} /><span>Collapse sidebar</span></>}</button>
        </div>
      </aside>
    </>
  );
}
