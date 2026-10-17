// DataLens — Sample Sales Dataset
// Deterministic, realistic data for demonstrating all product features.
// Includes dates, categories, numerics, booleans, and deliberate null/missing values.

import type { DatasetMetadata, ColumnSchema, ColumnProfile } from '../types';

const REGIONS = ['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East & Africa'];
const CATEGORIES = ['Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books', 'Food & Beverage', 'Health & Beauty', 'Automotive'];
const SUB_CATEGORIES: Record<string, string[]> = {
  'Electronics': ['Laptops', 'Smartphones', 'Tablets', 'Accessories', 'Audio'],
  'Clothing': ['Men\'s Wear', 'Women\'s Wear', 'Kids', 'Footwear', 'Accessories'],
  'Home & Garden': ['Furniture', 'Kitchen', 'Decor', 'Garden Tools', 'Lighting'],
  'Sports': ['Fitness', 'Outdoor', 'Team Sports', 'Water Sports', 'Winter Sports'],
  'Books': ['Fiction', 'Non-Fiction', 'Academic', 'Children\'s', 'Comics'],
  'Food & Beverage': ['Snacks', 'Beverages', 'Organic', 'Frozen', 'Dairy'],
  'Health & Beauty': ['Skincare', 'Haircare', 'Supplements', 'Makeup', 'Wellness'],
  'Automotive': ['Parts', 'Accessories', 'Tools', 'Care Products', 'Electronics'],
};
const CHANNELS = ['Online', 'Retail Store', 'Wholesale', 'Marketplace'];
const STATUSES = ['Completed', 'Pending', 'Shipped', 'Returned', 'Cancelled'];
const CUSTOMERS = [
  'Acme Corp', 'TechVision Inc', 'Global Traders', 'Summit Partners', 'Blue Ocean LLC',
  'Pinnacle Group', 'Horizon Labs', 'Vertex Solutions', 'Nexus Corp', 'Atlas Industries',
  'Prime Holdings', 'Sterling & Co', 'Vantage Point', 'Ember Technologies', 'Catalyst Inc',
  'Quantum Dynamics', 'Frontier Systems', 'Eclipse Digital', 'CoreTech Labs', 'Zenith Global',
];

// Seeded pseudo-random number generator for deterministic data
function mulberry32(seed: number) {
  return function () {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function generateDate(rng: () => number, startYear: number, endYear: number): string {
  const year = startYear + Math.floor(rng() * (endYear - startYear + 1));
  const month = 1 + Math.floor(rng() * 12);
  const day = 1 + Math.floor(rng() * 28);
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export interface SalesRecord {
  [key: string]: unknown;
  id: string;
  orderDate: string;
  region: string;
  category: string;
  subCategory: string;
  product: string;
  channel: string;
  customer: string;
  quantity: number | null;
  unitPrice: number | null;
  revenue: number | null;
  cost: number | null;
  profit: number | null;
  discount: number | null;
  status: string;
  isReturned: boolean;
  rating: number | null;
  shippingDays: number | null;
}

export function generateSalesData(count: number = 1000, seed: number = 42): SalesRecord[] {
  const rng = mulberry32(seed);
  const records: SalesRecord[] = [];

  for (let i = 0; i < count; i++) {
    const category = CATEGORIES[Math.floor(rng() * CATEGORIES.length)];
    const subCats = SUB_CATEGORIES[category];
    const subCategory = subCats[Math.floor(rng() * subCats.length)];
    const quantity = rng() > 0.03 ? Math.floor(rng() * 50) + 1 : null;
    const unitPrice = rng() > 0.02 ? Math.round((rng() * 500 + 5) * 100) / 100 : null;
    const revenue = (quantity !== null && unitPrice !== null)
      ? Math.round(quantity * unitPrice * 100) / 100
      : null;
    const costRatio = 0.4 + rng() * 0.35;
    const cost = revenue !== null ? Math.round(revenue * costRatio * 100) / 100 : null;
    const profit = (revenue !== null && cost !== null) ? Math.round((revenue - cost) * 100) / 100 : null;
    const discount = rng() > 0.3 ? Math.round(rng() * 25 * 100) / 100 : 0;
    const status = STATUSES[Math.floor(rng() * STATUSES.length)];
    const isReturned = status === 'Returned';
    const rating = rng() > 0.08 ? Math.round((rng() * 4 + 1) * 10) / 10 : null;
    const shippingDays = rng() > 0.05 ? Math.floor(rng() * 14) + 1 : null;

    records.push({
      id: `ORD-${String(i + 1).padStart(5, '0')}`,
      orderDate: generateDate(rng, 2023, 2025),
      region: REGIONS[Math.floor(rng() * REGIONS.length)],
      category,
      subCategory,
      product: `${subCategory} ${String.fromCharCode(65 + Math.floor(rng() * 26))}${Math.floor(rng() * 100)}`,
      channel: CHANNELS[Math.floor(rng() * CHANNELS.length)],
      customer: CUSTOMERS[Math.floor(rng() * CUSTOMERS.length)],
      quantity,
      unitPrice,
      revenue,
      cost,
      profit,
      discount,
      status,
      isReturned,
      rating,
      shippingDays,
    });
  }
  return records;
}

// Pre-generated dataset for immediate use
export const SAMPLE_SALES_DATA = generateSalesData(1000);

// Schema definition for the sales dataset
export const SALES_SCHEMA: ColumnSchema[] = [
  { id: 'col_id', key: 'id', label: 'Order ID', type: 'string', nullable: false, inferred: false, sourceIndex: 0 },
  { id: 'col_orderDate', key: 'orderDate', label: 'Order Date', type: 'date', nullable: false, inferred: true, sourceIndex: 1 },
  { id: 'col_region', key: 'region', label: 'Region', type: 'string', nullable: false, inferred: false, sourceIndex: 2 },
  { id: 'col_category', key: 'category', label: 'Category', type: 'string', nullable: false, inferred: false, sourceIndex: 3 },
  { id: 'col_subCategory', key: 'subCategory', label: 'Sub-Category', type: 'string', nullable: false, inferred: false, sourceIndex: 4 },
  { id: 'col_product', key: 'product', label: 'Product', type: 'string', nullable: false, inferred: false, sourceIndex: 5 },
  { id: 'col_channel', key: 'channel', label: 'Channel', type: 'string', nullable: false, inferred: false, sourceIndex: 6 },
  { id: 'col_customer', key: 'customer', label: 'Customer', type: 'string', nullable: false, inferred: false, sourceIndex: 7 },
  { id: 'col_quantity', key: 'quantity', label: 'Quantity', type: 'integer', nullable: true, inferred: true, sourceIndex: 8 },
  { id: 'col_unitPrice', key: 'unitPrice', label: 'Unit Price', type: 'number', nullable: true, inferred: true, sourceIndex: 9 },
  { id: 'col_revenue', key: 'revenue', label: 'Revenue', type: 'number', nullable: true, inferred: true, sourceIndex: 10 },
  { id: 'col_cost', key: 'cost', label: 'Cost', type: 'number', nullable: true, inferred: true, sourceIndex: 11 },
  { id: 'col_profit', key: 'profit', label: 'Profit', type: 'number', nullable: true, inferred: true, sourceIndex: 12 },
  { id: 'col_discount', key: 'discount', label: 'Discount %', type: 'number', nullable: false, inferred: true, sourceIndex: 13 },
  { id: 'col_status', key: 'status', label: 'Status', type: 'string', nullable: false, inferred: false, sourceIndex: 14 },
  { id: 'col_isReturned', key: 'isReturned', label: 'Returned', type: 'boolean', nullable: false, inferred: true, sourceIndex: 15 },
  { id: 'col_rating', key: 'rating', label: 'Rating', type: 'number', nullable: true, inferred: true, sourceIndex: 16 },
  { id: 'col_shippingDays', key: 'shippingDays', label: 'Shipping Days', type: 'integer', nullable: true, inferred: true, sourceIndex: 17 },
];

function computeProfile(data: SalesRecord[]): ColumnProfile[] {
  return SALES_SCHEMA.map((col) => {
    const values = data.map((r) => (r as Record<string, unknown>)[col.key]);
    const nonNullValues = values.filter((v) => v !== null && v !== undefined);
    const nullCount = values.length - nonNullValues.length;
    const distinctValues = new Set(nonNullValues.map(String));

    const profile: ColumnProfile = {
      columnId: col.id,
      nonNullCount: nonNullValues.length,
      nullCount,
      nullPercentage: Math.round((nullCount / values.length) * 10000) / 100,
      distinctCount: distinctValues.size,
    };

    if (col.type === 'number' || col.type === 'integer') {
      const nums = nonNullValues.filter((v): v is number => typeof v === 'number');
      if (nums.length > 0) {
        profile.min = Math.min(...nums);
        profile.max = Math.max(...nums);
        profile.mean = Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 100) / 100;
        const sorted = [...nums].sort((a, b) => a - b);
        profile.median = sorted[Math.floor(sorted.length / 2)];
      }
    }

    if (col.type === 'string') {
      const counts: Record<string, number> = {};
      nonNullValues.forEach((v) => { counts[String(v)] = (counts[String(v)] || 0) + 1; });
      profile.topValues = Object.entries(counts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([value, count]) => ({ value, count }));
    }

    if (col.type === 'date') {
      const dates = nonNullValues.map(String).sort();
      profile.min = dates[0];
      profile.max = dates[dates.length - 1];
    }

    return profile;
  });
}

export const SALES_PROFILE = computeProfile(SAMPLE_SALES_DATA);

export const SAMPLE_DATASET_METADATA: DatasetMetadata = {
  id: 'sample-sales-001',
  name: 'Sample Sales Data',
  sourceFileName: 'sales_data_sample.csv',
  format: 'sample',
  rowCount: SAMPLE_SALES_DATA.length,
  columnCount: SALES_SCHEMA.length,
  importedAt: new Date().toISOString(),
  schemaVersion: 1,
  engineKind: 'memory',
  schema: SALES_SCHEMA,
  profile: SALES_PROFILE,
  sizeBytes: 245000,
};

// Aggregation helpers for charts
export function aggregateBy(
  data: SalesRecord[],
  dimensionKey: string,
  metricKey: string,
  aggregation: 'count' | 'sum' | 'average' | 'min' | 'max'
): Array<{ dimension: string; value: number }> {
  const groups: Record<string, number[]> = {};

  for (const row of data) {
    const dim = String((row as Record<string, unknown>)[dimensionKey] ?? 'Unknown');
    if (!groups[dim]) groups[dim] = [];
    if (aggregation === 'count') {
      groups[dim].push(1);
    } else {
      const val = (row as Record<string, unknown>)[metricKey];
      if (typeof val === 'number') groups[dim].push(val);
    }
  }

  return Object.entries(groups)
    .map(([dimension, values]) => {
      let value = 0;
      switch (aggregation) {
        case 'count': value = values.length; break;
        case 'sum': value = values.reduce((a, b) => a + b, 0); break;
        case 'average': value = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0; break;
        case 'min': value = values.length > 0 ? Math.min(...values) : 0; break;
        case 'max': value = values.length > 0 ? Math.max(...values) : 0; break;
      }
      return { dimension, value: Math.round(value * 100) / 100 };
    })
    .sort((a, b) => b.value - a.value);
}

// Compute time-series data
export function timeSeriesAggregate(
  data: SalesRecord[],
  metricKey: string,
  aggregation: 'count' | 'sum' | 'average',
  granularity: 'month' | 'quarter' = 'month'
): Array<{ period: string; value: number }> {
  const groups: Record<string, number[]> = {};

  for (const row of data) {
    const date = row.orderDate;
    let period: string;
    if (granularity === 'month') {
      period = date.substring(0, 7); // YYYY-MM
    } else {
      const month = parseInt(date.substring(5, 7));
      const q = Math.ceil(month / 3);
      period = `${date.substring(0, 4)}-Q${q}`;
    }
    if (!groups[period]) groups[period] = [];
    if (aggregation === 'count') {
      groups[period].push(1);
    } else {
      const val = (row as Record<string, unknown>)[metricKey];
      if (typeof val === 'number') groups[period].push(val);
    }
  }

  return Object.entries(groups)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([period, values]) => {
      let value = 0;
      switch (aggregation) {
        case 'count': value = values.length; break;
        case 'sum': value = values.reduce((a, b) => a + b, 0); break;
        case 'average': value = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0; break;
      }
      return { period, value: Math.round(value * 100) / 100 };
    });
}
