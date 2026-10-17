## DataLens

## High-Performance Data Exploration Studio

A complete, implementation-ready blueprint for building a polished, accessible, measurable, local-first analytics application - from empty folder to tested deployment.

| DOCUMENT PURPOSE | PROJECT STANDARD | RECOMMENDED WORKFLOW |
| --- | --- | --- |
| Copy/paste master prompt plus full | A real working product: usable | Build incrementally in the repository. |
| project requirements, architecture, | workflows, trustworthy data handling, | Verify each phase with commands and |
| implementation phases, testing gates, | keyboard support, measured | tests. Do not stop at a mockup or a |
| and deployment guidance. | performance, clean code, and honest | successful development-server start. |
|   | documentation. |   |

*Prepared: 15 October 2026 | Intended for: coding assistants, VS Code workflows, and end-to-end project delivery This specification deliberately separates required product behavior from optional enhancements. Follow the phase gates instead of trying to generate the entire application in one unverified code dump.*


## Document map

Use this as a navigation guide. The full specification is intentionally detailed: keep it alongside the repository while you build.

| Section | Focus |
| --- | --- |
| Start here | How to use the PDF and quick reference |
| 1 | Product vision and definition |
| 2 | Product experience and navigation |
| 3 | End-to-end user journeys |
| 4 | Feature scope and priorities |
| 5 | Technology stack and dependency guardrails |
| 6 | Architecture and state ownership |
| 7 | Data contracts and query semantics |
| 8 | Large-file processing, workers and DuckDB-WASM |
| 9 | Data-grid behavior and edge cases |
| 10 | Chart builder, cross-filtering and dashboards |
| 11 | Persistence, URLs, privacy and security |
| 12 | Accessibility and responsive behavior |
| 13 | Performance targets, profiling and benchmarks |
| 14 | Error handling and resilience |
| 15 | Test strategy and required scenarios |
| 16 | Phased implementation plan and coding-agent protocol |
| 17 | Windows / VS Code setup, commands and troubleshooting |
| 18 | Deployment, README and recruiter-facing case study |
| 19 | Final definition-of-done checklist |
| 20 | Recommendations to raise project quality |
| 21 | Copy-and-paste master prompt |
| 22 | Official references and implementation notes |


## Read this first

## The standard for success

DataLens is not a static dashboard mockup. It is a browser-based product in which importing a dataset, exploring records, creating visualizations, saving a view, refreshing the page, and returning to the same workspace all work reliably.

## How to use this PDF

- 1. Create or open a project repository and open it in your coding assistant-enabled editor.

- 2. Attach this PDF as the authoritative product specification if your coding tool supports project files. Copy the master prompt in the final section into the tool.

- 3. Tell the assistant to inspect the repository first. It must not overwrite existing work without understanding it.

- 4. Implement one phase at a time. After each phase, run the required checks and fix failures before proceeding.

- 5. Keep the feature acceptance checklist and benchmark record updated. Do not claim a feature or metric that has not been verified.

## Quick reference

| Item | Decision |
| --- | --- |
| Product | DataLens - High-Performance Data Exploration Studio |
| Core value | Private, local-first exploration of CSV/JSON data, with |
|   | interactive tables, linked charts, and saved dashboards. |
| Primary stack | React + TypeScript + Vite; accessible custom UI; TanStack Table |
|   | + TanStack Virtual; Apache ECharts; Web Workers. |
| Advanced query path | DuckDB-WASM for large datasets and Parquet support, |
|   | introduced after the basic workflow is reliable. |
|   | IndexedDB for workspace configuration and optional user- |
| Persistence | approved dataset caching; URLs for compact shareable view |
|   | state. |
| Testing | Vitest + React Testing Library + Playwright; automated |
|   | typecheck, lint, build, and accessibility checks. |
|   | No backend required for the first complete release. Imported |
| Network/backend | data stays in the browser; external analytics/telemetry are off |
|   | by default. |
| Operating principle | Functional first; then accessible polish; then measured |
|   | performance; then deployment and documentation. |

## Important reality checks

- A million rows is a benchmark goal, not a universal guarantee. Dataset byte size, column count, data types, browser memory, and device CPU affect results. Test named datasets on documented hardware.

- Virtualization is not data processing. It reduces mounted DOM elements; it does not, by itself, reduce the memory or CPU cost of parsing, filtering, grouping, or sorting the full dataset.

- DuckDB-WASM has deployment and resource constraints. Its worker/WASM assets, browser memory limits, CORS, and possible cross-origin-isolation requirements must be tested in the actual deployment mode.

- Do not build a backend prematurely. The first release should work end-to-end offline for local files. Add cloud sync only as a separate, justified future phase.


- Do not chase vanity Lighthouse scores. Measure the real app in representative conditions and report the method, dataset, device, build, and limitations.

## 1. Product vision and definition

DataLens is a local-first data exploration studio for students, analysts, engineers, and developers who need to inspect a file, understand its structure, filter records, answer questions with charts, and preserve a useful analytical view - without first configuring a server or uploading a private dataset.

## 1.1 Product promise

- Users can start immediately with a sample dataset or import their own CSV/JSON file.

- The app explains what the data contains: dimensions, inferred types, missing values, distinct-value estimates, min/max or summary statistics where appropriate.

- A data grid makes it possible to search, sort, filter, group, pin, resize, hide, and reorder columns.

- Charts use the same filtered dataset and can cross-filter other widgets when users select a data point or category.

- Users can save named views and dashboards, restore them after a refresh, and share compact view state through a URL when it is safe to do so.

- Heavy parsing and analytical operations do not unnecessarily block the main UI thread.

- The interface is coherent, accessible, responsive, and professionally polished - not a default component-library demo.

## 1.2 Target users and main job-to-be-done

| User | Primary job | Success looks like |
| --- | --- | --- |
| Learner / student | Explore a dataset and create a visual | Can import a file, understand columns, |
|   | explanation. | make a chart, and share a saved view. |
|   | Evaluate product thinking and frontend | Can see a real workflow, inspect source |
| Frontend reviewer / recruiter | engineering. | architecture, reproduce benchmarks, |
|   |   | and review tests. |
|   |   | Can navigate large tables, use linked |
| Analyst / developer | Filter data and compare patterns locally. | visualizations, export results, and retain |
|   |   | analysis state. |

## 1.3 Non-goals for release 1

- No user accounts, permissions system, team collaboration, billing, or multi-tenant backend.

- No promise of Excel/Power BI parity or support for every possible file type.

- No arbitrary SQL console exposed by default; advanced SQL can be a future, guarded feature.

- No sending imported files or row contents to remote services.

- No meaningless AI chatbot, fabricated insights, or external APIs requiring secret keys for the main flow.

## 2. Product experience and navigation

## 2.1 Primary application shell

- Top bar: DataLens mark, current workspace/dataset name, global search/command button, theme switch, help/menu, and a clear save/persistence indicator.

- Left navigation: Overview, Data Explorer, Charts, Dashboards, Saved Views, and Settings/Help. Keep active route and active dataset obvious.


- Main canvas: Generous work area with consistent spacing, strong typographic hierarchy, stable page layouts, and minimal decorative clutter.

- Context inspector: An optional resizable side panel for column details, chart configuration, or selected-record details. On small screens this becomes a drawer.

- Feedback: Toasts for brief confirmations, inline errors near the responsible control, and persistent explanations for unrecoverable import failures.

## 2.2 Visual design principles

- Use a restrained professional palette: deep navy/slate surfaces, neutral backgrounds, one primary accent such as teal or blue, and a carefully designed categorical chart palette.

- Use a consistent spacing scale, radii, border weights, typography sizes, shadows, and focus styles through design tokens / CSS custom properties.

- Use Lucide icons consistently; pair icon-only controls with accessible names and tooltips. Never use emoji as primary product icons.

- Use micro-interactions only when they clarify state: typical transitions 120-220 ms, no animation that blocks interaction, and reduced-motion support.

- Do not rely on color alone to communicate chart series, selected records, errors, or status.

- Use empty states that explain what to do next, not blank rectangles or fake data with no label.

- Every control must have clear hover, focus-visible, active, disabled, loading, success, and error behavior where applicable.

## 2.3 Required routes

| Route | Purpose | Minimum visible content |
| --- | --- | --- |
|   |   | Product introduction, recent workspaces, |
| / | Overview / welcome | sample datasets, import CTA, short privacy |
|   |   | statement. |
|   |   | Active dataset summary, table toolbar, |
| /explore | Data Explorer | virtualized grid, column inspector, filter |
|   |   | controls. |
|   |   | Chart canvas, chart-type picker, |
| /charts | Chart Builder | dimension/metric/aggregation controls, |
|   |   | linked filter state. |
|   |   | Saved dashboard cards/list, |
| /dashboards | Dashboard list and editor | create/open/rename/duplicate/delete, |
|   |   | editable panels. |
|   |   | Named views with dataset reference, |
| /views | Saved Views | filter/sort/column state, |
|   |   | open/rename/delete. |
| /settings | Settings and diagnostics | Theme, storage status, clear local data, app |
|   |   | version, supported file formats, diagnostics. |
|   |   | Supported format guide, import tips, |
| /help | Help / keyboard shortcuts | accessibility and keyboard shortcuts, |
|   |   | known limits. |

## 3. User journeys that must work end-to-end

## Journey A: first-time success

- 1. Open app with no local data.

- 2. See a clear welcome screen with both “Load sample dataset” and “Import file”.


- 3. Load a small bundled sample and immediately view useful metadata and rows.

- 4. Sort and filter rows, open a chart, change an aggregation, and see the result update.

- 5. Save a named view, refresh the browser, reopen it, and confirm the state is restored.

## Journey B: user imports their own file

- 1. Choose or drag a CSV/JSON file.

- 2. Show supported formats, file size, and privacy notice before processing.

- 3. Validate file, show parsing progress, and allow safe cancellation if practical.

- 4. Preview inferred column names/types and report malformed rows or ambiguous inference.

- 5. Confirm import. Show row count, column count, source filename, inferred schema, and sample preview.

- 6. Explore the grid, filter data, create a chart, and export results.

- 7. Close/reopen app. Explain whether the source needs re-importing or whether the user opted into local cached persistence.

## Journey C: linked analytics

- 1. Open a dataset with date/category/numeric columns.

- 2. Create a grouped bar or time-series chart.

- 3. Select a category/mark; an active-filter chip appears and the grid/other charts update consistently.

- 4. Clear the cross-filter and restore the original state.

- 5. Save that state in a named view or dashboard.

## Journey D: error recovery

- 1. Import an unsupported or malformed file.

- 2. Show a specific, human-readable explanation with next steps and no silent failure.

- 3. Cancel a large import or query.

- 4. Verify the app remains usable and the previous valid dataset/view is not destroyed.

## 4. Complete feature scope and priorities

Build the must-have workflow first, then expand. The priority tags below are gates, not permission to leave the application half-finished.

| Priority | Features | Completion rule |
| --- | --- | --- |
|   | Application shell; sample data; CSV and |   |
|   | JSON import; schema inference; data |   |
| P0 - release foundation | profile; grid sort/search/basic filters; table | A new user can complete the main journey |
|   | virtualization; chart builder; saved views; | without developer intervention. |
|   | local persistence; responsive layout; |   |
|   | baseline tests; README; deploy. |   |
|   | Advanced grid controls; grouping; pinning; |   |
|   | resize/reorder/hide columns; multiple chart |   |
| P1 - flagship engineering | types; cross-filtering; dashboard editor; URL | Features work together against the same |
|   | state; worker-based parsing/aggregation; | source of truth, not as isolated demos. |
|   | export; command palette; robust |   |
|   | accessibility. |   |
|   | DuckDB-WASM query path; Parquet |   |
|   | import; data-engine abstraction; | Performance claims are backed by |
| P2 - large-data engine | virtualized/chunked result windows; | reproducible measurements and stated |
|   | explicit 100K/1M benchmark scenarios; | device/dataset limitations. |
|   | diagnostics and benchmark report. |   |


| Priority | Features | Completion rule |
| --- | --- | --- |
|   | Undo/redo for dashboard layout, additional | Only start after all release gates pass. Keep |
| P3 - stretch | chart types, advanced computed columns, | PWA/cloud sync/AI as separate product |
|   | theme customization, optional small- | decisions. |
|   | dataset cache, export dashboard image. |   |

## 4.1 Data import and profiling

- Accept CSV and JSON in the first release. Clearly declare JSON shape support: either arrays of objects or a documented record-oriented format; reject unsupported shapes with examples.

- Add Parquet through DuckDB-WASM only after the base CSV/JSON pipeline and deployment work reliably.

- Inspect headers, duplicate/empty column names, BOM, line endings, delimiters, quoted commas, escaped quotes, empty lines, null-like values, and inconsistent rows.

- Infer conservative types: boolean, integer, number, date/time candidate, text, null/mixed. Preserve original values where conversion is lossy or uncertain.

- Provide sampling strategy for large files and mark inferred types as inferred. Let the user override types where sensible.

- Profile each column with non-null count, null count/percentage, distinct estimate or exact count when affordable, and type-specific statistics.

- Use robust labels for missing/invalid cells. Do not silently turn malformed values into zero.

- Include seeded built-in datasets that demonstrate dates, categories, numeric measures, missing values, and enough rows to demonstrate table behavior. Label synthetic data honestly.

## 4.2 Table / grid capabilities

- Virtualized rows; optionally virtualized columns only if horizontal width and measured performance justify it.

- Column sorting, global search, per-column filters, multi-condition filter builder, clear-all filters, and visible filter chips.

- Group rows by one or more columns with collapsible groups and correctly computed aggregates where supported.

- Pin columns left/right, reorder columns, resize width, hide/show columns, reset layout, and persist these preferences.

- Row selection with select-visible and clear-selection semantics. Explicitly distinguish 
select current page/visible” from “select all filtered rows”.

- Use stable row IDs independent of row order. Handle duplicate data values safely.

- Expose keyboard behaviors and accessible names for sort/filter/menu/header controls.

- Provide visible/filtered export and document whether exports respect grouping, hidden columns, and selected rows.

## 4.3 Chart and cross-filter capabilities

- Support a deliberate initial set: bar, line, area, scatter, and a simple distribution/histogram where practical. Do not ship many chart types poorly.

- Chart controls: X/dimension, Y/metric, aggregation (count, sum, average, min/max as applicable), optional series/group-by, sort order, title, and filters.

- Use the same query/filter model as the grid. Avoid computing unrelated filtered copies in every chart component.

- Charts show title, axes, units/formatting, tooltips, legend when relevant, no-data states, and a data-table or textual alternative.

- Clicking a chart datum creates an explicit cross-filter with a visible chip and clear action. Support clearing one filter and clearing all.


- Avoid misleading aggregations: disable incompatible operations, clearly label units, and treat missing values deliberately.

- Use Canvas renderer for dense visualizations when benchmarks support the choice; use ECharts selectively and dispose chart instances on unmount.

## 4.4 Dashboard editor

- Create, rename, duplicate, open, and delete dashboards with a confirmation for destructive actions.

- Add a chart or KPI/table panel from the active dataset; drag to reorder and resize where supported.

- Keep panel settings separate from dataset records. Store a chart specification, position, dimensions, and a stable panel ID.

- Autosave with visible 
Saving / Saved / Save failed
 state, debounce writes, and recover from storage errors.

- Ensure layout remains usable at common widths; on mobile use a single-column panel stack rather than an unusable miniature desktop grid.

- Prevent accidental data loss when leaving an unsaved edit state. Restore defaults if a saved layout becomes invalid after an update.

## 4.5 Saved views, sharing, export and command palette

- Saved view includes dataset identity, filters, sorting, column settings, grouping and relevant chart/table view mode - not a duplicate of all source rows.

- URL state encodes only a compact, validated, share-safe subset of state. Never put file contents, private records, or secrets in a URL.

- Opening a URL with malformed or outdated parameters must fall back safely, show a notice if useful, and not crash.

- CSV export handles commas, quotes, newlines and Unicode. Escape spreadsheet formula-leading values when exporting untrusted data, and explain any safety transformation.

- Command palette opens with Ctrl/Cmd+K, searches actions, supports arrow keys/Enter/Escape, returns focus, and exposes accessible roles and labels.

- Provide keyboard shortcuts help. Never make core actions accessible only through shortcuts.

## 5. Recommended technology stack and guardrails

| Concern | Preferred choice | Rules |
| --- | --- | --- |
|   |   | Use currently supported stable versions; verify |
| App / language | React + TypeScript + Vite | peer compatibility during install. Keep strict |
|   |   | TypeScript enabled. |
|   |   | URLs should be first-class; support direct |
| Routing | React Router | loading of valid routes in deployed SPA |
|   |   | hosting. |
|   | Tailwind CSS plus CSS custom-property design | Choose one main styling strategy. Do not mix |
| Styling | tokens, or CSS Modules if preferred | three styling systems. Build a custom visual |
|   |   | identity. |
| Accessible primitives | Radix primitives / customized shadcn-style | Understand and customize the markup and |
|   | components where useful | interaction. No default generic template skin. |
| Icons | Lucide React | Consistent icon stroke/size; label icon-only |
|   |   | buttons. |
|   |   | Table owns sorting/filtering/column state; |
| Grid logic | TanStack Table + TanStack Virtual | Virtual controls which rows/cells are rendered. |
|   |   | Verify the current compatible API. |
|   |   | Use chart configuration and Canvas where |
| Charts | Apache ECharts | appropriate for dense data; provide alternate |
|   |   | textual/tabular access. |


| Concern | Preferred choice | Rules |
| --- | --- | --- |
|   |   | Wrap behind a data-engine interface. Validate |
| Large-data query | DuckDB-WASM (P2) | worker/WASM asset loading, memory, formats, |
|   |   | browser compatibility and hosting. |
|   | Papa Parse for CSV plus explicit JSON | Parse large files away from UI thread; handle |
| Lightweight import | parser/validator | cancellation, malformed rows, and encoding |
|   |   | issues. |
|   |   | Store metadata/configurations. Dataset byte |
| Persistence | IndexedDB, optionally via Dexie | caching must be opt-in, quota-aware, and |
|   |   | clearable. |
| Validation | Zod for file metadata, query specs, saved views | Validate at boundaries; do not treat TypeScript |
|   | and URL payloads | alone as runtime validation. |
| Testing | Vitest, Testing Library, user-event, Playwright | Test behavior, error paths, accessibility, routes |
|   |   | and complete user journeys. |
| Quality tooling | ESLint, Prettier, TypeScript compiler | Provide repeatable scripts and run them |
|   |   | before completion. |
|   | React state for local UI; small store such as | Do not place whole datasets in global React |
| State management | Zustand only if shared client state warrants it | state. Define state ownership before |
|   |   | implementing features. |
|   |   | Introduce TanStack Query only if remote/async |
| Server-state library | Not required in local-only release | server state exists; do not add dependencies |
|   |   | without a real use case. |

## Dependency discipline

Before installing any library, check its official documentation for the currently supported API and peer compatibility. Do not mix sample code from different major versions. Record installed versions in package-lock.json and the README.

## 5.1 Avoid tool sprawl

- Do not add Redux, Zustand, Context, and a second state library for the same state.

- Do not include both ECharts and D3 for all charts unless a specific custom visualization requires D3 scales or drawing.

- Do not add authentication, cloud database, analytics SDK, AI API, or an Express server for a local-first product.

- Do not use mock endpoints to pretend persistence works. If a feature is local-only, say so clearly.

- Avoid abstractions with one caller. Add abstractions when they isolate an actual boundary, such as the data engine or persistence adapter.

## 6. Architecture and state ownership

## 6.1 High-level architecture

React UI (routes / components / accessible controls)

|

- +-- Workspace state (selected dataset, active view, filter model)

- +-- URL adapter (compact shareable state only)

- +-- Persistence adapter (IndexedDB: views, dashboards, preferences)

- +-- Data Engine interface

|

- +-- Sample / small-file engine

- +-- CSV/JSON import worker + typed schema/profile

- +-- DuckDB-WASM engine (large-data / Parquet path)


|

+-- Query windows, aggregates, export streams

Table layer: TanStack Table -> TanStack Virtual -> visible DOM window

Chart layer: chart specification -> query/aggregate -> ECharts

Dashboard layer: panel specifications + layout -> charts/tables/KPIs

The data engine is the critical boundary. UI components should not know whether a result came from a small in-memory dataset, a worker aggregation, or DuckDB-WASM.

## 6.2 State categories

| State category | Examples | Storage / owner |
| --- | --- | --- |
| Dataset state | Dataset metadata, schema, active source ID, | Data engine owns data operations; app |
|   | row/column counts | store holds lightweight metadata only. |
| Query state | Filters, sort, group, column settings, | Central typed query model; serialize only |
|   | selected fields, query version | safe compact subsets. |
| Transient UI state | Open menu, hovered row, temporary | Local component state; never persist unless |
|   | dialog, current tooltip | the user expects it. |
| Workspace state | Saved views, dashboard panel | IndexedDB with versioned schema and |
|   | specifications, theme, preferences | migration path. |
| URL state | Active route, view ID, selected chart/filter | Parse and validate; URL always stays free of |
|   | state when useful | actual dataset content. |
| Operation state | Import/query progress, cancellation token, | Worker protocol + React status state; stale |
|   | job ID, error/result | responses are ignored. |

## 6.3 Data-engine contract

Define and type a DataEngine interface before implementing advanced features. Keep the interface narrow, asynchronous, testable, and independent of React UI. Example operations include:

- initialize / dispose engine;

- loadFile(file, options) and return validated dataset metadata;

- getSchema(datasetId), getProfile(datasetId);

- getRows(datasetId, query, offset, limit) or a cursor/window equivalent;

- getRowCount(datasetId, query);

- aggregate(datasetId, chartSpec, filters);

- cancel(jobId);

- exportCsv(datasetId, query, exportOptions);

- getEngineCapabilities() and getDiagnostics().

All operations must return typed results and structured errors. Long-running calls need request IDs so stale results can be ignored and cancellation can be handled. The engine must be disposable so worker/database resources do not leak when a dataset changes.

## 6.4 Suggested project structure

```
src/
app/ # app providers, router, error boundary
routes/ # Overview, Explorer, Charts, Dashboards, Views, Settings, Help
components/
ui/ # buttons, dialogs, menus, inputs, toasts, tooltip
layout/ # app shell, navigation, responsive drawers
data-grid/ # virtual grid, header, cell, column menu, filters
```


```
charts/ # chart renderer, builder, legend, cross-filter controls
dashboard/ # panel frame, layout editor, dashboard dialogs
import/ # drop zone, validation, preview, progress/errors
feedback/ # empty/loading/error/success patterns
features/
datasets/ # dataset metadata, selection, profile
query/ # typed filter/query model, query serialization
saved-views/ # view CRUD
persistence/ # IndexedDB repositories and migrations
preferences/ # theme, shortcuts, user settings
data-engine/
contracts/ # interfaces, types, errors
worker/ # parsing and worker protocol
memory/ # small/sampled dataset engine
duckdb/ # DuckDB-WASM adapter and worker setup
fixtures/ # deterministic sample datasets / generators
hooks/
lib/ # formatting, file helpers, validation, accessibility
styles/ # tokens, globals, typography, motion preferences
test/ # setup, helpers, mocks, fixture builders
types/
public/
icons/ # app icon assets if created
examples/ # tiny openly licensed demo datasets and attribution
scripts/ # benchmark/data generation helpers
README.md
```

## 7. Data model and query semantics

## 7.1 Minimum data contracts

```
type ColumnType = 'string' | 'boolean' | 'integer' | 'number' | 'date' | 'datetime' | 'null' | 'mixed';
type ColumnSchema = {
id: string; // stable, unique internal identifier
key: string; // source name, may be duplicated in raw file
label: string; // safe display label
type: ColumnType;
nullable: boolean;
inferred: boolean;
sourceIndex: number;
};
type DatasetMetadata = {
id: string;
name: string;
sourceFileName?: string;
format: 'csv' | 'json' | 'parquet' | 'sample';
rowCount?: number; // can be unknown until scan/query completes
columnCount: number;
```

*DataLens | Build carefully. Measure honestly. Ship completely. • Page 11*


```
importedAt: string;
schemaVersion: number;
engineKind: 'memory' | 'worker' | 'duckdb-wasm';
};
type FilterRule = {
id: string;
columnId: string;
operator: string;
value?: unknown;
values?: unknown[];
};
type QueryState = {
search?: string;
filters: FilterRule[];
sorting: Array<{ columnId: string; desc: boolean }>;
grouping: string[];
hiddenColumnIds: string[];
pinnedColumnIds: { left: string[]; right: string[] };
columnOrder: string[];
columnWidths: Record<string, number>;
};
```

Use stable internal identifiers: source headers may be blank, duplicated, contain punctuation, or collide with generated labels. Do not use raw column text as a unique key without normalization and collision handling.

## 7.2 Filter operator rules

- Text: contains, equals, starts with, ends with, is empty, is not empty.

- Number: equals, not equals, greater than, greater-than-or-equal, less than, less-than-or-equal, between, is empty.

- Date/time: before, after, between, relative ranges only if the timezone rule is explicitly defined.

- Boolean: is true, is false, is empty.

- Set/category: is any of, is none of, is empty; show a bounded, searchable value list for high-cardinality columns.

- Filter values and type coercion must follow the inferred/overridden schema. Display when an input could not be interpreted.

## 7.3 Query consistency

- The grid, counts, profile chips and charts must refer to the same active filter model unless a chart explicitly declares a separate local filter.

- Define the order of operations and document it: filter -> group/aggregate -> sort -> window/pagination. Search semantics and cross-filter semantics must be consistent.

- Cross-filter updates must not create accidental infinite loops between charts. Use one canonical filter model with origin metadata if needed.

- Every query has an ID or version. If a slower old request resolves after a newer one, discard it.

- Do not mutate source records while sorting, filtering, grouping or charting.

## 8. Large-file processing and the Web Worker strategy

## 8.1 Import stages

- 1. Validate filename/extension and file size limits; do not trust extension alone.


- 2. Inspect encoding and parse headers safely.

- 3. Parse in a worker or engine worker path when file size can make main-thread parsing block.

- 4. Report incremental progress if the parser/engine supports it; never invent percentages when the underlying operation cannot report progress.

- 5. Infer column types using bounded samples initially, and refine while scanning when needed.

- 6. Build metadata/profile and return the small schema/summary to React.

- 7. Store records in the data engine; do not copy the entire dataset into component state.

- 8. Release temporary buffers and terminate/dispose resources on cancel, replacement, or unmount.

## 8.2 Worker messaging contract

Use typed message envelopes with requestId, operation, datasetId, payload, and response/error. Validate message shapes at boundaries. Include progress events and cancellation where the underlying operation supports them. Log actionable development diagnostics, but never log full row content by default.

## 8.3 Large-data strategy

| Dataset scale | Preferred path | Expected behavior |
| --- | --- | --- |
| Bundled demo / small file | In-memory or lightweight worker | Simple and fast; normal React state holds |
|   |   | metadata and limited view state only. |
|   | Worker parsing + paged row windows + | No long synchronous parse on main thread; |
| Medium CSV/JSON | virtualized grid | operations return structured query |
|   |   | windows. |
|   | DuckDB-WASM adapter and its supported | Run filtering/grouping/aggregation inside |
| Large CSV / Parquet | worker integration | engine; fetch limited windows/results; |
|   |   | handle WASM memory and query limits. |
|   | Show preflight warning or require a | Do not crash tab or promise unrealistic |
| Very large / unsuitable browser file | smaller sample / future server-backed | support. Explain size/device limits and |
|   | mode | recovery steps. |

## Critical performance rule

Virtualize the grid and avoid copying million-row arrays between the engine, global store, charts, and React components. Return only the visible row window and the aggregate results needed for the current view.

## 8.4 DuckDB-WASM implementation gates

- Use official DuckDB-WASM documentation and examples for the current installed version; worker and bundle setup has changed across versions.

- Load CSV/Parquet using supported APIs; do not write string-concatenated SQL with untrusted filenames/column names. Quote identifiers and use safe parameterization / controlled identifiers where supported.

- Test packaged development and production output, not just a local import in a test runner. Verify JavaScript worker assets, WASM files, extension requests, correct MIME types and URL base paths.

- Do not assume multithreading is enabled. Threaded Wasm variants may require cross-origin isolation. Single- thread mode remains the fallback unless deployment headers and browser constraints are explicitly verified.

- Treat memory as finite. Dispose connections/statements when done, stream/chunk results where appropriate, and handle allocation/query failures gracefully.

- Provide a capability check and user-facing error with fallback or retry for unsupported browsers or failed WASM initialization.


## 9. Grid specification in detail

## 9.1 Layout

- Dataset name, row/column counts, source and engine state in a compact header.

- Toolbar: search, filters, group-by, column settings, export, and reset. Overflow controls must remain discoverable at tablet/mobile widths.

- Grid header stays visible while the data region scrolls. Avoid nested horizontal/vertical scroll traps.

- Keep the same row height where possible for reliable virtualization; if dynamic heights are needed, measure and test them explicitly.

- Use skeleton rows for initial waiting only; after a query error, retain the last valid state and explain the failure.

## 9.2 Interaction and edge cases

- Sorting a column again reverses order; keyboard and screen-reader users receive the new sort direction.

- Nulls, mixed values, long text and dates sort predictably; document null placement.

- Resizing has minimum/maximum widths and does not make adjacent columns inaccessible.

- Pinning has a deterministic z-index and shadow/border treatment so pinned cells remain legible while horizontal scrolling.

- Column menus close on Escape/outside click and return focus to the triggering control.

- Group summaries clearly distinguish aggregate rows from original rows; expand/collapse state remains stable across harmless updates.

- When search returns zero rows, display 
No rows match
 with a clear-filters action; distinguish this from an empty dataset.

- Selection survives sort/filter only according to documented stable-ID behavior. Do not silently select a different row after reordering.

## 9.3 Large-data grid acceptance

- Render only the visible row window plus bounded overscan; inspect DOM node count when loaded rows go from 10K to 100K.

- Scrolling near the top, middle, and end remains usable for the documented benchmark file.

- Changing a filter cancels or supersedes obsolete work, shows feedback, and does not briefly display rows from a different query as if current.

- Column resizing/pinning/reordering behaves consistently with horizontal scrolling and viewport resize.

- Keyboard users can reach the toolbar, headers, grid controls, cell content, and return to toolbar without being trapped.

## 10. Chart builder and dashboard specification

## 10.1 Chart builder state

Represent each chart as a serializable ChartSpec with stable ID, title, type, dimension column ID, metric column ID or count, aggregation, series/group-by, sort, formatting, local filters if any, cross-filter behavior, and optional display settings. Validate every referenced column against the active schema when loading saved state.

## 10.2 Chart visual quality

- Consistent axes, gridlines, labels, tooltips, numbers/dates formatting, legends and categorical colors.

- Responsive resize using observer-based behavior; release chart instances on component unmount.

- No-data, insufficient-data, invalid-type and query-error states that explain the issue.

- Canvas for dense data when it benchmarks better; do not send millions of SVG nodes into the DOM.

- Use color palettes that remain distinguishable and add direct labels or patterns where necessary.


- Every chart has a concise accessible title/description plus a data-table or equivalent textual route to its key information.

## 10.3 Cross-filtering semantics

- Selecting a bar/point adds a visible filter chip identifying field and value.

- The grid and all charts whose query depends on the active dataset update coherently.

- A selected series/value is visibly selected; deselection and -clear all  are

- Keep chart-originated filters distinct from permanent chart configuration.

- Avoid enormous filter state for charts with high-cardinality selections; use a safe compact representation or do not support that interaction on that chart type.

## 10.4 Dashboard layout model

Store layout and content separately. The layout contains panel IDs and positions/sizes; each panel points to a chart/table/KPI specification. Reordering or resizing should update layout without mutating underlying data or query results. Validate old layouts at load time and use a safe default layout if the stored version is incompatible.

## 11. Persistence, URL state and privacy

## 11.1 IndexedDB persistence

- Persist dashboard definitions, saved views, theme/preferences and compact dataset metadata.

- Version the local storage schema and provide migration or safe reset behavior.

- Handle browser storage denial, quota exceeded, private browsing differences, and corrupted records. Keep the app usable if persistence fails.

- By default, do not persist imported raw rows to IndexedDB without an explicit user choice. If raw file caching is added, show storage size, consent, clear-cache action, quota handling, and a clear “data stays on this device” statement.

- On dataset deletion, remove related saved views/references as appropriate and ask before destructive deletion.

## 11.2 URL-state rules

- Put route, saved view ID, and selected safe filters/sort/group when useful into search parameters.

- Validate and cap parameter size. Fall back to default state for malformed values.

- Do not put the full dataset, raw cell values that may be private, file names where sensitive, or credentials in the URL.

- Use replaceState for transient/high-frequency changes when browser history would otherwise become noisy; push history for meaningful navigation states.

- Ensure Back/Forward restores expected view state. Document which state is shareable and which remains local.

## 11.3 Privacy and security

- Local files remain local in the initial product. No telemetry or remote upload by default.

- Render all user-provided cell values as text, never as untrusted HTML. Do not use dangerouslySetInnerHTML for data values.

- Validate file size/type and guard against malformed/hostile inputs. Add reasonable user-configurable limits and show progress/warnings.

- Escape values on CSV export that could be interpreted as spreadsheet formulas (for example values beginning with =, +, - or @ after relevant whitespace rules); document the behavior.

- Never place secrets in Vite client environment variables. Anything shipped to the browser is public.

- Avoid SQL injection in DuckDB queries: use controlled/quoted identifiers, safe query construction and bound values where available.


- Provide a clear local-data deletion action. Avoid logging row contents or placing imported data in crash/error messages.

## 12. Accessibility and responsive requirements

## 12.1 Accessibility target

Aim for WCAG 2.2 AA practices across core workflows. Automated checkers catch only a subset of issues; manually test keyboard operation, focus order, dialogs, status updates and zoom.

- Semantic landmarks: header, navigation, main, named sections, sensible heading order.

- Every input has an associated visible or programmatic label. Icon-only buttons have accessible names.

- Visible focus indicator and logical focus order; do not remove outlines without a clear replacement.

- Dialogs trap focus when modal, close on Escape when appropriate, restore focus to the trigger, and prevent background interaction.

- Dynamic progress and query results use restrained live-region announcements; do not announce every table cell or every streaming event.

- Color contrast, selected states, chart colors and error indicators are not color-only.

- All functionality available with keyboard. Test grid interactions explicitly; use standard grid keyboard patterns only if fully implemented.

- Respect prefers-reduced-motion. Avoid scroll-jacking and animations that impair reading.

- Test 200% zoom and viewport widths around 320px, 768px, 1024px, and wide desktop. Do not require horizontal page scrolling at normal zoom except within intentionally scrollable data grid/chart regions.

## 12.2 Responsive behavior

| Viewport | Required behavior |
| --- | --- |
|   | Collapsible navigation, stacked panels, filters in drawer, compact |
| Phone / narrow | cards, readable chart summaries, deliberate grid fallback |
|   | (horizontal grid scroll or row-card mode), large touch targets. |
| Tablet | Navigation can collapse; grid toolbar wraps; inspector uses a |
|   | drawer; chart/dashboard panels use one or two columns. |
| Desktop | Persistent navigation, resizable inspector, dense grid with |
|   | controlled scrolling, multi-column dashboard layout. |
|   | No hidden critical action; controls remain reachable; dialogs and |
| High zoom / keyboard | dropdowns stay in viewport; focus never disappears behind sticky |
|   | headers. |

## 13. Performance engineering and measurable proof

## 13.1 Performance budget and measurement rules

Set a baseline before optimizing. Use a production build, identify machine/browser, dataset file size and dimensions, warm/cold state, test procedure, and repeat count. Report median and p95 where meaningful. Never fabricate a benchmark or label an untested number as a result.

| Scenario | Target / gate | Measurement method |
| --- | --- | --- |
|   | Aim for good Core Web Vitals on the deployed |   |
|   | overview and small sample flow; treat LCP <= | Lighthouse plus field data if available; name |
| Initial app shell | 2.5 s, INP <= 200 ms and CLS <= 0.1 as | test URL, build, device and throttling settings. |
|   | reference thresholds, not a promise for every |   |
|   | device. |   |


| Scenario | Target / gate | Measurement method |
| --- | --- | --- |
|   | Primary desktop benchmark; common table |   |
|   | interactions should feel immediate. Aim for | Repeat at least 10 times after warm-up; |
| 100K-row dataset | p95 filter/query-to-visible-update <= 200 ms | separate engine query time from UI paint time. |
|   | when achievable on the documented machine; |   |
|   | if missed, profile and report accurately. |   |
|   | Must not crash or freeze for an advertised | Record row/column count, raw bytes, browser, |
| 1M-row stress case | supported fixture on reference hardware. | RAM/device, engine path, operation timing and |
|   | Latency is reported, not hidden behind a | errors. |
|   | universal claim. |   |
|   | DOM node count should remain bounded as | Inspect DOM count and React/Chrome |
| Virtualized DOM | rows increase. Use viewport + overscan, not all | Performance profiles at 10K/100K/1M fixtures |
|   | rows. | if supported. |
|   | No long parsing/aggregation tasks should block | Chrome Performance panel/Performance |
| Main thread | the main UI thread for supported large | Tracks, Long Tasks indicators, and React |
|   | fixtures. | profiling as available. |
|   | Switching datasets and closing dashboards | Repeated import/clear cycles; inspect memory |
| Memory/resource cleanup | does not cause unbounded resource growth. | where practical; dispose workers, DB |
|   |   | connections, charts and object URLs. |

## 13.2 Required profiling report

- Initial baseline and final optimized numbers in README or docs/performance.md.

- A short list of changes made (e.g., worker-based parse, virtual rows, reduced copies, query cancellation, chart decimation/aggregation).

- Screenshots or notes from DevTools flame charts where available; do not use screenshots alone as the only evidence.

- Explain regressions/trade-offs: bundle size, worker/WASM startup, memory, browser support, precision, file size and cache behavior.

- Record the exact benchmark scripts/steps so another reviewer can reproduce the result.

## 13.3 Optimization order

- 1. Measure a representative slow interaction first.

- 2. Check whether time is in file parsing, engine query, React render, DOM layout/paint, chart drawing, or storage.

- 3. Apply the smallest relevant change and rerun the same benchmark.

- 4. Keep the change only if it improves user-facing behavior without breaking correctness/accessibility.

- 5. Avoid blanket memoization. Use stable references, derived-state discipline, selectors and virtualization based on profile evidence.

## 14. Error handling and resilience matrix

| Situation | Expected behavior |
| --- | --- |
| Unsupported file | Explain accepted formats, allow user to choose another file, retain |
|   | prior valid dataset. |
| Malformed CSV / inconsistent rows | Show line/row information when available, summarize issue, offer |
|   | cancel/continue only if safe, never silently corrupt data. |
| Duplicate/empty headers | Generate stable internal IDs and readable labels; preserve original |
|   | header details for diagnostics. |
| Browser storage unavailable | Keep current session working; display a non-blocking persistence |
|   | warning and export option. |
| Query failure / timeout | Stop spinner, preserve last valid view where possible, show |


| Situation | Expected behavior |
| --- | --- |
|   | retry/cancel, do not show stale results as current. |
| Stale async response | Ignore result whose request/query ID no longer matches active |
|   | state. |
| WASM/worker initialization failure | Show clear diagnostic and supported fallback; no blank screen or |
|   | infinite loading. |
| File too large / memory risk | Warn before expensive work if size is known; offer sample/smaller |
|   | file, cancel, and state realistic limits. |
| Invalid saved view/dashboard | Validate, recover with defaults, and let user delete/repair broken |
|   | state. |
| Export failure | Report reason and retain source dataset/view; provide retry and a |
|   | safe fallback if practical. |

## 15. Testing strategy and required test cases

## 15.1 Test pyramid

| Layer | Tools | What it must cover |
| --- | --- | --- |
|   |   | Filter operators, type inference, query |
| Unit | Vitest | serialization, CSV export escaping, column IDs, |
|   |   | reducer/state transitions, URL validation. |
|   |   | Import controls, grid toolbar, menus/dialogs, |
| Component | Testing Library + user-event | accessible labels, sort/filter interactions, chart |
|   |   | configuration and empty/error states. |
|   |   | File -> metadata -> query -> grid/chart; saved |
| Integration | Vitest/Testing Library with mocked engine | view restore; persistence failure; stale result |
|   |   | suppression. |
|   |   | First-time sample workflow, import workflow, |
| End-to-end | Playwright | sort/filter, chart creation, cross-filter, |
|   |   | save/refresh/restore, export, keyboard use, |
|   |   | error path. |
|   | axe-core integration plus manual keyboard | No critical/serious automated issues in core |
| Accessibility | checks | routes; manually verify focus, modal behavior, |
|   |   | zoom and chart alternatives. |
| Performance | Repeatable benchmark scripts and browser | Dataset scaling, virtualization DOM, query |
|   | DevTools | latency, main thread and resource cleanup. |

## 15.2 Minimum mandatory test scenarios

- CSV with quoted commas, escaped quotes, newline in quoted field, BOM, blank lines, duplicate headers and Unicode.

- JSON array with consistent objects; missing keys, extra keys, nested values and unsupported top-level shape.

- Numbers with blanks, mixed date formats, boolean-like text, null values and high-cardinality categories.

- Global search plus column filter plus sorting combined; clear one filter vs clear all.

- Group/collapse; pin left/right; resize/reorder/hide column; persist/reset grid layout.

- Chart aggregation changes; category selection cross-filters table and other charts; clearing filters restores counts.

- Dataset switching while query is pending; verify stale response is ignored and worker resources are cleaned up.

- Refresh with saved dashboard/view and invalid URL parameters.

- Storage quota/IndexedDB failure and export failure.

- Keyboard path through navigation, grid toolbar, column menu, command palette and modal.


- 100K and supported 1M benchmark runs with the same documented methodology.

## 15.3 CI checks

npm run lint

npm run typecheck

npm run test:run

npm run build

npm run test:e2e # where CI browser dependencies are configured

Provide these scripts in package.json. If the exact script naming differs, document it and keep the equivalent check runnable with one command. CI should fail on type errors, lint violations, failed tests or failed production build.

## 16. Build plan: phases, deliverables and gates

The coding assistant must implement in this order. Do not skip a phase because the UI looks convincing. Keep the main branch/build working between phases whenever possible.

| Phase | Work | Exit gate |
| --- | --- | --- |
|   | Inspect existing files, Node/npm versions and |   |
|   | repository status. Confirm clean starting state | No destructive changes; decisions and |
| Phase 0 - Inspect and plan | without deleting user files. Write a concise | commands documented. |
|   | implementation plan, dependency matrix and |   |
|   | risks. |   |
|   | Create React + TypeScript + Vite app; configure |   |
| Phase 1 - Scaffold and quality baseline | strict TypeScript, lint, format, unit test, routing, | npm run dev starts; lint, typecheck, tests and |
|   | error boundary and scripts. Install only first- | production build pass. |
|   | phase dependencies. |   |
|   | Build tokens, typography, responsive app shell, |   |
| Phase 2 - Design system and shell | navigation, theme, UI primitives, | All routes load directly; keyboard focus and |
|   | empty/loading/error states and routes. Make it | responsive layout verified. |
|   | visually coherent using realistic sample data. |   |
|   | Define contracts and DataEngine interface; |   |
| Phase 3 - Dataset model and sample fixtures | create deterministic sample data and profile | A user loads sample data or imports a fixture, |
|   | logic; add CSV/JSON validation and import | with correct schema and useful errors. |
|   | preview. |   |
|   | Add worker parsing/query path as needed, |   |
| Phase 4 - Worker pipeline and data grid | query contract, virtualized grid, | 100K fixture is usable; DOM is virtualized; |
|   | search/sort/filters, column controls, grouping | operations are tested. |
|   | and export. |   |
|   | Implement chart specs, aggregate queries, | Table and charts agree on active filters; no |
| Phase 5 - Chart builder and cross-filter | chart types, tooltips, no-data states and | stale results or loops. |
|   | canonical cross-filter model. |   |
|   | CRUD for views/dashboards, panel layout, | Refresh/restore, malformed state, storage |
| Phase 6 - Saved views and dashboard editor | autosave indicator, URL serialization, | failure and delete/reset are tested. |
|   | IndexedDB versioning and migrations. |   |
|   | Integrate DuckDB-WASM through adapter; | Production build/deploy can load assets; |
| Phase 7 - Large-data / Parquet path | large-query windows, worker/WASM setup, | representative large files tested and limits |
|   | Parquet if supported, cancellation/disposal, | documented. |
|   | capability errors. |   |
|   | Manual keyboard pass, color/contrast, |   |
| Phase 8 - Accessibility and polish | responsive refinements, reduced motion, chart | Core user journeys work on |
|   | alternatives, focus management, micro- | phone/tablet/desktop and keyboard only. |
|   | interactions and visual consistency. |   |
|   | Automate core flows, run benchmarks, inspect |   |
| Phase 9 - Performance and tests | profiler, optimize based on evidence, CI | No critical known test/build failures; |
|   | checks, accessibility scan and dependency | performance report exists with honest results. |
|   | audit. |   |


| Phase | Work | Exit gate |
| --- | --- | --- |
|   | Write README, architecture and | Live URL, reproducible local setup, |
| Phase 10 - Documentation and deploy | troubleshooting docs, benchmark report, | documented known limits and final checklist |
|   | screenshots, licenses/attribution; deploy | complete. |
|   | production build and smoke-test it. |   |

## 16.1 Mandatory execution protocol for the coding assistant

- Before editing: inspect current files, package manager, installed versions, existing tests and Git status.

- After each phase: summarize files changed, commands run, pass/fail results, and the next smallest phase.

- Run commands in the actual repository. Do not merely print code blocks as a substitute for creating files when filesystem/terminal tools are available.

- If a command fails, diagnose the root cause, fix it, and rerun the failed command. Do not hide error output or claim success without a passing exit status.

- Use small, focused changes. Do not replace the entire app to fix one component.

- If blocked by a real environment limitation, state the exact blocker, the attempted command, its error, and a specific manual step. Keep building independent features where possible.

- Do not stop after scaffolding, a screenshot, or the first successful npm run dev. The definition of done is the acceptance gates and deployed build.

## 17. Windows / VS Code setup and runbook

These commands are illustrative for a Windows PowerShell terminal. Use the currently supported Node.js LTS version required by the installed Vite release; check the official Vite guide at setup time. Do not assume an old Node.js version is compatible.

## 17.1 Initial setup

```
\# Verify Node.js and npm
node -v
npm -v
# Create the project if starting in an empty folder
npm create vite@latest datalens -- --template react-ts
cd datalens
npm install
# Start development server
npm run dev
```

If the repository already exists, do not scaffold over it. Inspect package.json and use the repo’s chosen package manager. Commit package-lock.json for npm installs.

## 17.2 Expected scripts

```
{
"scripts": {
"dev": "vite",
"build": "tsc -b && vite build",
"preview": "vite preview",
"lint": "eslint .",
"format": "prettier --write .",
"typecheck": "tsc -b --pretty false",
```


```
"test": "vitest",
"test:run": "vitest run",
"test:e2e": "playwright test"
}
}
```

Adjust exact commands to the actual tool versions and generated config; ensure every documented script truly exists and runs. Do not duplicate contradictory tsconfig/build checks if the chosen template uses a different pattern.

## 17.3 Production smoke test

npm run lint

npm run typecheck

npm run test:run

npm run build

npm run preview

- Open the preview URL printed by Vite.

- Load a bundled sample. Import a CSV. Filter and sort. Build a chart. Save a view. Refresh. Restore it. Export CSV.

- Check browser console/network for failed worker, WASM, CSS, route or asset requests.

- Repeat against the deployed URL. Local development success does not prove production asset paths or worker setup.

## 17.4 Troubleshooting playbook

| Symptom | Investigate first |
| --- | --- |
| Vite refuses to start | Node.js version requirement, package install, npm script, port conflict, |
|   | terminal working directory. |
| Blank route on deployed site | SPA fallback/rewrite configuration, base path, direct route loading, |
|   | console stack trace. |
| Worker fails in production | Worker URL construction, bundler-supported new Worker(new URL(..., |
|   | import.meta.url)) pattern, base path and network response. |
| WASM initializes locally but not deployed | WASM/worker asset paths, MIME type, CORS, extension URLs, |
|   | COOP/COEP only if threaded build selected, hosting headers. |
| Browser tab freezes while importing | Parsing/aggregation on main thread, excessive row copies, synchronous |
|   | loops, no cancellation, missing virtual windowing. |
| Table remains slow despite virtualization | Filtering/sorting entire data on every render, unnecessary React state |
|   | updates, duplicate arrays, chart recomputation, slow cell renderers. |
| Saved view does not survive refresh | IndexedDB transaction/await, schema migration, silent serialization |
|   | failure, storing wrong state slice, ID mismatch. |
| Charts show stale/incorrect values | Query versioning, cross-filter canonical model, incorrect aggregation |
|   | ordering, stale closure, race condition. |
| TypeScript package mismatch | Check version and official current docs, align peer dependencies; do not |
|   | suppress errors with any or broad ts-ignore. |
| Storage quota exceeded | Persist config before raw data, make dataset cache opt-in, quota-aware |
|   | error, delete cached data and retry. |

## 18. Deployment, documentation and recruiter presentation

## 18.1 Deployment requirements

- Deploy the production build to a static host such as Vercel, Netlify or Cloudflare Pages; configure SPA routing and environment/base paths correctly.


- Test Web Worker and DuckDB-WASM assets at the deployed URL. For threaded WebAssembly only, explicitly configure and verify required cross-origin isolation headers; keep a supported single-thread fallback if possible.

- No API secret is required for the local-first flow. Do not add private credentials to client-side .env variables.

- Add a lightweight app version/build identifier and an error boundary. Avoid a blank page when a route fails.

- Test the deployed build in current Chrome/Edge, Firefox and Safari where available; list untested browser/platform limitations honestly.

## 18.2 README must include

- One-sentence description and screenshot(s) or short GIF/video of real working flows.

- Live demo URL and repository setup instructions.

- Feature list grouped by implemented / planned - never show planned work as complete.

- Technology stack with why each major dependency exists.

- Architecture overview and data-flow diagram.

- Supported file formats, JSON shape expectations, local privacy behavior and storage choices.

- Environment requirements and exact install/run/test/build commands.

- Benchmark method/results: CPU/device, browser, data dimensions/file sizes, repetitions, engine path and known limitations.

- Accessibility and browser testing notes.

- Known issues, trade-offs, licenses/attribution for datasets, and next roadmap items.

## 18.3 Recruiter-facing case study

Create a short case-study page or README section around the engineering problem rather than a list of features:

- Problem: large local datasets make naive tables and charts slow or unusable.

- Constraints: browser memory, main-thread responsiveness, privacy, accessibility, and no required backend.

- Decisions: data-engine abstraction, workers/WASM where justified, virtualized rendering, canonical filter model, compact URL state, and accessible UI primitives.

- Evidence: actual benchmark tables, test coverage summary, architecture view, and deployed demo.

- Trade-offs: startup cost, memory, file compatibility, browser capability and what remains out of scope.

## 19. Final definition of done

## Do not mark the project complete until all release gates below are true.

The UI must work; the tests/build must pass; persistence and error paths must be verified; large-data claims must be measured; and the deployed app must be smoke-tested.

- Fresh clone/install steps in README work without secret credentials or undocumented manual hacks.

- App can load a bundled dataset and import valid CSV/JSON with useful progress, validation and error messages.

- Data profile and schema are correct for tested fixtures; ambiguous values are handled honestly.

- Grid search, sort, filters, grouping, column controls and CSV export work together.

- Virtualization is verified by DOM inspection and a documented 100K-row benchmark.

- Charts use the shared query model; cross-filtering and clearing filters are consistent.

- Dashboard/view CRUD, IndexedDB persistence and refresh recovery work; malformed stored/URL state fails safely.

- Worker and DuckDB-WASM paths are tested in production build if the large-data phase is implemented.

- Keyboard navigation and focus management work in core journeys; responsive layouts are checked.

- Unit, component/integration and critical E2E tests pass; lint, typecheck and build pass.

- No critical runtime console errors or failed resource loads in the tested deployment.

- Performance report contains reproducible measurements and honest limitations; no fabricated scores.

- README includes setup, architecture, features, tests, benchmarks, screenshots, live URL, privacy and trade-offs.

- Known bugs and unsupported behaviors are explicitly listed; no primary button is a dead end.


## 20. Recommendations that improve project quality

| Recommendation | Why it matters | Practical rule |
| --- | --- | --- |
|   |   | Complete sample dataset -> table -> filter -> |
| Start with the vertical slice | Prevents a beautiful but non-functional shell. | chart -> save -> refresh before adding exotic |
|   |   | features. |
| Build a deterministic 10K/100K/1M fixture | Makes performance repeatable and avoids | Use a seed, fixed schema and documented |
| generator | depending on random public downloads. | generated file sizes; label data synthetic. |
| Make the data engine replaceable | Avoids rewriting UI when memory and | All UI queries go through the same typed |
|   | DuckDB paths differ. | engine contract. |
| Measure before optimizing | Stops premature memoization and random | Keep a baseline benchmark, repeat tests, and |
|   | dependency additions. | record results after each major optimization. |
| Make error states a first-class design | Real files are messy; failures reveal | Test invalid files, storage failure, worker crash, |
|   | engineering maturity. | cancellation and stale responses early. |
| Invest in accessibility during component | Retrofitting focus and keyboard behavior is | Every dialog/menu/form/grid component has a |
| creation | expensive. | keyboard and accessible-name test at |
|   |   | introduction. |
| Protect scope | Advanced functionality can overwhelm | P0/P1 must be complete before P2; stretch |
|   | delivery. | features only after acceptance gates pass. |
| Prefer clarity over fashionable tools | Recruiters can see when tools are listed but not | Every dependency must solve a documented |
|   | understood. | problem and have tests around the integration. |
|   | Default components rarely look distinctive | Unify spacing, typography, chart colors, empty |
| Do a visual polish pass after functionality | without art direction. | states, hover/focus behavior and micro-motion |
|   |   | at the end. |
| Document trade-offs honestly | Evidence beats exaggerated claims. | State what was measured, on what device, and |
|   |   | what remains unsupported. |

## 21. Copy-and-paste master prompt for your coding assistant

## Use this prompt together with the full specification

Attach this PDF to the coding workspace if possible. The prompt below is the execution contract; the preceding sections define the detailed requirements.

You are the lead frontend engineer responsible for building DataLens - High-Performance Data Exploration Studio - in the current repository. Treat the attached DataLens Master Build Specification as the source of truth for product behavior, architecture, quality requirements, phased build plan, performance targets and definition of done.

## MISSION

Build a complete, polished, accessible, local-first analytics web application from the existing repository to a tested production deployment. Do not stop at a mockup, starter template, partial UI, generated snippets, or a successful development-server start. When terminal/file tools are available, edit real project files, run the required commands, diagnose failures and verify outcomes. Be honest about any step you cannot execute.

## FIRST ACTIONS

- 1. Inspect the working directory, repository structure and Git status; do not overwrite user work. Read package.json, lockfile, tsconfig, build/test setup and installed runtime versions.

- 2. Check current official docs for React, Vite, TanStack Table/Virtual, ECharts, DuckDB-WASM and the selected testing libraries. Choose compatible supported versions, use the correct APIs for those versions, and keep the lockfile.

- 3. Present a brief plan, dependency rationale and risks. Then implement phase by phase as specified in this PDF. Do not ask questions for ordinary choices; use the recommended defaults and document meaningful assumptions.

## PRODUCT

DataLens lets users load a bundled sample or import their own CSV/JSON, inspect schema and column profiles, explore records in a


virtualized data grid, filter/group/sort records, create interactive charts, cross-filter charts and table, build dashboards, save views, restore state after refresh, export data, and use keyboard-accessible controls. Add DuckDB-WASM and Parquet/large-data handling only through a replaceable data-engine adapter after the core vertical slice is reliable. Treat support for 100K-1M rows as a measured target, not a universal promise.

## BASELINE STACK

Use React + TypeScript + Vite; React Router; one coherent styling strategy with reusable design tokens; Lucide icons; TanStack Table and TanStack Virtual for the data grid; Apache ECharts for charts; worker-based parsing/aggregation where appropriate; IndexedDB for saved views/dashboard configuration; Zod at runtime boundaries; Vitest + React Testing Library + Playwright for tests. Use DuckDB-WASM for the advanced large-data/Parquet path only after checking its current official worker, asset, memory and deployment guidance. Avoid unnecessary state libraries or backend services.

## NON-NEGOTIABLE ENGINEERING RULES

- \- Keep raw large datasets out of global React state. Return visible row windows and chart aggregates through a typed DataEngine contract.

- \- Virtualization must bound rendered DOM; it does not replace query/aggregation optimization.

- \- Use stable IDs for datasets, columns, rows, views, charts and dashboard panels.

- \- Centralize query/filter semantics so grid and charts agree. Reject stale async results using request/query IDs; support cancellation where feasible.

- \- Store compact safe URL state only. Never place raw datasets, private row contents or secrets in a URL.

- \- Keep imported data local by default. Do not add external telemetry or upload data without explicit product approval.

- \- Escape untrusted data in UI and CSV export; validate files, schemas, stored state and URL payloads. Never expose client secrets.

- \- Make loading, empty, success, failure, cancellation and persistence states deliberate. No dead buttons, silent failures, fake progress, fabricated data claims or fake benchmarks.

- \- Meet WCAG 2.2 AA-oriented practices: semantic HTML, names/labels, visible focus, keyboard operation, contrast, focus restoration, reduced motion and chart alternatives.

- \- Build for responsive phone/tablet/desktop use, not desktop-only shrinkage.

- \- Add tests as features are built. Do not defer all testing to the end.

## IMPLEMENTATION ORDER

Follow the full specification's phases: inspect/plan; scaffold and quality gates; design system/app shell; sample datasets and import/profile; worker/data engine and virtualized grid; chart builder/cross-filter; saved views/dashboard and URL/persistence; DuckDB-WASM/Parquet; accessibility polish; performance/testing; documentation/deployment. At each phase, report changed files, commands run, actual pass/fail results, known gaps and the next phase. Fix failures before building more on top of them.

## QUALITY GATES

Ensure runnable scripts for lint, strict typecheck, unit/component tests, production build and E2E tests. At minimum test malformed CSV/JSON, duplicate headers, null/mixed values, filter/sort combinations, grouping and column controls, chart cross- filtering, save-refresh-restore, broken URL/storage, stale async responses, keyboard/focus flows, export escaping, and supported large-data fixtures. Test the actual production build and deployed worker/WASM asset paths.

## PERFORMANCE AND HONESTY

Create deterministic 10K/100K/1M fixture generation and a repeatable benchmark procedure. Profile a baseline before optimizing; report dataset row/column counts and bytes, browser/device, engine path, repetitions, median/p95 where useful, UI latency, DOM behavior, memory/resource observations and known limitations. Use Core Web Vitals as reference targets for suitable page loads; do not claim field performance from one Lighthouse run. Do not invent numbers or assert that one million rows works unless that exact test has been run successfully.

## DESIGN BAR

Create an original, professional analytics interface with consistent spacing, typography, restrained color palette, clear hierarchy, polished grid and chart interactions, well-designed empty/loading/error states, subtle purposeful motion, and reduced-motion support. Avoid a generic template look, excessive gradients, decorative clutter and animation that impedes work. Every control must perform its stated action.

## FINAL DELIVERABLES

A working repository; production build; responsive deployed demo if deployment credentials/permissions allow; tests and quality scripts; README; architecture/data-flow description; supported formats/privacy notes; known limitations; screenshots/walkthrough; and a reproducible performance report. At the end, provide exact setup/run/test/build/deploy commands, the live URL if actually deployed, what was tested, the real test results, outstanding bugs and any actions a human must still perform. Never report a command as passed unless it was run and its exit status succeeded.


Start by inspecting the repository and confirming the installed runtime. Then implement the smallest complete vertical slice and

continue through all phases until the definition-of-done checklist in the specification is satisfied.

## 22. Official references and implementation notes

The following sources were checked while preparing this specification on 15 October 2026. Always re-check the

official docs at implementation time because package APIs and deployment requirements can change.

- [R1 - React versions and current documentation](https://react.dev/versions)

- [R2 - React 19.3 release notes](https://react.dev/blog/2026/09/09/react-19-3)

- [R3 - Vite Getting Started / runtime requirements](https://vite.dev/guide/)

- [R4 - TanStack Table React documentation](https://tanstack.com/table/latest/docs/framework/react)

- [R5 - TanStack Table virtualization guide for React](https://tanstack.com/table/latest/docs/framework/react/guide/virtualization)

- [R6 - TanStack Query React documentation (only if remote/server state is introduced)](https://tanstack.com/query/latest/docs/framework/react)

- [R7 - DuckDB-WASM overview and constraints](https://duckdb.org/docs/current/clients/wasm/overview)

- [R8 - DuckDB-WASM deployment guidance](https://duckdb.org/docs/current/clients/wasm/deploying_duckdb_wasm)

- [R9 - Apache ECharts renderer guidance](https://echarts.apache.org/handbook/en/best-practices/canvas-vs-svg/)

- [R10 - Web Content Accessibility Guidelines (WCAG) 2.2](https://www.w3.org/TR/WCAG22/)

- [R11 - web.dev: Web Vitals](https://web.dev/articles/vitals)

- [R12 - Chrome DevTools Performance documentation](https://developer.chrome.com/docs/devtools/performance/)

## Final advice

This project becomes prestigious through completeness and proof: a real workflow, stable architecture, humane error

handling, keyboard accessibility, reproducible benchmarks, and a clean live demo. Feature count alone is not the goal.
