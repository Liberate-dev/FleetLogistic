# Fleet Ops (FleetLogistic) — Technical Documentation

**Project**: Fleet Ops — Document Management System (DMS) for Logistics Operations  
**Focus**: Surat Jalan (SJ), Dispatch Planning, Vehicle/Driver Gate Checks, Proof of Delivery (POD), Laporan Pertanggungjawaban (LPJ), and Financial Reporting.  
**Language**: Bahasa Indonesia (Indonesian market)  
**Current State**: Full-featured React prototype with optional Node.js backend. Supports fully offline/static deployment via browser persistence.

---

## 1. Technologies Used

### Frontend (React SPA)
- **Framework**: React 19 + Vite 8 (build tool)
- **Routing**: React Router DOM v7 (`BrowserRouter`)
- **Styling**: Tailwind CSS 3.4 with custom Material 3-inspired design tokens (glass-panel, color system, dark mode via `.dark` class)
- **UI Components**: Custom components in `src/components/ui/` (Modal, SearchableSelect, FileUpload, DigitalSignature, StatusBadge, ToastContainer, etc.)
- **Icons**: 
  - Google Material Symbols Outlined (via CDN)
  - lucide-react
- **PDF & Reporting**: 
  - jsPDF + jspdf-autotable
  - html2canvas (for visual capture)
- **State Management**: `useReducer` + Context API (`FleetOpsContext`)
- **Persistence (Static Mode)**:
  - localStorage (main business data, audit logs, document counters)
  - **IndexedDB** (file attachments, photos, signatures — via updated `storageService`)
- **Other**:
  - Document numbering service (client-side for offline)
  - Expiry tracker (STNK/KIR/SIM)
  - Fonnte WhatsApp integration (client + server)

### Backend (Optional, for production data)
- **Runtime**: Node.js (ESM)
- **Web Framework**: Express 4
- **ORM + Database**: Prisma + better-sqlite3 (SQLite by default)
- **Key Services** (in `backend/src/services/`):
  - `statusWorkflow.js` — Enforces SJ state machine
  - `gateCheck.js` — Validates vehicle/driver documents before dispatch
  - `documentNumbering.js` (server)
  - `auditLog.js`
  - `expiryTracking.js`
  - `fonnteService.js`
- **API**: REST under `/api/*`
- **Middleware**: CORS, JSON body parser (10MB limit for photos), error handler
- **Seeding**: `prisma/seed.js` (sample users, fleet, customers, materials)

### DevOps & Deployment
- **Config**: `vite.config.js` (`base: './'` for relative paths), `tailwind.config.js`, `vercel.json` (experimental frontend + backend services)
- **CI/CD**: `.github/workflows/deploy.yml` (GitHub Pages)
- **Package Managers**: npm + package-lock.json (both root and `backend/`)

### Key Design Decisions
- **Offline-first / Static-first**: Frontend can run completely standalone (in-memory + localStorage + IndexedDB) on pure static hosting (cPanel, GitHub Pages, Vercel static, etc.).
- **Hybrid Architecture**: Full backend support when available; graceful degradation when not.
- **Compliance Focus**: Built around Indonesian logistics requirements (Surat Jalan mandatory document, LPJ financial accountability, gate checks for legal vehicle/driver docs).

---

## 2. Database Structure (Prisma Schema)

**Database Provider**: SQLite (development). Easily swappable to PostgreSQL/MySQL via Prisma.

**Core Tables** (see full `backend/prisma/schema.prisma`):

### Master Data
- **User** (id, email, name, role=OPERATOR|ADMIN, ...)
- **Customer** (code, name, address, phone)
- **Material** (code, name, unit)
- **Vehicle** (plateNumber, type, capacity, stnkExpiry, kirExpiry, status)
- **Driver** (employeeId, name, phone, whatsappPhone, simType, simNumber, licenseExpiry, status)

### Operational Documents
- **SuratJalan** (documentNumber unique, customer, status, date, destination, originDepot, contact info, uangJalan, danaCadangan, photo/signature flags, ...)
  - Has many **SuratJalanItem** (material + quantity)
- **Dispatch** (links 1:1 to SuratJalan)
  - vehicle, driver
  - gateCheckStatus (PENDING|PASSED|FAILED), gateCheckBy, gateCheckAt
  - Related: VehicleChecklist, DriverChecklist, POD, LPJ (1:1 each)

### Checklists & Proof
- **VehicleChecklist** (dispatchId, vehicleId, checklistItems JSON, condition, notes)
- **DriverChecklist** (dispatchId, driverId, hasLicense, licenseValid, condition)
- **POD** (dispatchId, receivedBy, receivedAt, signature, photos JSON, notes)
- **LPJ** (dispatchId, startKm/endKm, fuelUsed, expenses JSON, notes)

### Supporting
- **Notification**
- **AuditLog** (entityType, entityId, action, old/newValue, user)

**Indexes**: Heavy indexing on status, documentNumber, expiry dates, customer, vehicle, driver for fast queries and gate checks.

**Relationships**: Strong cascade deletes from Dispatch → related checklists/POD/LPJ.

**Note on Frontend**: In pure static mode (no backend), data is denormalized and stored in browser (IndexedDB + localStorage) using a similar shape to the normalized API responses.

---

## 3. Alur Program / Program Flow

### 3.1 Surat Jalan (SJ) Lifecycle (State Machine)
Defined in `backend/src/services/statusWorkflow.js` (enforced on server) and mirrored in frontend context.

```
DRAFT → ASSIGNED → DISPATCHED → DELIVERED → COMPLETED
                  ↓
            CANCELLED (from any non-COMPLETED state)
```

- **DRAFT**: Create SJ (CreateNewSJ.jsx) → items, customer, uang jalan, photos. Number auto-generated client-side (frontend `documentNumberingService` format: `SJ/MLG/YYYY/MM/NNNN`).
- **ASSIGNED**: NewDispatch.jsx — assign vehicle + driver.
- **DISPATCHED**: Requires successful **Gate Check** (GateCheck.jsx component + `gateCheck.js` service validates STNK/KIR/SIM expiry + ACTIVE status).
- **DELIVERED**: ProofOfDelivery.jsx — receiver signature + photos.
- **COMPLETED**: LPJKeuangan.jsx / LPJIndex — odometer, fuel, expenses.
- **CANCELLED**: Available from most states via SJIndex or Archiving.

Auto-transitions often triggered from form submissions in context (`FleetOpsContext`).

### 3.2 Frontend Architecture
- **Entry**: `src/main.jsx` → `BrowserRouter` → `FleetOpsProvider` + `LayoutProvider`
- **Global State**: `FleetOpsContext` (useReducer)
  - On mount: Attempts `fetch('/api/...')` for all master + operational data.
  - **On failure** (static deploy): Falls back to `localStorage` (`fleet_ops_main_data`) + previously saved document counters / audit.
- **Actions**: Mix of pure local dispatch (most) + some API calls with graceful fallback (e.g. `createSJ` tries backend, falls back to local + uses client numbering).
- **Pages** (one file per major screen under `src/pages/`):
  - Operations: CreateNewSJ, NewDispatch, VehicleChecklist, ProofOfDelivery, LPJKeuangan, Monitoring, Archiving.
  - Master: Fleet/Customer/Material/Driver/User indexes + add forms.
  - Reports: Reports, AuditLog, SJIndex, PODIndex, LPJIndex, DispatchIndex.
- **Key Shared UI**:
  - `FileUpload` + `storageService` (now IndexedDB) for photos/signatures.
  - `DigitalSignature` (canvas).
  - `DocumentPrintLayout` + PDF export.
  - `GateCheck`, `StatusBadge`, `ToastContainer`.

### 3.3 Backend Flow (when available)
- Express app mounts `/api` routes.
- Prisma client injected into `req.prisma`.
- Routes delegate to services for business rules (gate check, status validation, numbering).
- Webhooks route for external events (e.g. photo received from driver app).
- Fonnte integration for WhatsApp notifications on SJ creation.

### 3.4 Offline / Static Mode Flow (Current cPanel Deploy)
1. User opens static site → React loads.
2. Context tries API → fails → loads from localStorage + IndexedDB.
3. User creates SJ → `documentNumberingService.generateNumber()` (persisted counter) + `createSJ` (local dispatch + audit log).
4. Photos uploaded → compressed to JPEG dataURL → stored in **IndexedDB** via `storageService`.
5. All changes immediately persisted.
6. Refresh / reopen → everything (including photos) restored.

---

## 4. Fitur Unggulan / Competitive Advantages

1. **End-to-End Indonesian Logistics Workflow**
   - Full SJ lifecycle + mandatory supporting docs (Gate Check, POD, LPJ).
   - Matches real operational needs in Indonesia (Surat Jalan, LPJ keuangan for accountability).

2. **Compliance & Safety Gate**
   - Automatic gate check blocks dispatch if STNK/KIR/SIM expired or vehicle/driver not ACTIVE.
   - Expiry tracking utility.

3. **Evidence-Rich Documents**
   - Photo evidence at multiple stages (muatan, checklist, POD).
   - Digital signature capture.
   - All stored with metadata (timestamp, GPS if available).

4. **Offline / Static Hosting Ready (Unique for this category)**
   - After recent enhancements: Fully functional without any backend.
   - Uses **IndexedDB** for attachments (high capacity) + localStorage for structured data.
   - Perfect for field teams, low-connectivity areas, or cheap static hosting.

5. **Audit Trail & Traceability**
   - Every create/status change logged with user + timestamp (persisted).
   - Accessible via AuditLog page.

6. **Modern UX on Logistics Domain**
   - Material 3 + glassmorphism UI, dark mode, responsive (mobile nav included).
   - Searchable selects, drag-drop file upload, instant PDF export with tables.
   - Real-time notifications (toast) + in-app notification model.

7. **WhatsApp Integration**
   - Automatic driver notification on SJ creation (via fonnte service).
   - Test page included.

8. **Extensible Document Numbering**
   - Configurable format (Settings page).
   - Client-side generation works offline; server-side also available.

9. **PDF Export & Reporting**
   - Professional reports (executive summary, LPJ, SJ print layout).
   - Uses jsPDF + autotable for clean tabular output.

**Competitive Edge vs Generic DMS**:
- Purpose-built for Indonesian trucking/logistics compliance.
- Low-cost deployment (static frontend on cPanel + optional cheap Node backend).
- Strong offline capability with rich media (photos/signatures).

---

## 5. Cara Instalasi dan Hosting

### 5.1 Local Development

**Prerequisites**: Node.js 18+ , npm

```bash
# Root (Frontend)
npm install
npm run dev          # Vite dev server (http://localhost:5173)
npm run build        # Produces dist/ (static)
npm run preview      # Preview production build

# Backend (in /backend folder)
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma db push   # or prisma migrate
npm run db:seed      # Loads demo data (admin@fleetops.com / operator@...)
npm run dev          # Runs on port 3001
```

Vite dev proxy forwards `/api` → `http://localhost:3001` automatically (see `vite.config.js`).

**Demo users** (after seed): Check `backend/prisma/seed.js`.

### 5.2 Frontend-Only Static Hosting (Current Recommended for Prototype)

This is how the project is currently deployed to cPanel.

1. `npm run build` (in root)
2. Upload contents of `dist/` to your web root (e.g. `public_html/fleetlogistic.mcs i2/` or equivalent in cPanel File Manager).
3. Ensure `.htaccess` for SPA fallback exists (Rewrite to `index.html` for client-side routes):

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . index.html [L]
</IfModule>
```

4. (Optional) Delete or keep `php.ini` / `user.ini` — not required for static React.

**Result**: Fully working app with local persistence (IndexedDB + localStorage).

### 5.3 Backend Hosting (for real multi-user / persistent DB)

Backend requires a Node.js runtime that can run persistently.

**Recommended platforms** (free tiers available):
- **Render.com** (easiest for Node + SQLite/Postgres)
- **Railway.app**
- **Fly.io**
- VPS (Hostinger, DigitalOcean, etc.) + PM2 or Docker

**Steps (example on Render)**:
1. Push backend folder (or whole repo) to Git.
2. Create new Web Service.
3. Build: `cd backend && npm install && npx prisma generate && npx prisma db push`
4. Start: `node src/index.js`
5. Set environment variables (PORT, CORS_ORIGIN pointing to your frontend URL, DATABASE_URL if switching from SQLite).
6. For production DB: Change Prisma datasource to `postgresql` or `mysql` and run migrations.

**Frontend connection**:
- Update `vite.config.js` proxy (dev only) or in production set API base URL.
- For static frontend, you may need to hardcode or use a small config for backend URL.

### 5.4 Full-Stack Options

- **Vercel** (experimental): `vercel.json` declares backend service at `/_/backend`.
- **GitHub Pages**: Only frontend (via workflow). Use separate backend.
- **Single VPS**: Run both frontend static files + Node backend on same server (Nginx reverse proxy).

### 5.5 Database Migration (Production)

```bash
# In backend/
npx prisma migrate dev --name init
# Or for SQLite file move: just copy dev.db (not recommended for prod)
```

Switch to Postgres:
- Update `prisma/schema.prisma` datasource
- `npx prisma generate`
- `npx prisma migrate deploy`

### 5.6 Post-Deployment Notes

- Run `npm run db:seed` on fresh backend instances.
- Configure fonnte credentials for WhatsApp (see `backend/src/services/fonnteService.js`).
- Set proper CORS origin in backend `.env`.
- For large photo usage, monitor IndexedDB quota on client devices.

---

## Appendix: Current Limitations & Roadmap

- Frontend-backend integration is **partial** (some pages still do direct fetches; context provides fallbacks).
- No real authentication / multi-tenant yet (prototype user is hardcoded).
- SQLite fine for testing; production should use Postgres + proper backups.
- Offline mode is powerful but data is device-local (consider sync strategy later).
- Document numbering formats differ slightly between frontend (offline) and backend.

**Next Recommended Steps**:
- Centralize more data access through context actions.
- Add proper auth (JWT or session).
- Backend deployment + connect real frontend to it.
- Add data export/import (JSON) for cross-device testing.

---

**Maintained by**: Fleet Ops Team  
**Last Updated**: 2026-06 (post-cleanup + IndexedDB storage upgrade)

For code-level details, refer to:
- `src/context/FleetOpsContext.jsx`
- `backend/prisma/schema.prisma`
- `backend/src/services/statusWorkflow.js` + `gateCheck.js`
- `src/utils/storageService.js` (IndexedDB implementation)
- `README.md` (basic project overview)

This document should be sufficient for developers, deployers, and stakeholders.