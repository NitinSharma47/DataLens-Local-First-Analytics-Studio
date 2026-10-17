import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';
import Dexie, { type Table } from 'dexie';
import { v4 as uuidv4 } from 'uuid';
import { SAMPLE_DATASET_METADATA, SAMPLE_SALES_DATA } from '../data/sample-data';
import { filterRows } from '../data/query';
import type { Dashboard, DashboardPanel, DatasetMetadata, FilterRule, SavedView, SortingRule, ThemeMode, ToastMessage } from '../types';

export type DataRecord = Record<string, unknown>;
export { filterRows } from '../data/query';

interface AppState {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
  activeDataset: DatasetMetadata | null;
  dataRows: DataRecord[];
  loadSampleData: (silent?: boolean) => void;
  loadDataset: (metadata: DatasetMetadata, rows: DataRecord[]) => void;
  clearDataset: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filters: FilterRule[];
  addFilter: (filter: FilterRule) => void;
  removeFilter: (id: string) => void;
  clearFilters: () => void;
  sorting: SortingRule[];
  setSorting: (sorting: SortingRule[]) => void;
  hiddenColumnIds: string[];
  toggleColumnVisibility: (columnId: string) => void;
  resetColumnVisibility: () => void;
  crossFilters: FilterRule[];
  addCrossFilter: (filter: FilterRule) => void;
  removeCrossFilter: (id: string) => void;
  clearCrossFilters: () => void;
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  savedViews: SavedView[];
  saveView: (name: string) => void;
  deleteView: (id: string) => void;
  loadView: (view: SavedView) => void;
  dashboards: Dashboard[];
  activeDashboard: Dashboard | null;
  createDashboard: (name: string) => void;
  renameDashboard: (id: string, name: string) => void;
  duplicateDashboard: (id: string) => void;
  deleteDashboard: (id: string) => void;
  setActiveDashboard: (id: string | null) => void;
  addDashboardPanel: (dashboardId: string, panel: DashboardPanel) => void;
  removeDashboardPanel: (dashboardId: string, panelId: string) => void;
  moveDashboardPanel: (dashboardId: string, panelId: string, direction: -1 | 1) => void;
  clearWorkspace: () => void;
  getFilteredData: () => DataRecord[];
}

function applyTheme(theme: ThemeMode): void {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', theme === 'light' ? 'light' : 'dark');
}

interface WorkspaceStorageEntry {
  key: string;
  value: string;
}

class DataLensWorkspaceDatabase extends Dexie {
  workspace!: Table<WorkspaceStorageEntry, string>;

  constructor() {
    super('datalens-local');
    this.version(1).stores({ workspace: '&key' });
  }
}

const workspaceDatabase = new DataLensWorkspaceDatabase();
let storageWarningQueued = false;

function reportStorageFailure(error: unknown): void {
  console.warn('DataLens workspace storage is unavailable; changes will stay in memory.', error);
  if (storageWarningQueued || typeof window === 'undefined') return;
  storageWarningQueued = true;
  window.setTimeout(() => {
    useAppStore.getState().addToast({
      type: 'warning',
      title: 'Workspace changes are not being saved',
      description: 'Browser storage is unavailable or full. You can keep working, but saved views and preferences may not persist.',
      duration: 7000,
    });
  }, 0);
}

const workspaceStorage: StateStorage = {
  getItem: async (name) => {
    try {
      const entry = await workspaceDatabase.workspace.get(name);
      if (entry) return entry.value;

      const legacyValue = window.localStorage.getItem(name);
      if (legacyValue === null) return null;
      await workspaceDatabase.workspace.put({ key: name, value: legacyValue });
      window.localStorage.removeItem(name);
      return legacyValue;
    } catch (error) {
      reportStorageFailure(error);
      try {
        return window.localStorage.getItem(name);
      } catch (fallbackError) {
        reportStorageFailure(fallbackError);
        return null;
      }
    }
  },
  setItem: async (name, value) => {
    try {
      await workspaceDatabase.workspace.put({ key: name, value });
    } catch (error) {
      reportStorageFailure(error);
      try {
        window.localStorage.setItem(name, value);
      } catch (fallbackError) {
        reportStorageFailure(fallbackError);
      }
    }
  },
  removeItem: async (name) => {
    try {
      await workspaceDatabase.workspace.delete(name);
    } catch (error) {
      reportStorageFailure(error);
    }
    try {
      window.localStorage.removeItem(name);
    } catch (error) {
      reportStorageFailure(error);
    }
  },
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      setTheme: (theme) => {
        applyTheme(theme);
        set({ theme });
      },
      sidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      mobileSidebarOpen: false,
      setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),

      activeDataset: null,
      dataRows: [],
      loadSampleData: (silent = false) => {
        set({
          activeDataset: SAMPLE_DATASET_METADATA,
          dataRows: SAMPLE_SALES_DATA,
          filters: [],
          crossFilters: [],
          sorting: [],
          searchQuery: '',
        });
        if (!silent) get().addToast({ type: 'success', title: 'Sample data loaded', description: '1,000 synthetic sales records are ready to explore.' });
      },
      loadDataset: (metadata, rows) => {
        set({ activeDataset: metadata, dataRows: rows, filters: [], crossFilters: [], sorting: [], searchQuery: '', hiddenColumnIds: [] });
        get().addToast({ type: 'success', title: 'Dataset imported', description: `${metadata.rowCount.toLocaleString()} rows across ${metadata.columnCount} columns.` });
      },
      clearDataset: () => set({ activeDataset: null, dataRows: [], filters: [], crossFilters: [], sorting: [], searchQuery: '' }),

      searchQuery: '',
      setSearchQuery: (searchQuery) => set({ searchQuery }),
      filters: [],
      addFilter: (filter) => set((state) => ({ filters: [...state.filters.filter((item) => item.columnId !== filter.columnId), filter] })),
      removeFilter: (id) => set((state) => ({ filters: state.filters.filter((filter) => filter.id !== id) })),
      clearFilters: () => set({ filters: [] }),
      sorting: [],
      setSorting: (sorting) => set({ sorting }),
      hiddenColumnIds: [],
      toggleColumnVisibility: (columnId) => set((state) => ({
        hiddenColumnIds: state.hiddenColumnIds.includes(columnId)
          ? state.hiddenColumnIds.filter((id) => id !== columnId)
          : [...state.hiddenColumnIds, columnId],
      })),
      resetColumnVisibility: () => set({ hiddenColumnIds: [] }),

      crossFilters: [],
      addCrossFilter: (filter) => set((state) => ({ crossFilters: [...state.crossFilters.filter((item) => item.columnId !== filter.columnId), filter] })),
      removeCrossFilter: (id) => set((state) => ({ crossFilters: state.crossFilters.filter((filter) => filter.id !== id) })),
      clearCrossFilters: () => set({ crossFilters: [] }),

      toasts: [],
      addToast: (toast) => {
        const id = uuidv4();
        set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
        window.setTimeout(() => get().removeToast(id), toast.duration ?? 4000);
      },
      removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),

      savedViews: [],
      saveView: (name) => {
        const state = get();
        if (!state.activeDataset) {
          state.addToast({ type: 'warning', title: 'No dataset loaded', description: 'Load or import a dataset before saving a view.' });
          return;
        }
        const now = new Date().toISOString();
        const view: SavedView = {
          id: uuidv4(),
          name,
          datasetId: state.activeDataset.id,
          query: {
            search: state.searchQuery,
            filters: state.filters,
            sorting: state.sorting,
            grouping: [],
            hiddenColumnIds: state.hiddenColumnIds,
            pinnedColumnIds: { left: [], right: [] },
            columnOrder: [],
            columnWidths: {},
          },
          createdAt: now,
          updatedAt: now,
        };
        set((current) => ({ savedViews: [...current.savedViews, view] }));
        state.addToast({ type: 'success', title: 'View saved', description: `"${name}" is saved on this device.` });
      },
      deleteView: (id) => set((state) => ({ savedViews: state.savedViews.filter((view) => view.id !== id) })),
      loadView: (view) => {
        if (view.datasetId !== get().activeDataset?.id) {
          get().addToast({ type: 'warning', title: 'Dataset not available', description: 'Load the dataset associated with this view, then open it again.' });
          return;
        }
        set({
          searchQuery: view.query.search ?? '',
          filters: view.query.filters,
          sorting: view.query.sorting,
          hiddenColumnIds: view.query.hiddenColumnIds,
          crossFilters: [],
        });
        get().addToast({ type: 'info', title: 'View restored', description: `"${view.name}" is now active.` });
      },

      dashboards: [],
      activeDashboard: null,
      createDashboard: (name) => {
        const state = get();
        if (!state.activeDataset) {
          state.addToast({ type: 'warning', title: 'No dataset loaded', description: 'Load or import a dataset before creating a dashboard.' });
          return;
        }
        const now = new Date().toISOString();
        const dashboard: Dashboard = { id: uuidv4(), name, datasetId: state.activeDataset.id, panels: [], createdAt: now, updatedAt: now };
        set((current) => ({ dashboards: [...current.dashboards, dashboard], activeDashboard: dashboard }));
        state.addToast({ type: 'success', title: 'Dashboard created', description: `"${name}" is ready for panels.` });
      },
      renameDashboard: (id, name) => set((state) => {
        const dashboards = state.dashboards.map((dashboard) => dashboard.id === id ? { ...dashboard, name, updatedAt: new Date().toISOString() } : dashboard);
        return { dashboards, activeDashboard: state.activeDashboard?.id === id ? dashboards.find((dashboard) => dashboard.id === id) ?? null : state.activeDashboard };
      }),
      duplicateDashboard: (id) => {
        const original = get().dashboards.find((dashboard) => dashboard.id === id);
        if (!original) return;
        const now = new Date().toISOString();
        const duplicate = { ...original, id: uuidv4(), name: `${original.name} copy`, panels: original.panels.map((panel) => ({ ...panel, id: uuidv4() })), createdAt: now, updatedAt: now };
        set((state) => ({ dashboards: [...state.dashboards, duplicate] }));
        get().addToast({ type: 'success', title: 'Dashboard duplicated', description: `"${duplicate.name}" was created.` });
      },
      deleteDashboard: (id) => set((state) => ({
        dashboards: state.dashboards.filter((dashboard) => dashboard.id !== id),
        activeDashboard: state.activeDashboard?.id === id ? null : state.activeDashboard,
      })),
      setActiveDashboard: (id) => set((state) => ({ activeDashboard: id ? state.dashboards.find((dashboard) => dashboard.id === id) ?? null : null })),
      addDashboardPanel: (dashboardId, panel) => set((state) => {
        const dashboards = state.dashboards.map((dashboard) => dashboard.id === dashboardId
          ? { ...dashboard, panels: [...dashboard.panels, panel], updatedAt: new Date().toISOString() }
          : dashboard);
        return { dashboards, activeDashboard: dashboards.find((dashboard) => dashboard.id === dashboardId) ?? state.activeDashboard };
      }),
      removeDashboardPanel: (dashboardId, panelId) => set((state) => {
        const dashboards = state.dashboards.map((dashboard) => dashboard.id === dashboardId
          ? { ...dashboard, panels: dashboard.panels.filter((panel) => panel.id !== panelId), updatedAt: new Date().toISOString() }
          : dashboard);
        return { dashboards, activeDashboard: dashboards.find((dashboard) => dashboard.id === dashboardId) ?? state.activeDashboard };
      }),
      moveDashboardPanel: (dashboardId, panelId, direction) => set((state) => {
        const dashboards = state.dashboards.map((dashboard) => {
          if (dashboard.id !== dashboardId) return dashboard;
          const currentIndex = dashboard.panels.findIndex((panel) => panel.id === panelId);
          const nextIndex = currentIndex + direction;
          if (currentIndex < 0 || nextIndex < 0 || nextIndex >= dashboard.panels.length) return dashboard;
          const panels = [...dashboard.panels];
          [panels[currentIndex], panels[nextIndex]] = [panels[nextIndex], panels[currentIndex]];
          return { ...dashboard, panels, updatedAt: new Date().toISOString() };
        });
        return { dashboards, activeDashboard: dashboards.find((dashboard) => dashboard.id === dashboardId) ?? state.activeDashboard };
      }),
      clearWorkspace: () => set({ savedViews: [], dashboards: [], activeDashboard: null }),
      getFilteredData: () => filterRows(get()),
    }),
    {
      name: 'datalens-workspace',
      storage: createJSONStorage(() => workspaceStorage),
      partialize: (state) => ({
        theme: state.theme,
        savedViews: state.savedViews,
        dashboards: state.dashboards,
        activeDataset: state.activeDataset?.format === 'sample' ? state.activeDataset : null,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) reportStorageFailure(error);
        if (state?.activeDataset?.format === 'sample') state.loadSampleData(true);
        if (state) applyTheme(state.theme);
      },
    },
  ),
);
