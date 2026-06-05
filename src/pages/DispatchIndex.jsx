import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import StatusBadge from '../components/ui/StatusBadge';
import { useFleetOps } from '../context';
import { DISPATCH_STATUS } from '../constants';

const STATUS_CONFIG = {
  [DISPATCH_STATUS.PLANNED]: { color: 'slate', icon: 'calendar_today', label: 'Planned' },
  [DISPATCH_STATUS.READY]: { color: 'primary', icon: 'check_circle', label: 'Ready' },
  [DISPATCH_STATUS.DISPATCHED]: { color: 'secondary', icon: 'departure_board', label: 'Dispatched' },
  [DISPATCH_STATUS.IN_TRANSIT]: { color: 'amber', icon: 'local_shipping', label: 'In Transit' },
  [DISPATCH_STATUS.DELIVERED]: { color: 'tertiary', icon: 'fact_check', label: 'Delivered' },
  [DISPATCH_STATUS.COMPLETED]: { color: 'slate', icon: 'task_alt', label: 'Completed' },
  [DISPATCH_STATUS.CANCELLED]: { color: 'error', icon: 'cancel', label: 'Cancelled' },
};

const PRIORITY_CONFIG = {
  standard: { label: 'Standard', color: 'slate', icon: 'schedule' },
  high: { label: 'High', color: 'primary', icon: 'priority_high' },
  critical: { label: 'Critical', color: 'error', icon: 'bolt' },
};

export default function DispatchIndex() {
  const navigate = useNavigate();
  const { dispatches, suratJalan } = useFleetOps();

  const dispatchList = useMemo(() => {
    return dispatches.map(d => {
      const sj = suratJalan.find(s => s.number === d.sjNumber);
      return {
        ...d,
        sjDestination: sj?.destination || '-',
        sjClient: sj?.clientName || '-',
        statusConfig: STATUS_CONFIG[d.status] || STATUS_CONFIG[DISPATCH_STATUS.PLANNED],
        priorityConfig: PRIORITY_CONFIG[d.priority] || PRIORITY_CONFIG.standard,
      };
    });
  }, [dispatches, suratJalan]);

  // Summary stats
  const stats = useMemo(() => ({
    total: dispatchList.length,
    ready: dispatchList.filter(d => d.status === DISPATCH_STATUS.READY).length,
    inTransit: dispatchList.filter(d => d.status === DISPATCH_STATUS.IN_TRANSIT).length,
    completed: dispatchList.filter(d => d.status === DISPATCH_STATUS.COMPLETED).length,
  }), [dispatchList]);

  return (
    <Layout>
      <div className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10 animate-fade-in no-scrollbar bg-slate-50/50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
            <div>
              <h2 className="text-3xl font-extrabold font-headline tracking-tight text-on-surface">Dispatch Planning</h2>
              <p className="text-slate-500 font-body mt-1">Assign unassigned Surat Jalan to fleet vehicles and monitor execution.</p>
            </div>
            <Link
              to="/dispatch/new"
              className="px-6 py-2.5 bg-gradient-to-r from-primary to-primary-container text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2 hover:-translate-y-0.5"
            >
              <span className="material-symbols-outlined text-lg">alt_route</span>
              <span>New Dispatch</span>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-panel p-4 rounded-xl border border-slate-200/50 bg-white dark:bg-slate-800">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-primary text-[20px]">route</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total</span>
              </div>
              <p className="text-2xl font-black font-headline text-on-surface">{stats.total}</p>
            </div>
            <div className="glass-panel p-4 rounded-xl border border-slate-200/50 bg-white dark:bg-slate-800">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ready</span>
              </div>
              <p className="text-2xl font-black font-headline text-primary">{stats.ready}</p>
            </div>
            <div className="glass-panel p-4 rounded-xl border border-slate-200/50 bg-white dark:bg-slate-800">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-secondary text-[20px]">local_shipping</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">In Transit</span>
              </div>
              <p className="text-2xl font-black font-headline text-secondary">{stats.inTransit}</p>
            </div>
            <div className="glass-panel p-4 rounded-xl border border-slate-200/50 bg-white dark:bg-slate-800">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-slate-500 text-[20px]">task_alt</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Completed</span>
              </div>
              <p className="text-2xl font-black font-headline text-slate-500">{stats.completed}</p>
            </div>
          </div>

          {/* Dispatch Table */}
          {dispatchList.length === 0 ? (
            <div className="glass-panel rounded-2xl p-12 text-center border border-slate-200/50 bg-white dark:bg-slate-800">
              <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600 mb-4 block">local_shipping</span>
              <h3 className="text-lg font-bold font-headline text-on-surface mb-2">No Dispatches Yet</h3>
              <p className="text-sm text-slate-500 mb-6">Create your first dispatch by assigning a Surat Jalan to a vehicle and driver.</p>
              <Link
                to="/dispatch/new"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
              >
                <span className="material-symbols-outlined text-lg">add</span>
                Create First Dispatch
              </Link>
            </div>
          ) : (
            <div className="glass-panel rounded-2xl overflow-hidden shadow-lg border border-slate-200/50 bg-white dark:bg-slate-800">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 dark:bg-slate-900/30 border-b border-slate-200 dark:border-slate-700 text-slate-500">
                      <th className="py-4 px-6 font-bold uppercase text-xs tracking-wider">Dispatch ID</th>
                      <th className="py-4 px-6 font-bold uppercase text-xs tracking-wider">Related SJ</th>
                      <th className="py-4 px-6 font-bold uppercase text-xs tracking-wider">Destination</th>
                      <th className="py-4 px-6 font-bold uppercase text-xs tracking-wider">Truck</th>
                      <th className="py-4 px-6 font-bold uppercase text-xs tracking-wider">Driver</th>
                      <th className="py-4 px-6 font-bold uppercase text-xs tracking-wider">Created By</th>
                      <th className="py-4 px-6 font-bold uppercase text-xs tracking-wider">Priority</th>
                      <th className="py-4 px-6 font-bold uppercase text-xs tracking-wider">Status</th>
                      <th className="py-4 px-6 font-bold uppercase text-xs tracking-wider">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                    {dispatchList.map((item, i) => {
                      const sj = suratJalan.find(s => s.number === item.sjNumber);
                      return (
                        <tr key={item.id} onClick={() => navigate(`/dispatch/${item.id}`)} className="hover:bg-primary/5 dark:hover:bg-primary/5 transition-colors cursor-pointer">
                          <td className="py-4 px-6">
                            <div className="font-bold text-on-surface font-mono">{item.number}</div>
                          </td>
                          <td className="py-4 px-6">
                            <Link to={`/sj/${item.sjNumber}`} className="text-primary font-bold underline hover:text-[#3a533a]">{item.sjNumber}</Link>
                          </td>
                          <td className="py-4 px-6">
                            <div className="text-on-surface font-medium">{item.sjDestination}</div>
                            <div className="text-xs text-slate-400">{item.sjClient}</div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="font-bold text-on-surface font-mono">{item.truckPlate}</div>
                            <div className="text-xs text-slate-400">{item.truckId}</div>
                          </td>
                          <td className="py-4 px-6 text-on-surface">{item.driverName}</td>
                          <td className="py-4 px-6">
                            <div className="text-sm text-on-surface">{sj?.createdByName || '-'}</div>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 text-[10px] uppercase font-bold rounded-md ${
                              item.priority === 'critical' ? 'bg-error/10 text-error border border-error/20' :
                              item.priority === 'high' ? 'bg-primary/10 text-primary border border-primary/20' :
                              'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600'
                            }`}>
                              <span className="material-symbols-outlined text-[12px]">{item.priorityConfig.icon}</span>
                              {item.priorityConfig.label}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <StatusBadge status={item.status} />
                          </td>
                          <td className="py-4 px-6">
                            <div className="text-xs text-slate-500">
                              {item.createdAt ? new Date(item.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
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
