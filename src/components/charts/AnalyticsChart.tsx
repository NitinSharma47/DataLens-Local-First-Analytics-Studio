import { useMemo } from 'react';
import ReactEChartsCore from 'echarts-for-react/esm/core';
import * as echarts from 'echarts/core';
import { BarChart, LineChart, PieChart } from 'echarts/charts';
import { GridComponent, TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { useAppStore, type DataRecord } from '../../store/app-store';
import type { ChartSpec, ColumnSchema } from '../../types';

const CURRENCY = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const NUMBER = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 });

echarts.use([BarChart, LineChart, PieChart, GridComponent, TooltipComponent, CanvasRenderer]);

function themeToken(name: string, fallback: string): string {
  if (typeof document === 'undefined') return fallback;
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

function escapeTooltipText(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character] ?? character);
}

function columnKey(schema: ColumnSchema[], id: string): string {
  return schema.find((column) => column.id === id)?.key ?? id.replace(/^col_/, '');
}

function formatMetricValue(value: number, isCurrency: boolean, aggregation: ChartSpec['aggregation']): string {
  return isCurrency && aggregation !== 'count' ? CURRENCY.format(value) : NUMBER.format(value);
}

function aggregateRows(rows: DataRecord[], schema: ColumnSchema[], dimensionId: string, metricId: string, aggregation: ChartSpec['aggregation']) {
  const dimensionKey = columnKey(schema, dimensionId);
  const metricKey = columnKey(schema, metricId);
  const grouped = new Map<string, number[]>();
  const dimensionType = schema.find((column) => column.id === dimensionId)?.type;
  for (const row of rows) {
    const rawDimension = row[dimensionKey];
    const dimensionText = rawDimension === null || rawDimension === undefined || rawDimension === '' ? 'Empty' : String(rawDimension);
    const dimension = dimensionType === 'date' || dimensionType === 'datetime' ? dimensionText.slice(0, 7) : dimensionText;
    const values = grouped.get(dimension) ?? [];
    if (aggregation === 'count') values.push(1);
    else {
      const value = row[metricKey];
      if (typeof value === 'number' && Number.isFinite(value)) values.push(value);
      else if (typeof value === 'string' && value.trim() && Number.isFinite(Number(value))) values.push(Number(value));
    }
    grouped.set(dimension, values);
  }
  const aggregated = [...grouped.entries()].map(([dimension, values]) => {
    const sum = values.reduce((total, value) => total + value, 0);
    const value = aggregation === 'count' || aggregation === 'sum' ? sum
      : aggregation === 'average' ? (values.length ? sum / values.length : 0)
        : aggregation === 'min' ? (values.length ? values.reduce((lowest, current) => Math.min(lowest, current)) : 0)
          : (values.length ? values.reduce((highest, current) => Math.max(highest, current)) : 0);
    return { dimension, value: Math.round(value * 100) / 100 };
  });
  const timeDimension = dimensionType === 'date' || dimensionType === 'datetime';
  return aggregated.sort((a, b) => timeDimension ? a.dimension.localeCompare(b.dimension) : b.value - a.value).slice(0, timeDimension ? 36 : 14);
}

export default function AnalyticsChart({ title, subtitle, rows, schema, dimensionId, metricId, aggregation = 'sum', type = 'bar', onSelect }: {
  title: string;
  subtitle?: string;
  rows: DataRecord[];
  schema: ColumnSchema[];
  dimensionId: string;
  metricId: string;
  aggregation?: ChartSpec['aggregation'];
  type?: 'bar' | 'line' | 'area' | 'pie';
  onSelect?: (value: string) => void;
}) {
  const theme = useAppStore((state) => state.theme);
  const data = useMemo(() => aggregateRows(rows, schema, dimensionId, metricId, aggregation), [rows, schema, dimensionId, metricId, aggregation]);
  const metricLabel = schema.find((column) => column.id === metricId)?.label ?? 'Value';
  const isCurrency = /revenue|sales|profit|cost|price|amount/i.test(metricLabel);
  const palette = ['--dl-chart-1', '--dl-chart-2', '--dl-chart-3', '--dl-chart-4', '--dl-chart-5', '--dl-chart-6', '--dl-chart-7', '--dl-chart-8']
    .map((token) => themeToken(token, '#879276'));
  const textColor = themeToken('--dl-text-secondary', theme === 'light' ? '#59564e' : '#c1bbb0');
  const axisColor = themeToken('--dl-border-primary', theme === 'light' ? '#e4dfd5' : '#39352e');
  const cardColor = themeToken('--dl-surface-card', theme === 'light' ? '#fffefa' : '#211f1b');
  const option = useMemo(() => ({
    animationDuration: 350,
    color: palette,
    tooltip: {
      trigger: type === 'pie' ? 'item' : 'axis',
      backgroundColor: cardColor,
      borderColor: axisColor,
      textStyle: { color: themeToken('--dl-text-primary', '#292721'), fontSize: 13 },
      formatter: (params: { name?: string; value?: number; data?: { name?: string; value?: number } } | Array<{ axisValue?: string; value?: number }>) => {
        if (Array.isArray(params)) return `${escapeTooltipText(params[0]?.axisValue ?? '')}<br/>${formatMetricValue(params[0]?.value ?? 0, isCurrency, aggregation)}`;
        return `${escapeTooltipText(params.name ?? params.data?.name ?? '')}<br/><strong>${formatMetricValue(params.value ?? params.data?.value ?? 0, isCurrency, aggregation)}</strong>`;
      },
    },
    grid: { left: 18, right: 16, top: 26, bottom: 24, containLabel: true },
    ...(type === 'pie' ? {
      series: [{
        type: 'pie',
        radius: ['48%', '72%'],
        center: ['50%', '52%'],
        itemStyle: { borderRadius: 5, borderColor: cardColor, borderWidth: 2 },
        label: { color: textColor, fontSize: 11 },
        data: data.map((item, index) => ({ name: item.dimension, value: item.value, itemStyle: { color: palette[index % palette.length] } })),
      }],
    } : {
      xAxis: {
        type: 'category',
        data: data.map((item) => item.dimension),
        axisLabel: { color: textColor, fontSize: 10, hideOverlap: true, rotate: data.length > 8 ? 18 : 0 },
        axisLine: { lineStyle: { color: axisColor } },
        axisTick: { show: false },
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: textColor, fontSize: 10, formatter: (value: number) => isCurrency && aggregation !== 'count' ? value >= 1000 ? `$${(value / 1000).toFixed(0)}k` : `$${value}` : NUMBER.format(value) },
        splitLine: { lineStyle: { color: axisColor, type: 'dashed' } },
      },
      series: [{
        type: type === 'area' ? 'line' : type,
        data: data.map((item) => item.value),
        smooth: type !== 'bar',
        barMaxWidth: 28,
        showSymbol: false,
        itemStyle: { color: type === 'bar' ? palette[0] : palette[1], borderRadius: type === 'bar' ? [4, 4, 0, 0] : 0 },
        areaStyle: type === 'area' ? { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: `${palette[1]}66` }, { offset: 1, color: `${palette[1]}00` }] } } : undefined,
      }],
    }),
  }), [data, type, textColor, axisColor, cardColor, palette, isCurrency, aggregation]);
  const onEvents = useMemo(() => onSelect ? {
    click: (params: { name?: string; data?: { name?: string } }) => onSelect(params.name ?? params.data?.name ?? ''),
  } : undefined, [onSelect]);

  return (
    <article className="chart-card panel">
      <div className="chart-card-heading">
        <div><h3>{title}</h3><p>{subtitle ?? `${aggregation[0].toUpperCase()}${aggregation.slice(1)} by ${schema.find((column) => column.id === dimensionId)?.label ?? 'category'}`}</p></div>
        {onSelect && <span className="chart-hint">Select a mark to filter</span>}
      </div>
      {data.length === 0 ? <div className="chart-empty">No chartable records in this view.</div> : (
        <ReactEChartsCore
          echarts={echarts}
          option={option}
          onEvents={onEvents}
          style={{ height: 270, width: '100%' }}
          opts={{ renderer: 'canvas' }}
          aria-label={`${title}, chart`}
        />
      )}
      <div className="sr-only">
        <table><caption>{title} data</caption><tbody>{data.map((item) => <tr key={item.dimension}><th>{item.dimension}</th><td>{NUMBER.format(item.value)}</td></tr>)}</tbody></table>
      </div>
    </article>
  );
}
