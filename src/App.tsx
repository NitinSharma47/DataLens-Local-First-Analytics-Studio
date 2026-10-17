import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';
import ToastContainer from './components/ui/Toast';
import AppErrorBoundary from './components/ui/AppErrorBoundary';
import { useAppStore } from './store/app-store';
import { ChartsPage, DashboardsPage, ExplorePage, HelpPage, OverviewPage, SettingsPage, ViewsPage } from './pages/Pages';
import './App.css';

function AppShell() {
  const theme = useAppStore((state) => state.theme);
  const savedViews = useAppStore((state) => state.savedViews);
  const activeDataset = useAppStore((state) => state.activeDataset);
  const loadView = useAppStore((state) => state.loadView);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (location.pathname !== '/explore') return;
    const params = new URLSearchParams(location.search);
    const viewId = params.get('view');
    if (!viewId) return;
    if (viewId.length > 80) {
      params.delete('view');
      navigate({ pathname: '/explore', search: params.size ? `?${params}` : '' }, { replace: true });
      return;
    }
    const view = savedViews.find((candidate) => candidate.id === viewId);
    if (!view || view.datasetId !== activeDataset?.id) return;

    loadView(view);
    params.delete('view');
    navigate({ pathname: '/explore', search: params.size ? `?${params}` : '' }, { replace: true });
  }, [activeDataset?.id, loadView, location.pathname, location.search, navigate, savedViews]);

  return (
    <div className="app-layout">
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <Sidebar />
      <div className="app-main">
        <TopBar />
        <main className="app-content" id="main-content">
          <AppErrorBoundary>
            <div className="page-container">
              <Routes>
                <Route path="/" element={<OverviewPage />} />
                <Route path="/explore" element={<ExplorePage />} />
                <Route path="/charts" element={<ChartsPage />} />
                <Route path="/dashboards" element={<DashboardsPage />} />
                <Route path="/views" element={<ViewsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/help" element={<HelpPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </AppErrorBoundary>
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return <HashRouter><AppShell /></HashRouter>;
}
