import type { DatasetMetadata, FilterRule } from '../types';

export type DataRecord = Record<string, unknown>;

function matchesFilter(value: unknown, filter: FilterRule): boolean {
  const filterValue = filter.value;
  const text = String(value ?? '').toLowerCase();
  const expected = String(filterValue ?? '').toLowerCase();
  const number = typeof value === 'number' ? value : Number(value);
  const expectedNumber = Number(filterValue);

  switch (filter.operator) {
    case 'equals': return String(value ?? '') === String(filterValue ?? '');
    case 'not_equals': return String(value ?? '') !== String(filterValue ?? '');
    case 'contains': return text.includes(expected);
    case 'starts_with': return text.startsWith(expected);
    case 'ends_with': return text.endsWith(expected);
    case 'gt': return Number.isFinite(number) && Number.isFinite(expectedNumber) && number > expectedNumber;
    case 'gte': return Number.isFinite(number) && Number.isFinite(expectedNumber) && number >= expectedNumber;
    case 'lt': return Number.isFinite(number) && Number.isFinite(expectedNumber) && number < expectedNumber;
    case 'lte': return Number.isFinite(number) && Number.isFinite(expectedNumber) && number <= expectedNumber;
    case 'is_empty': return value === null || value === undefined || value === '';
    case 'is_not_empty': return value !== null && value !== undefined && value !== '';
    case 'is_true': return value === true || String(value).toLowerCase() === 'true';
    case 'is_false': return value === false || String(value).toLowerCase() === 'false';
    case 'is_any_of': return Array.isArray(filter.values) && filter.values.map(String).includes(String(value));
    default: return true;
  }
}

export function filterRows(state: {
  dataRows: DataRecord[];
  activeDataset: DatasetMetadata | null;
  filters: FilterRule[];
  crossFilters: FilterRule[];
  searchQuery: string;
}): DataRecord[] {
  const { dataRows, activeDataset, filters, crossFilters, searchQuery } = state;
  const allFilters = [...filters, ...crossFilters];
  const columnKeys = new Map(activeDataset?.schema.map((column) => [column.id, column.key]) ?? []);
  const search = searchQuery.trim().toLowerCase();

  return dataRows.filter((row) => {
    if (search && !Object.values(row).some((value) => String(value ?? '').toLowerCase().includes(search))) return false;
    return allFilters.every((filter) => {
      const key = columnKeys.get(filter.columnId) ?? filter.columnId.replace(/^col_/, '');
      return matchesFilter(row[key], filter);
    });
  });
}
