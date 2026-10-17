// DataLens — Core type definitions

export type ColumnType = 'string' | 'boolean' | 'integer' | 'number' | 'date' | 'datetime' | 'null' | 'mixed';

export interface ColumnSchema {
  id: string;
  key: string;
  label: string;
  type: ColumnType;
  nullable: boolean;
  inferred: boolean;
  sourceIndex: number;
}

export interface ColumnProfile {
  columnId: string;
  nonNullCount: number;
  nullCount: number;
  nullPercentage: number;
  distinctCount: number;
  min?: number | string;
  max?: number | string;
  mean?: number;
  median?: number;
  topValues?: Array<{ value: string; count: number }>;
}

export interface DatasetMetadata {
  id: string;
  name: string;
  sourceFileName?: string;
  format: 'csv' | 'json' | 'parquet' | 'sample';
  rowCount: number;
  columnCount: number;
  importedAt: string;
  schemaVersion: number;
  engineKind: 'memory' | 'worker' | 'duckdb-wasm';
  schema: ColumnSchema[];
  profile?: ColumnProfile[];
  sizeBytes?: number;
}

export interface FilterRule {
  id: string;
  columnId: string;
  operator: string;
  value?: unknown;
  values?: unknown[];
}

export interface SortingRule {
  columnId: string;
  desc: boolean;
}

export interface QueryState {
  search?: string;
  filters: FilterRule[];
  sorting: SortingRule[];
  grouping: string[];
  hiddenColumnIds: string[];
  pinnedColumnIds: { left: string[]; right: string[] };
  columnOrder: string[];
  columnWidths: Record<string, number>;
}

export interface ChartSpec {
  id: string;
  title: string;
  type: 'bar' | 'line' | 'area' | 'scatter' | 'histogram' | 'pie';
  dimensionColumnId: string;
  metricColumnId: string;
  aggregation: 'count' | 'sum' | 'average' | 'min' | 'max';
  seriesColumnId?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: FilterRule[];
  crossFilterEnabled: boolean;
}

export interface DashboardPanel {
  id: string;
  type: 'chart' | 'table' | 'kpi';
  chartSpec?: ChartSpec;
  position: { x: number; y: number; w: number; h: number };
  title: string;
}

export interface Dashboard {
  id: string;
  name: string;
  datasetId: string;
  panels: DashboardPanel[];
  createdAt: string;
  updatedAt: string;
}

export interface SavedView {
  id: string;
  name: string;
  datasetId: string;
  query: QueryState;
  chartSpecs?: ChartSpec[];
  createdAt: string;
  updatedAt: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  duration?: number;
}

export type ThemeMode = 'dark' | 'light' | 'system';
