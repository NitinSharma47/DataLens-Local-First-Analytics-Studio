import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  ArrowDown, ArrowDownToLine, ArrowRight, ArrowUp, BarChart3, Bookmark, Check, ChevronDown, CircleHelp, Columns3,
  Database, FileSpreadsheet, Filter, LayoutDashboard, LockKeyhole, Plus, Search,
  Settings2, Share2, ShieldCheck, Sparkles, Table2, Trash2, Upload, X,
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { parseDataFile } from '../data/import-data';
import { filterRows, useAppStore, type DataRecord } from '../store/app-store';
import type { ChartSpec, ColumnSchema, DashboardPanel, FilterRule, SavedView } from '../types';

const CURRENCY = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const NUMBER = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 });
const AnalyticsChart = lazy(() => import('../components/charts/AnalyticsChart'));

function displayValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'number') return NUMBER.format(value);
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value);
}

function useVisibleRows(): DataRecord[] {
  const dataRows = useAppStore((state) => state.dataRows);
  const activeDataset = useAppStore((state) => state.activeDataset);
  const filters = useAppStore((state) => state.filters);
  const crossFilters = useAppStore((state) => state.crossFilters);
  const searchQuery = useAppStore((state) => state.searchQuery);
  return useMemo(() => filterRows({ dataRows, activeDataset, filters, crossFilters, searchQuery }), [dataRows, activeDataset, filters, crossFilters, searchQuery]);
}

function PageHeading({ eyebrow, title, description, actions }: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </div>
  );
}

function ImportButton({ compact = false }: { compact?: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const loadDataset = useAppStore((state) => state.loadDataset);
  const addToast = useAppStore((state) => state.addToast);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const handleFile = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    try {
      const imported = await parseDataFile(file);
      loadDataset(imported.metadata, imported.rows);
      navigate('/explore');
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Could not import file',
        description: error instanceof Error ? error.message : 'An unexpected error occurred while reading this file.',
        duration: 7000,
      });
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        className="visually-hidden"
        type="file"
        accept=".csv,.json,text/csv,application/json"
        aria-label="Choose a CSV or JSON file"
        onChange={(event) => void handleFile(event.target.files?.[0])}
      />
      <button className={compact ? 'button button--secondary button--small' : 'button button--secondary'} type="button" disabled={busy} onClick={() => inputRef.current?.click()}>
        <Upload size={16} />
        {busy ? 'Reading file…' : compact ? 'Import' : 'Import a file'}
      </button>
    </>
  );
}

function SampleButton({ children = 'Load sample dataset' }: { children?: React.ReactNode }) {
  const loadSampleData = useAppStore((state) => state.loadSampleData);
  const navigate = useNavigate();
  return (
    <button className="button button--primary" type="button" onClick={() => { loadSampleData(); navigate('/explore'); }}>
      <Sparkles size={16} /> {children}
    </button>
  );
}

function EmptyDataset({ heading = 'Start with a dataset', description = 'Load the sample or import a CSV or JSON file. Your data stays in this browser.' }: {
  heading?: string;
  description?: string;
}) {
  return (
    <section className="empty-state panel">
      <div className="empty-icon"><Database size={22} /></div>
      <h2>{heading}</h2>
      <p>{description}</p>
      <div className="empty-actions"><SampleButton /><ImportButton /></div>
      <div className="privacy-note"><LockKeyhole size={14} /> Files are processed locally and are not uploaded.</div>
    </section>
  );
}

function MetricCard({ label, value, detail, icon: Icon, accent = 'teal' }: {
  label: string;
  value: string;
  detail: string;
  icon: typeof BarChart3;
  accent?: string;
}) {
  return (
    <article className="metric-card panel">
      <div className={`metric-icon metric-icon--${accent}`}><Icon size={17} /></div>
      <div className="metric-copy">
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{detail}</small>
      </div>
    </article>
  );
}

function useDatasetControls() {
  const activeDataset = useAppStore((state) => state.activeDataset);
  const rows = useVisibleRows();
  return { activeDataset, rows, schema: activeDataset?.schema ?? [] };
}

export function OverviewPage() {
  const { activeDataset, rows, schema } = useDatasetControls();
  const dataRows = useAppStore((state) => state.dataRows);
  const filters = useAppStore((state) => state.filters);
  const crossFilters = useAppStore((state) => state.crossFilters);
  const searchQuery = useAppStore((state) => state.searchQuery);
  const setSearchQuery = useAppStore((state) => state.setSearchQuery);
  const addCrossFilter = useAppStore((state) => state.addCrossFilter);
  const clearCrossFilters = useAppStore((state) => state.clearCrossFilters);
  const clearFilters = useAppStore((state) => state.clearFilters);
  const revenue = schema.find((column) => /revenue|sales|amount/i.test(column.key));
  const category = schema.find((column) => /category|region|type|status/i.test(column.key));
  const date = schema.find((column) => column.type === 'date' || column.type === 'datetime');
  const revenueValues = revenue ? rows.map((row) => row[revenue.key])
    .filter((value): value is number | string => typeof value === 'number' || (typeof value === 'string' && value.trim() !== ''))
    .map(Number).filter(Number.isFinite) : [];
  const total = revenue ? revenueValues.reduce((sum, value) => sum + value, 0) : rows.length;
  const avg = revenueValues.length ? total / revenueValues.length : 0;
  const profile = activeDataset?.profile ?? [];
  const missing = profile.reduce((sum, item) => sum + item.nullCount, 0);
  const addCategoryFilter = (value: string) => {
    if (!category) return;
    addCrossFilter({ id: uuidv4(), columnId: category.id, operator: 'equals', value });
  };

  if (!activeDataset) {
    return (
      <div className="page-stack">
        <PageHeading eyebrow="YOUR PRIVATE ANALYTICS WORKSPACE" title="Explore your data, locally." description="Bring a file, find the signal, and keep every analysis on this device." />
        <EmptyDataset heading="A clearer view starts here" description="Load the synthetic sales dataset for an instant walkthrough, or import your own CSV or JSON. No account or upload required." />
        <div className="welcome-features">
          <article className="panel feature-card"><div className="feature-icon"><FileSpreadsheet size={17} /></div><div><h3>Bring a file</h3><p>CSV and record-oriented JSON up to 25 MB are supported in this frontend preview.</p></div></article>
          <article className="panel feature-card"><div className="feature-icon"><BarChart3 size={17} /></div><div><h3>Explore together</h3><p>Search and filter the grid, then build charts from the same active dataset.</p></div></article>
          <article className="panel feature-card"><div className="feature-icon"><ShieldCheck size={17} /></div><div><h3>Local by design</h3><p>Files stay in the browser session; only saved views and dashboards are stored locally.</p></div></article>
        </div>
      </div>
    );
  }

  const status = schema.find((column) => /status/i.test(column.key));
  const completed = status ? rows.filter((row) => String(row[status.key]).toLowerCase() === 'completed').length : rows.length;
  const recent = rows.slice(0, 6);
  return (
    <div className="page-stack">
      <PageHeading
        eyebrow="OVERVIEW · LOCAL WORKSPACE"
        title="Good data. Clear decisions."
        description={`A live snapshot of ${activeDataset.name} — charts and metrics reflect your current filters.`}
        actions={<><ImportButton compact /><Link className="button button--primary button--small" to="/explore"><Table2 size={15} /> Explore data <ArrowRight size={14} /></Link></>}
      />
      {(filters.length > 0 || crossFilters.length > 0 || searchQuery) && <FilterChips filters={[...filters, ...crossFilters]} schema={schema} searchQuery={searchQuery} clearSearch={() => setSearchQuery('')} clearAll={() => { clearFilters(); clearCrossFilters(); setSearchQuery(''); }} />}
      <div className="metrics-grid">
        <MetricCard label={revenue ? 'Total revenue' : 'Total records'} value={revenue ? CURRENCY.format(total) : NUMBER.format(rows.length)} detail={`${NUMBER.format(rows.length)} of ${NUMBER.format(dataRows.length)} rows`} icon={BarChart3} />
        <MetricCard label="Avg. order value" value={revenue ? CURRENCY.format(avg) : '—'} detail="Calculated from visible records" icon={Sparkles} accent="blue" />
        <MetricCard label={status ? 'Completed' : 'Data quality'} value={status ? `${rows.length ? Math.round((completed / rows.length) * 100) : 0}%` : `${NUMBER.format(missing)} missing`} detail={status ? `${NUMBER.format(completed)} records in this view` : 'Null values across all columns'} icon={Check} accent="amber" />
        <MetricCard label="Dataset size" value={NUMBER.format(activeDataset.rowCount)} detail={`${activeDataset.columnCount} columns · ${activeDataset.format.toUpperCase()} · local`} icon={Database} accent="violet" />
      </div>
      <div className="chart-grid chart-grid--overview">
        {date && revenue && <Suspense fallback={<div className="chart-card panel chart-loading">Loading visualization…</div>}><AnalyticsChart title="Revenue over time" subtitle="Monthly revenue · current filters applied" rows={rows} schema={schema} dimensionId={date.id} metricId={revenue.id} type="line" onSelect={(value) => addCrossFilter({ id: uuidv4(), columnId: date.id, operator: 'starts_with', value: value.slice(0, 7) })} /></Suspense>}
        {category && revenue && <Suspense fallback={<div className="chart-card panel chart-loading">Loading visualization…</div>}><AnalyticsChart title="Revenue by category" rows={rows} schema={schema} dimensionId={category.id} metricId={revenue.id} onSelect={addCategoryFilter} /></Suspense>}
      </div>
      <div className="panel recent-panel">
        <div className="section-heading"><div><h2>Recent records</h2><p>A quick look at the rows currently in view.</p></div><Link className="text-link" to="/explore">Open data explorer <ArrowRight size={14} /></Link></div>
        <div className="table-scroll"><table className="data-table compact-table"><thead><tr>{schema.slice(0, 5).map((column) => <th key={column.id}>{column.label}</th>)}</tr></thead><tbody>{recent.map((row, index) => <tr key={String(row.id ?? `${index}`)}>{schema.slice(0, 5).map((column) => <td key={column.id}>{displayValue(row[column.key])}</td>)}</tr>)}</tbody></table></div>
        <div className="data-footnote"><LockKeyhole size={13} /> Sample data is synthetic; imported files are processed locally in this browser.</div>
      </div>
    </div>
  );
}

function FilterChips({ filters, schema, clearAll, searchQuery = '', clearSearch }: {
  filters: FilterRule[];
  schema: ColumnSchema[];
  clearAll: () => void;
  searchQuery?: string;
  clearSearch?: () => void;
}) {
  const removeCrossFilter = useAppStore((state) => state.removeCrossFilter);
  const removeFilter = useAppStore((state) => state.removeFilter);
  return (
    <div className="filter-chips" aria-label="Active filters">
      <span className="filter-chip-label"><Filter size={13} /> Filters</span>
      {filters.map((filter) => {
        const column = schema.find((item) => item.id === filter.columnId);
        return (
          <span className="filter-chip" key={filter.id}>
            {column?.label ?? filter.columnId}: <strong>{String(filter.value ?? '')}</strong>
            <button type="button" aria-label={`Remove ${column?.label ?? 'filter'} filter`} onClick={() => { removeCrossFilter(filter.id); removeFilter(filter.id); }}><X size={12} /></button>
          </span>
        );
      })}
      {searchQuery && <span className="filter-chip">Search: <strong>{searchQuery}</strong><button type="button" aria-label="Clear search filter" onClick={clearSearch}><X size={12} /></button></span>}
      <button type="button" className="text-button" onClick={clearAll}>Clear all</button>
    </div>
  );
}

export function ExplorePage() {
  const { activeDataset, rows, schema } = useDatasetControls();
  const dataRows = useAppStore((state) => state.dataRows);
  const searchQuery = useAppStore((state) => state.searchQuery);
  const setSearchQuery = useAppStore((state) => state.setSearchQuery);
  const filters = useAppStore((state) => state.filters);
  const crossFilters = useAppStore((state) => state.crossFilters);
  const sorting = useAppStore((state) => state.sorting);
  const setSorting = useAppStore((state) => state.setSorting);
  const addFilter = useAppStore((state) => state.addFilter);
  const removeFilter = useAppStore((state) => state.removeFilter);
  const clearFilters = useAppStore((state) => state.clearFilters);
  const hiddenColumnIds = useAppStore((state) => state.hiddenColumnIds);
  const toggleColumnVisibility = useAppStore((state) => state.toggleColumnVisibility);
  const [filterOpen, setFilterOpen] = useState(false);
  const [columnMenuOpen, setColumnMenuOpen] = useState(false);
  const [filterColumnId, setFilterColumnId] = useState('');
  const [operator, setOperator] = useState('contains');
  const [filterValue, setFilterValue] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const visibleColumns = schema.filter((column) => !hiddenColumnIds.includes(column.id));
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 42,
    overscan: 8,
  });
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [activeDataset?.id, searchQuery, filters, crossFilters]);
  const sortedRows = useMemo(() => {
    if (!sorting.length) return rows;
    const column = schema.find((item) => item.id === sorting[0].columnId);
    if (!column) return rows;
    return [...rows].sort((a, b) => {
      const left = a[column.key];
      const right = b[column.key];
      if (left === right) return 0;
      if (left === null || left === undefined || left === '') return 1;
      if (right === null || right === undefined || right === '') return -1;
      const result = typeof left === 'number' && typeof right === 'number'
        ? left - right
        : String(left).localeCompare(String(right), undefined, { numeric: true, sensitivity: 'base' });
      return sorting[0].desc ? -result : result;
    });
  }, [rows, schema, sorting]);

  if (!activeDataset) return <div className="page-stack"><PageHeading eyebrow="DATA WORKSPACE" title="Data Explorer" description="Inspect, search, filter, and export records." /><EmptyDataset /></div>;

  const addColumnFilter = () => {
    if (!filterColumnId || (!['is_empty', 'is_not_empty'].includes(operator) && !filterValue.trim())) return;
    addFilter({ id: uuidv4(), columnId: filterColumnId, operator, value: filterValue });
    setFilterValue('');
    setFilterOpen(false);
  };
  const exportRows = () => {
    const header = visibleColumns.map((column) => column.label);
    const data = sortedRows.map((row) => visibleColumns.map((column) => row[column.key]));
    const escape = (value: unknown) => {
      let text = String(value ?? '');
      if (/^[\s]*[=+\-@]/.test(text)) text = `'${text}`;
      return `"${text.replace(/"/g, '""')}"`;
    };
    const contents = [header, ...data].map((record) => record.map(escape).join(',')).join('\r\n');
    const blob = new Blob([`\uFEFF${contents}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeDataset.name.replace(/[^\w-]+/g, '_')}_filtered.csv`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  };
  const toggleSort = (column: ColumnSchema) => {
    const current = sorting[0];
    setSorting([{ columnId: column.id, desc: current?.columnId === column.id ? !current.desc : false }]);
  };
  const filterColumns = [...filters, ...crossFilters];

  return (
    <div className="page-stack">
      <PageHeading eyebrow="DATA WORKSPACE" title="Data Explorer" description="Search and shape your records. Changes stay in this browser session." actions={<><ImportButton compact /><button className="button button--secondary button--small" type="button" onClick={exportRows}><ArrowDownToLine size={15} /> Export CSV</button></>} />
      <section className="panel dataset-summary">
        <div className="dataset-summary-icon"><Database size={18} /></div>
        <div className="dataset-summary-copy"><strong>{activeDataset.name}</strong><span>{activeDataset.sourceFileName ?? 'Built-in sample'} · {activeDataset.format.toUpperCase()} · local {activeDataset.engineKind === 'worker' ? 'worker parser' : 'memory engine'}</span></div>
        <div className="dataset-summary-stats"><span><strong>{NUMBER.format(dataRows.length)}</strong> total rows</span><span><strong>{schema.length}</strong> columns</span><span><strong>{NUMBER.format(rows.length)}</strong> visible</span></div>
      </section>
      {activeDataset.profile && <details className="panel profile-details">
        <summary><span><Database size={14} /> Column profiles <small>{schema.length} inferred fields</small></span><ChevronDown size={15} /></summary>
        <div className="profile-grid">{schema.map((column) => {
          const profile = activeDataset.profile?.find((item) => item.columnId === column.id);
          return <article className="profile-item" key={column.id}><strong>{column.label}</strong><span>{column.type}{column.inferred ? ' · inferred' : ''}</span><small>{NUMBER.format(profile?.distinctCount ?? 0)} distinct · {profile?.nullPercentage ?? 0}% missing</small></article>;
        })}</div>
      </details>}
      <section className="panel grid-panel">
        <div className="grid-toolbar">
          <label className="search-field"><Search size={16} /><input aria-label="Search all columns" placeholder="Search all columns…" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} /><kbd>⌘ F</kbd></label>
          <div className="toolbar-actions">
            <button className={`button button--small ${filterOpen ? 'button--active' : 'button--secondary'}`} type="button" onClick={() => setFilterOpen((open) => !open)}><Filter size={14} /> Filter {filterColumns.length > 0 && <span className="count-badge">{filterColumns.length}</span>}</button>
            <div className="column-menu-wrap">
              <button className="button button--secondary button--small" type="button" aria-expanded={columnMenuOpen} onClick={() => setColumnMenuOpen((open) => !open)}><Columns3 size={14} /> Columns <ChevronDown size={13} /></button>
              {columnMenuOpen && <div className="column-menu" role="group" aria-label="Show or hide columns">
                {schema.map((column) => <label key={column.id}><input type="checkbox" checked={!hiddenColumnIds.includes(column.id)} onChange={() => toggleColumnVisibility(column.id)} />{column.label}</label>)}
                <button type="button" className="text-button" onClick={() => useAppStore.getState().resetColumnVisibility()}>Show all columns</button>
              </div>}
            </div>
          </div>
        </div>
        {filterOpen && <div className="filter-builder">
          <label>Column<select value={filterColumnId} onChange={(event) => { setFilterColumnId(event.target.value); setOperator('contains'); }}><option value="">Choose column</option>{schema.map((column) => <option key={column.id} value={column.id}>{column.label}</option>)}</select></label>
          <label>Condition<select value={operator} onChange={(event) => setOperator(event.target.value)}><option value="contains">contains</option><option value="equals">equals</option><option value="gt">greater than</option><option value="lt">less than</option><option value="is_empty">is empty</option><option value="is_not_empty">is not empty</option></select></label>
          {!['is_empty', 'is_not_empty'].includes(operator) && <label>Value<input value={filterValue} onChange={(event) => setFilterValue(event.target.value)} placeholder="Filter value" onKeyDown={(event) => { if (event.key === 'Enter') addColumnFilter(); }} /></label>}
          <button type="button" className="button button--primary button--small" onClick={addColumnFilter} disabled={!filterColumnId}>Add filter</button>
        </div>}
        {filterColumns.length > 0 && <div className="grid-filter-list">
          {[...filters, ...crossFilters].map((filter) => <span className="filter-pill" key={filter.id}>{schema.find((column) => column.id === filter.columnId)?.label}: {String(filter.value ?? filter.operator)}<button type="button" aria-label="Remove filter" onClick={() => { removeFilter(filter.id); useAppStore.getState().removeCrossFilter(filter.id); }}><X size={12} /></button></span>)}
          <button type="button" className="text-button" onClick={clearFilters}>Clear column filters</button>
        </div>}
        <div className="virtual-table" ref={scrollRef} role="region" aria-label="Dataset rows" tabIndex={0}>
          <table className="data-table explorer-table">
            <thead><tr>{visibleColumns.map((column) => {
              const active = sorting[0]?.columnId === column.id;
              return <th key={column.id} aria-sort={active ? sorting[0].desc ? 'descending' : 'ascending' : 'none'}><button type="button" className="sort-button" onClick={() => toggleSort(column)}>{column.label}{active && <span>{sorting[0].desc ? ' ↓' : ' ↑'}</span>}</button></th>;
            })}</tr></thead>
            <tbody>
              {virtualizer.getVirtualItems().length > 0 && <tr aria-hidden="true"><td colSpan={visibleColumns.length} style={{ height: `${virtualizer.getVirtualItems()[0].start}px`, padding: 0, border: 0 }} /></tr>}
              {virtualizer.getVirtualItems().map((virtualRow) => {
                const row = sortedRows[virtualRow.index];
                return <tr key={String(row.id ?? virtualRow.key)} style={{ height: `${virtualRow.size}px` }}>{visibleColumns.map((column) => <td key={column.id} title={displayValue(row[column.key])}>{displayValue(row[column.key])}</td>)}</tr>;
              })}
              {virtualizer.getVirtualItems().length > 0 && <tr aria-hidden="true"><td colSpan={visibleColumns.length} style={{ height: `${virtualizer.getTotalSize() - (virtualizer.getVirtualItems().at(-1)?.end ?? 0)}px`, padding: 0, border: 0 }} /></tr>}
            </tbody>
          </table>
          {rows.length === 0 && <div className="table-empty"><Search size={19} /><strong>No records match this view</strong><span>Adjust your search or clear active filters.</span><button className="text-button" type="button" onClick={() => { setSearchQuery(''); clearFilters(); useAppStore.getState().clearCrossFilters(); }}>Clear search and filters</button></div>}
        </div>
        <div className="grid-footer"><span>Showing {NUMBER.format(rows.length)} records</span><span>{schema.length - hiddenColumnIds.length} of {schema.length} columns</span></div>
      </section>
    </div>
  );
}

export function ChartsPage() {
  const { activeDataset, rows, schema } = useDatasetControls();
  const filters = useAppStore((state) => state.filters);
  const addCrossFilter = useAppStore((state) => state.addCrossFilter);
  const crossFilters = useAppStore((state) => state.crossFilters);
  const searchQuery = useAppStore((state) => state.searchQuery);
  const setSearchQuery = useAppStore((state) => state.setSearchQuery);
  const clearFilters = useAppStore((state) => state.clearFilters);
  const clearCrossFilters = useAppStore((state) => state.clearCrossFilters);
  const addToast = useAppStore((state) => state.addToast);
  const [dimensionId, setDimensionId] = useState('');
  const [metricId, setMetricId] = useState('');
  const [aggregation, setAggregation] = useState<ChartSpec['aggregation']>('sum');
  const [type, setType] = useState<'bar' | 'line' | 'area' | 'pie'>('bar');
  const [title, setTitle] = useState('');
  const navigate = useNavigate();
  const numericColumns = schema.filter((column) => ['integer', 'number'].includes(column.type));
  const defaultDimension = schema.find((column) => /category|region|channel|status/i.test(column.key) && column.type === 'string')
    ?? schema.find((column) => column.type === 'date' || column.type === 'datetime')
    ?? schema.find((column) => ['string', 'boolean'].includes(column.type));
  const dimension = dimensionId || defaultDimension?.id || schema[0]?.id || '';
  const defaultMetric = schema.find((column) => /revenue|sales|amount/i.test(column.key) && ['integer', 'number'].includes(column.type)) ?? numericColumns[0];
  const metric = metricId || defaultMetric?.id || schema[0]?.id || '';
  const chartTitle = title.trim() || `${schema.find((column) => column.id === metric)?.label ?? 'Records'} by ${schema.find((column) => column.id === dimension)?.label ?? 'category'}`;

  if (!activeDataset) return <div className="page-stack"><PageHeading eyebrow="VISUAL ANALYSIS" title="Chart Builder" description="Build charts from the same filtered dataset as your grid." /><EmptyDataset /></div>;
  const handleChartSelect = (value: string) => {
    if (!value) return;
    const dateDimension = schema.some((column) => column.id === dimension && (column.type === 'date' || column.type === 'datetime'));
    addCrossFilter({ id: uuidv4(), columnId: dimension, operator: dateDimension ? 'starts_with' : 'equals', value });
  };
  const saveToDashboard = () => {
    const dashboard = useAppStore.getState().activeDashboard ?? useAppStore.getState().dashboards.find((item) => item.datasetId === activeDataset.id);
    if (!dashboard) {
      addToast({ type: 'info', title: 'Create a dashboard first', description: 'Open Dashboards to create a workspace for this chart.' });
      navigate('/dashboards');
      return;
    }
    const chartSpec: ChartSpec = { id: uuidv4(), title: chartTitle, type, dimensionColumnId: dimension, metricColumnId: metric, aggregation, crossFilterEnabled: true };
    const panel: DashboardPanel = { id: uuidv4(), type: 'chart', chartSpec, position: { x: 0, y: 0, w: 6, h: 4 }, title: chartSpec.title };
    useAppStore.getState().addDashboardPanel(dashboard.id, panel);
    addToast({ type: 'success', title: 'Chart added', description: `Added to ${dashboard.name}.` });
  };
  return (
    <div className="page-stack">
      <PageHeading eyebrow="VISUAL ANALYSIS" title="Chart Builder" description="Choose a dimension, metric, and aggregation. Select a chart mark to cross-filter your workspace." actions={<button type="button" className="button button--secondary button--small" onClick={saveToDashboard}><Plus size={15} /> Add to dashboard</button>} />
      <section className="panel chart-controls">
        <label>Chart title<input value={title} placeholder={`Revenue by ${schema.find((column) => column.id === dimension)?.label ?? 'category'}`} onChange={(event) => setTitle(event.target.value)} /></label>
        <label>Dimension<select value={dimension} onChange={(event) => setDimensionId(event.target.value)}>{schema.map((column) => <option key={column.id} value={column.id}>{column.label}</option>)}</select></label>
        <label>Metric<select value={metric} onChange={(event) => { setMetricId(event.target.value); if (event.target.value === dimension) setAggregation('count'); }}>{numericColumns.map((column) => <option key={column.id} value={column.id}>{column.label}</option>)}<option value={dimension}>Records (count)</option></select></label>
        <label>Aggregation<select value={aggregation} onChange={(event) => setAggregation(event.target.value as ChartSpec['aggregation'])}><option value="sum" disabled={metric === dimension}>Sum</option><option value="average" disabled={metric === dimension}>Average</option><option value="count">Count</option><option value="min" disabled={metric === dimension}>Minimum</option><option value="max" disabled={metric === dimension}>Maximum</option></select></label>
        <label>Chart type<select value={type} onChange={(event) => setType(event.target.value as typeof type)}><option value="bar">Bar</option><option value="line">Line</option><option value="area">Area</option><option value="pie">Donut</option></select></label>
      </section>
      {(filters.length > 0 || crossFilters.length > 0 || searchQuery) && <FilterChips filters={[...filters, ...crossFilters]} schema={schema} searchQuery={searchQuery} clearSearch={() => setSearchQuery('')} clearAll={() => { clearFilters(); clearCrossFilters(); setSearchQuery(''); }} />}
      <div className="chart-grid chart-grid--builder"><Suspense fallback={<div className="chart-card panel chart-loading">Loading visualization…</div>}><AnalyticsChart title={chartTitle} rows={rows} schema={schema} dimensionId={dimension} metricId={metric} aggregation={aggregation} type={type} onSelect={handleChartSelect} /></Suspense></div>
      <div className="panel chart-note"><ShieldCheck size={16} /><span>Charts use filtered records from this session. No source data leaves your browser.</span></div>
    </div>
  );
}

export function ViewsPage() {
  const savedViews = useAppStore((state) => state.savedViews);
  const activeDataset = useAppStore((state) => state.activeDataset);
  const saveView = useAppStore((state) => state.saveView);
  const deleteView = useAppStore((state) => state.deleteView);
  const loadView = useAppStore((state) => state.loadView);
  const addToast = useAppStore((state) => state.addToast);
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();
  const create = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || !activeDataset) return;
    saveView(trimmed);
    setName('');
    setCreating(false);
  };
  const shareView = async (view: SavedView) => {
    const url = new URL(window.location.href);
    url.hash = `/explore?view=${encodeURIComponent(view.id)}`;
    try {
      await navigator.clipboard.writeText(url.toString());
      addToast({ type: 'success', title: 'View link copied', description: 'The link contains only the saved view ID; the dataset and view must also be available in that browser.' });
    } catch (error) {
      console.error('Could not copy the saved view URL.', error);
      addToast({ type: 'error', title: 'Could not copy link', description: 'Clipboard access was denied. You can open the view and copy its URL from the address bar.' });
    }
  };
  return (
    <div className="page-stack">
      <PageHeading eyebrow="YOUR WORKSPACE" title="Saved Views" description="Pick up where you left off with a saved search, filter, sort, and column setup." actions={<button className="button button--primary button--small" type="button" onClick={() => setCreating((open) => !open)} disabled={!activeDataset}><Plus size={15} /> Save current view</button>} />
      {creating && <form className="panel inline-form" onSubmit={create}><label htmlFor="view-name">View name</label><input id="view-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. North America orders" autoFocus /><button className="button button--primary button--small" disabled={!name.trim()}>Save view</button><button className="icon-button" type="button" aria-label="Cancel" onClick={() => setCreating(false)}><X size={16} /></button></form>}
      {savedViews.length === 0 ? <EmptyDataset heading="No saved views yet" description={activeDataset ? 'Set up a search or filters in Data Explorer, then save the setup here.' : 'Saved views keep your filters and column preferences, not copies of your data.'} /> : (
        <div className="cards-grid">{savedViews.map((view) => <SavedViewCard key={view.id} view={view} activeDatasetId={activeDataset?.id} onOpen={() => { loadView(view); if (view.datasetId === activeDataset?.id) navigate('/explore'); }} onDelete={() => deleteView(view.id)} onShare={() => void shareView(view)} />)}</div>
      )}
      <div className="panel storage-note"><LockKeyhole size={16} /><span>Saved views are stored in this browser using IndexedDB, with a localStorage fallback. Imported file contents are not persisted; reload those files to use their views again.</span></div>
    </div>
  );
}

function SavedViewCard({ view, activeDatasetId, onOpen, onDelete, onShare }: { view: SavedView; activeDatasetId?: string; onOpen: () => void; onDelete: () => void; onShare: () => void }) {
  const date = new Date(view.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  return (
    <article className="panel saved-card">
      <div className="saved-card-head"><div className="saved-icon"><Bookmark size={17} /></div><button className="icon-button danger-hover" type="button" aria-label={`Delete ${view.name}`} onClick={onDelete}><Trash2 size={15} /></button></div>
      <h3>{view.name}</h3><p>{view.query.filters.length} filters · {view.query.sorting.length ? 'Sorted' : 'Default sort'} · saved {date}</p>
      <div className="saved-card-bottom"><span className={view.datasetId === activeDatasetId ? 'status-tag status-tag--ready' : 'status-tag'}>{view.datasetId === activeDatasetId ? 'Dataset ready' : 'Dataset needed'}</span><div className="card-actions"><button type="button" className="icon-button" aria-label={`Copy link for ${view.name}`} title="Copy local view link" onClick={onShare}><Share2 size={14} /></button><button type="button" className="text-link" onClick={onOpen}>Open view <ArrowRight size={13} /></button></div></div>
    </article>
  );
}

export function DashboardsPage() {
  const dashboards = useAppStore((state) => state.dashboards);
  const activeDataset = useAppStore((state) => state.activeDataset);
  const createDashboard = useAppStore((state) => state.createDashboard);
  const deleteDashboard = useAppStore((state) => state.deleteDashboard);
  const duplicateDashboard = useAppStore((state) => state.duplicateDashboard);
  const activeDashboard = useAppStore((state) => state.activeDashboard);
  const setActiveDashboard = useAppStore((state) => state.setActiveDashboard);
  const addDashboardPanel = useAppStore((state) => state.addDashboardPanel);
  const removeDashboardPanel = useAppStore((state) => state.removeDashboardPanel);
  const moveDashboardPanel = useAppStore((state) => state.moveDashboardPanel);
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [rename, setRename] = useState('');
  const { rows, schema } = useDatasetControls();
  const current = activeDashboard;
  const create = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    createDashboard(name.trim());
    setName('');
    setCreating(false);
  };
  const addPanel = (type: 'chart' | 'kpi') => {
    if (!current || !activeDataset) return;
    const dimension = schema.find((column) => ['string', 'date', 'datetime'].includes(column.type)) ?? schema[0];
    const metric = schema.find((column) => /revenue|sales|amount/i.test(column.key)) ?? schema.find((column) => ['integer', 'number'].includes(column.type));
    const panel: DashboardPanel = {
      id: uuidv4(), type, title: type === 'kpi' ? 'Records in view' : `${metric?.label ?? 'Record count'} by ${dimension?.label ?? 'category'}`,
      position: { x: 0, y: 0, w: 6, h: 4 },
      ...(type === 'chart' && dimension && metric ? { chartSpec: { id: uuidv4(), title: `${metric.label} by ${dimension.label}`, type: 'bar', dimensionColumnId: dimension.id, metricColumnId: metric.id, aggregation: 'sum', crossFilterEnabled: true } as ChartSpec } : {}),
    };
    addDashboardPanel(current.id, panel);
  };
  if (current) {
    const usedDataset = activeDataset?.id === current.datasetId;
    return (
      <div className="page-stack">
        <PageHeading eyebrow="WORKSPACE / DASHBOARDS" title={current.name} description="A local canvas for the metrics and charts you want to revisit." actions={<><button className="button button--secondary button--small" type="button" onClick={() => setRenaming((open) => !open)}>Rename</button><button className="button button--secondary button--small" type="button" onClick={() => addPanel('kpi')} disabled={!usedDataset}><Plus size={14} /> Add metric</button><button className="button button--primary button--small" type="button" onClick={() => addPanel('chart')} disabled={!usedDataset}><Plus size={14} /> Add chart</button></>} />
        <button className="back-link" type="button" onClick={() => setActiveDashboard(null)}>← All dashboards</button>
        {renaming && <form className="panel inline-form" onSubmit={(event) => { event.preventDefault(); if (rename.trim()) { useAppStore.getState().renameDashboard(current.id, rename.trim()); setRenaming(false); setRename(''); } }}><label htmlFor="dashboard-rename">Dashboard name</label><input id="dashboard-rename" value={rename} onChange={(event) => setRename(event.target.value)} placeholder={current.name} autoFocus /><button className="button button--primary button--small">Save name</button></form>}
        {!usedDataset && <div className="notice-banner"><Database size={16} /> Load the dataset associated with this dashboard to see its live charts and values.</div>}
        {current.panels.length === 0 ? <EmptyDataset heading="Your dashboard is ready" description="Add a metric or chart to start building a personal dashboard." /> : (
          <div className="dashboard-panel-grid">{current.panels.map((panel, index) => {
            const controls = <div className="dashboard-panel-tools"><button className="icon-button" type="button" aria-label={`Move ${panel.title} up`} title="Move up" disabled={index === 0} onClick={() => moveDashboardPanel(current.id, panel.id, -1)}><ArrowUp size={14} /></button><button className="icon-button" type="button" aria-label={`Move ${panel.title} down`} title="Move down" disabled={index === current.panels.length - 1} onClick={() => moveDashboardPanel(current.id, panel.id, 1)}><ArrowDown size={14} /></button><button className="icon-button danger-hover" type="button" aria-label={`Remove ${panel.title}`} title="Remove panel" onClick={() => removeDashboardPanel(current.id, panel.id)}><Trash2 size={14} /></button></div>;
            if (panel.type === 'chart' && panel.chartSpec && usedDataset) {
              const spec = panel.chartSpec;
              return <div className="dashboard-panel-item" key={panel.id}>{controls}<Suspense fallback={<div className="chart-card panel chart-loading">Loading visualization…</div>}><AnalyticsChart title={panel.title} rows={rows} schema={schema} dimensionId={spec.dimensionColumnId} metricId={spec.metricColumnId} aggregation={spec.aggregation} type={spec.type === 'pie' ? 'pie' : spec.type === 'line' ? 'line' : 'bar'} /></Suspense></div>;
            }
            return <div className="dashboard-panel-item" key={panel.id}>{controls}<article className="panel dashboard-kpi"><div className="metric-icon"><Database size={16} /></div><span>{panel.title}</span><strong>{usedDataset ? NUMBER.format(rows.length) : '—'}</strong><small>records in current view</small></article></div>;
          })}</div>
        )}
      </div>
    );
  }
  return (
    <div className="page-stack">
      <PageHeading eyebrow="YOUR WORKSPACE" title="Dashboards" description="Collect the charts and metrics that help you make sense of a dataset." actions={<button type="button" className="button button--primary button--small" onClick={() => setCreating((open) => !open)} disabled={!activeDataset}><Plus size={15} /> New dashboard</button>} />
      {creating && <form className="panel inline-form" onSubmit={create}><label htmlFor="dashboard-name">Dashboard name</label><input id="dashboard-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Quarterly sales" autoFocus /><button className="button button--primary button--small" disabled={!name.trim()}>Create dashboard</button><button className="icon-button" type="button" aria-label="Cancel" onClick={() => setCreating(false)}><X size={16} /></button></form>}
      {dashboards.length === 0 ? <EmptyDataset heading="No dashboards yet" description={activeDataset ? 'Create a dashboard, then add charts or metrics from your current dataset.' : 'Load a dataset before creating a dashboard.'} /> : <div className="cards-grid">{dashboards.map((dashboard) => (
        <article className="panel saved-card" key={dashboard.id}>
          <div className="saved-card-head"><div className="saved-icon saved-icon--purple"><LayoutDashboard size={17} /></div><button className="icon-button danger-hover" type="button" aria-label={`Delete ${dashboard.name}`} onClick={() => deleteDashboard(dashboard.id)}><Trash2 size={15} /></button></div>
          <h3>{dashboard.name}</h3><p>{dashboard.panels.length} panels · Updated {new Date(dashboard.updatedAt).toLocaleDateString()}</p>
          <div className="saved-card-bottom"><span className="status-tag">{activeDataset?.id === dashboard.datasetId ? 'Dataset ready' : 'Local dashboard'}</span><div className="card-actions"><button type="button" className="text-link" onClick={() => setActiveDashboard(dashboard.id)}>Open <ArrowRight size={13} /></button><button type="button" className="icon-button" aria-label={`Duplicate ${dashboard.name}`} onClick={() => duplicateDashboard(dashboard.id)}><Columns3 size={14} /></button></div></div>
        </article>
      ))}</div>}
    </div>
  );
}

export function SettingsPage() {
  const theme = useAppStore((state) => state.theme);
  const setTheme = useAppStore((state) => state.setTheme);
  const activeDataset = useAppStore((state) => state.activeDataset);
  const clearDataset = useAppStore((state) => state.clearDataset);
  const clearWorkspace = useAppStore((state) => state.clearWorkspace);
  const addToast = useAppStore((state) => state.addToast);
  return (
    <div className="page-stack">
      <PageHeading eyebrow="PREFERENCES" title="Settings" description="Manage the local interface and understand what this preview stores." />
      <section className="panel settings-section"><div className="section-heading"><div><h2>Appearance</h2><p>Choose the contrast that works best for you.</p></div><Settings2 size={18} /></div><div className="settings-row"><div><strong>Theme</strong><span>Switch between dark and light appearance.</span></div><select aria-label="Theme" value={theme} onChange={(event) => setTheme(event.target.value as 'dark' | 'light')}><option value="dark">Dark</option><option value="light">Light</option></select></div></section>
      <section className="panel settings-section"><div className="section-heading"><div><h2>Data & privacy</h2><p>Imported files are held in memory for this session only.</p></div><LockKeyhole size={18} /></div><div className="settings-row"><div><strong>Active dataset</strong><span>{activeDataset ? `${activeDataset.name} · ${NUMBER.format(activeDataset.rowCount)} rows · ${activeDataset.format.toUpperCase()}` : 'No dataset loaded'}</span></div><span className="status-tag status-tag--ready">Local only</span></div><div className="settings-row"><div><strong>Saved workspace</strong><span>Saved views, dashboards, and theme preference are kept in this browser's IndexedDB, with a localStorage fallback.</span></div><span className="status-tag">This device</span></div><div className="settings-actions"><button type="button" className="button button--secondary button--small" onClick={() => { clearDataset(); addToast({ type: 'success', title: 'Dataset cleared', description: 'The active in-memory dataset was removed.' }); }}>Clear active dataset</button><button type="button" className="button button--danger button--small" onClick={() => { if (window.confirm('Clear saved views and dashboards from this browser?')) { clearWorkspace(); addToast({ type: 'success', title: 'Workspace cleared', description: 'Saved views and dashboards have been removed.' }); } }}>Clear saved workspace</button></div></section>
      <section className="panel settings-section"><div className="section-heading"><div><h2>About this preview</h2><p>Frontend-first release of DataLens.</p></div><Database size={18} /></div><div className="settings-row"><div><strong>DataLens</strong><span>Private, local-first data exploration studio · version 0.1.0</span></div><span className="status-tag">Frontend preview</span></div><div className="settings-row"><div><strong>Supported formats</strong><span>CSV and JSON arrays of objects · up to 25 MB per file</span></div><span className="status-tag">Browser processing</span></div></section>
    </div>
  );
}

export function HelpPage() {
  return (
    <div className="page-stack">
      <PageHeading eyebrow="DOCUMENTATION" title="Help & shortcuts" description="A quick guide to exploring data in this frontend preview." />
      <section className="panel help-section"><div className="help-icon"><CircleHelp size={18} /></div><div><h2>Start exploring</h2><p>Load the built-in synthetic sales dataset or import a CSV file with a header row. JSON imports must be an array of flat objects; nested values are displayed as text. Files larger than 25 MB are rejected to keep browser use predictable.</p><div className="help-actions"><SampleButton /><Link className="button button--secondary button--small" to="/explore"><Table2 size={15} /> Open Data Explorer</Link></div></div></section>
      <section className="panel help-section"><div className="help-icon"><Search size={18} /></div><div><h2>Keyboard tips</h2><div className="shortcut-list"><span>Open navigation search</span><kbd>Ctrl / ⌘ + K</kbd><span>Search dataset rows</span><kbd>Type in the grid search</kbd><span>Sort a column</span><kbd>Activate a column heading</kbd><span>Dismiss a dialog or menu</span><kbd>Esc</kbd></div></div></section>
      <section className="panel help-section"><div className="help-icon"><ShieldCheck size={18} /></div><div><h2>Privacy and current limits</h2><p>Data is processed client-side. Sample data and workspace preferences can be restored locally; imported records are not written to storage and need to be re-imported after a refresh. This release does not include accounts, cloud sync, a backend, Parquet, or a large-file database engine.</p></div></section>
    </div>
  );
}
