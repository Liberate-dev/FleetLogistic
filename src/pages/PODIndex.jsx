import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import StatusBadge from '../components/ui/StatusBadge';
import { useFleetOps } from '../context';

const POD_STATUS_CONFIG = {
  'POD PENDING': { label: 'Pending', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: 'pending' },
  'POD RECEIVED': { label: 'Received', color: 'bg-primary/10 text-primary', icon: 'check_circle' },
  'POD DISCREPANCY': { label: 'Discrepancy', color: 'bg-error/10 text-error', icon: 'warning' },
};

export default function PODIndex() {
  const { pods, suratJalan } = useFleetOps();

  const podList = useMemo(() => {
    return pods.map(p => {
      const sj = suratJalan.find(s => s.number === p.sjNumber);
      return {
        ...p,
        sjDestination: sj?.destination || '-',
        sjClient: sj?.clientName || '-',
      };
    });
  }, [pods, suratJalan]);

  // SJ that are delivered but don't have POD yet
  const pendingPODs = useMemo(() => {
    const sjWithPOD = new Set(pods.map(p => p.sjNumber));
    return suratJalan.filter(sj => sj.status === 'DELIVERED' && !sjWithPOD.has(sj.number));
  }, [suratJalan, pods]);

  // Summary stats
  const stats = useMemo(() => ({
    total: podList.length,
    received: podList.filter(p => p.status === 'POD RECEIVED').length,
    discrepancy: podList.filter(p => p.status === 'POD DISCREPANCY').length,
    pending: pendingPODs.length,
  }), [podList, pendingPODs]);

  return (
    <Layout>
      <div className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10 animate-fade-in no-scrollbar bg-slate-50/50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
            <div>
              <h2 className="text-3xl font-extrabold font-headline tracking-tight text-on-surface">Proof of Delivery</h2>
              <p className="text-slate-500 font-body mt-1">Serah terima barang dan bukti pengiriman ke penerima.</p>
            </div>
            <Link
              to="/pod/new"
              className="px-6 py-2.5 bg-gradient-to-r from-primary to-primary-container text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2 hover:-translate-y-0.5"
            >
              <span className="material-symbols-outlined text-lg">how_to_reg</span>
              <span>New POD</span>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-panel p-4 rounded-xl border border-slate-200/50 bg-white dark:bg-slate-800">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-primary text-[20px]">receipt_long</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total POD</span>
              </div>
              <p className="text-2xl font-black font-headline text-on-surface">{stats.total}</p>
            </div>
            <div className="glass-panel p-4 rounded-xl border border-slate-200/50 bg-white dark:bg-slate-800">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Received</span>
              </div>
              <p className="text-2xl font-black font-headline text-primary">{stats.received}</p>
            </div>
            <div className="glass-panel p-4 rounded-xl border border-slate-200/50 bg-white dark:bg-slate-800">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-error text-[20px]">warning</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Discrepancy</span>
              </div>
              <p className="text-2xl font-black font-headline text-error">{stats.discrepancy}</p>
            </div>
            <div className="glass-panel p-4 rounded-xl border border-slate-200/50 bg-white dark:bg-slate-800">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-amber-600 text-[20px]">pending_actions</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pending</span>
              </div>
              <p className="text-2xl font-black font-headline text-amber-600">{stats.pending}</p>
            </div>
          </div>

          {/* Pending PODs (Delivered SJ without POD) */}
          {pendingPODs.length > 0 && (
            <div className="glass-panel rounded-2xl p-6 border border-amber-200/50 bg-amber-50/50 dark:bg-amber-900/10">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-amber-600">pending_actions</span>
                <h3 className="text-sm font-bold font-headline text-amber-700 dark:text-amber-400">Surat Jalan Menunggu POD</h3>
              </div>
              <div className="space-y-2">
                {pendingPODs.map(sj => (
                  <div key={sj.number} className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-xl border border-amber-200 dark:border-amber-800">
                    <div>
                      <p className="text-sm font-bold text-on-surface">{sj.number}</p>
                      <p className="text-xs text-slate-500">{sj.destination} — {sj.clientName}</p>
                    </div>
                    <Link
                      to={`/pod/new?sj=${sj.number}`}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[14px]">add</span>
                      Buat POD
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* POD Table */}
          {podList.length === 0 ? (
            <div className="glass-panel rounded-2xl p-12 text-center border border-slate-200/50 bg-white dark:bg-slate-800">
              <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600 mb-4 block">how_to_reg</span>
              <h3 className="text-lg font-bold font-headline text-on-surface mb-2">No POD Records Yet</h3>
              <p className="text-sm text-slate-500 mb-6">Create a POD after delivery is completed.</p>
              <Link
                to="/pod/new"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
              >
                <span className="material-symbols-outlined text-lg">add</span>
                Create First POD
              </Link>
            </div>
          ) : (
            <div className="glass-panel rounded-2xl overflow-hidden shadow-lg border border-slate-200/50 bg-white dark:bg-slate-800">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 dark:bg-slate-900/30 border-b border-slate-200 dark:border-slate-700 text-slate-500">
                      <th className="py-4 px-6 font-bold uppercase text-xs tracking-wider">POD Number</th>
                      <th className="py-4 px-6 font-bold uppercase text-xs tracking-wider">Related SJ</th>
                      <th className="py-4 px-6 font-bold uppercase text-xs tracking-wider">Destination</th>
                      <th className="py-4 px-6 font-bold uppercase text-xs tracking-wider">Received By</th>
                      <th className="py-4 px-6 font-bold uppercase text-xs tracking-wider">Date</th>
                      <th className="py-4 px-6 font-bold uppercase text-xs tracking-wider">Photos</th>
                      <th className="py-4 px-6 font-bold uppercase text-xs tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                    {podList.map((pod) => (
                      <tr key={pod.id} className="hover:bg-primary/5 dark:hover:bg-primary/5 transition-colors cursor-pointer">
                        <td className="py-4 px-6">
                          <div className="font-bold text-on-surface font-mono">{pod.number}</div>
                        </td>
                        <td className="py-4 px-6">
                          <Link to={`/sj/${pod.sjNumber}`} className="text-primary font-bold underline hover:text-[#3a533a]">{pod.sjNumber}</Link>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-on-surface font-medium">{pod.sjDestination}</div>
                          <div className="text-xs text-slate-400">{pod.sjClient}</div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-on-surface">{pod.receiverName || '-'}</div>
                          <div className="text-xs text-slate-400">{pod.receiverTitle || ''}</div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-xs text-slate-500">
                            {pod.receivedAt ? new Date(pod.receivedAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-1">
                            {pod.photoCount > 0 ? (
                              <>
                                <span className="material-symbols-outlined text-primary text-[18px]">photo</span>
                                <span className="text-sm font-bold text-primary">{pod.photoCount}</span>
                              </>
                            ) : (
                              <span className="text-xs text-slate-400">-</span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <StatusBadge status={pod.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
