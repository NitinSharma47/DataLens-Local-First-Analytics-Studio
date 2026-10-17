import { describe, expect, it } from 'vitest';
import { filterRows, type DataRecord } from './query';
import type { DatasetMetadata, FilterRule } from '../types';

const rows: DataRecord[] = [
  { region: 'East', revenue: 120, active: true, note: '' },
  { region: 'West', revenue: 80, active: false, note: 'checked' },
  { region: 'East', revenue: null, active: 'true', note: null },
];

const dataset: DatasetMetadata = {
  id: 'fixture',
  name: 'Fixture',
  format: 'json',
  rowCount: rows.length,
  columnCount: 2,
  importedAt: '2026-10-17T00:00:00.000Z',
  schemaVersion: 1,
  engineKind: 'memory',
  schema: [
    { id: 'col_0', key: 'region', label: 'Region', type: 'string', nullable: false, inferred: true, sourceIndex: 0 },
    { id: 'col_1', key: 'revenue', label: 'Revenue', type: 'number', nullable: true, inferred: true, sourceIndex: 1 },
  ],
};

function run(filters: FilterRule[] = [], crossFilters: FilterRule[] = [], searchQuery = '') {
  return filterRows({ dataRows: rows, activeDataset: dataset, filters, crossFilters, searchQuery });
}

describe('filterRows', () => {
  it('combines text search, column filters, and chart cross-filters', () => {
    const results = run(
      [{ id: 'revenue', columnId: 'col_1', operator: 'gte', value: 100 }],
      [{ id: 'region', columnId: 'col_0', operator: 'equals', value: 'East' }],
      'east',
    );

    expect(results).toEqual([rows[0]]);
  });

  it('compares numeric values while excluding blanks and non-numbers', () => {
    expect(run([{ id: 'gt', columnId: 'col_1', operator: 'gt', value: 100 }])).toEqual([rows[0]]);
  });

  it('treats null, undefined, and empty strings as empty values', () => {
    const results = run([{ id: 'empty', columnId: 'note', operator: 'is_empty' }]);
    expect(results).toEqual([rows[0], rows[2]]);
  });

  it('supports case-insensitive text operators and value lists', () => {
    expect(run([{ id: 'starts', columnId: 'col_0', operator: 'starts_with', value: 'ea' }])).toEqual([rows[0], rows[2]]);
    expect(run([{ id: 'any', columnId: 'col_0', operator: 'is_any_of', values: ['West'] }])).toEqual([rows[1]]);
  });

  it('returns all rows when no query state is active', () => {
    expect(run()).toEqual(rows);
  });
});
