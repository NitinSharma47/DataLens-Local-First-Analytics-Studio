# DataLens

DataLens is a local-first data exploration studio for inspecting CSV and JSON files, filtering records, and creating interactive charts without uploading source data to a service.

> **Privacy model:** imported rows stay in memory in this browser tab. Saved views, dashboard definitions, and preferences are stored locally in IndexedDB with a localStorage fallback. There is no account, server, telemetry, or cloud sync.

## Implemented

- Responsive workspace: Overview, Data Explorer, Chart Builder, Dashboards, Saved Views, Settings, and Help.
- Deterministic synthetic sales sample with 1,000 records.
- CSV and JSON array-of-objects import, capped at 25 MB.
- CSV/JSON parsing and column profiling in a dedicated Web Worker.
- Column type inference, null counts, distinct counts, frequent values, and numeric summaries.
- Search, sorting, column filters, chart cross-filters, column visibility, and virtualized table rows.
- Filtered CSV export with spreadsheet formula-leading values escaped.
- Interactive ECharts visualizations with a text alternative table.
- Saved views and dashboards, including dashboard panel creation, removal, and ordering.
- Local-only saved-view links containing an opaque local view ID (no row data or filter values).
- IndexedDB workspace persistence, schema versioning, migration from the former localStorage record, and localStorage fallback.
- Light parchment / warm-neutral and dark espresso themes, responsive navigation, keyboard shortcuts, and a quick-action palette.
- Error boundary, local-file privacy notice, and user-facing import/storage errors.
- GitHub Actions checks and optional GitHub Pages deployment on pushes to `main`.

## Known limitations and roadmap

- Import is limited to 25 MB. Parsing and profiling run in a worker, but filtering and chart aggregation still process in-memory rows on the UI thread. Virtualizing the grid does not eliminate that cost.
- DuckDB-WASM, Parquet, grouping, pinning, column resizing/reordering, compact URL filter state, and million-row performance targets are not implemented or claimed.
- Dashboard charts use their saved specification and current in-memory rows; advanced drag-and-drop resizing, independent query models, and dashboard-level cross-filter orchestration are not implemented.
- Automated tests currently cover core filter/query behavior and the rendering error boundary; full import fixture, accessibility, cross-browser, and end-to-end suites remain future work.


## Technology and cost

React, TypeScript, Vite, Zustand, Dexie, TanStack Virtual, Apache ECharts, Papa Parse, Vitest, Testing Library, and GitHub Actions are free/open-source tools. Static hosting through GitHub Pages is free for public repositories, subject to GitHub's current plan limits. No paid API, account service, or secret key is required.

## Requirements and run locally

Use Node.js 22 (or another release supported by Vite 8) and npm.

```powershell
npm ci
npm run dev
```

Open the local URL printed by Vite. Load the sample dataset for a quick walkthrough or import a local CSV/JSON file.

## Quality checks

```powershell
npm run lint
npm run typecheck
npm run test:run
npm run build
npm run preview
```

`npm run build` writes the static site to `dist/`. The ECharts chart bundle currently triggers Vite's large-chunk advisory; builds still succeed.

## Deploy to GitHub Pages

1. Push this project to a GitHub repository and use the `main` branch.
2. In **Settings → Pages**, set the build and deployment source to **GitHub Actions**.
3. Push to `main`. `.github/workflows/deploy.yml` runs lint, typecheck, tests, and the production build, then deploys `dist/`.
4. Open the Pages URL from the workflow deployment and smoke-test import, navigation, charts, saved views, and browser storage.

The app uses hash-based navigation and relative asset paths so project-site URLs work without server-side SPA rewrite rules. The same `dist/` output can be hosted on other static hosts.

## Architecture

```text
Local CSV/JSON file
        │
        ▼
src/data/import-data.ts ── module Web Worker ── parse / validate / profile
        │
        ▼
in-memory dataset ── shared filters ── virtualized explorer + charts
        │
        └── saved views / dashboards / preferences
                └── IndexedDB (version 1), localStorage fallback
```

## Project layout

```text
src/
  components/layout/   Sidebar and top navigation
  components/ui/       Toasts and error boundary
  components/charts/   Lazy-loaded ECharts renderer
  data/                Sample data, worker import, and query/filter functions
  pages/               Workspace routes
  store/               Zustand application state and persistence
  styles/              Design tokens and global styles
  types/               Dataset, query, chart, and persistence contracts
.github/workflows/     CI checks and GitHub Pages deployment
```

## Privacy and data handling

- Data files are read locally by the browser and are not sent to DataLens or a telemetry endpoint.
- Imported row contents are rendered as text and are not included in URLs or application error messages.
- Only workspace configuration and sample-dataset metadata are persisted; imported file rows must be loaded again after refresh.
- CSV export prefixes formula-leading values (including values with leading whitespace) before CSV quoting.
- Clearing the active dataset removes imported rows from the current app state. Clearing the saved workspace removes local saved views, dashboards, and active-dashboard state.

## Accessibility and browser notes

The UI includes semantic page landmarks, keyboard-visible focus, a skip link, labeled controls, keyboard-operable navigation, chart data tables for assistive technology, and reduced-motion support. Automated accessibility and manual keyboard/screen-reader checks have not yet been completed; this is not a WCAG conformance claim. The app is built for modern browsers with Web Worker, IndexedDB, and module-worker support; dedicated cross-browser testing remains outstanding.
