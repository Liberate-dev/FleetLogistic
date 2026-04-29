// Application Constants

// Document Status Constants
export const SJ_STATUS = {
  DRAFT: 'DRAFT',
  ASSIGNED: 'ASSIGNED',
  DISPATCHED: 'DISPATCHED',
  DELIVERED: 'DELIVERED',
  COMPLETED: 'COMPLETED',
  VOID: 'VOID',
};

export const VEHICLE_STATUS = {
  ACTIVE: 'ACTIVE',  // Maps to READY/IN_USE states
  IN_USE: 'IN USE',
  MAINTENANCE: 'MAINTENANCE',
  INACTIVE: 'INACTIVE',
};

export const CHECKLIST_STATUS = {
  PENDING: 'PENDING',
  'PRE-DEPARTURE DONE': 'PRE-DEPARTURE DONE',
  'POST-ARRIVAL DONE': 'POST-ARRIVAL DONE',
};

export const LPJ_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
};

export const CHECKLIST_ITEM_STATUS = {
  BAIK: 'BAIK',
  PERLU_PERHATIAN: 'PERLU PERHATIAN',
  TIDAK_LAYAK: 'TIDAK LAYAK',
};

// Document Types
export const DOCUMENT_TYPES = {
  SJ: 'SJ',
  CHECKLIST: 'CHECKLIST',
  POD: 'POD',
  LPJ: 'LPJ',
  STNK: 'STNK',
  KIR: 'KIR',
  SIM: 'SIM',
  INSURANCE: 'INSURANCE',
};

// Vehicle Inspection Checklist Categories (F-VIC-01 & F-VIC-02)
export const PRE_DEPARTURE_CATEGORIES = [
  {
    id: 'documents',
    name: 'Dokumen Kendaraan',
    icon: 'description',
    items: [
      { id: 'stnk', label: 'STNK masih berlaku', type: 'checkbox', photoRequired: true, checkboxLabel: 'STNK valid' },
      { id: 'kir', label: 'KIR masih berlaku', type: 'checkbox', photoRequired: true, checkboxLabel: 'KIR valid' },
      { id: 'sim', label: 'SIM supir sesuai kelas', type: 'checkbox', photoRequired: true, checkboxLabel: 'SIM valid' },
      { id: 'sj_kabin', label: 'Surat Jalan tersedia di kabin', type: 'checkbox', photoRequired: false, checkboxLabel: 'SJ tersedia' },
    ],
  },
  {
    id: 'exterior',
    name: 'Kondisi Eksterior',
    icon: 'directions_car',
    items: [
      { id: 'ban_depan_kiri', label: 'Kondisi ban depan kiri', type: 'choice', options: ['Baik', 'Perlu Perhatian', 'Tidak Layak'], photoRequired: true },
      { id: 'ban_depan_kanan', label: 'Kondisi ban depan kanan', type: 'choice', options: ['Baik', 'Perlu Perhatian', 'Tidak Layak'], photoRequired: true },
      { id: 'ban_belakang', label: 'Kondisi ban belakang (semua)', type: 'choice', options: ['Baik', 'Perlu Perhatian', 'Tidak Layak'], photoRequired: true, description: '1 foto mewakili' },
      { id: 'body', label: 'Kondisi body truk (penyok/retak)', type: 'choice', options: ['Baik', 'Perlu Perhatian', 'Tidak Layak'], photoRequired: true, description: 'Tampak samping kiri & kanan' },
      { id: 'lampu_depan', label: 'Kondisi lampu depan', type: 'choice', options: ['Baik', 'Perlu Perhatian', 'Tidak Layak'], photoRequired: true },
      { id: 'lampu_belakang', label: 'Kondisi lampu belakang & rem', type: 'choice', options: ['Baik', 'Perlu Perhatian', 'Tidak Layak'], photoRequired: true },
      { id: 'kaca_spion', label: 'Kondisi kaca spion', type: 'choice', options: ['Baik', 'Perlu Perhatian', 'Tidak Layak'], photoRequired: false },
      { id: 'kaca_depan', label: 'Kondisi kaca depan (retak?)', type: 'choice', options: ['Baik', 'Perlu Perhatian', 'Tidak Layak'], photoRequired: 'conditional', description: 'Foto jika ada temuan' },
    ],
  },
  {
    id: 'engine',
    name: 'Kondisi Mesin & Cairan',
    icon: 'build',
    items: [
      { id: 'oli', label: 'Level oli mesin', type: 'choice', options: ['Cukup', 'Kurang', 'Perlu Ganti'], photoRequired: false },
      { id: 'radiator', label: 'Level air radiator', type: 'choice', options: ['Cukup', 'Kurang', 'Perlu Ganti'], photoRequired: false },
      { id: 'minyak_rem', label: 'Level minyak rem', type: 'choice', options: ['Cukup', 'Kurang', 'Perlu Ganti'], photoRequired: false },
      { id: 'kebocoran', label: 'Kebocoran oli/cairan di bawah truk', type: 'choice', options: ['Ada', 'Tidak Ada'], photoRequired: 'conditional', description: 'Foto jika ada' },
      { id: 'fan_belt', label: 'Kondisi fan belt (retak?)', type: 'choice', options: ['Baik', 'Perlu Perhatian', 'Tidak Layak'], photoRequired: false },
      { id: 'aki', label: 'Kondisi aki (terminal korosi?)', type: 'choice', options: ['Baik', 'Perlu Perhatian', 'Tidak Layak'], photoRequired: false },
    ],
  },
  {
    id: 'safety',
    name: 'Keselamatan & Perlengkapan',
    icon: 'safety_check',
    items: [
      { id: 'apar', label: 'APAR (alat pemadam api ringan) tersedia', type: 'checkbox', photoRequired: false, checkboxLabel: 'APAR tersedia' },
      { id: 'segitiga', label: 'Segitiga pengaman tersedia', type: 'checkbox', photoRequired: false, checkboxLabel: 'Segitiga tersedia' },
      { id: 'dongkrak', label: 'Dongkrak & ban cadangan ada', type: 'checkbox', photoRequired: false, checkboxLabel: 'Dongkrak & ban cadangan ada' },
      { id: 'rem_tangan', label: 'Rem tangan berfungsi', type: 'checkbox', photoRequired: false, checkboxLabel: 'Rem tangan berfungsi' },
      { id: 'klakson', label: 'Klakson berfungsi', type: 'checkbox', photoRequired: false, checkboxLabel: 'Klakson berfungsi' },
      { id: 'wiper', label: 'Wiper berfungsi', type: 'checkbox', photoRequired: false, checkboxLabel: 'Wiper berfungsi' },
    ],
  },
  {
    id: 'bak',
    name: 'Kondisi Bak / Muatan',
    icon: 'inventory_2',
    items: [
      { id: 'bak_condition', label: 'Kondisi bak (retak/bocor)', type: 'choice', options: ['Baik', 'Perlu Perhatian', 'Tidak Layak'], photoRequired: true, description: 'Foto bak kosong' },
      { id: 'terpal', label: 'Terpal/penutup tersedia & kondisi baik', type: 'choice', options: ['Baik', 'Perlu Perhatian', 'Tidak Layak'], photoRequired: true },
      { id: 'odometer', label: 'Odometer (catat angka)', type: 'input', inputType: 'number', photoRequired: true, placeholder: 'Masukkan angka odometer', description: 'Foto odometer wajib' },
    ],
  },
];

export const POST_ARRIVAL_CATEGORIES = [
  ...PRE_DEPARTURE_CATEGORIES.slice(0, 4), // Categories 1-4 same
  {
    id: 'bak_post',
    name: 'Kondisi Setelah Perjalanan',
    icon: 'assignment_late',
    items: [
      ...PRE_DEPARTURE_CATEGORIES[4].items.slice(0, -1), // All except odometer
      { id: 'odometer_akhir', label: 'Odometer setelah kembali', type: 'input', inputType: 'number', photoRequired: true, placeholder: 'Masukkan angka odometer akhir', description: 'Foto odometer wajib' },
      { id: 'kerusakan_baru', label: 'Kerusakan baru selama perjalanan', type: 'choice', options: ['Ada', 'Tidak Ada'], photoRequired: 'conditional', description: 'Foto jika ada' },
      { id: 'ban_ganti', label: 'Ban atau komponen diganti di jalan?', type: 'choice', options: ['Ada', 'Tidak Ada'], photoRequired: 'conditional', description: 'Foto jika ada' },
      { id: 'bak_bersih', label: 'Bak bersih setelah bongkar muat', type: 'checkbox', photoRequired: true, checkboxLabel: 'Bak bersih', description: 'Foto bak kosong' },
      { id: 'bak_post_condition', label: 'Kondisi bak setelah pengiriman', type: 'choice', options: ['Baik', 'Perlu Perhatian', 'Tidak Layak'], photoRequired: true },
    ],
  },
];

// LPJ Expense Categories
export const DISPATCH_STATUS = {
  PLANNED: 'PLANNED',
  READY: 'READY',
  DISPATCHED: 'DISPATCHED',
  IN_TRANSIT: 'IN TRANSIT',
  DELIVERED: 'DELIVERED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};

export const LPJ_EXPENSE_CATEGORIES = [
  { id: 'bbm', label: 'BBM', icon: 'local_gas_station', requiresReceipt: true },
  { id: 'tol', label: 'Tol', icon: 'toll', requiresReceipt: true },
  { id: 'parkir', label: 'Parkir', icon: 'local_parking', requiresReceipt: true },
  { id: 'perbaikan', label: 'Perbaikan Darurat', icon: 'build', requiresReceipt: true, requiresDescription: true },
  { id: 'lainnya', label: 'Lain-lain', icon: 'more_horiz', requiresReceipt: true, requiresDescription: true },
];

// Branch Codes
export const BRANCH_CODES = {
  malang: 'MLG',
  jakarta: 'JKT',
  surabaya: 'SBY',
  cikarang: 'CKR',
};

// Photo Requirements
export const PHOTO_REQUIREMENTS = {
  SJ: {
    muatan: { minimum: 1, label: 'Foto Muatan' },
  },
  CHECKLIST_PRE: {
    per_item_wajib: { minimum: 1, label: 'Foto per Item Checklist' },
  },
  POD: {
    barang: { minimum: 1, label: 'Foto Barang Diturunkan' },
    tanda_terima: { minimum: 1, label: 'Foto Surat TTD' },
    kerusakan: { minimum: 1, label: 'Foto Kerusakan (jika ada)' },
  },
  LPJ: {
    struk: { minimum: 1, label: 'Foto Struk/Nota' },
  },
};

// User Roles
export const USER_ROLES = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  DISPATCHER: 'Dispatcher',
  FLEET_MANAGER: 'Fleet Manager',
  DRIVER: 'Driver',
  MECHANIC: 'Mechanic',
  FINANCE: 'Finance',
};

// Audit Action Types
export const AUDIT_ACTIONS = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  STATUS_CHANGE: 'STATUS_CHANGE',
  VOID: 'VOID',
  APPROVE: 'APPROVE',
  REJECT: 'REJECT',
  DISPATCH: 'DISPATCH',
  UPLOAD: 'UPLOAD',
  DOWNLOAD: 'DOWNLOAD',
};
