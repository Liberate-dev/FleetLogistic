import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import TopNavBar from '../components/TopNavBar';
import Modal from '../components/ui/Modal';

export default function SJIndex() {
  const [suratJalan, setSuratJalan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSJ, setSelectedSJ] = useState(null);

  useEffect(() => {
    fetchSuratJalan();
  }, []);

  const fetchSuratJalan = async () => {
    try {
      const res = await fetch('/api/surat-jalan');
      const data = await res.json();
      setSuratJalan(data.suratJalan || []);
    } catch (err) {
      console.error('Failed to fetch SJ:', err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh every 10 seconds to pick up webhook updates
  useEffect(() => {
    const interval = setInterval(fetchSuratJalan, 10000);
    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = (status) => {
    const styles = {
      DRAFT: 'bg-slate-200 text-slate-600',
      ASSIGNED: 'bg-blue-100 text-blue-800',
      DISPATCHED: 'bg-amber-100 text-amber-800',
      DELIVERED: 'bg-purple-100 text-purple-800',
      COMPLETED: 'bg-emerald-100 text-emerald-800',
      CANCELLED: 'bg-red-100 text-red-600',
    };
    return styles[status] || 'bg-slate-200 text-slate-600';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  const handleCancelSJ = async (id) => {
    if (!window.confirm('Yakin batalkan SJ ini?')) return;
    setSuratJalan(suratJalan.map(sj => sj.id === id ? { ...sj, status: 'CANCELLED' } : sj));
    try {
      await fetch(`/api/surat-jalan/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' }),
      });
    } catch (err) {
      console.error('Cancel failed:', err);
      fetchSuratJalan();
    }
  };

  const handleReturnSJ = async (id) => {
    if (!window.confirm('Kembalikan SJ ini ke status aktif?')) return;
    setSuratJalan(suratJalan.map(sj => sj.id === id ? { ...sj, status: 'DRAFT' } : sj));
    try {
      await fetch(`/api/surat-jalan/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'DRAFT' }),
      });
    } catch (err) {
      console.error('Return failed:', err);
      fetchSuratJalan();
    }
  };

  const handleDeleteSJ = async (id) => {
    if (!window.confirm('Yakin hapus permanen SJ ini?')) return;
    setSuratJalan(suratJalan.filter(sj => sj.id !== id));
    try {
      await fetch(`/api/surat-jalan/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Delete failed:', err);
      fetchSuratJalan();
    }
  };

  return (
    <Layout>
      <TopNavBar title="Surat Jalan (Manifests)" breadcrumbs={['Operations', 'Surat Jalan']} />
      <div className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10 animate-fade-in">
        <div className="max-w-7xl mx-auto space-y-8">

          <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
            <div>
              <h2 className="text-3xl font-extrabold font-headline tracking-tight">Surat Jalan (SJ)</h2>
              <p className="text-slate-500 font-body mt-1">Manage delivery manifests and client shipping requests.</p>
            </div>
            <Link to="/sj/new" className="px-6 py-2.5 bg-gradient-to-r from-tertiary to-tertiary-container text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">note_add</span>
              <span>Create New SJ</span>
            </Link>
          </div>

          <div className="glass-panel rounded-2xl overflow-hidden shadow-lg border border-slate-200/50">
            {loading ? (
              <div className="p-12 text-center text-slate-400">
                <span className="material-symbols-outlined text-4xl animate-spin">progress_activity</span>
                <p className="mt-2">Loading...</p>
              </div>
            ) : suratJalan.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <span className="material-symbols-outlined text-5xl">description</span>
                <p className="mt-2">No Surat Jalan yet. Create your first one!</p>
              </div>
            ) : (
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-200 text-slate-500">
                    <th className="py-4 px-6 font-bold uppercase text-xs">SJ Number</th>
                    <th className="py-4 px-6 font-bold uppercase text-xs">Date</th>
                    <th className="py-4 px-6 font-bold uppercase text-xs">Client</th>
                    <th className="py-4 px-6 font-bold uppercase text-xs">Items</th>
                    <th className="py-4 px-6 font-bold uppercase text-xs">Photo</th>
                    <th className="py-4 px-6 font-bold uppercase text-xs">Status</th>
                    <th className="py-4 px-6 font-bold uppercase text-xs text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {suratJalan.map((item) => (
                    <tr key={item.id} className="hover:bg-primary/5 transition-colors cursor-pointer" onClick={() => setSelectedSJ(item)}>
                      <td className="py-4 px-6 font-mono font-bold text-slate-800 dark:text-slate-200">{item.documentNumber}</td>
                      <td className="py-4 px-6 text-slate-600">{formatDate(item.date)}</td>
                      <td className="py-4 px-6 text-slate-800 font-semibold">{item.customer?.name || '-'}</td>
                      <td className="py-4 px-6 text-slate-600">{item.items?.length || 0} items</td>
                      <td className="py-4 px-6">
                        {item.photoReceived ? (
                          <span className="flex items-center gap-1 text-emerald-600">
                            <span className="material-symbols-outlined text-[16px]">check_circle</span>
                            <span className="text-xs">OK</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-slate-400">
                            <span className="material-symbols-outlined text-[16px]">photo</span>
                            <span className="text-xs">-</span>
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-1 text-[10px] uppercase font-bold rounded-md ${getStatusBadge(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        {item.status === 'CANCELLED' ? (
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReturnSJ(item.id);
                              }}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-colors"
                              title="Return"
                            >
                              <span className="material-symbols-outlined text-[18px]">undo</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteSJ(item.id);
                              }}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-error hover:bg-error/10 transition-colors"
                              title="Hapus Permanen"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete_forever</span>
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancelSJ(item.id);
                            }}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-amber-600 hover:bg-amber-50 border border-amber-200 transition-colors"
                            title="Batalkan SJ"
                          >
                            <span className="material-symbols-outlined text-[18px]">cancel</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* SJ Detail Modal */}
          <Modal
            isOpen={!!selectedSJ}
            onClose={() => setSelectedSJ(null)}
            title={`Detail: ${selectedSJ?.documentNumber || ''}`}
            size="lg"
          >
            {selectedSJ && (
              <div className="space-y-6">

                {/* Header Status */}
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Tanggal</p>
                    <p className="text-sm font-semibold">{formatDate(selectedSJ.date)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Status</p>
                    <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full ${
                      selectedSJ.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                      selectedSJ.status === 'CANCELLED' ? 'bg-red-100 text-red-600' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {selectedSJ.status}
                    </span>
                  </div>
                </div>

                {/* Info Tujuan */}
                {selectedSJ.destination && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">location_on</span>
                      Info Tujuan
                    </h4>
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase">Lokasi / Site</p>
                        <p className="text-sm font-semibold">{selectedSJ.destination}</p>
                      </div>
                      {selectedSJ.destinationAddress && (
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase">Alamat</p>
                          <p className="text-sm">{selectedSJ.destinationAddress}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Info Klien */}
                {selectedSJ.clientName && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">business</span>
                      Info Klien
                    </h4>
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                      <p className="text-[10px] text-slate-400 uppercase">Perusahaan</p>
                      <p className="text-sm font-semibold">{selectedSJ.clientName}</p>
                      {selectedSJ.contactPerson && (
                        <div className="mt-2 pt-2 border-t border-slate-100">
                          <p className="text-[10px] text-slate-400 uppercase">Contact Person</p>
                          <p className="text-sm">{selectedSJ.contactPerson}</p>
                          {selectedSJ.contactPhone && (
                            <p className="text-xs text-slate-500">{selectedSJ.contactPhone}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Cargo Manifest */}
                {selectedSJ.items?.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">inventory_2</span>
                      Cargo Manifest
                    </h4>
                    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                      <table className="w-full text-xs border-collapse">
                        <thead className="bg-slate-50 dark:bg-slate-800">
                          <tr className="text-slate-500">
                            <th className="p-3 font-bold uppercase text-left">SKU</th>
                            <th className="p-3 font-bold uppercase text-left">Material</th>
                            <th className="p-3 font-bold uppercase text-right">Qty</th>
                            <th className="p-3 font-bold uppercase text-right">Berat</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {selectedSJ.items.map((item, idx) => (
                            <tr key={idx}>
                              <td className="p-3 font-mono">{item.sku}</td>
                              <td className="p-3">{item.name}</td>
                              <td className="p-3 text-right">{item.qty} {item.unit}</td>
                              <td className="p-3 text-right">{Number(item.weight).toLocaleString()} kg</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Cash Advance */}
                {(selectedSJ.cashAdvance?.uangJalan?.nominal || selectedSJ.cashAdvance?.danaCadangan?.nominal) && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">payments</span>
                      Cash Advance
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      {selectedSJ.cashAdvance?.uangJalan?.nominal > 0 && (
                        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                          <p className="text-[10px] font-bold text-amber-600 uppercase">Uang Jalan</p>
                          <p className="text-sm font-bold text-amber-700">Rp {Number(selectedSJ.cashAdvance.uangJalan.nominal).toLocaleString()}</p>
                          {selectedSJ.cashAdvance.uangJalan.recipient && (
                            <p className="text-xs text-slate-500 mt-1">Penerima: {selectedSJ.cashAdvance.uangJalan.recipient}</p>
                          )}
                        </div>
                      )}
                      {selectedSJ.cashAdvance?.danaCadangan?.nominal > 0 && (
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                          <p className="text-[10px] font-bold text-blue-600 uppercase">Dana Cadangan</p>
                          <p className="text-sm font-bold text-blue-700">Rp {Number(selectedSJ.cashAdvance.danaCadangan.nominal).toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Foto Muatan */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">photo_library</span>
                    Foto Muatan
                  </h4>
                  <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    {selectedSJ.photoUrl ? (
                      <img
                        src={selectedSJ.photoUrl}
                        alt="Photo muatan"
                        className="max-w-full rounded-lg"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                    ) : (
                      <p className="text-sm text-slate-400">Belum ada foto</p>
                    )}
                  </div>
                </div>

                {/* Notes */}
                {selectedSJ.notes && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">sticky_note_2</span>
                      Catatan
                    </h4>
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                      <p className="text-sm">{selectedSJ.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Modal>
        </div>
      </div>
    </Layout>
  );
}
