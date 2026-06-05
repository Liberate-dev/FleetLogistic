# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Fleet Ops** (a.k.a. Stitch Logistics) is a Document Management System (DMS) for logistics operations, focused on managing the lifecycle of shipments from order intake through delivery and financial reporting. The system is in Bahasa Indonesia (Indonesian) and handles Surat Jalan (SJ / delivery manifests), dispatch planning, vehicle inspection checklists, proof of delivery (POD), and financial reporting (LPJ).

This is a **frontend prototype** that pairs with a Node/Express/Prisma backend (see `backend/`). Currently the frontend runs against in-memory React Context state — the backend is not yet integrated into the running app.

## Repository Structure

```
.
├── src/                    # React + Vite frontend
│   ├── App.jsx             # All route definitions
│   ├── main.jsx            # Provider chain: BrowserRouter → FleetOpsProvider → LayoutProvider
│   ├── components/         # Layout, Sidebar, TopNavBar, MobileNav
│   │   └── ui/             # Reusable: Modal, StatusBadge, FileUpload, SearchableSelect, ToastContainer, etc.
│   ├── context/            # FleetOpsContext (reducer-based global state) + LayoutContext
│   ├── constants/          # SJ_STATUS, VEHICLE_STATUS, checklist categories, etc.
│   ├── pages/              # One file per route (e.g. CreateNewSJ.jsx, NewDispatch.jsx)
│   ├── services/           # fonnteService.js (WhatsApp gateway integration)
│   └── utils/              # documentNumbering, auditLogger, storageService, expiryTracker
├── backend/                # Express + Prisma + SQLite REST API
│   ├── prisma/             # schema.prisma (14 tables) + seed.js
│   └── src/
│       ├── index.js        # Express entry on port 3001
│       ├── routes/         # 7 route files (customers, materials, vehicles, drivers, suratJalan, dispatches, notifications, fonnte, webhooks)
│       ├── services/       # gateCheck, statusWorkflow, expiryTracking, documentNumbering, auditLog, fonnteService
│       └── middleware/     # errorHandler
├── .github/workflows/      # deploy.yml — GitHub Pages deployment
├── vercel.json             # Vercel config (experimental services for backend)
└── tailwind.config.js      # Material 3-inspired color tokens, dark mode via class
```

## Common Commands

### Frontend (root directory)
```bash
npm run dev        # Vite dev server with /api proxy to localhost:3001
npm run build      # Production build to dist/ (verified working)
npm run preview    # Preview production build
npm run lint       # ESLint (pre-existing warnings are expected)
```

### Backend (backend/ directory)
```bash
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma db push          # Apply schema to SQLite
npm run db:seed             # Load sample data (admin@fleetops.com / operator@fleetops.com)
npm run dev                 # nodemon on port 3001
```

The Vite dev server proxies `/api` → `http://localhost:3001`, so backend must be running for proxy to work.

## Architecture Notes

### State Management
All global state lives in `src/context/FleetOpsContext.jsx` — a `useReducer` store with actions for SJ, checklists, POD, LPJ, fleet, drivers, customers, materials, dispatches, and notifications. Pages consume via `useFleetOps()` hook. The reducer also auto-logs to the audit logger on create/status-change actions.

**Important:** Frontend currently operates entirely on local in-memory state. The backend Prisma/SQLite layer exists but is not yet wired into the React app — `vercel.json` declares experimental services for it.

### SJ Status Auto-Transitions
```
DRAFT → ASSIGNED → DISPATCHED → DELIVERED → COMPLETED
                  ↓
            CANCELLED (from any non-completed)
```
Triggered automatically when dispatch / POD / LPJ forms submit. See `FleetOpsContext.jsx` reducer cases.

### Document Numbering
Format: `SJ/MLG/YYYY/MM/NNNN` (with city code). Auto-incremented by `documentNumberingService.generateNumber(type, city)`. Types: `SJ`, `CL`, `POD`, `LPJ`. See `src/utils/documentNumbering.js`.

### Sidebar Routes (from `src/App.jsx`)
Operations: `/`, `/sj`, `/checklist/new`, `/dispatch`, `/pod`, `/lpj`, `/monitoring`
Master Data: `/fleet`, `/fleet/:id`, `/customers`, `/materials`, `/users`
Administration: `/archive`, `/reports`, `/audit`, `/settings`

### Backend API Surface
REST under `/api/*` — customers, materials, vehicles, drivers, surat-jalan, dispatches, notifications, fonnte, webhooks. See `backend/HANDOFF.md` for the full endpoint list. Gate check service validates STNK/KIR/SIM expiry + ACTIVE status before allowing dispatch. Status workflow service enforces the SJ transition rules above.

## Code Style Conventions
- **Styling:** Tailwind CSS only — no separate CSS files except `index.css`/`App.css` (which are scaffolding)
- **Custom Tailwind tokens:** `glass-panel` (card backgrounds), `font-headline` (Manrope), `font-body` (Inter), `font-label` (Inter)
- **Icons:** `material-symbols-outlined` Google font (e.g. `<span className="material-symbols-outlined">route</span>`)
- **Dark mode:** Use `dark:` prefix throughout; toggled via `.dark` class on root
- **Layout:** Wrap pages in `<Layout>` (sticky top header + scrollable content)
- **Forms:** `rounded-xl border focus:ring-2 focus:ring-primary`
- **Status badges:** Use `<StatusBadge>` from `components/ui/`
- **Modals:** Use `<Modal>` from `components/ui/`
- **Search inputs:** Use `<SearchableSelect>` (portal-based, auto-positioned) — not raw `<select>`
- **Notifications:** Call `addNotification({ type, title, message })` from context — **never use `alert()`**
- **Toasts:** Auto-dismiss after 4s; managed by `<ToastContainer>`

## Configuration Files Worth Knowing
- `vite.config.js` — `base: './'` (relative paths for GitHub Pages subdir deployment)
- `tailwind.config.js` — Material 3 color tokens, custom animations (`fade-in`, `slide-up`, `slide-in-right`, `pulse-slow`)
- `vercel.json` — Experimental services config (backend at `/_/backend`, frontend at `/`)
- `.github/workflows/deploy.yml` — Auto-deploys to GitHub Pages on push to `master`

## Common Gotchas
- `storageService` methods are **instance methods**, not static — call on the imported `storageService` instance, not `storageService.compressImage(...)` as a class static
- ToastContainer's import path is `../../context` from `src/components/ui/` (sibling of `context/`)
- Frontend state is in-memory only — refreshes reset data. Backend integration is a pending task
- The Vite proxy only forwards `/api/*` — non-API backend endpoints (like `/health`) need direct access to `:3001`

## Reference Docs
- `HANDOFF.md` — Comprehensive phase-by-phase implementation log with form codes (F-SJ-01, F-DP-01, etc.)
- `SYSTEM_DESIGN.md` — Sitemap, operational workflow, use cases
- `plan.md` — Full feature/module specification with document taxonomy
- `backend/HANDOFF.md` — Backend setup, endpoints, schema, troubleshooting

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **FleetLogistic** (1396 symbols, 2199 relationships, 58 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/FleetLogistic/context` | Codebase overview, check index freshness |
| `gitnexus://repo/FleetLogistic/clusters` | All functional areas |
| `gitnexus://repo/FleetLogistic/processes` | All execution flows |
| `gitnexus://repo/FleetLogistic/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
