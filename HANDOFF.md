# Fleet Ops — Handoff Document

> **Date:** April 14, 2026 (Updated)
> **Status:** Phases 1-10 Complete ✅
> **Build Status:** ✅ Compiles successfully (`npm run build` passes)

---

## What's Been Done

### Phase 1: Foundation ✅
| File | Purpose |
|---|---|
| `src/utils/documentNumbering.js` | Auto-generate document numbers (SJ/CL/POD/LPJ) with format `SJ/MLG/YYYY/MM/NNNN` |
| `src/utils/auditLogger.js` | Audit trail — logs all actions with timestamp, user, document reference |
| `src/utils/storageService.js` | File/photo upload storage with metadata, compression (fixed: `static` → instance methods) |
| `src/utils/expiryTracker.js` | Document expiry tracking (STNK/KIR/SIM/Insurance) with H-30, H-7 reminders |
| `src/utils/index.js` | Utils barrel export |
| `src/components/ui/Modal.jsx` | Reusable modal with header, scrollable content, size variants |
| `src/components/ui/StatusBadge.jsx` | Status badge with dispatch statuses (PLANNED, IN TRANSIT) |
| `src/components/ui/FileUpload.jsx` | Drag-and-drop file upload with compression, preview, remove |
| `src/components/ui/ChecklistItem.jsx` | Checklist item with choice/checkbox/input types, photo required badges, notes |
| `src/components/ui/DocumentCard.jsx` | Card display for documents with metadata, actions, status |
| `src/components/ui/GateCheck.jsx` | Gate check validation display with progress, warnings |
| `src/components/ui/SearchableSelect.jsx` | **NEW** — Portal-based search+select with `createPortal`, auto-positioning |
| `src/components/ui/ToastContainer.jsx` | **NEW** — In-app toast notifications (success/error-warning-info), auto-dismiss 4s |
| `src/components/ui/index.js` | UI components barrel export |
| `src/context/FleetOpsContext.jsx` | React Context + reducer for global state (SJ, checklists, POD, LPJ, fleet, drivers) |
| `src/context/index.js` | Context barrel export |
| `src/constants/index.js` | Added `DISPATCH_STATUS` (PLANNED, READY, DISPATCHED, IN_TRANSIT, DELIVERED, COMPLETED, CANCELLED) |
| `src/main.jsx` | Wrapped App with `FleetOpsProvider` |

### Phase 2: Surat Jalan Module ✅
| File | What Changed |
|---|---|
| `src/pages/CreateNewSJ.jsx` | 5-step wizard with auto-generated SJ number (F-SJ-01), cash advance form (F-SJ-02), foto muatan upload (F-SJ-03). **Fixed:** `handlePhotoUploadComplete` handler was missing — now defined. Uses toast notifications instead of `alert()`. |

### Phase 3: Vehicle Inspection Checklist ✅
| File | What Changed |
|---|---|
| `src/pages/VehicleChecklist.jsx` | Pre-Departure (F-VIC-01) + Post-Arrival (F-VIC-02) with 5 categories each, auto-numbering, photo per item, "Tidak Layak" blocking, Fleet Manager approval for "Perlu Perhatian", odometer tracking, distance calculation. **Revised:** SJ field uses `SearchableSelect` (search + select). Supports `?vehicle=` and `?plate=` URL params for pre-fill. |

### Phase 4: Dispatch Planning Module ✅
| File | What Changed |
|---|---|
| `src/pages/NewDispatch.jsx` | **Full rewrite** — SJ/Driver/Truck selection from context, 6 gate checks (F-DP-01) including auto-detect last vehicle checklist, cost estimation (F-DP-02), priority levels, confirmation modal. Gate check for pre-departure finds latest checklist by vehicle plate and checks "Tidak Layak" findings. Auto-transitions SJ status to `ASSIGNED`. Uses toast notifications. |
| `src/pages/DispatchIndex.jsx` | **Full rewrite** — Real data from context with stats cards, priority badges, cost display, empty state |
| `src/App.jsx` | Added routes: `/dispatch`, `/dispatch/new` |

### Phase 5: POD Module ✅
| File | What Changed |
|---|---|
| `src/pages/PODIndex.jsx` | **NEW** — POD list with stats, pending PODs for delivered SJ, status badges |
| `src/pages/ProofOfDelivery.jsx` | **NEW** — Serah terima form (F-POD-01) with receiver info, condition selection (good/partial_damage/damaged/missing), photo evidence upload (F-POD-02), discrepancy reporting. Auto-transitions SJ status from `DISPATCHED` → `DELIVERED`. |
| `src/App.jsx` | Added routes: `/pod`, `/pod/new`, `/pod/:sjNumber` |

### Phase 6: LPJ Keuangan Module ✅
| File | What Changed |
|---|---|
| `src/pages/LPJIndex.jsx` | **NEW** — LPJ list with stats, total expenses summary |
| `src/pages/LPJKeuangan.jsx` | **NEW** — Financial form with expense breakdown by category (F-LPJ-01), receipt uploads, cash advance comparison, balance calculation. Auto-transitions SJ status to `COMPLETED`. |
| `src/App.jsx` | Added routes: `/lpj`, `/lpj/new`, `/lpj/:sjNumber` |

### Phase 7: Fleet Management ✅
| File | What Changed |
|---|---|
| `src/pages/FleetIndex.jsx` | **Full rewrite** — Fleet list with stats, document expiry alerts (F-FL-01), maintenance tickets from checklist findings (F-FL-02) |
| `src/pages/FleetDetail.jsx` | **NEW** — Per-vehicle detail with document compliance, checklist history timeline (F-FL-03), dispatch history, distance tracking, "New Checklist" button that navigates to checklist with `?vehicle=` and `?plate=` params |
| `src/App.jsx` | Added route: `/fleet/:id` |

### Phase 8: User & Driver Management ✅
| File | What Changed |
|---|---|
| `src/pages/UserIndex.jsx` | **Full rewrite** — Driver list with SIM expiry tracking (F-UM-01), dispatch blocking alerts, system users table |

### Phase 9: Reports & Archive ✅
| File | What Changed |
|---|---|
| `src/pages/Reports.jsx` | **Full rewrite** — 7 report types: Fleet Utilization, Cash Advance Recap, Distance Tracking, Checklist Findings, POD Discrepancies (F-RP-01), Client Delivery Performance, Monthly Revenue & Tonnage. All reports use real data from context. |

### Phase 10: Integration Testing ✅
- Build passes: `npm run build` ✅ (574KB JS, 65KB CSS)
- All routes registered in App.jsx

---

## SJ Status Flow (Auto-Transitions)

```
DRAFT → ASSIGNED → DISPATCHED → DELIVERED → COMPLETED
```

| Action | From → To | Triggered By |
|---|---|---|
| Create SJ | — → `DRAFT` | CreateNewSJ submit |
| Assign Dispatch | `DRAFT` → `ASSIGNED` | NewDispatch submit |
| Confirm Dispatch | `ASSIGNED` → `DISPATCHED` | (gate check pass, manual confirm) |
| Submit POD | `DISPATCHED` → `DELIVERED` | ProofOfDelivery submit |
| Submit LPJ | `DELIVERED` → `COMPLETED` | LPJKeuangan submit |

---

## Sidebar Navigation (Updated)

| Group | Menu | Path |
|---|---|---|
| Operations | Dashboard | `/` |
| Operations | Surat Jalan (SJ) | `/sj` |
| Operations | Vehicle Checklist | `/checklist/new` |
| Operations | Dispatch Planning | `/dispatch` |
| Operations | Proof of Delivery | `/pod` |
| Operations | LPJ Keuangan | `/lpj` |
| Operations | Live Monitoring | `/monitoring` |
| Master Data | Fleet Assets | `/fleet` |
| Master Data | Customers | `/customers` |
| Master Data | Materials | `/materials` |
| Administration | User Management | `/users` |
| Administration | Document Archive | `/archive` |
| Administration | Reports | `/reports` |
| Administration | Audit Log | `/audit` |

---

## Architecture Reference

### State Management
```js
import { useFleetOps } from '../context';
const { createSJ, updateSJ, changeSJStatus, createChecklist, createPOD, updatePOD, createLPJ, updateLPJ, suratJalan, checklists, pods, lpjRecords, addNotification } = useFleetOps();
```

### Toast Notifications
```js
addNotification({
  type: 'success' | 'error' | 'warning' | 'info',
  title: 'Berhasil Dibuat',
  message: 'Detail message',
});
// Auto-dismisses after 4s, manual close via ToastContainer
```

### SearchableSelect Component
```js
import SearchableSelect from '../components/ui/SearchableSelect';

<SearchableSelect
  value={selectedValue}
  onChange={setSelectedValue}
  label="Pilih Item"
  placeholder="Ketik untuk mencari..."
  options={[
    { value: 'opt1', label: 'Option 1 — Description' },
    { value: 'opt2', label: 'Option 2 — Description' },
  ]}
/>
// Portal-based, auto-positioned, scroll/resize aware
```

### Document Numbering
```js
import { documentNumberingService } from '../utils';
const { number, sequence } = documentNumberingService.generateNumber('SJ', 'malang');
// Types: 'SJ', 'CL', 'POD', 'LPJ'
```

### Audit Logging
```js
import { auditLogger } from '../utils';
auditLogger.log({ action: 'CREATE', documentType: 'SJ', documentId: 'SJ/MLG/2025/04/0001', details: '...' });
auditLogger.logStatusChange('SJ', number, 'DRAFT', 'ASSIGNED');
```

### File Storage
```js
import { storageService } from '../utils';
// Compress + store (now instance methods, not static)
const dataUrl = await storageService.compressImage(file);
const record = storageService.storeFile(documentId, 'photo', 'muatan', dataUrl, metadata);
// Retrieve
const files = storageService.getFilesByDocument(documentId);
```

### Expiry Tracking
```js
import { expiryTracker } from '../utils';
const isValid = expiryTracker.isEntityValid(truckId, 'truck');
const earliest = expiryTracker.getEarliestExpiry(truckId, 'truck');
```

### Constants
```js
import { SJ_STATUS, VEHICLE_STATUS, DISPATCH_STATUS, PRE_DEPARTURE_CATEGORIES, POST_ARRIVAL_CATEGORIES, LPJ_EXPENSE_CATEGORIES } from '../constants';
```

---

## Code Style Conventions
- **Tailwind CSS** — all styling, no CSS files
- **glass-panel** class for card backgrounds
- **material-symbols-outlined** for icons (Google Material Symbols)
- **font-headline** for headings, **font-body** for text
- **Dark mode:** `dark:` prefix throughout
- **Layout:** `<Layout>` wrapper, sticky top header, scrollable content
- **Forms:** rounded-xl, border, focus:ring-2 focus:ring-primary
- **Status badges:** use `StatusBadge` component from ui/
- **Modals:** use `Modal` component from ui/
- **Search/Select:** use `SearchableSelect` component from ui/
- **Notifications:** use `addNotification()` from context — do NOT use `alert()`

---

## Running the Project
```bash
npm run dev        # Start dev server
npm run build      # Production build (verified working, 574KB JS)
npm run lint       # ESLint (some pre-existing warnings)
npm run preview    # Preview production build
```

---

## Bug Fixes Applied
| File | Issue | Fix |
|---|---|---|
| `CreateNewSJ.jsx` | `handlePhotoUploadComplete` undefined → foto muatan blank | Handler added |
| `storageService.js` | `compressImage` declared as `static` → not callable on instance | Removed `static` keyword |
| `ToastContainer.jsx` | Import path wrong (`../context` in `src/components/ui/`) | Changed to `../../context` |

---

## What's Next / Future Work
- Edit SJ (for DRAFT status)
- Void SJ workflow
- PDF export bundles (F-RP-02) — combine SJ + Checklist + POD + LPJ into single PDF
- Effect dispatch confirm → SJ → `DISPATCHED` (currently manual)
- LPJ approval workflow (Finance approve/reject)
- Real file upload (IndexedDB / cloud storage instead of localStorage)
