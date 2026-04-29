# Fleet Ops Backend - Handoff

## What's Built

REST API lengkap untuk Fleet Ops logistics app.

### Stack
- **Runtime**: Node.js + Express
- **ORM**: Prisma
- **Database**: SQLite (file-based, untuk prototype)
- **Port**: 3001 (default)

### File Structure
```
backend/
├── prisma/
│   ├── schema.prisma      # 14 tables
│   ├── seed.js            # Sample data
│   └── dev.db             # SQLite database
├── prisma.config.ts       # Prisma 7 config
├── src/
│   ├── index.js           # Express entry
│   ├── routes/            # 7 route files
│   ├── services/          # 5 service files
│   └── middleware/
│       └── errorHandler.js
├── .env.example
└── package.json
```

## Setup

### 1. Copy env
```bash
cd backend
copy .env.example .env
```

### 2. Install dependencies
```bash
npm install
```

### 3. Generate Prisma client & push schema
```bash
npx prisma generate
npx prisma db push
```

### 4. Seed data & start
```bash
npm run db:seed
npm run dev
```

Uses Prisma 7 adapter pattern with `better-sqlite3`. Database `dev.db` tersimpan di folder `backend/prisma/`.

API aktif di `http://localhost:3001`

## API Endpoints

### Customers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/customers | List all |
| GET | /api/customers/:id | Get single |
| POST | /api/customers | Create |
| PUT | /api/customers/:id | Update |
| DELETE | /api/customers/:id | Delete |

### Materials
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/materials | List all |
| GET | /api/materials/:id | Get single |
| POST | /api/materials | Create |
| PUT | /api/materials/:id | Update |
| DELETE | /api/materials/:id | Delete |

### Vehicles
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/vehicles | List all |
| GET | /api/vehicles/expiring | Expiring docs |
| GET | /api/vehicles/:id | Get single |
| POST | /api/vehicles | Create |
| PUT | /api/vehicles/:id | Update |
| DELETE | /api/vehicles/:id | Delete |

### Drivers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/drivers | List all |
| GET | /api/drivers/expiring | Expiring licenses |
| GET | /api/drivers/:id | Get single |
| POST | /api/drivers | Create |
| PUT | /api/drivers/:id | Update |
| DELETE | /api/drivers/:id | Delete |

### Surat Jalan
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/surat-jalan | List all |
| GET | /api/surat-jalan/:id | Get with items |
| POST | /api/surat-jalan | Create |
| PUT | /api/surat-jalan/:id | Update (DRAFT only) |
| POST | /api/surat-jalan/:id/assign | Assign vehicle+driver |
| POST | /api/surat-jalan/:id/dispatch | Gate check + dispatch |
| POST | /api/surat-jalan/:id/deliver | Mark delivered |
| POST | /api/surat-jalan/:id/complete | Mark completed |
| POST | /api/surat-jalan/:id/cancel | Cancel |
| DELETE | /api/surat-jalan/:id | Delete (DRAFT only) |

### Dispatches
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/dispatches | List all |
| GET | /api/dispatches/:id | Get with checklists |
| POST | /api/dispatches/:id/vehicle-checklist | Submit vehicle check |
| POST | /api/dispatches/:id/driver-checklist | Submit driver check |
| POST | /api/dispatches/:id/gate-check | Perform gate check |
| PUT | /api/dispatches/:id/status | Update status |
| POST | /api/dispatches/:id/pod | Submit POD |
| GET | /api/dispatches/:id/pod | Get POD |
| POST | /api/dispatches/:id/lpj | Submit LPJ |
| GET | /api/dispatches/:id/lpj | Get LPJ |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/notifications | List |
| GET | /api/notifications/unread-count | Count unread |
| PUT | /api/notifications/:id/read | Mark read |
| PUT | /api/notifications/mark-all-read | Mark all read |
| POST | /api/notifications/check-expiring | Check expiring docs |

## Database Schema

### Tables
- `users` - Admin, Operator, Viewer roles
- `customers` - Kode unik (CUST-XXX)
- `materials` - Kode unik (MAT-XXX)
- `vehicles` - STNK/KIR expiry tracking
- `drivers` - License expiry tracking
- `surat_jalan` - Document workflow
- `surat_jalan_items` - Material items per SJ
- `dispatches` - Vehicle+driver assignment
- `vehicle_checklists` - Pre-departure vehicle check
- `driver_checklists` - Pre-departure driver check
- `pods` - Proof of delivery
- `lpjs` - Laporan perjalanan
- `notifications` - Expiry warnings, alerts
- `audit_logs` - Change tracking

### SJ Status Flow
```
DRAFT → ASSIGNED → DISPATCHED → DELIVERED → COMPLETED
                     ↓
               CANCELLED (from any non-completed)
```

## Services

### Gate Check
Validasi sebelum dispatch:
- Vehicle STNK expiry > today
- Vehicle KIR expiry > today
- Driver license expiry > today
- Vehicle/Driver status ACTIVE

### Expiry Tracking
- Auto-create notification kalau docs expire dalam 30 hari
- Endpoint `/api/vehicles/expiring` dan `/api/drivers/expiring`

### Document Numbering
Auto-generate format:
- SJ: `SJ-YYYYMMDD-XXX`
- Customer: `CUST-XXX`
- Material: `MAT-XXX`

## Sample Data (from seed)

```
Users:
- admin@fleetops.com (ADMIN)
- operator@fleetops.com (OPERATOR)

Customers: 3
Materials: 5
Vehicles: 3
Drivers: 3
Sample SJ: SJ-20260428-001
```

## Testing

```bash
# Health check
curl http://localhost:3001/health

# List customers
curl http://localhost:3001/api/customers

# Create customer
curl -X POST http://localhost:3001/api/customers \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Corp","address":"Jakarta"}'
```

## Next Steps

1. **Frontend integration** - Replace FleetOpsContext with API calls
2. **Authentication** - Add JWT middleware
3. **File upload** - POD signature/photos
4. **Cron job** - Daily expiry check
5. **Deployment** - Docker, environment configs

## Troubleshooting

### Prisma error "Can't reach database"
- Check SQLite file exists di `prisma/dev.db`
- Verify DATABASE_URL di .env
- Re-generate: `npx prisma generate && npx prisma db push`

### CORS error
- Pastikan CORS_ORIGIN sesuai dengan frontend URL
- Frontend running di port 5173 (Vite default)

### Port already in use
```bash
# Find process on port 3001
netstat -ano | findstr :3001
# Kill by PID
taskkill /PID <PID> /F
```
