import Papa from 'papaparse';
import { v4 as uuidv4 } from 'uuid';
import type { ColumnProfile, ColumnSchema, ColumnType, DatasetMetadata } from '../types';
import type { DataRecord } from '../store/app-store';

function normalizeValue(value: unknown): unknown {
  if (value === null || value === undefined || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return value;
  return JSON.stringify(value);
}

function inferType(values: unknown[]): ColumnType {
  const present = values.filter((value) => value !== null && value !== undefined && value !== '');
  if (present.length === 0) return 'null';
  if (present.every((value) => typeof value === 'boolean')) return 'boolean';
  if (present.every((value) => typeof value === 'number' && Number.isInteger(value))) return 'integer';
  if (present.every((value) => typeof value === 'number')) return 'number';
  if (present.every((value) => typeof value === 'string' && /^(true|false)$/i.test(value))) return 'boolean';
  if (present.every((value) => typeof value === 'string' && value.trim() !== '' && Number.isFinite(Number(value)))) {
    return present.every((value) => Number.isInteger(Number(value))) ? 'integer' : 'number';
  }
  if (present.every((value) => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}(?:[T ].*)?$/.test(value) && !Number.isNaN(Date.parse(value)))) {
    return present.some((value) => String(value).includes('T') || String(value).includes(' ')) ? 'datetime' : 'date';
  }
  return present.some((value) => typeof value !== 'string' && typeof value !== 'number' && typeof value !== 'boolean') ? 'mixed' : 'string';
}

function buildMetadata(file: File, rows: DataRecord[], keys: string[], format: 'csv' | 'json'): DatasetMetadata {
  const schema: ColumnSchema[] = keys.map((key, sourceIndex) => {
    const values = rows.map((row) => row[key]);
    const type = inferType(values);
    return {
      id: `col_${sourceIndex}`,
      key,
      label: key.trim() || `Column ${sourceIndex + 1}`,
      type,
      nullable: values.some((value) => value === null || value === undefined || value === ''),
      inferred: true,
      sourceIndex,
    };
  });

  const profile: ColumnProfile[] = schema.map((column) => {
    let nullCount = 0;
    let min: number | undefined;
    let max: number | undefined;
    let sum = 0;
    const distinct = new Set<string>();
    const topValues = new Map<string, number>();
    for (const row of rows) {
      const value = row[column.key];
      if (value === null || value === undefined || value === '') {
        nullCount += 1;
        continue;
      }
      const text = String(value);
      distinct.add(text);
      topValues.set(text, (topValues.get(text) ?? 0) + 1);
      if (typeof value === 'number') {
        min = min === undefined ? value : Math.min(min, value);
        max = max === undefined ? value : Math.max(max, value);
        sum += value;
      }
    }
    const nonNullCount = rows.length - nullCount;
    const numeric = column.type === 'integer' || column.type === 'number';
    return {
      columnId: column.id,
      nonNullCount,
      nullCount,
      nullPercentage: rows.length ? Math.round((nullCount / rows.length) * 10000) / 100 : 0,
      distinctCount: distinct.size,
      ...(numeric && min !== undefined ? { min, max, mean: Math.round((sum / nonNullCount) * 100) / 100 } : {}),
      topValues: [...topValues.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([value, count]) => ({ value, count })),
    };
  });

  return {
    id: uuidv4(),
    name: file.name.replace(/\.[^.]+$/, ''),
    sourceFileName: file.name,
    format,
    rowCount: rows.length,
    columnCount: schema.length,
    importedAt: new Date().toISOString(),
    schemaVersion: 1,
    engineKind: 'worker',
    schema,
    profile,
    sizeBytes: file.size,
  };
}

function normalizeRecords(records: unknown[]): { rows: DataRecord[]; keys: string[] } {
  const objectRecords = records.filter((record): record is Record<string, unknown> =>
    record !== null && typeof record === 'object' && !Array.isArray(record),
  );
  if (objectRecords.length !== records.length) throw new Error('Every item in the JSON array must be an object with named fields. The previous dataset was kept.');
  if (objectRecords.length === 0) throw new Error('No data rows were found. JSON must be an array of objects with column names as keys.');

  const keys = [...new Set(objectRecords.flatMap((record) => Object.keys(record)))];
  if (keys.length === 0) throw new Error('The JSON records do not contain any fields to display.');
  const rows = objectRecords.map((record) => Object.fromEntries(keys.map((key) => [key, normalizeValue(record[key])])) as DataRecord);
  return { rows, keys };
}

function parseJson(file: File): Promise<{ rows: DataRecord[]; keys: string[] }> {
  return file.text().then((text) => {
    let content: unknown;
    try {
      content = JSON.parse(text);
    } catch {
      throw new Error('The JSON file could not be parsed. Check that it is valid JSON, then try again.');
    }
    if (!Array.isArray(content)) throw new Error('JSON must be an array of records, for example: [{ "region": "West", "sales": 120 }].');
    return normalizeRecords(content);
  });
}

function parseCsv(file: File): Promise<{ rows: DataRecord[]; keys: string[] }> {
  return new Promise((resolve, reject) => {
    Papa.parse<DataRecord>(file, {
      header: true,
      skipEmptyLines: 'greedy',
      dynamicTyping: true,
      complete: (result) => {
        if (result.errors.length > 0) {
          const firstError = result.errors[0];
          reject(new Error(`CSV parsing stopped at row ${firstError.row ?? 'unknown'}: ${firstError.message}. The previous dataset was kept.`));
          return;
        }
        const keys = result.meta.fields ?? [];
        const rows = result.data.filter((row) => Object.values(row).some((value) => value !== null && value !== ''));
        if (rows.length === 0 || keys.length === 0) {
          reject(new Error('The CSV contains no usable header and data rows.'));
          return;
        }
        resolve({ rows, keys });
      },
      error: (error) => reject(new Error(`CSV import failed: ${error.message}`)),
    });
  });
}

self.onmessage = (event: MessageEvent<File>) => {
  const file = event.data;
  const isJson = /\.json$/i.test(file.name);
  const parse = isJson ? parseJson(file) : parseCsv(file);

  void parse.then(({ rows, keys }) => {
    self.postMessage({ dataset: { metadata: buildMetadata(file, rows, keys, isJson ? 'json' : 'csv'), rows } });
  }).catch((error: unknown) => {
    self.postMessage({ error: error instanceof Error ? error.message : 'An unexpected error occurred while parsing the file.' });
  });
};
