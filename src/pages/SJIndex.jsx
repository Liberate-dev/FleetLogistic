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
                    <th className="py-4 px-6 font-bold uppercase text-xs">TTD</th>
                    <th className="py-4 px-6 font-bold uppercase text-xs">Status</th>
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
                        {item.signatureConfirmed ? (
                          <span className="flex items-center gap-1 text-emerald-600">
                            <span className="material-symbols-outlined text-[16px]">verified</span>
                            <span className="text-xs">OK</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-slate-400">
                            <span className="material-symbols-outlined text-[16px]">draw</span>
                            <span className="text-xs">-</span>
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-1 text-[10px] uppercase font-bold rounded-md ${getStatusBadge(item.status)}`}>
                          {item.status}
                        </span>
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
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Client</label>
                    <p className="font-semibold">{selectedSJ.customer?.name || '-'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Status</label>
                    <p className={`font-semibold ${
                      selectedSJ.status === 'COMPLETED' ? 'text-emerald-600' :
                      selectedSJ.status === 'CANCELLED' ? 'text-red-600' : 'text-blue-600'
                    }`}>{selectedSJ.status}</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Date</label>
                    <p className="font-semibold">{formatDate(selectedSJ.date)}</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Items</label>
                    <p className="font-semibold">{selectedSJ.items?.length || 0} items</p>
                  </div>
                </div>

                {selectedSJ.notes && (
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Notes</label>
                    <p className="text-sm">{selectedSJ.notes}</p>
                  </div>
                )}

                <div className="border-t pt-4">
                  <h4 className="text-sm font-bold text-slate-700 mb-3">Photo & Signature</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                        Photo Muatan
                        {selectedSJ.photoReceived ? (
                          <span className="material-symbols-outlined text-emerald-600 text-[14px]">check_circle</span>
                        ) : (
                          <span className="material-symbols-outlined text-slate-400 text-[14px]">radio_button_unchecked</span>
                        )}
                      </label>
                      {selectedSJ.photoUrl ? (
                        <div className="mt-2">
                          <img
                            src={selectedSJ.photoUrl}
                            alt="Photo muatan"
                            className="max-w-full rounded-lg border"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'block';
                            }}
                          />
                          <div className="hidden text-xs text-slate-500 mt-1">
                            Image URL: {selectedSJ.photoUrl}
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-slate-400 mt-1">No photo received</p>
                      )}
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                        TTD Confirmation
                        {selectedSJ.signatureConfirmed ? (
                          <span className="material-symbols-outlined text-emerald-600 text-[14px]">verified</span>
                        ) : (
                          <span className="material-symbols-outlined text-slate-400 text-[14px]">radio_button_unchecked</span>
                        )}
                      </label>
                      <p className={`text-sm mt-1 ${selectedSJ.signatureConfirmed ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {selectedSJ.signatureConfirmed ? 'Driver confirmed receipt' : 'Pending confirmation'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Modal>
        </div>
      </div>
    </Layout>
  );
}
