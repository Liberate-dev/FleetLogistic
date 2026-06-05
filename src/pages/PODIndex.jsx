import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

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
      <div className="flex-1 flex flex-col relative w-full overflow-hidden">
        {/* Main Container - Edge to Edge on Mobile */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden relative z-10 animate-fade-in no-scrollbar bg-slate-100 dark:bg-slate-950 sm:bg-slate-50/50 sm:dark:bg-slate-900/50">
          <div className="max-w-7xl mx-auto flex flex-col gap-2 sm:gap-8 pb-24 sm:pb-8 sm:p-4 md:p-8 pt-0 sm:pt-4 w-full">

            {/* Header Section */}
            <div className="bg-white dark:bg-slate-900 sm:bg-transparent px-4 py-5 sm:p-0 flex flex-col md:flex-row justify-between md:items-end gap-4 shadow-sm sm:shadow-none">
              <div>
                <h2 className="text-xl sm:text-3xl font-extrabold font-headline tracking-tight text-on-surface">Proof of Delivery</h2>
                <p className="text-[13px] sm:text-sm text-slate-500 font-body mt-1">Serah terima barang dan bukti pengiriman.</p>
              </div>
              {/* Desktop New POD Button */}
              <Link
                to="/pod/new"
                className="hidden sm:flex px-6 py-2.5 bg-gradient-to-r from-primary to-primary-container text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all items-center gap-2 hover:-translate-y-0.5"
              >
                <span className="material-symbols-outlined text-lg">add_circle</span>
                <span>New POD</span>
              </Link>
            </div>

            {/* Stats Section - Horizontal Scroll on Mobile */}
            <div className="bg-white dark:bg-slate-900 sm:bg-transparent py-4 sm:py-0 shadow-sm sm:shadow-none max-w-full">
              <div className="flex overflow-x-auto sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 px-4 sm:px-0 no-scrollbar snap-x snap-mandatory">
                {/* Stat Card 1 */}
                <div className="min-w-[140px] sm:min-w-0 snap-start flex-shrink-0 bg-slate-50 dark:bg-slate-800/50 sm:glass-panel p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50 sm:bg-white">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-primary text-[20px]">receipt_long</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total POD</span>
                  </div>
                  <p className="text-2xl font-black font-headline text-on-surface">{stats.total}</p>
                </div>
                {/* Stat Card 2 */}
                <div className="min-w-[140px] sm:min-w-0 snap-start flex-shrink-0 bg-slate-50 dark:bg-slate-800/50 sm:glass-panel p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50 sm:bg-white">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Received</span>
                  </div>
                  <p className="text-2xl font-black font-headline text-primary">{stats.received}</p>
                </div>
                {/* Stat Card 3 */}
                <div className="min-w-[140px] sm:min-w-0 snap-start flex-shrink-0 bg-slate-50 dark:bg-slate-800/50 sm:glass-panel p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50 sm:bg-white">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-error text-[20px]">warning</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Discrepancy</span>
                  </div>
                  <p className="text-2xl font-black font-headline text-error">{stats.discrepancy}</p>
                </div>
                {/* Stat Card 4 */}
                <div className="min-w-[140px] sm:min-w-0 snap-start flex-shrink-0 bg-slate-50 dark:bg-slate-800/50 sm:glass-panel p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50 sm:bg-white">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-amber-600 text-[20px]">pending_actions</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pending</span>
                  </div>
                  <p className="text-2xl font-black font-headline text-amber-600">{stats.pending}</p>
                </div>
              </div>
            </div>

            {/* Pending PODs (Delivered SJ without POD) */}
            {pendingPODs.length > 0 && (
              <div className="bg-white dark:bg-slate-900 sm:glass-panel sm:rounded-2xl p-4 sm:p-6 sm:border border-amber-200/50 sm:bg-amber-50/50 sm:dark:bg-amber-900/10 shadow-sm sm:shadow-none">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-amber-600">pending_actions</span>
                  <h3 className="text-sm font-bold font-headline text-amber-700 dark:text-amber-400">Menunggu POD ({pendingPODs.length})</h3>
                </div>
                <div className="flex flex-col gap-3">
                  {pendingPODs.map(sj => (
                    <div key={sj.number} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-amber-50/30 dark:bg-slate-800 rounded-xl border border-amber-100 dark:border-amber-800 gap-3 sm:gap-0">
                      <div>
                        <p className="text-sm font-bold text-on-surface">{sj.number}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{sj.destination} — {sj.clientName}</p>
                      </div>
                      <Link
                        to={`/pod/new?sj=${sj.number}`}
                        className="w-full sm:w-auto px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-[13px] font-bold transition-colors flex items-center justify-center gap-1.5 active:scale-[0.98]"
                      >
                        <span className="material-symbols-outlined text-[16px]">add</span>
                        Buat POD
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* POD Records Area */}
            {podList.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 sm:glass-panel sm:rounded-2xl p-8 sm:p-12 text-center sm:border border-slate-200/50 shadow-sm sm:shadow-none mx-4 sm:mx-0 rounded-2xl sm:rounded-none mt-2 sm:mt-0">
                <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600 mb-4 block">how_to_reg</span>
                <h3 className="text-lg font-bold font-headline text-on-surface mb-2">Belum Ada Data POD</h3>
                <p className="text-[13px] sm:text-sm text-slate-500 mb-6">Buat POD setelah pengiriman selesai.</p>
                <Link
                  to="/pod/new"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
                >
                  <span className="material-symbols-outlined text-lg">add</span>
                  Buat POD Pertama
                </Link>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block glass-panel rounded-2xl overflow-hidden shadow-sm border border-slate-200/50 bg-white dark:bg-slate-800 max-w-full">
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
                          <tr key={pod.id} onClick={() => navigate(`/pod/${pod.sjNumber}`)} className="hover:bg-primary/5 dark:hover:bg-primary/5 transition-colors cursor-pointer">
                            <td className="py-4 px-6">
                              <div className="font-bold text-on-surface font-mono">{pod.number}</div>
                            </td>
                            <td className="py-4 px-6">
                              <span className="text-primary font-bold">{pod.sjNumber}</span>
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

                {/* Mobile List View */}
                <div className="md:hidden flex flex-col bg-white dark:bg-slate-900 shadow-sm sm:shadow-none sm:bg-transparent">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 sticky top-0 z-10 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Daftar POD ({podList.length})</span>
                    <span className="material-symbols-outlined text-[16px] text-slate-400">filter_list</span>
                  </div>
                  {podList.map(pod => (
                    <div key={pod.id} onClick={() => navigate(`/pod/${pod.sjNumber}`)} className="p-4 border-b border-slate-100 dark:border-slate-800 active:bg-slate-50 dark:active:bg-slate-800/50 transition-colors cursor-pointer relative overflow-hidden">
                      {/* Status accent line */}
                      <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                        pod.status === 'POD RECEIVED' ? 'bg-primary' : 
                        pod.status === 'POD DISCREPANCY' ? 'bg-error' : 'bg-amber-400'
                      }`}></div>
                      
                      <div className="flex justify-between items-start mb-2.5 pl-1">
                        <div>
                          <h4 className="font-bold text-[15px] font-mono text-on-surface">{pod.number}</h4>
                          <p className="text-[12px] text-primary font-bold mt-0.5">{pod.sjNumber}</p>
                        </div>
                        <div>
                          <StatusBadge status={pod.status} />
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-end pl-1 mt-3 bg-slate-50/50 dark:bg-slate-800/30 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700/50">
                        <div>
                          <p className="text-[13px] font-bold text-on-surface line-clamp-1">{pod.sjDestination}</p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="material-symbols-outlined text-[14px] text-slate-400">person</span>
                            <p className="text-[11px] text-slate-500">{pod.receiverName || 'Belum ada penerima'}</p>
                          </div>
                        </div>
                        <div className="text-[11px] text-slate-500 text-right shrink-0">
                          <div className="flex items-center justify-end gap-1 mb-1">
                            <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                            <span>{pod.receivedAt ? new Date(pod.receivedAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) : '-'}</span>
                          </div>
                          {pod.photoCount > 0 && (
                            <div className="flex items-center justify-end gap-1 text-primary bg-primary/10 px-1.5 py-0.5 rounded-md w-max ml-auto">
                              <span className="material-symbols-outlined text-[12px]">photo</span>
                              <span className="font-bold text-[10px]">{pod.photoCount} foto</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

          </div>
        </div>

        {/* Mobile Floating Action Button */}
        <Link
          to="/pod/new"
          className="sm:hidden absolute bottom-6 right-6 w-[56px] h-[56px] bg-primary text-white rounded-[18px] shadow-[0_8px_25px_-5px_rgba(70,99,71,0.5)] flex items-center justify-center z-50 hover:bg-[#3a533a] active:scale-[0.95] transition-all"
        >
          <span className="material-symbols-outlined text-[28px]">add</span>
        </Link>
      </div>
    </Layout>
  );
}
