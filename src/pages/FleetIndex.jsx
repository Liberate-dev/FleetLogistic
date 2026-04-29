import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import StatusBadge from '../components/ui/StatusBadge';
import { useFleetOps } from '../context';
import { expiryTracker } from '../utils';
import { VEHICLE_STATUS } from '../constants';

const VEHICLE_CONFIG = {
  [VEHICLE_STATUS.ACTIVE]: { label: 'Ready', color: 'bg-primary/10 text-primary', icon: 'check_circle' },
  [VEHICLE_STATUS.IN_USE]: { label: 'In Use', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: 'moving' },
  [VEHICLE_STATUS.MAINTENANCE]: { label: 'Maintenance', color: 'bg-error/10 text-error', icon: 'build' },
  [VEHICLE_STATUS.INACTIVE]: { label: 'Inactive', color: 'bg-error/10 text-error', icon: 'cancel' },
};

export default function FleetIndex() {
  const { fleet, checklists, dispatches } = useFleetOps();

  // Sample fleet data if context is empty
  const fleetData = fleet.length > 0 ? fleet : [
    { id: 'TRK-001', plate: 'B 9102 UXA', model: 'Scania R500', type: 'Tronton', status: VEHICLE_STATUS.ACTIVE, capacity: 25, year: 2022 },
    { id: 'TRK-002', plate: 'D 8831 XYZ', model: 'Isuzu Giga', type: 'Engkel', status: VEHICLE_STATUS.ACTIVE, capacity: 10, year: 2021 },
    { id: 'TRK-003', plate: 'B 1120 ABC', model: 'Mitsubishi Fuso', type: 'Fuso', status: VEHICLE_STATUS.MAINTENANCE, capacity: 15, year: 2020 },
  ];

  // Summary stats
  const stats = useMemo(() => ({
    total: fleetData.length,
    ready: fleetData.filter(t => t.status === VEHICLE_STATUS.ACTIVE).length,
    inUse: fleetData.filter(t => t.status === VEHICLE_STATUS.IN_USE).length,
    maintenance: fleetData.filter(t => t.status === VEHICLE_STATUS.MAINTENANCE).length,
    inactive: fleetData.filter(t => t.status === VEHICLE_STATUS.INACTIVE).length,
  }), [fleetData]);

  // Maintenance tickets (from checklists with "Tidak Layak" findings)
  const maintenanceTickets = useMemo(() => {
    const tickets = [];
    checklists.forEach(cl => {
      Object.entries(cl.itemValues || {}).forEach(([catId, items]) => {
        Object.entries(items).forEach(([itemId, val]) => {
          if (val.status === 'TIDAK LAYAK') {
            tickets.push({
              id: `MT-${cl.id}-${itemId}`,
              vehiclePlate: cl.vehiclePlate,
              vehicleId: cl.vehiclePlate,
              checklistId: cl.id,
              itemLabel: itemId,
              notes: val.notes || '',
              reportedAt: cl.completedAt || cl.date,
              status: 'Open',
            });
          }
        });
      });
    });
    return tickets;
  }, [checklists]);

  // Document expiry alerts
  const expiryAlerts = useMemo(() => {
    return expiryTracker.checkExpiries();
  }, []);

  return (
    <Layout>
      <div className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10 animate-fade-in no-scrollbar bg-slate-50/50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
            <div>
              <h2 className="text-3xl font-extrabold font-headline tracking-tight text-on-surface">Fleet Management</h2>
              <p className="text-slate-500 font-body mt-1">Overview of all registered vehicles, document compliance, and maintenance.</p>
            </div>
            <Link
              to="/fleet/new"
              className="px-6 py-2.5 bg-gradient-to-r from-primary to-primary-container text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all hover:-translate-y-1 active:scale-95 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              <span>Register Truck</span>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="glass-panel p-4 rounded-xl border border-slate-200/50 bg-white dark:bg-slate-800">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-slate-500 text-[20px]">local_shipping</span>
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
                <span className="material-symbols-outlined text-secondary text-[20px]">moving</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">In Use</span>
              </div>
              <p className="text-2xl font-black font-headline text-secondary">{stats.inUse}</p>
            </div>
            <div className="glass-panel p-4 rounded-xl border border-slate-200/50 bg-white dark:bg-slate-800">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-error text-[20px]">build</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Maintenance</span>
              </div>
              <p className="text-2xl font-black font-headline text-error">{stats.maintenance}</p>
            </div>
            <div className="glass-panel p-4 rounded-xl border border-slate-200/50 bg-white dark:bg-slate-800">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-amber-600 text-[20px]">cancel</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Inactive</span>
              </div>
              <p className="text-2xl font-black font-headline text-amber-600">{stats.inactive}</p>
            </div>
          </div>

          {/* Document Expiry Alerts (F-FL-01) */}
          {expiryAlerts.length > 0 && (
            <div className="glass-panel rounded-2xl p-6 border border-error/20 bg-error/5">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-error">warning</span>
                <h3 className="text-sm font-bold font-headline text-error">Document Expiry Alerts</h3>
              </div>
              <div className="space-y-2">
                {expiryAlerts.map((alert, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-xl border border-error/20">
                    <div>
                      <p className="text-sm font-bold text-on-surface">{alert.message}</p>
                      <p className="text-xs text-slate-500">{alert.docType} — {alert.documentNumber}</p>
                    </div>
                    <span className={`px-2 py-1 text-[10px] uppercase font-bold rounded-md ${
                      alert.severity === 'critical' ? 'bg-error/10 text-error' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {alert.severity === 'critical' ? 'Expired' : `${alert.daysUntilExpiry} days`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Maintenance Tickets (F-FL-02) */}
          {maintenanceTickets.length > 0 && (
            <div className="glass-panel rounded-2xl p-6 border border-amber-200/50 bg-amber-50/50 dark:bg-amber-900/10">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-amber-600">build_circle</span>
                <h3 className="text-sm font-bold font-headline text-amber-700 dark:text-amber-400">Maintenance Tickets</h3>
                <span className="ml-auto text-xs font-bold text-amber-600">{maintenanceTickets.length} Open</span>
              </div>
              <div className="space-y-2">
                {maintenanceTickets.slice(0, 5).map(ticket => (
                  <div key={ticket.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-xl border border-amber-200 dark:border-amber-800">
                    <div>
                      <p className="text-sm font-bold text-on-surface">{ticket.id}</p>
                      <p className="text-xs text-slate-500">{ticket.vehiclePlate} — {ticket.itemLabel}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">
                        {ticket.reportedAt ? new Date(ticket.reportedAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) : '-'}
                      </span>
                      <span className="px-2 py-1 text-[10px] uppercase font-bold rounded-md bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                        {ticket.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fleet Table */}
          <div className="glass-panel rounded-2xl overflow-hidden shadow-lg border border-slate-200/50 bg-white dark:bg-slate-800">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-900/30 border-b border-slate-200 dark:border-slate-700 text-slate-500">
                    <th className="py-4 px-6 font-bold uppercase text-xs tracking-wider">Asset ID</th>
                    <th className="py-4 px-6 font-bold uppercase text-xs tracking-wider">Plate</th>
                    <th className="py-4 px-6 font-bold uppercase text-xs tracking-wider">Make/Model</th>
                    <th className="py-4 px-6 font-bold uppercase text-xs tracking-wider">Type</th>
                    <th className="py-4 px-6 font-bold uppercase text-xs tracking-wider">Status</th>
                    <th className="py-4 px-6 font-bold uppercase text-xs tracking-wider">Capacity</th>
                    <th className="py-4 px-6 font-bold uppercase text-xs tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {fleetData.map((item, i) => (
                    <tr key={item.id} className="hover:bg-primary/5 dark:hover:bg-primary/5 transition-colors cursor-pointer">
                      <td className="py-4 px-6 font-bold text-on-surface font-mono">{item.id}</td>
                      <td className="py-4 px-6 font-bold text-on-surface">{item.plate}</td>
                      <td className="py-4 px-6 text-on-surface">{item.model}</td>
                      <td className="py-4 px-6 text-slate-500">{item.type}</td>
                      <td className="py-4 px-6">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="py-4 px-6 text-slate-500">{item.capacity}T</td>
                      <td className="py-4 px-6 text-right">
                        <Link to={`/fleet/${item.id}`} className="text-primary hover:text-[#3a533a] font-bold text-xs">
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
