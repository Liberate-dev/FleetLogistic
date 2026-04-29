import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import StatusBadge from '../components/ui/StatusBadge';
import { useFleetOps } from '../context';

const LPJ_STATUS_CONFIG = {
  PENDING: { label: 'Pending Review', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: 'pending' },
  APPROVED: { label: 'Approved', color: 'bg-primary/10 text-primary', icon: 'check_circle' },
  REJECTED: { label: 'Rejected', color: 'bg-error/10 text-error', icon: 'cancel' },
};

export default function LPJIndex() {
  const { lpjRecords, suratJalan } = useFleetOps();

  const lpjList = useMemo(() => {
    return lpjRecords.map(lpj => {
      const sj = suratJalan.find(s => s.number === lpj.sjNumber);
      return {
        ...lpj,
        sjDestination: sj?.destination || '-',
        sjClient: sj?.clientName || '-',
      };
    });
  }, [lpjRecords, suratJalan]);

  // Summary stats
  const stats = useMemo(() => ({
    total: lpjList.length,
    pending: lpjList.filter(l => l.status === 'PENDING').length,
    approved: lpjList.filter(l => l.status === 'APPROVED').length,
    rejected: lpjList.filter(l => l.status === 'REJECTED').length,
  }), [lpjList]);

  const totalExpenses = useMemo(() =>
    lpjList.reduce((sum, lpj) => sum + (lpj.totalAmount || 0), 0),
    [lpjList]
  );

  const formatCurrency = (val) => `Rp ${Number(val || 0).toLocaleString('id-ID')}`;

  return (
    <Layout>
      <div className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10 animate-fade-in no-scrollbar bg-slate-50/50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
            <div>
              <h2 className="text-3xl font-extrabold font-headline tracking-tight text-on-surface">Laporan Pertanggungjawaban</h2>
              <p className="text-slate-500 font-body mt-1">Laporan keuangan operasional setiap pengiriman.</p>
            </div>
            <Link
              to="/lpj/new"
              className="px-6 py-2.5 bg-gradient-to-r from-primary to-primary-container text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2 hover:-translate-y-0.5"
            >
              <span className="material-symbols-outlined text-lg">receipt_long</span>
              <span>New LPJ</span>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-panel p-4 rounded-xl border border-slate-200/50 bg-white dark:bg-slate-800">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-primary text-[20px]">account_balance_wallet</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total LPJ</span>
              </div>
              <p className="text-2xl font-black font-headline text-on-surface">{stats.total}</p>
            </div>
            <div className="glass-panel p-4 rounded-xl border border-slate-200/50 bg-white dark:bg-slate-800">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-amber-600 text-[20px]">pending</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pending</span>
              </div>
              <p className="text-2xl font-black font-headline text-amber-600">{stats.pending}</p>
            </div>
            <div className="glass-panel p-4 rounded-xl border border-slate-200/50 bg-white dark:bg-slate-800">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Approved</span>
              </div>
              <p className="text-2xl font-black font-headline text-primary">{stats.approved}</p>
            </div>
            <div className="glass-panel p-4 rounded-xl border border-slate-200/50 bg-white dark:bg-slate-800">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-error text-[20px]">cancel</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Rejected</span>
              </div>
              <p className="text-2xl font-black font-headline text-error">{stats.rejected}</p>
            </div>
          </div>

          {/* Total Expenses Summary */}
          {totalExpenses > 0 && (
            <div className="glass-panel rounded-2xl p-6 bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-2xl">payments</span>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Expenses Reported</p>
                    <p className="text-2xl font-black font-headline text-on-surface">{formatCurrency(totalExpenses)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* LPJ Table */}
          {lpjList.length === 0 ? (
            <div className="glass-panel rounded-2xl p-12 text-center border border-slate-200/50 bg-white dark:bg-slate-800">
              <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600 mb-4 block">receipt_long</span>
              <h3 className="text-lg font-bold font-headline text-on-surface mb-2">No LPJ Records Yet</h3>
              <p className="text-sm text-slate-500 mb-6">Create an LPJ after delivery is completed to report operational expenses.</p>
              <Link
                to="/lpj/new"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
              >
                <span className="material-symbols-outlined text-lg">add</span>
                Create First LPJ
              </Link>
            </div>
          ) : (
            <div className="glass-panel rounded-2xl overflow-hidden shadow-lg border border-slate-200/50 bg-white dark:bg-slate-800">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 dark:bg-slate-900/30 border-b border-slate-200 dark:border-slate-700 text-slate-500">
                      <th className="py-4 px-6 font-bold uppercase text-xs tracking-wider">LPJ Number</th>
                      <th className="py-4 px-6 font-bold uppercase text-xs tracking-wider">Related SJ</th>
                      <th className="py-4 px-6 font-bold uppercase text-xs tracking-wider">Destination</th>
                      <th className="py-4 px-6 font-bold uppercase text-xs tracking-wider">Driver</th>
                      <th className="py-4 px-6 font-bold uppercase text-xs tracking-wider">Total Amount</th>
                      <th className="py-4 px-6 font-bold uppercase text-xs tracking-wider">Receipts</th>
                      <th className="py-4 px-6 font-bold uppercase text-xs tracking-wider">Status</th>
                      <th className="py-4 px-6 font-bold uppercase text-xs tracking-wider">Submitted</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                    {lpjList.map((lpj) => (
                      <tr key={lpj.id} className="hover:bg-primary/5 dark:hover:bg-primary/5 transition-colors cursor-pointer">
                        <td className="py-4 px-6">
                          <div className="font-bold text-on-surface font-mono">{lpj.number}</div>
                        </td>
                        <td className="py-4 px-6">
                          <Link to={`/sj/${lpj.sjNumber}`} className="text-primary font-bold underline hover:text-[#3a533a]">{lpj.sjNumber}</Link>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-on-surface font-medium">{lpj.sjDestination}</div>
                        </td>
                        <td className="py-4 px-6 text-on-surface">{lpj.driverName || '-'}</td>
                        <td className="py-4 px-6">
                          <div className="font-bold text-on-surface">{formatCurrency(lpj.totalAmount)}</div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-1">
                            {lpj.receiptCount > 0 ? (
                              <>
                                <span className="material-symbols-outlined text-primary text-[18px]">receipt</span>
                                <span className="text-sm font-bold text-primary">{lpj.receiptCount}</span>
                              </>
                            ) : (
                              <span className="text-xs text-slate-400">-</span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <StatusBadge status={lpj.status} />
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-xs text-slate-500">
                            {lpj.submittedAt ? new Date(lpj.submittedAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                          </div>
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
