import React, { useState, useEffect, useMemo } from 'react';
import Layout from '../components/Layout';
import TopNavBar from '../components/TopNavBar';
import Modal from '../components/ui/Modal';
import DocumentPrintLayout from '../components/ui/DocumentPrintLayout';

const PAGE_SIZE = 10;

const formatDate = (d) => {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatDateTime = (d) => {
  if (!d) return '-';
  return new Date(d).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
};

const getStatusBadge = (status) => {
  const styles = {
    COMPLETED: 'bg-emerald-100 text-emerald-700',
    CANCELLED: 'bg-red-100 text-red-600',
    DELIVERED: 'bg-purple-100 text-purple-700',
    DISPATCHED: 'bg-amber-100 text-amber-700',
    ASSIGNED: 'bg-blue-100 text-blue-700',
    DRAFT: 'bg-slate-200 text-slate-600',
  };
  return styles[status] || 'bg-slate-200 text-slate-600';
};

const getTotalWeight = (sj) => {
  if (sj.totalWeight) return Number(sj.totalWeight).toFixed(2);
  if (sj.items?.length > 0) {
    const total = sj.items.reduce((sum, i) => sum + (Number(i.weight || i.quantity) || 0), 0);
    return (total / 1000).toFixed(2);
  }
  return '0.00';
};

export default function Archiving() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ARCHIVED');
  const [page, setPage] = useState(1);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const fetchArchive = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/surat-jalan?limit=500');
      const data = await res.json();
      const all = data.suratJalan || data || [];
      setRecords(all);
    } catch (err) {
      console.error('Archive fetch failed:', err);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArchive();
  }, []);

  const archived = useMemo(() => {
    let list = records.filter(r => r.status === 'COMPLETED' || r.status === 'CANCELLED');
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(r =>
        (r.documentNumber || '').toLowerCase().includes(q) ||
        (r.customer?.name || r.clientName || '').toLowerCase().includes(q) ||
        (r.destination || '').toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'ARCHIVED') {
      list = list.filter(r => r.status === statusFilter);
    }
    return list;
  }, [records, search, statusFilter]);

  const total = archived.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pageItems = archived.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages, page]);

  return (
    <Layout>
      <TopNavBar title="Document Archive" breadcrumbs={['Records', 'Document Archive']} />

      <div className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10 animate-fade-in flex flex-col">
        <div className="max-w-7xl mx-auto w-full space-y-6">

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div className="space-y-1">
              <h2 className="text-3xl font-extrabold font-headline tracking-tight">System Archive</h2>
              <p className="text-slate-500 font-body text-sm">Search and retrieve completed Surat Jalan and historical dispatches.</p>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <select
                value={statusFilter}
                onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary"
              >
                <option value="ARCHIVED">All Archived</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
              <div className="relative flex-1 md:w-64">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
                <input
                  type="text"
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Search SJ Number or Client..."
                  className="w-full bg-white dark:bg-slate-800 border-none rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary shadow-sm"
                />
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-2xl overflow-hidden shadow-lg border border-slate-200/50 dark:border-slate-800/50">
            {loading ? (
              <div className="p-12 text-center text-slate-400">
                <span className="material-symbols-outlined text-4xl animate-spin">progress_activity</span>
                <p className="mt-2">Loading archive...</p>
              </div>
            ) : pageItems.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <span className="material-symbols-outlined text-5xl">inventory_2</span>
                <p className="mt-2">No archived documents found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-800 text-slate-500">
                      <th className="py-4 px-6 font-bold uppercase tracking-wider text-xs">Document ID</th>
                      <th className="py-4 px-6 font-bold uppercase tracking-wider text-xs">Date</th>
                      <th className="py-4 px-6 font-bold uppercase tracking-wider text-xs">Client</th>
                      <th className="py-4 px-6 font-bold uppercase tracking-wider text-xs">Route</th>
                      <th className="py-4 px-6 font-bold uppercase tracking-wider text-xs">Items</th>
                      <th className="py-4 px-6 font-bold uppercase tracking-wider text-xs">Status</th>
                      <th className="py-4 px-6 font-bold uppercase tracking-wider text-xs text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                    {pageItems.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="py-8 text-center text-slate-400">No archived documents found</td>
                      </tr>
                    ) : (pageItems).map((rec) => (
                      <tr
                        key={rec.id}
                        className="hover:bg-primary/5 transition-colors group cursor-pointer"
                        onClick={() => setSelectedRecord(rec)}
                      >
                        <td className="py-4 px-6 font-bold text-slate-800 dark:text-slate-200 font-mono">
                          {rec.documentNumber || rec.number || rec.id}
                        </td>
                        <td className="py-4 px-6 text-slate-600 dark:text-slate-400">{formatDate(rec.date || rec.loadingDate)}</td>
                        <td className="py-4 px-6 font-semibold">{rec.customer?.name || rec.clientName || '-'}</td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2 text-slate-500">
                            <span className="truncate max-w-[100px]">{rec.originDepot || rec.origin || 'Jakarta'}</span>
                            <span className="material-symbols-outlined text-[10px]">arrow_forward</span>
                            <span className="truncate max-w-[100px]">{rec.destination || rec.dest || '-'}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-slate-600">
                          <span className="font-bold">{rec.items?.length || 0}</span>
                          <span className="text-xs text-slate-400 ml-1">({getTotalWeight(rec)} T)</span>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-md ${getStatusBadge(rec.status)}`}>
                            {rec.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={(e) => { e.stopPropagation(); setSelectedRecord(rec); }}
                            className="p-1.5 text-slate-400 hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <span className="material-symbols-outlined text-lg">visibility</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-sm text-slate-500 bg-white/50 dark:bg-slate-900/50">
              <p>Showing {pageItems.length} of {total} records</p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1 hover:text-primary disabled:opacity-30"
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <span className="px-3 py-1 text-xs">
                  Page {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1 hover:text-primary disabled:opacity-30"
                >
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Archive Viewer Modal */}
      <div className={`fixed inset-0 z-[100] transition-all ${selectedRecord ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm print:hidden"
          onClick={() => setSelectedRecord(null)}
        />

        {/* Content */}
        <div className="absolute inset-4 md:inset-12 xl:inset-20 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col print:shadow-none print:rounded-none print:inset-0 print:z-[0]">
          {/* Toolbar - hidden on print */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 print:hidden">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                {selectedRecord?.documentNumber || selectedRecord?.number || ''}
              </h3>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg text-sm font-bold flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">print</span> Print
              </button>
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
          </div>

          {/* Scrollable content area - hidden on print */}
          <div className="flex-1 overflow-y-auto p-6 print:overflow-visible print:p-0 print:h-screen">
            <div className="max-w-4xl mx-auto print:max-w-none">
              <div className="bg-white p-8 rounded-xl print:rounded-none print:p-0 print:shadow-none print:border-0">
                {selectedRecord ? (
                  <DocumentPrintLayout
                    docType="SJ"
                    docNumber={selectedRecord.documentNumber || selectedRecord.number || ''}
                  date={formatDate(selectedRecord.date || selectedRecord.loadingDate)}
                  status={selectedRecord.status}
                  metadata={[
                    { label: 'Dibuat Oleh', value: selectedRecord.createdBy?.name || selectedRecord.createdByName || '-' },
                    { label: 'Dibuat Pada', value: formatDateTime(selectedRecord.createdAt) },
                    { label: 'Tipe', value: 'Surat Jalan' },
                    { label: 'Driver / Pengemudi', value: selectedRecord.dispatch?.driver?.name || selectedRecord.driver?.name || selectedRecord.driverName || '-' },
                    { label: 'Kendaraan', value: selectedRecord.dispatch?.vehicle?.plateNumber || selectedRecord.vehicleNumber || selectedRecord.plateNumber || '-' },
                    { label: 'Status', value: selectedRecord.status },
                  ]}
                  parties={[
                    {
                      label: 'Penerima (Shipped To)',
                      name: selectedRecord.customer?.name || selectedRecord.clientName || '-',
                      address: selectedRecord.destinationAddress || selectedRecord.destination,
                      icon: 'location_on',
                    },
                    {
                      label: 'Asal (Origin Facility)',
                      name: `Fleet Ops Hub - ${selectedRecord.originDepot || 'Main'}`,
                      address: selectedRecord.originDepot || 'Main Distribution Center',
                      icon: 'warehouse',
                    },
                  ]}
                  body={(
                    <table className="w-full text-sm border-collapse border border-slate-300">
                      <thead>
                        <tr className="bg-slate-800 text-white border border-slate-800">
                          <th className="py-3 px-4 text-left font-bold w-12 border-r border-slate-600">No</th>
                          <th className="py-3 px-4 text-left font-bold border-r border-slate-600">Description of Goods</th>
                          <th className="py-3 px-4 text-center font-bold w-20 border-r border-slate-600">Qty</th>
                          <th className="py-3 px-4 text-center font-bold w-24 border-r border-slate-600">Unit</th>
                          <th className="py-3 px-4 text-right font-bold w-32">Weight</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {(selectedRecord.items || []).length > 0 ? (selectedRecord.items).map((item, idx) => {
                          const name = item.name || item.material?.name || '-';
                          const qty = item.qty ?? item.quantity ?? 0;
                          const unit = item.unit || item.material?.unit || '-';
                          const weight = Number(item.weight || item.quantity || 0).toLocaleString();
                          return (
                            <tr key={idx}>
                              <td className="py-4 px-4 font-semibold border-r border-slate-200 text-center">{idx + 1}</td>
                              <td className="py-4 px-4 border-r border-slate-200">{name}</td>
                              <td className="py-4 px-4 text-center border-r border-slate-200 font-bold">{qty}</td>
                              <td className="py-4 px-4 text-center border-r border-slate-200">{unit}</td>
                              <td className="py-4 px-4 text-right text-slate-600">{weight} kg</td>
                            </tr>
                          );
                        }) : (
                          <tr>
                            <td colSpan="5" className="py-8 text-center text-slate-400 border-r border-slate-200">No cargo items recorded</td>
                          </tr>
                        )}
                        <tr className="bg-slate-100 font-bold border-t-2 border-slate-800">
                          <td colSpan="4" className="py-4 px-4 text-right uppercase tracking-wider text-xs">Total Cargo Weight</td>
                          <td className="py-4 px-4 text-right text-slate-800 text-base">{getTotalWeight(selectedRecord)} Ton</td>
                        </tr>
                      </tbody>
                    </table>
                  )}
                  signatures={[
                    { label: 'Admin Logistik', sub: 'Nama Terang & Tanda Tangan' },
                    { label: 'Driver / Armada', sub: 'Nama & Nomor Plat Kendaraan' },
                    { label: 'Penerima (Receiver)', sub: 'Nama Terang & Cap Perusahaan' },
                  ]}
                />
                ) : (
                  <div className="text-center py-12 text-slate-400">
                    <span className="material-symbols-outlined text-5xl">description</span>
                    <p className="mt-2">Document not found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
