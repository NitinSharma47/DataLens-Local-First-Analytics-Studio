import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BarChart3, Command, Database, LayoutDashboard, Menu, Moon, Search, Sun, Table2, X } from 'lucide-react';
import { useAppStore } from '../../store/app-store';
import './TopBar.css';

const ROUTE_TITLES: Record<string, string> = {
  '/': 'Overview',
  '/explore': 'Data Explorer',
  '/charts': 'Chart Builder',
  '/dashboards': 'Dashboards',
  '/views': 'Saved Views',
  '/settings': 'Settings',
  '/help': 'Help & Shortcuts',
};

const COMMANDS = [
  { label: 'Go to Overview', path: '/', icon: LayoutDashboard },
  { label: 'Go to Data Explorer', path: '/explore', icon: Table2 },
  { label: 'Go to Chart Builder', path: '/charts', icon: BarChart3 },
  { label: 'Go to Dashboards', path: '/dashboards', icon: LayoutDashboard },
];

export default function TopBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useAppStore((state) => state.theme);
  const setTheme = useAppStore((state) => state.setTheme);
  const setMobileSidebarOpen = useAppStore((state) => state.setMobileSidebarOpen);
  const activeDataset = useAppStore((state) => state.activeDataset);
  const loadSampleData = useAppStore((state) => state.loadSampleData);
  const [commandOpen, setCommandOpen] = useState(false);
  const [commandSearch, setCommandSearch] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const title = ROUTE_TITLES[location.pathname] ?? 'DataLens';
  const commands = useMemo(() => [
    ...COMMANDS,
    { label: 'Load sample dataset', action: () => loadSampleData(), icon: Database },
  ].filter((item) => item.label.toLowerCase().includes(commandSearch.toLowerCase())), [commandSearch, loadSampleData]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setCommandSearch('');
        setActiveIndex(0);
        setCommandOpen((open) => !open);
      }
      if (event.key === 'Escape') setCommandOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (commandOpen) inputRef.current?.focus();
  }, [commandOpen]);

  const runCommand = (item: typeof commands[number]) => {
    if ('action' in item && item.action) item.action();
    else if ('path' in item && item.path) navigate(item.path);
    setCommandOpen(false);
  };

  return (
    <>
      <header className="topbar">
        <div className="topbar-left">
          <button className="topbar-menu-btn" type="button" onClick={() => setMobileSidebarOpen(true)} aria-label="Open navigation"><Menu size={19} /></button>
          <div className="topbar-title-area"><span className="topbar-title">{title}</span>{activeDataset && <span className="topbar-dataset-badge"><Database size={12} /> {activeDataset.name}</span>}</div>
        </div>
        <div className="topbar-right">
          <button className="topbar-search-btn" type="button" onClick={() => { setCommandSearch(''); setActiveIndex(0); setCommandOpen(true); }} aria-label="Open command search">
            <Search size={15} /><span className="topbar-search-text">Quick search</span><kbd><Command size={10} /> K</kbd>
          </button>
          <div className="topbar-divider" />
          <span className="topbar-local-status"><span /> Local</span>
          <button className="topbar-icon-btn" type="button" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}>{theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}</button>
        </div>
      </header>

      {commandOpen && (
        <div className="command-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setCommandOpen(false); }}>
          <div className="command-palette" role="dialog" aria-modal="true" aria-label="Quick search">
            <div className="command-input-wrap"><Search size={17} /><input ref={inputRef} type="search" value={commandSearch} placeholder="Search pages and actions…" aria-label="Search pages and actions" onChange={(event) => setCommandSearch(event.target.value)} onKeyDown={(event) => {
              if (event.key === 'ArrowDown') { event.preventDefault(); setActiveIndex((index) => Math.min(index + 1, commands.length - 1)); }
              if (event.key === 'ArrowUp') { event.preventDefault(); setActiveIndex((index) => Math.max(index - 1, 0)); }
              if (event.key === 'Enter' && commands[activeIndex]) runCommand(commands[activeIndex]);
            }} /><button className="icon-button" type="button" aria-label="Close search" onClick={() => setCommandOpen(false)}><X size={15} /></button></div>
            <div className="command-section-label">QUICK ACTIONS</div>
            <div className="command-results" role="listbox" aria-label="Search results">
              {commands.map((item, index) => <button key={item.label} type="button" role="option" aria-selected={index === activeIndex} className={`command-result-item ${index === activeIndex ? 'command-result-item--active' : ''}`} onMouseEnter={() => setActiveIndex(index)} onClick={() => runCommand(item)}><item.icon size={16} /><span>{item.label}</span><kbd>↵</kbd></button>)}
              {commands.length === 0 && <p className="command-empty">No matching actions.</p>}
            </div>
            <div className="command-footer"><span><kbd>↑</kbd><kbd>↓</kbd> Navigate</span><span><kbd>↵</kbd> Open</span><span><kbd>Esc</kbd> Close</span></div>
          </div>
        </div>
      )}
    </>
  );
}
