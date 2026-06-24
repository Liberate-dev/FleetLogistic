# Fleet Ops — Sistem Manajemen Dokumen Logistik

**Fleet Ops** (juga dikenal sebagai Stitch Logistics) adalah aplikasi Document Management System (DMS) untuk operasional logistik. Sistem ini mengelola siklus penuh dokumen pengiriman mulai dari pembuatan Surat Jalan (SJ), perencanaan dispatch, pemeriksaan gate (kendaraan & driver), Proof of Delivery (POD), hingga Laporan Pertanggungjawaban (LPJ) keuangan.

Aplikasi ini dirancang khusus untuk kebutuhan logistik Indonesia dengan dukungan **offline-first** yang kuat.

## ✨ Fitur Utama

- **Manajemen Surat Jalan (SJ)** lengkap dengan auto-numbering (format: SJ/MLG/YYYY/MM/NNNN)
- **Perencanaan Dispatch** — assign kendaraan & driver
- **Gate Check** otomatis (validasi STNK, KIR, SIM + status aktif)
- **Checklist Kendaraan & Driver** (pre & post departure)
- **Proof of Delivery (POD)** dengan tanda tangan digital + foto bukti
- **LPJ Keuangan** (odometer, BBM, pengeluaran)
- **Upload & Penyimpanan Bukti** (foto muatan, kerusakan, dll) — disimpan di IndexedDB
- **Audit Log** lengkap untuk semua aktivitas
- **Export PDF** profesional (laporan eksekutif, SJ, dll)
- **Notifikasi WhatsApp** via Fonnte (opsional)
- **Mode Offline/Static** — aplikasi tetap berfungsi penuh tanpa backend (data tersimpan di browser)
- **UI Modern** — Material 3 inspired, dark mode, responsive (desktop + mobile)

## 🖥️ Teknologi

- **Frontend**: React 19 + Vite, React Router v7, Tailwind CSS (Material 3 tokens), jsPDF + html2canvas
- **State & Persistence**: Context + useReducer + localStorage + IndexedDB (untuk foto/lampiran berkapasitas besar)
- **Backend (opsional)**: Node.js + Express + Prisma + SQLite
- **Dokumen**: Full support offline dengan auto document numbering

Lihat [Dokumentasi Teknis lengkap](./TECHNICAL_DOCUMENTATION.md) untuk detail struktur database, alur program, dan arsitektur.

## 🚀 Cara Menjalankan (Local)

### Frontend Only (Paling Mudah — Direkomendasikan untuk Testing)

```bash
npm install
npm run dev
```

Buka http://localhost:5173

> **Catatan**: Semua data akan tersimpan di browser kamu (localStorage + IndexedDB). Data hilang jika clear site data atau ganti device.

### Dengan Backend (untuk data persisten & multi-user)

1. Jalankan frontend seperti di atas.
2. Buka terminal baru dan masuk ke folder backend:

```bash
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma db push
npm run db:seed          # Membuat data demo
npm run dev
```

Backend berjalan di `http://localhost:3001`.

Akun demo setelah seed:
- admin@fleetops.com
- operator@fleetops.com

Vite secara otomatis mem-proxy `/api` ke backend saat development.

### Build untuk Production (Static)

```bash
npm run build
```

Hasil ada di folder `dist/`. Bisa langsung di-deploy sebagai static site.

## 📖 Panduan Penggunaan Sistem

### Alur Utama (SJ Lifecycle)

1. **Buat Surat Jalan** (`/sj/new`)
   - Isi data pengiriman, muatan, uang jalan, dan upload foto.
   - Nomor SJ otomatis digenerate.

2. **Assign Dispatch** (`/dispatch`)
   - Pilih SJ → assign kendaraan & driver.

3. **Gate Check** (saat akan dispatch)
   - Sistem akan memvalidasi dokumen kendaraan (STNK/KIR) dan driver (SIM).
   - Hanya bisa lanjut jika lolos.

4. **Checklist Kendaraan** (`/checklist/new`)
   - Checklist pre-departure (ban, lampu, rem, dll) + foto.

5. **Kirim & Update Status**
   - Update status SJ menjadi DISPATCHED → DELIVERED → COMPLETED.

6. **Proof of Delivery (POD)**
   - Di halaman POD: tanda tangan penerima + foto barang.

7. **LPJ Keuangan**
   - Catat odometer awal/akhir, BBM, dan pengeluaran.
   - Generate laporan.

### Fitur Pendukung

- **Master Data**: Kelola Fleet, Driver, Customer, Material di menu Master Data.
- **Archive**: Lihat semua SJ yang sudah COMPLETED atau CANCELLED.
- **Reports & Audit Log**: Laporan dan jejak aktivitas.
- **Settings**: Atur format nomor dokumen + reset data lokal.
- **Reset Data**: Di halaman Settings → tab "Local Data (Prototype)" ada tombol reset semua data (berguna saat testing).

**Tips Offline**:
- Semua data (termasuk foto yang sudah di-compress) tetap ada setelah refresh.
- Kapasitas foto jauh lebih besar karena menggunakan IndexedDB.
- Gunakan tombol **Reset Semua Data Lokal** jika storage penuh.

## 🏗️ Deployment

### Frontend (Static) — Paling Umum

- Build dengan `npm run build`
- Upload isi folder `dist/` ke hosting static (cPanel File Manager, GitHub Pages, Vercel, Netlify, dll).
- Pastikan ada `.htaccess` untuk SPA fallback (sudah disediakan di contoh).

### Backend (jika butuh database permanen)

Deploy backend ke platform yang support Node.js:
- Render.com (gratis tier)
- Railway.app
- VPS + PM2

Ganti Prisma ke PostgreSQL untuk production.

Lihat file `TECHNICAL_DOCUMENTATION.md` (section Instalasi & Hosting) untuk panduan detail.

## 📁 Struktur Project

```
.
├── src/                    # React frontend
│   ├── pages/              # Semua halaman utama (SJ, Dispatch, POD, LPJ, dll)
│   ├── context/            # FleetOpsContext (state global + persistence)
│   ├── components/         # Layout, Sidebar, UI components
│   └── utils/              # documentNumbering, storageService (IndexedDB), auditLogger
├── backend/                # Node.js + Prisma (opsional)
│   ├── src/
│   │   ├── routes/
│   │   └── services/       # Gate check, status workflow, dll
│   └── prisma/schema.prisma
├── public/                 # Static assets + /docs/ (technical doc)
├── TECHNICAL_DOCUMENTATION.md
└── dist/                   # Hasil build (jangan commit)
```

## 🔗 Dokumentasi

- **[Dokumentasi Teknis Lengkap](./TECHNICAL_DOCUMENTATION.md)** — Teknologi, struktur DB, alur program, cara install & hosting
- Halaman **Dokumentasi Teknis** di dalam aplikasi (`/technical-docs`) — bisa diakses langsung dari sidebar + support download PDF dengan cover.

## ⚠️ Catatan Penting

- Saat ini aplikasi berjalan **penuh di browser** (prototype/offline mode). Data hanya ada di perangkat kamu.
- Untuk penggunaan multi-user atau data yang tersimpan di server, diperlukan backend + database production.
- Foto dan lampiran disimpan sebagai data URL (base64) — pastikan tidak terlalu banyak agar tidak melebihi kuota browser.

---

**Fleet Ops** — Dibuat untuk mempermudah operasional logistik dengan dokumen yang rapi, terlacak, dan compliance.

Jika ada pertanyaan atau ingin berkontribusi, silakan buka issue di repo ini.