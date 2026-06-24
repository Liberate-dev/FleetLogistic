import React from 'react';
import Layout from '../components/Layout';
import TopNavBar from '../components/TopNavBar';
import jsPDF from 'jspdf';

export default function TechnicalDocumentation() {
  const handleOpenFull = () => {
    window.open('/docs/TECHNICAL_DOCUMENTATION.md', '_blank');
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = '/docs/TECHNICAL_DOCUMENTATION.md';
    link.download = 'TECHNICAL_DOCUMENTATION.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    let y = 15;

    // ========== COVER PAGE ==========
    // Header bar
    doc.setFillColor(70, 99, 71);
    doc.rect(0, 0, pageWidth, 52, 'F');

    doc.setTextColor(255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('FLEET OPS LOGISTICS', margin, 10);

    doc.setFontSize(24);
    doc.text('DOKUMENTASI TEKNIS', margin, 24);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Technical Reference — Fleet Ops Document Management System', margin, 33);

    doc.setFontSize(9);
    doc.text('Versi Internal | Juni 2026', margin, 40);
    doc.text('Single-Device / Offline-Capable Prototype', margin, 46);

    y = 62;

    // Cover body info
    doc.setTextColor(40);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Sistem Manajemen Dokumen untuk Operasional Logistik', margin, y);
    y += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const coverLines = [
      'Dokumen ini berisi spesifikasi teknis lengkap Fleet Ops DMS, meliputi:',
      '• Teknologi yang digunakan (Frontend & Backend)',
      '• Struktur database & relasi antar entitas',
      '• Alur program dan siklus dokumen (SJ Lifecycle)',
      '• Fitur unggulan dan competitive advantage',
      '• Panduan instalasi dan opsi hosting',
      '',
      'Dokumen ini bersifat internal dan ditujukan untuk keperluan',
      'testing, pengembangan, serta dokumentasi proyek.',
    ];

    coverLines.forEach((line) => {
      doc.text(line, margin, y);
      y += 6;
    });

    y += 10;
    doc.setFontSize(9);
    doc.text('Fleet Ops Team — 2026', margin, y);

    // ========== CONTENT PAGE 1 ==========
    doc.addPage();
    y = 15;

    const addSection = (title, lines) => {
      if (y > 240) {
        doc.addPage();
        y = 15;
      }

      doc.setTextColor(70, 99, 71);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text(title, margin, y);
      y += 7;

      doc.setTextColor(30);
      doc.setFontSize(9.5);
      doc.setFont('helvetica', 'normal');

      lines.forEach((line) => {
        if (y > 265) {
          doc.addPage();
          y = 15;
        }
        // Handle long lines by simple wrap
        const maxWidth = 180;
        const split = doc.splitTextToSize(line, maxWidth);
        split.forEach((l) => {
          if (y > 265) {
            doc.addPage();
            y = 15;
          }
          doc.text(l, margin, y);
          y += 5.5;
        });
      });

      y += 5;
    };

    // Section 1: Teknologi
    addSection('1. Teknologi yang Digunakan', [
      'Frontend (React SPA):',
      '  • React 19 + Vite 8 (build tool)',
      '  • React Router DOM v7 (BrowserRouter)',
      '  • Tailwind CSS 3.4 dengan custom Material 3 design tokens + dark mode',
      '  • PDF: jsPDF + jspdf-autotable + html2canvas',
      '  • Icons: Material Symbols + lucide-react',
      '  • State: useReducer + Context API (FleetOpsContext)',
      '  • Persistence: localStorage (data utama) + IndexedDB (foto & lampiran)',
      '',
      'Backend (Opsional):',
      '  • Node.js + Express 4',
      '  • Prisma ORM + better-sqlite3 (SQLite)',
      '  • Services: statusWorkflow, gateCheck, documentNumbering, auditLog, fonnte',
      '  • REST API di /api/* dengan CORS & JSON limit 10MB',
    ]);

    // Section 2: Database
    addSection('2. Struktur Database (Prisma)', [
      'Provider: SQLite (development). Mudah diganti ke PostgreSQL/MySQL.',
      '',
      'Master Data:',
      '  • User, Customer, Material, Vehicle (plate, stnkExpiry, kirExpiry), Driver',
      '',
      'Operational Documents:',
      '  • SuratJalan (+ SuratJalanItem), Dispatch (1:1 dengan SJ)',
      '',
      'Checklists & Proof:',
      '  • VehicleChecklist, DriverChecklist, POD, LPJ',
      '',
      'Supporting: Notification, AuditLog',
      '',
      'Dispatch berfungsi sebagai pusat relasi dengan cascade delete.',
    ]);

    // Section 3: Alur
    addSection('3. Alur Program & SJ Lifecycle', [
      'Status Machine (DRAFT → ASSIGNED → DISPATCHED → DELIVERED → COMPLETED)',
      '  • CANCELLED dapat dilakukan dari status non-COMPLETED.',
      '',
      'Gate Check: Wajib saat transisi ASSIGNED → DISPATCHED.',
      '  • Memvalidasi STNK, KIR, SIM expiry + status ACTIVE kendaraan & driver.',
      '',
      'Frontend Flow (Offline Mode):',
      '  • Context mencoba fetch /api, jika gagal → load dari localStorage + IndexedDB.',
      '  • createSJ fallback ke local dispatch + documentNumberingService (client-side).',
      '  • Foto disimpan sebagai compressed JPEG dataURL di IndexedDB.',
      '  • Semua perubahan langsung tersimpan dan bertahan setelah refresh.',
    ]);

    // ========== NEW PAGE ==========
    doc.addPage();
    y = 15;

    // Section 4: Fitur
    addSection('4. Fitur Unggulan & Competitive Advantage', [
      '• End-to-end workflow khusus logistik Indonesia (SJ wajib + LPJ keuangan)',
      '• Gate Check otomatis untuk compliance (STNK/KIR/SIM)',
      '• Bukti kaya: foto multi-tahap + tanda tangan digital + metadata',
      '• Offline/Static Hosting Ready — menggunakan IndexedDB (kapasitas besar)',
      '• Audit trail lengkap + notifikasi WhatsApp via Fonnte',
      '• PDF export profesional + format nomor dokumen yang bisa dikonfigurasi',
      '• UI modern (Material 3, glassmorphism, responsive, dark mode)',
      '• Low-cost deployment (cPanel static frontend + optional Node backend)',
      '',
      'Keunggulan vs DMS generik:',
      '  Dibangun khusus untuk compliance logistik Indonesia dengan dukungan',
      '  offline yang kuat dan biaya hosting rendah.',
    ]);

    // Section 5: Instalasi
    addSection('5. Cara Instalasi & Hosting', [
      'Local Development:',
      '  npm install && npm run dev',
      '  (Backend: cd backend && npm run dev)',
      '',
      'Static Hosting (cPanel / GitHub Pages / Vercel):',
      '  1. npm run build',
      '  2. Upload isi dist/ ke document root',
      '  3. Pastikan .htaccess untuk SPA fallback ada',
      '  4. Data tersimpan sepenuhnya di browser (IndexedDB + localStorage)',
      '',
      'Backend (untuk multi-user & data permanen):',
      '  • Deploy ke Render.com, Railway, atau VPS',
      '  • Ubah Prisma ke PostgreSQL jika diperlukan',
      '  • Set CORS_ORIGIN sesuai URL frontend',
      '  • Jalankan npm run db:seed untuk data awal',
    ]);

    // Footer note
    y += 10;
    if (y > 250) {
      doc.addPage();
      y = 15;
    }
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text('Dokumen ini bersifat internal. Untuk versi lengkap lihat TECHNICAL_DOCUMENTATION.md', margin, y);

    // Add simple page numbers
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(120);
      doc.text(`Fleet Ops — Technical Documentation | Halaman ${i} dari ${totalPages}`, margin, 287);
    }

    doc.save('Fleet_Ops_Dokumentasi_Teknis.pdf');
  };

  return (
    <Layout>
      <TopNavBar 
        title="Dokumentasi Teknis" 
        breadcrumbs={['Platform', 'Dokumentasi Teknis']} 
      />
      
      <div className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10 animate-fade-in">
        <div className="max-w-5xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-container rounded-2xl flex items-center justify-center text-white shadow-lg">
                  <span className="material-symbols-outlined text-3xl">menu_book</span>
                </div>
                <div>
                  <h1 className="text-4xl font-black font-headline tracking-tight text-on-surface">Dokumentasi Teknis</h1>
                  <p className="text-slate-500 dark:text-slate-400">Fleet Ops — Internal Reference</p>
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl">
                Dokumentasi teknis lengkap sistem Fleet Ops (Stitch Logistics DMS). 
                Berisi teknologi, struktur database, alur program, fitur unggulan, serta panduan instalasi dan hosting.
              </p>
            </div>

            <div className="flex gap-2 flex-wrap">
              <button 
                onClick={handleOpenFull}
                className="px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm transition active:scale-95"
              >
                <span className="material-symbols-outlined text-base">open_in_new</span>
                Buka Markdown
              </button>
              <button 
                onClick={handleDownload}
                className="px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm transition active:scale-95"
              >
                <span className="material-symbols-outlined text-base">download</span>
                Download MD
              </button>
              <button 
                onClick={handleDownloadPDF}
                className="px-5 py-2.5 bg-primary hover:bg-primary-container text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm transition active:scale-95"
              >
                <span className="material-symbols-outlined text-base">picture_as_pdf</span>
                Download PDF
              </button>
            </div>
          </div>

          {/* Section: Teknologi */}
          <section className="glass-panel p-6 rounded-3xl">
            <h2 className="text-xl font-bold font-headline flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary">settings</span>
              Teknologi yang Digunakan
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold text-sm uppercase tracking-widest text-slate-500 mb-2">Frontend (React SPA)</h3>
                <ul className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
                  <li>• React 19 + Vite 8</li>
                  <li>• React Router DOM v7</li>
                  <li>• Tailwind CSS (Material 3 design tokens + dark mode)</li>
                  <li>• jsPDF + html2canvas + jspdf-autotable (PDF export)</li>
                  <li>• Material Symbols + lucide-react</li>
                  <li>• State: useReducer + Context (FleetOpsContext)</li>
                  <li>• Persistence: localStorage + <strong>IndexedDB</strong> (photos &amp; files)</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-sm uppercase tracking-widest text-slate-500 mb-2">Backend (Opsional)</h3>
                <ul className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
                  <li>• Node.js + Express 4</li>
                  <li>• Prisma ORM + better-sqlite3 (SQLite default)</li>
                  <li>• Services: statusWorkflow, gateCheck, documentNumbering, auditLog, fonnte</li>
                  <li>• REST API di <code>/api/*</code></li>
                  <li>• CORS + 10MB JSON body limit</li>
                </ul>
              </div>
            </div>

            <p className="mt-4 text-xs text-slate-500">Catatan: Aplikasi dirancang <strong>offline-first</strong>. Frontend dapat berjalan penuh tanpa backend menggunakan browser storage.</p>
          </section>

          {/* Section: Database */}
          <section className="glass-panel p-6 rounded-3xl">
            <h2 className="text-xl font-bold font-headline flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary">storage</span>
              Struktur Database
            </h2>

            <p className="text-sm mb-4 text-slate-600 dark:text-slate-300">Provider: SQLite (dev). Dapat diganti ke PostgreSQL/MySQL lewat Prisma.</p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                <div className="font-semibold mb-1">Master Data</div>
                <div className="text-xs text-slate-500">User, Customer, Material, Vehicle, Driver</div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                <div className="font-semibold mb-1">Operational</div>
                <div className="text-xs text-slate-500">SuratJalan + SuratJalanItem, Dispatch</div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                <div className="font-semibold mb-1">Checklists &amp; Proof</div>
                <div className="text-xs text-slate-500">VehicleChecklist, DriverChecklist, POD, LPJ</div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                <div className="font-semibold mb-1">Supporting</div>
                <div className="text-xs text-slate-500">Notification, AuditLog</div>
              </div>
            </div>

            <div className="mt-4 text-xs text-slate-500">
              Lihat skema lengkap di <code>backend/prisma/schema.prisma</code>. 
              Dispatch adalah pusat relasi (1:1 dengan SJ, Vehicle, Driver + child checklists/POD/LPJ).
            </div>
          </section>

          {/* Section: Alur Program */}
          <section className="glass-panel p-6 rounded-3xl">
            <h2 className="text-xl font-bold font-headline flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary">route</span>
              Alur Program
            </h2>

            <div className="mb-6">
              <div className="font-semibold mb-2">SJ Status Lifecycle</div>
              <div className="font-mono text-sm bg-slate-900 text-emerald-300 p-3 rounded-xl tracking-wider">
                DRAFT → ASSIGNED → DISPATCHED → DELIVERED → COMPLETED<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;↓<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;CANCELLED (dari state non-final)
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div><strong>Gate Check</strong>: Wajib saat ASSIGNED → DISPATCHED. Memvalidasi STNK, KIR, SIM expiry + status ACTIVE.</div>
              <div><strong>Frontend State</strong>: FleetOpsContext (useReducer) dengan fallback ke localStorage + IndexedDB saat backend tidak tersedia.</div>
              <div><strong>Offline Flow</strong>: Nomor dokumen di-generate client-side, foto disimpan di IndexedDB, semua perubahan langsung tersimpan.</div>
            </div>
          </section>

          {/* Section: Fitur Unggulan */}
          <section className="glass-panel p-6 rounded-3xl">
            <h2 className="text-xl font-bold font-headline flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary">star</span>
              Fitur Unggulan &amp; Competitive Advantage
            </h2>

            <ul className="grid md:grid-cols-2 gap-x-8 gap-y-2 text-sm">
              <li className="flex gap-2">✓ End-to-end workflow logistik Indonesia (SJ + LPJ + Gate Check)</li>
              <li className="flex gap-2">✓ Gate Check otomatis (compliance kendaraan &amp; pengemudi)</li>
              <li className="flex gap-2">✓ Bukti lengkap: foto + tanda tangan digital + metadata</li>
              <li className="flex gap-2">✓ <strong>Offline/Static ready</strong> (IndexedDB untuk foto — kapasitas besar)</li>
              <li className="flex gap-2">✓ Audit trail lengkap + WhatsApp notification (Fonnte)</li>
              <li className="flex gap-2">✓ PDF export profesional + custom document numbering</li>
              <li className="flex gap-2">✓ Modern UI (Material 3, responsive, dark mode)</li>
              <li className="flex gap-2">✓ Low-cost deployment (cPanel static + optional Node backend)</li>
            </ul>
          </section>

          {/* Section: Instalasi & Hosting */}
          <section className="glass-panel p-6 rounded-3xl">
            <h2 className="text-xl font-bold font-headline flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary">deployed_code</span>
              Cara Instalasi &amp; Hosting
            </h2>

            <div className="space-y-4 text-sm">
              <div>
                <div className="font-semibold">Local Development</div>
                <div className="font-mono text-xs bg-slate-100 dark:bg-slate-800 p-2 rounded mt-1">
                  npm install &amp;&amp; npm run dev<br/>
                  (backend: cd backend &amp;&amp; npm run dev)
                </div>
              </div>

              <div>
                <div className="font-semibold">Static Hosting (cPanel / GitHub Pages / Vercel static)</div>
                <ol className="list-decimal ml-5 mt-1 space-y-0.5">
                  <li>npm run build</li>
                  <li>Upload isi folder <code>dist/</code> ke document root</li>
                  <li>Pastikan .htaccess SPA fallback ada</li>
                  <li>Data tersimpan di browser (IndexedDB + localStorage)</li>
                </ol>
              </div>

              <div>
                <div className="font-semibold">Backend (jika butuh multi-user &amp; DB permanen)</div>
                <div>Deploy ke Render / Railway / VPS. Ubah Prisma ke PostgreSQL jika perlu. Set CORS origin ke URL frontend.</div>
              </div>
            </div>
          </section>

          {/* Footer note */}
          <div className="text-center text-xs text-slate-400 pt-4 border-t border-slate-100 dark:border-slate-800">
            Dokumentasi ini adalah referensi internal. Versi Markdown lengkap tersedia di folder <code>/docs</code> setelah build.
            <br />
            Terakhir diperbarui: Juni 2026 (termasuk dukungan IndexedDB untuk attachment)
          </div>

        </div>
      </div>
    </Layout>
  );
}
