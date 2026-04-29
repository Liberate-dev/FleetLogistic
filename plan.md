# Fleet Ops — Master Plan Sistem DMS Logistik

> Dokumen ini merangkum seluruh fitur, dokumen, dan alur kerja sistem Fleet Ops setelah revisi. Dibagi per modul fungsional.

---

## Daftar Isi

1. [Gambaran Umum Sistem](#1-gambaran-umum-sistem)
2. [Taksonomi Dokumen](#2-taksonomi-dokumen)
3. [Modul & Fitur Lengkap](#3-modul--fitur-lengkap)
4. [Alur Kerja Utama (End-to-End)](#4-alur-kerja-utama-end-to-end)
5. [Status & Transisi Dokumen](#5-status--transisi-dokumen)
6. [Matriks Dokumen Masuk & Keluar](#6-matriks-dokumen-masuk--keluar)

---

## 1. Gambaran Umum Sistem

**Fleet Ops** adalah sistem manajemen logistik berbasis DMS (Document Management System) yang mengelola siklus hidup pengiriman barang (dalam konteks ini: kapur) dari awal order hingga selesai, termasuk manajemen armada, personel, dan keuangan operasional.

### Prinsip DMS yang Diterapkan

| Prinsip | Penerapan di Fleet Ops |
|---|---|
| Document sequencing | Setiap dokumen punya nomor urut otomatis sebelum diisi |
| Audit trail | Semua perubahan status tercatat dengan timestamp & user |
| Photo evidence | Checklist kendaraan wajib disertai foto per item |
| Multi-copy control | Setiap dokumen punya peran berbeda per penerima rangkap |
| Expiry tracking | Dokumen dengan masa berlaku (STNK, KIR, SIM) di-monitor otomatis |

---

## 2. Taksonomi Dokumen

Dokumen dalam sistem ini dibagi berdasarkan cara masuknya ke sistem:

### A. Generated (Dibuat Otomatis oleh Sistem)
Tidak ada intervensi user, sistem yang menciptakan.

| Dokumen | Kapan Dibuat | Tujuan |
|---|---|---|
| Nomor Surat Jalan | Saat user klik "Buat SJ Baru" | Identifikasi unik & audit |
| Nomor Checklist | Saat form checklist dibuka | Tracking per sesi inspeksi |
| Audit log entry | Setiap perubahan status | Jejak aktivitas user |
| Timestamp dispatch | Saat status berubah ke Dispatched | Pencatatan waktu keberangkatan |
| Notifikasi expiry | H-30 dan H-7 sebelum kadaluarsa | Reminder STNK/KIR/SIM |

### B. Structured Input (Form Isian oleh User)
User mengisi data, sistem menyimpan sebagai dokumen terstruktur.

| Dokumen | Siapa yang Mengisi | Kapan |
|---|---|---|
| Surat Jalan (manifest) | Dispatcher | Saat ada order masuk |
| Form Cash Advance | Dispatcher / Admin | Sebelum keberangkatan |
| Form Serah Terima (POD) | Supir | Di lokasi tujuan |
| LPJ Keuangan Supir | Supir / Admin | Setelah kembali |
| Data Klien / Material | Admin | Saat onboarding |
| Data Armada | Fleet Manager | Saat registrasi truk |

### C. Photo Evidence (Foto Bukti Fisik)
Foto yang diambil langsung dari kamera, terikat ke dokumen tertentu.

| Foto | Terikat ke Dokumen | Siapa yang Ambil | Kapan |
|---|---|---|---|
| Kondisi tiap item truk (per checklist) | Pre-departure checklist | Supir | Sebelum berangkat |
| Kondisi truk setelah kembali | Post-arrival checklist | Supir | Setelah tiba di pool |
| Muatan saat dimuat | Surat Jalan | Supir / Loader | Sebelum pintu ditutup |
| Odometer berangkat | Pre-departure checklist | Supir | Sebelum berangkat |
| Odometer kembali | Post-arrival checklist | Supir | Setelah tiba |
| Surat serah terima yang sudah TTD | Form POD | Supir | Di lokasi tujuan |
| Kondisi barang saat diturunkan | Form POD | Supir | Di lokasi tujuan |
| Struk BBM, tol, parkir | LPJ Keuangan | Supir | Selama perjalanan |

### D. Uploaded File (Upload Dokumen Eksternal)
File dari luar sistem (scan fisik atau file digital dari pihak ketiga).

| Dokumen | Siapa yang Upload | Masa Berlaku | Reminder |
|---|---|---|---|
| STNK kendaraan | Fleet Manager | Per tahun | Ya |
| KIR (Kartu Izin Hasil Uji) | Fleet Manager | Per 6 bulan | Ya |
| SIM supir | Admin | Per 5 tahun | Ya |
| Asuransi kendaraan | Fleet Manager | Per tahun | Ya |
| Kontrak klien | Admin | Sesuai kontrak | Opsional |
| Invoice dari vendor BBM | Admin | - | Tidak |

---

## 3. Modul & Fitur Lengkap

### 3.1 Modul: Surat Jalan (Manifest)

**Status modul:** Existing → Direvisi

#### Fitur yang sudah ada:
- Buat SJ baru (isi detail barang, klien, tujuan, berat/volume)
- Daftar SJ dengan status (Draft, Unassigned, Dispatched)
- Kalkulator kapasitas otomatis (berat vs kapasitas truk)

#### Fitur baru / revisi:

**F-SJ-01 — Auto-generate nomor surat**
- Nomor di-generate SEBELUM form diisi, bukan setelah disimpan
- Format: `SJ/[KODE-CABANG]/[YYYY]/[MM]/[NNNN]`
  - Contoh: `SJ/MLG/2025/04/0047`
- Nomor di-reserve saat sesi dibuka; jika dibatalkan, nomor tetap tercatat sebagai "void" di audit log
- Penomoran urut tidak bisa mundur atau dimanipulasi

**F-SJ-02 — Form Cash Advance di dalam SJ**
- Sebelum SJ bisa di-dispatch, harus ada persetujuan dana operasional
- Field yang perlu ada:
  - Uang jalan supir (nominal, nama penerima, tanda tangan/paraf digital)
  - Dana cadangan perbaikan (nominal, disimpan terpisah, hanya bisa diklaim jika ada foto bukti kerusakan)
- Setelah pengiriman selesai, supir wajib submit LPJ dengan nominal yang dipakai + sisa

**F-SJ-03 — Upload foto muatan**
- Slot foto wajib sebelum SJ bisa berubah status ke Dispatched
- Minimal 1 foto tampak dalam bak truk setelah dimuat
- Foto tersimpan dengan metadata: timestamp, GPS koordinat, ID truk, nomor SJ

---

### 3.2 Modul: Vehicle Inspection Checklist

**Status modul:** BARU

Ini adalah modul baru yang sepenuhnya terpisah dari SJ, tapi terhubung ke setiap sesi pengiriman.

#### F-VIC-01 — Pre-Departure Checklist

Wajib diselesaikan oleh supir sebelum SJ bisa berubah ke status Dispatched.

Kategori item checklist dan foto yang diwajibkan:

**Kategori 1: Dokumen Kendaraan**
| Item | Jenis Input | Foto Wajib? |
|---|---|---|
| STNK masih berlaku | Centang + tanggal berlaku | Ya (foto STNK) |
| KIR masih berlaku | Centang + tanggal berlaku | Ya (foto KIR) |
| SIM supir sesuai kelas | Centang | Ya (foto SIM) |
| Surat Jalan tersedia di kabin | Centang | Tidak |

**Kategori 2: Kondisi Eksterior**
| Item | Jenis Input | Foto Wajib? |
|---|---|---|
| Kondisi ban depan kiri | Pilihan (Baik/Perlu Perhatian/Tidak Layak) | Ya |
| Kondisi ban depan kanan | Pilihan | Ya |
| Kondisi ban belakang (semua) | Pilihan | Ya (1 foto mewakili) |
| Kondisi body truk (penyok/retak) | Pilihan + catatan | Ya (tampak samping kiri & kanan) |
| Kondisi lampu depan | Pilihan | Ya |
| Kondisi lampu belakang & rem | Pilihan | Ya |
| Kondisi kaca spion | Pilihan | Tidak |
| Kondisi kaca depan (retak?) | Pilihan | Jika ada temuan |

**Kategori 3: Kondisi Mesin & Cairan**
| Item | Jenis Input | Foto Wajib? |
|---|---|---|
| Level oli mesin | Pilihan (Cukup/Kurang/Perlu Ganti) | Tidak |
| Level air radiator | Pilihan | Tidak |
| Level minyak rem | Pilihan | Tidak |
| Kebocoran oli/cairan di bawah truk | Pilihan (Ada/Tidak Ada) | Ya jika ada |
| Kondisi fan belt (retak?) | Pilihan | Tidak |
| Kondisi aki (terminal korosi?) | Pilihan | Tidak |

**Kategori 4: Keselamatan & Perlengkapan**
| Item | Jenis Input | Foto Wajib? |
|---|---|---|
| APAR (alat pemadam api ringan) tersedia | Centang | Tidak |
| Segitiga pengaman tersedia | Centang | Tidak |
| Dongkrak & ban cadangan ada | Centang | Tidak |
| Rem tangan berfungsi | Centang (uji langsung) | Tidak |
| Klakson berfungsi | Centang | Tidak |
| Wiper berfungsi | Centang | Tidak |

**Kategori 5: Kondisi Bak / Muatan**
| Item | Jenis Input | Foto Wajib? |
|---|---|---|
| Kondisi bak (retak/bocor) | Pilihan + catatan | Ya (foto bak kosong) |
| Terpal/penutup tersedia & kondisi baik | Pilihan | Ya |
| Odometer (catat angka) | Input angka | Ya (foto odometer) |

**Aturan sistem:**
- Jika ada item yang dinilai "Tidak Layak" → sistem otomatis blokir dispatch dan notifikasi Fleet Manager
- Jika ada item "Perlu Perhatian" → bisa tetap berangkat tapi Fleet Manager harus approve secara eksplisit
- Checklist yang selesai menghasilkan nomor dokumen tersendiri, terhubung ke nomor SJ

#### F-VIC-02 — Post-Arrival Checklist

Wajib diselesaikan oleh supir setelah tiba kembali di pool. SJ baru bisa berubah ke status Completed jika ini selesai.

Kategori item (mirip pre-departure, dengan tambahan):

**Kategori 1–4:** Sama dengan pre-departure (untuk membandingkan kondisi sebelum vs sesudah)

**Kategori 5: Kondisi Setelah Perjalanan (Tambahan)**
| Item | Jenis Input | Foto Wajib? |
|---|---|---|
| Odometer setelah kembali | Input angka | Ya (foto odometer) |
| Kerusakan baru selama perjalanan | Pilihan (Ada/Tidak Ada) + catatan | Ya jika ada |
| Ban atau komponen diganti di jalan? | Pilihan + detail | Ya jika ada |
| Bak bersih setelah bongkar muat | Centang | Ya (foto bak kosong) |
| Kondisi bak setelah pengiriman | Pilihan | Ya |

**Output otomatis dari post-arrival checklist:**
- Jika ada kerusakan baru terdeteksi → otomatis buat tiket Maintenance di modul Fleet
- Jarak tempuh aktual dihitung dari selisih odometer → masuk ke laporan

---

### 3.3 Modul: Dispatch Planning

**Status modul:** Existing → Direvisi

#### Fitur yang sudah ada:
- Pilih SJ berstatus Unassigned
- Assign truk & supir
- Ubah status ke Dispatched

#### Fitur revisi:

**F-DP-01 — Gate check sebelum dispatch**

Sebelum tombol "Konfirmasi Dispatch" aktif, sistem harus memverifikasi bahwa semua ini sudah selesai:

```
[ ] Pre-departure checklist selesai & tidak ada item Tidak Layak
[ ] Foto muatan sudah diupload di SJ
[ ] Cash advance sudah disetujui
[ ] Supir punya SIM yang masih berlaku
[ ] Truk tidak sedang dalam status Maintenance
```

Jika salah satu belum, tombol dispatch tetap disable dengan keterangan yang jelas.

**F-DP-02 — Estimasi kebutuhan dana operasional**
- Sistem bisa menghitung estimasi biaya tol & BBM berdasarkan rute (jika ada data historis)
- Menjadi acuan nominal cash advance

---

### 3.4 Modul: Proof of Delivery (Surat Serah Terima)

**Status modul:** BARU

Ini adalah dokumen yang dibuat di lokasi tujuan, membuktikan barang sudah diturunkan dan diterima.

#### F-POD-01 — Form serah terima digital

Field yang harus ada:
- Nomor referensi SJ terkait (auto-filled)
- Tanggal & jam bongkar muat
- Nama penerima di lokasi tujuan
- Jabatan/identitas penerima
- Jumlah aktual yang diturunkan (bisa berbeda dari manifest jika ada susut)
- Catatan kondisi barang (Baik / Ada Kerusakan / Ada Kekurangan Jumlah)
- Catatan bebas jika ada ketidaksesuaian
- Tanda tangan penerima (capture di layar atau foto tanda tangan fisik)

#### F-POD-02 — Foto bukti wajib di POD

| Foto | Keterangan |
|---|---|
| Foto barang setelah diturunkan | Minimal 1 foto tampak keseluruhan |
| Foto surat serah terima yang sudah TTD | Bukti penerimaan fisik |
| Foto kondisi barang jika ada kerusakan | Wajib jika ada catatan kerusakan |

**Aturan sistem:**
- POD hanya bisa dibuat jika SJ berstatus Dispatched
- Setelah POD disimpan, status SJ berubah ke "Delivered" (belum Completed sampai post-arrival checklist selesai)
- Jika ada ketidaksesuaian jumlah/kondisi barang, sistem otomatis flagging ke Dispatcher & manajemen

---

### 3.5 Modul: LPJ Keuangan (Laporan Pertanggungjawaban)

**Status modul:** BARU

#### F-LPJ-01 — Form LPJ supir

Wajib disubmit setelah kembali, sebelum post-arrival checklist bisa dianggap final.

Field yang harus ada:
- Nomor SJ referensi (auto-filled)
- Dana yang diterima:
  - Uang jalan supir (nominal awal)
  - Dana cadangan perbaikan (nominal awal)
- Rincian pengeluaran aktual:
  - BBM (nominal + foto struk)
  - Tol (nominal + foto struk)
  - Parkir (nominal + foto struk)
  - Perbaikan darurat (nominal + foto struk + deskripsi)
  - Lain-lain (nominal + keterangan + foto)
- Total pengeluaran (auto-hitung)
- Sisa uang yang dikembalikan

**Aturan sistem:**
- Semua pengeluaran yang diklaim harus ada foto bukti (struk/nota)
- Jika ada klaim perbaikan dari dana cadangan, harus ada foto kerusakan + foto struk bengkel
- Admin/Finance bisa approve atau reject tiap item
- SJ baru bisa berubah ke status Completed setelah LPJ di-approve

---

### 3.6 Modul: Fleet Management

**Status modul:** Existing → Direvisi

#### Fitur yang sudah ada:
- Database kendaraan & spesifikasi
- Status kendaraan (Ready/In Use/Maintenance)

#### Fitur revisi:

**F-FL-01 — Manajemen dokumen kendaraan**

Setiap truk di database harus punya:

| Dokumen | Masa Berlaku | Reminder |
|---|---|---|
| STNK | Tahunan | H-30, H-7 |
| KIR | 6 bulanan | H-30, H-7 |
| Asuransi kendaraan | Tahunan | H-30, H-7 |

Jika dokumen kadaluarsa → truk otomatis tidak bisa dipilih di dispatch meski statusnya Ready.

**F-FL-02 — Maintenance log dari checklist**
- Setiap temuan di post-arrival checklist yang ditandai "kerusakan baru" otomatis membuat tiket maintenance
- Tiket berisi: deskripsi, foto bukti, estimasi perbaikan (diisi mekanik), tanggal selesai
- Truk berstatus Maintenance tidak bisa masuk ke pilihan dispatch

**F-FL-03 — Riwayat checklist per kendaraan**
- Setiap truk punya timeline riwayat kondisi dari semua pre dan post-checklist
- Memudahkan Fleet Manager melihat tren kerusakan

---

### 3.7 Modul: User & Driver Management

**Status modul:** Existing → Direvisi

**F-UM-01 — Manajemen dokumen supir**

Setiap supir di database harus punya:

| Dokumen | Masa Berlaku | Reminder |
|---|---|---|
| SIM (sesuai kelas truk) | 5 tahunan | H-30, H-7 |
| Sertifikat K3 (jika ada) | Sesuai | H-30 |

Jika dokumen supir kadaluarsa → supir tidak bisa dipilih di dispatch.

---

### 3.8 Modul: Reports & Archive

**Status modul:** Existing → Diperluas

**F-RP-01 — Laporan operasional baru**

Tambahan laporan yang relevan dengan fitur baru:

| Laporan | Isi | Frekuensi |
|---|---|---|
| Rekapitulasi cash advance | Total dana keluar vs kembali per periode | Bulanan |
| Laporan jarak tempuh aktual | Dari selisih odometer per SJ | Per trip / bulanan |
| Rekapitulasi temuan checklist | Frekuensi kerusakan per komponen per truk | Bulanan |
| Laporan POD dengan ketidaksesuaian | SJ yang ada selisih jumlah/kerusakan barang | On-demand |
| Utilitas armada (sudah ada) | Frekuensi penggunaan truk | Bulanan |

**F-RP-02 — Dokumen yang bisa di-export**

Setiap SJ yang sudah Completed bisa di-export sebagai paket dokumen lengkap:
- PDF Surat Jalan (bernomor resmi)
- PDF Checklist Pre-departure (dengan foto)
- PDF Checklist Post-arrival (dengan foto)
- PDF Surat Serah Terima / POD (dengan foto & TTD)
- PDF LPJ Keuangan (dengan foto struk)

---

## 4. Alur Kerja Utama (End-to-End)

```
┌─────────────────────────────────────────────────────────────────┐
│  FASE 1: PERSIAPAN ORDER                                        │
│                                                                 │
│  1.1  Admin/Dispatcher membuka modul Surat Jalan               │
│  1.2  Klik "Buat SJ Baru"                                      │
│  1.3  [SISTEM] Auto-generate nomor SJ → SJ/MLG/2025/04/0047   │
│  1.4  Isi form: klien, tujuan, jenis barang, berat, volume     │
│  1.5  Simpan → status SJ: DRAFT                                │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│  FASE 2: ALOKASI SUMBER DAYA (DISPATCH PLANNING)               │
│                                                                 │
│  2.1  Dispatcher buka modul Dispatch Planning                  │
│  2.2  Pilih SJ berstatus Draft/Unassigned                      │
│  2.3  Pilih truk (hanya truk Ready + dokumen valid tampil)     │
│  2.4  Pilih supir (hanya supir dengan SIM valid tampil)        │
│  2.5  Tentukan cash advance:                                   │
│       - Uang jalan supir: Rp ______                            │
│       - Dana cadangan perbaikan: Rp ______                     │
│  2.6  Simpan → status SJ: UNASSIGNED → ASSIGNED               │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│  FASE 3: PRE-DEPARTURE (dilakukan di pool/gudang)              │
│                                                                 │
│  3.1  Supir buka form Pre-Departure Checklist (terhubung ke SJ)│
│  3.2  [SISTEM] Auto-generate nomor checklist                   │
│  3.3  Supir isi checklist per kategori + foto per item wajib   │
│  3.4  Jika ada item Tidak Layak → sistem blokir, notif FM      │
│  3.5  Jika semua OK / ada Perlu Perhatian dengan approval FM:  │
│       → Checklist selesai, status: PRE-DEPARTURE DONE          │
│  3.6  Upload foto muatan (tampak dalam bak)                    │
│  3.7  Catat odometer awal + foto                               │
│  3.8  Semua gate check terpenuhi → tombol "Konfirmasi Dispatch"│
│       aktif                                                    │
│  3.9  Dispatcher konfirmasi → status SJ: DISPATCHED           │
│  3.10 [SISTEM] Catat timestamp keberangkatan                  │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│  FASE 4: PENGIRIMAN                                             │
│                                                                 │
│  4.1  Truk berangkat, terpantau di Monitoring dashboard        │
│  4.2  Supir bisa update status manual jika perlu              │
│  4.3  Jika ada kejadian darurat (kerusakan):                  │
│       - Supir foto kerusakan                                   │
│       - Klaim dana cadangan dengan upload foto + deskripsi    │
│       - Dispatcher/Admin approve dari dashboard               │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│  FASE 5: SERAH TERIMA DI LOKASI TUJUAN                         │
│                                                                 │
│  5.1  Truk tiba di lokasi tujuan                               │
│  5.2  Barang diturunkan                                        │
│  5.3  Supir buka form POD (Surat Serah Terima)                 │
│  5.4  Isi: nama penerima, jumlah aktual, kondisi barang       │
│  5.5  Ambil foto barang yang sudah diturunkan                 │
│  5.6  Ambil foto surat serah terima fisik yang sudah TTD      │
│  5.7  Jika ada ketidaksesuaian → isi catatan, foto bukti      │
│  5.8  Simpan POD → status SJ: DELIVERED                       │
│  5.9  [SISTEM] Notifikasi ke Dispatcher bahwa barang terkirim │
│  5.10 Jika ada ketidaksesuaian → [SISTEM] flagging ke mgmt    │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│  FASE 6: POST-ARRIVAL (setelah kembali ke pool)                 │
│                                                                 │
│  6.1  Truk tiba kembali di pool                                │
│  6.2  Supir buka form Post-Arrival Checklist                   │
│  6.3  Isi checklist kondisi truk setelah perjalanan           │
│  6.4  Catat odometer akhir + foto (jarak tempuh dihitung)     │
│  6.5  Foto bak truk setelah bongkar (bersih/kondisi)          │
│  6.6  Jika ada kerusakan baru → [SISTEM] buat tiket maintenance│
│  6.7  Checklist selesai → status: POST-ARRIVAL DONE           │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│  FASE 7: LAPORAN KEUANGAN (LPJ)                                 │
│                                                                 │
│  7.1  Supir/Admin buka form LPJ terhubung ke nomor SJ         │
│  7.2  Isi rincian pengeluaran selama perjalanan:              │
│       - BBM, tol, parkir, perbaikan darurat, lain-lain        │
│  7.3  Upload foto struk/nota untuk setiap pengeluaran         │
│  7.4  Hitung sisa uang yang dikembalikan                      │
│  7.5  Submit LPJ → menunggu review Admin/Finance              │
│  7.6  Admin review + approve/reject per item                  │
│  7.7  Setelah approve → status SJ: COMPLETED                  │
│  7.8  [SISTEM] Update status truk kembali ke READY            │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│  FASE 8: FINALISASI & ARSIP                                     │
│                                                                 │
│  8.1  Semua dokumen terhimpun dalam satu bundle per SJ:       │
│       - SJ (manifest)                                          │
│       - Pre-departure checklist + foto                        │
│       - Foto muatan                                            │
│       - POD / Surat serah terima + foto                       │
│       - Post-arrival checklist + foto                         │
│       - LPJ keuangan + foto struk                             │
│  8.2  Bundle bisa di-export ke PDF                            │
│  8.3  Data masuk ke modul Reports                             │
│  8.4  Audit log lengkap tersimpan                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Status & Transisi Dokumen

### Status Surat Jalan

```
DRAFT → ASSIGNED → DISPATCHED → DELIVERED → COMPLETED
                                           ↑
                              (requires: POD + Post-checklist + LPJ approve)
```

| Status | Artinya | Siapa yang Bisa Ubah |
|---|---|---|
| DRAFT | SJ dibuat, belum ada truk/supir | Dispatcher |
| ASSIGNED | Truk & supir sudah dipilih, cash advance disetujui | Dispatcher |
| DISPATCHED | Gate check selesai, truk berangkat | Sistem (setelah semua gate check ✓) |
| DELIVERED | POD sudah disubmit dari lokasi tujuan | Supir (via form POD) |
| COMPLETED | LPJ diapprove, post-checklist selesai | Admin/Finance |
| VOID | SJ dibatalkan sebelum dispatch | Dispatcher + approval |

### Status Kendaraan

```
READY → IN USE → READY
   ↓                ↑
MAINTENANCE → (selesai) → READY
```

| Status | Kondisi |
|---|---|
| READY | Dokumen valid, tidak ada jadwal aktif, tidak ada tiket maintenance terbuka |
| IN USE | Sedang dalam perjalanan (SJ berstatus Dispatched) |
| MAINTENANCE | Ada tiket maintenance terbuka, tidak bisa di-dispatch |
| EXPIRED DOCS | Dokumen (STNK/KIR) kadaluarsa — muncul sebagai warning, tidak bisa di-dispatch |

---

## 6. Matriks Dokumen Masuk & Keluar

### Dokumen Masuk (Input ke Sistem)

| Dokumen | Tipe Input | Dibuat oleh | Fase |
|---|---|---|---|
| Nomor SJ | Generated | Sistem | Fase 1 |
| Form Surat Jalan | Structured input | Dispatcher | Fase 1 |
| Form Cash Advance | Structured input | Dispatcher | Fase 2 |
| Nomor Checklist | Generated | Sistem | Fase 3 |
| Pre-departure checklist + foto | Photo evidence + structured | Supir | Fase 3 |
| Foto muatan | Photo evidence | Supir/Loader | Fase 3 |
| Form POD | Structured input | Supir | Fase 5 |
| Foto serah terima + barang | Photo evidence | Supir | Fase 5 |
| Post-arrival checklist + foto | Photo evidence + structured | Supir | Fase 6 |
| Form LPJ + foto struk | Photo evidence + structured | Supir/Admin | Fase 7 |
| STNK, KIR, SIM, Asuransi | Upload file | Fleet Manager/Admin | Master data |
| Kontrak klien | Upload file | Admin | Master data |

### Dokumen Keluar (Output dari Sistem)

| Dokumen | Format | Diterima oleh | Kapan |
|---|---|---|---|
| PDF Surat Jalan bernomor | PDF export | Supir (dibawa), Klien, Arsip | Sebelum dispatch |
| PDF Surat Serah Terima | PDF export | Penerima di lokasi, Arsip | Setelah POD disimpan |
| PDF Checklist (pre+post) | PDF export | Fleet Manager, Arsip | Setelah selesai |
| PDF LPJ Keuangan | PDF export | Finance, Arsip | Setelah approve |
| Bundle dokumen lengkap | PDF gabungan | Arsip, Manajemen | Setelah SJ Completed |
| Notifikasi expiry dokumen | Notifikasi in-app | Fleet Manager/Admin | H-30, H-7 |
| Tiket maintenance | Sistem internal | Fleet Manager, Mekanik | Otomatis dari checklist |
| Laporan bulanan | PDF/Excel export | Manajemen | Akhir bulan |
| Audit log | Tampilan di sistem | Admin, Super Admin | On-demand |

---

*Dokumen ini adalah living document — akan diupdate seiring perkembangan desain sistem.*
