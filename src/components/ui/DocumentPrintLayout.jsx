import React from 'react';

// Document Print Layout
// Reusable printable paper used by SJ / Archive / POD / Dispatch / LPJ detail views.
// Props:
//   docType: 'SJ' | 'POD' | 'DISPATCH' | 'LPJ' | 'CHECKLIST'
//   title: Human title (e.g. "Surat Jalan")
//   subtitle: e.g. "Delivery Manifest"
//   docNumber: Document number (SJ/MLG/2025/...)
//   date: ISO string or display string
//   status: status text/badge
//   parties: array of { label, name, address, icon } shown as routing cards
//   metadata: array of { label, value } for small key-value grid
//   body: ReactNode — main content (tables, sections)
//   signatures: array of { label, sub } for signature row
//   remarks: optional remarks string
//   extra: optional extra ReactNode appended after body
//   compact: bool — reduce padding for nested modal use

const COMPANY = {
  name: 'FLEET OPS LOGISTICS',
  address: 'Operation Center Building Lt 4.\nJl. Gatot Subroto Kav. 7A, Jakarta 12190',
  phone: '(021) 555-0192 | info@fleetops.id',
};

const TYPE_ICON = {
  SJ: 'local_shipping',
  POD: 'how_to_reg',
  DISPATCH: 'route',
  LPJ: 'receipt_long',
  CHECKLIST: 'fact_check',
};

const TYPE_SUBTITLE = {
  SJ: 'Delivery Manifest',
  POD: 'Proof of Delivery',
  DISPATCH: 'Dispatch Order',
  LPJ: 'Operational Cost Report',
  CHECKLIST: 'Vehicle Inspection Checklist',
};

export default function DocumentPrintLayout({
  docType = 'SJ',
  title,
  subtitle,
  docNumber,
  date,
  status,
  parties = [],
  metadata = [],
  body,
  signatures = [],
  remarks,
  extra,
  compact = false,
  printedBy,
}) {
  const t = docType || 'SJ';
  const resolvedTitle = title || t === 'SJ' ? 'SURAT JALAN' : t;
  const resolvedSubtitle = subtitle || TYPE_SUBTITLE[t] || '';

  return (
    <div
      className={`w-full max-w-3xl bg-white shadow-xl print:shadow-none print:px-12 print:py-12 relative text-slate-800 font-sans mx-auto ${
        compact ? 'p-6 md:p-8' : 'p-8 md:p-12'
      }`}
    >
      {/* Watermark */}
      <div className="absolute inset-0 flex flex-col items-center justify-center opacity-[0.03] pointer-events-none select-none overflow-hidden rotate-[-30deg] print:opacity-[0.03]">
        <span className="material-symbols-outlined text-[200px]">{TYPE_ICON[t] || 'description'}</span>
        <div className="text-[100px] font-black tracking-widest text-slate-800 whitespace-nowrap mt-4">FLEET OPS</div>
      </div>

      {/* Doc Header */}
      <div className="flex flex-col md:flex-row justify-between items-start border-b-2 border-slate-800 pb-6 mb-6 gap-6 print:pb-4 print:mb-6 relative z-10">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <span className="material-symbols-outlined text-4xl">local_shipping</span>
            {COMPANY.name}
          </h1>
          <p className="text-xs text-slate-500 mt-2 max-w-[250px] leading-relaxed whitespace-pre-line">
            {COMPANY.address}
            {'\n'}Phone: {COMPANY.phone}
          </p>
        </div>
        <div className="text-left md:text-right w-full md:w-auto">
          <h2 className="text-2xl font-bold text-slate-800 mb-1 uppercase">{resolvedTitle}</h2>
          <p className="text-slate-500 text-sm font-bold tracking-widest uppercase">{resolvedSubtitle}</p>
          <div className="mt-4 flex flex-col text-sm border-2 border-slate-200 p-4 bg-slate-50 w-full md:w-64 ml-auto">
            <div className="flex justify-between gap-4 mb-2">
              <span className="font-semibold text-slate-600">Doc No.</span>
              <span className="font-bold text-slate-800 font-mono break-all text-right">{docNumber || '-'}</span>
            </div>
            <div className="flex justify-between gap-4 mb-2">
              <span className="font-semibold text-slate-600">Date</span>
              <span className="font-bold text-slate-800">{date || '-'}</span>
            </div>
            {status && (
              <div className="flex justify-between gap-4 pt-2 border-t border-slate-200">
                <span className="font-semibold text-slate-600">Status</span>
                <span className="font-bold text-primary uppercase tracking-wider">{status}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Metadata grid (optional) */}
      {metadata.length > 0 && (
        <div className="mb-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-slate-50 border border-slate-200 rounded-lg">
            {metadata.map((m, i) => (
              <div key={i}>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{m.label}</p>
                <p className="text-sm font-bold text-slate-800">{m.value ?? '-'}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Parties (routing) */}
      {parties.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 mb-8 border-b-2 border-slate-100 pb-8 print:gap-6 print:mb-6 print:pb-6 relative z-10">
          {parties.map((p, i) => (
            <div key={i} className="flex-1 space-y-1 text-sm bg-slate-50 p-4 rounded-lg border border-slate-100">
              <h3 className="font-bold text-slate-400 uppercase tracking-widest text-[10px] mb-3 flex items-center gap-1">
                {p.icon && <span className="material-symbols-outlined text-[14px]">{p.icon}</span>}
                {p.label}
              </h3>
              <p className="font-bold text-slate-800 text-lg">{p.name}</p>
              {p.address && (
                <p className="text-slate-600 flex items-start gap-1.5 mt-2 whitespace-pre-line">
                  <span className="material-symbols-outlined text-[18px] shrink-0">location_on</span>
                  <span>{p.address}</span>
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Body content (tables, sections) */}
      {body && <div className="mb-8 print:mb-6 relative z-10">{body}</div>}

      {/* Remarks */}
      {remarks && (
        <div className="text-sm relative z-10 mb-8 print:mb-6">
          <p className="font-bold text-slate-800 mb-2">Remarks / Catatan:</p>
          <p className="text-slate-600 italic p-4 bg-slate-50 border border-slate-200 rounded leading-relaxed border-l-4 border-l-slate-400">
            {remarks}
          </p>
        </div>
      )}

      {/* Signatures */}
      {signatures.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-around items-center text-center pt-8 mt-8 mb-4 gap-8 print:pt-6 print:mt-6 relative z-10 page-break-inside-avoid">
          {signatures.map((s, i) => (
            <div key={i} className="w-full sm:w-48">
              <p className="font-bold text-slate-800 mb-20 print:mb-24 text-xs uppercase tracking-wider">{s.label}</p>
              {s.stamp && (
                <div className="inline-block p-1 border-2 border-red-500/30 text-red-500/50 -rotate-12 rounded opacity-50 align-middle transform -translate-y-6">
                  {s.stamp}
                </div>
              )}
              <div className="border-b-2 border-slate-800"></div>
              {s.autoName ? (
                <p className="text-xs font-bold text-slate-700 mt-2">{s.autoName}</p>
              ) : (
                <p className="text-xs font-bold text-slate-500 mt-2">{s.sub}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Extra content (e.g. items table) */}
      {extra && <div className="relative z-10">{extra}</div>}

      {/* Footer */}
      <div className="mt-12 pt-4 print:mt-8 print:pt-4 border-t border-slate-200 text-[10px] text-slate-400 flex flex-col sm:flex-row justify-between items-center gap-4 font-mono relative z-10">
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <p className="font-bold text-slate-500">Doc Ref: {docNumber || '-'}</p>
          <p>Fleet Ops System</p>
          <p className="font-bold text-slate-500">Halaman: 1 / 1</p>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 sm:text-right">
          <p>Dicetak oleh: <span className="font-bold text-slate-500">{printedBy || 'Admin Operasional'}</span></p>
          <p>{new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</p>
        </div>
      </div>
    </div>
  );
}
