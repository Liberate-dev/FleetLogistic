import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import StatusBadge from '../components/ui/StatusBadge';
import { useFleetOps } from '../context';
import { expiryTracker } from '../utils';
import { USER_ROLES } from '../constants';

const DRIVER_STATUS = {
  AVAILABLE: { label: 'Available', color: 'bg-primary/10 text-primary', icon: 'check_circle' },
  ON_DISPATCH: { label: 'On Dispatch', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: 'local_shipping' },
  ON_LEAVE: { label: 'On Leave', color: 'bg-slate-100 text-slate-500', icon: 'pause_circle' },
  SIM_EXPIRED: { label: 'SIM Expired', color: 'bg-error/10 text-error', icon: 'block' },
};

export default function UserIndex() {
  const { drivers, dispatches } = useFleetOps();

  // Sample drivers if context is empty
  const driverData = drivers.length > 0 ? drivers : [
    { id: 'DRV-001', name: 'Sudirman P.', sim: 'B2', simExpiry: '2027-06-15', simNumber: 'SIM-2022-001', phone: '081234567890', status: 'AVAILABLE', joinDate: '2022-01-15' },
    { id: 'DRV-002', name: 'Agus M.', sim: 'C', simExpiry: '2026-12-01', simNumber: 'SIM-2021-045', phone: '081234567891', status: 'AVAILABLE', joinDate: '2021-06-20' },
    { id: 'DRV-003', name: 'Budi S.', sim: 'B2', simExpiry: '2026-03-01', simNumber: 'SIM-2021-012', phone: '081234567892', status: 'ON_DISPATCH', joinDate: '2021-03-10' },
    { id: 'DRV-004', name: 'Rudi H.', sim: 'C', simExpiry: '2026-04-10', simNumber: 'SIM-2021-033', phone: '081234567893', status: 'ON_LEAVE', joinDate: '2021-09-05' },
  ];

  // System users (non-drivers)
  const systemUsers = [
    { id: 'USR-001', name: 'Alex Sterling', email: 'alex@fleetops.co', role: USER_ROLES.SUPER_ADMIN, lastActive: '2 mins ago', status: 'Active' },
    { id: 'USR-002', name: 'Sarah Jenkins', email: 'sarah@fleetops.co', role: USER_ROLES.DISPATCHER, lastActive: '1 hour ago', status: 'Active' },
    { id: 'USR-003', name: 'Priya Patel', email: 'priya@fleetops.co', role: USER_ROLES.FINANCE, lastActive: 'Yesterday', status: 'Active' },
  ];

  // Check SIM expiry for each driver
  const driversWithSimStatus = useMemo(() => {
    return driverData.map(d => {
      const simValid = expiryTracker.isEntityValid(d.id, 'driver');
      const earliestExpiry = expiryTracker.getEarliestExpiry(d.id, 'driver');
      const simExpiryDate = new Date(d.simExpiry);
      const daysUntilExpiry = Math.ceil((simExpiryDate - new Date()) / (1000 * 60 * 60 * 24));

      let computedStatus = d.status;
      if (daysUntilExpiry <= 0) {
        computedStatus = 'SIM_EXPIRED';
      }

      return {
        ...d,
        simValid: simValid !== false,
        daysUntilExpiry,
        earliestExpiry,
        computedStatus,
        statusConfig: DRIVER_STATUS[computedStatus] || DRIVER_STATUS.AVAILABLE,
      };
    });
  }, []);

  // SIM expiry alerts
  const simAlerts = useMemo(() => {
    return driversWithSimStatus.filter(d => d.daysUntilExpiry <= 30 && d.daysUntilExpiry > -Infinity);
  }, [driversWithSimStatus]);

  // Dispatch blocking: drivers with expired SIM cannot be assigned
  const blockedDrivers = useMemo(() => {
    return driversWithSimStatus.filter(d => d.computedStatus === 'SIM_EXPIRED');
  }, [driversWithSimStatus]);

  // Stats
  const stats = useMemo(() => ({
    totalDrivers: driverData.length,
    available: driversWithSimStatus.filter(d => d.computedStatus === 'AVAILABLE').length,
    onDispatch: driversWithSimStatus.filter(d => d.computedStatus === 'ON_DISPATCH').length,
    simExpired: driversWithSimStatus.filter(d => d.computedStatus === 'SIM_EXPIRED').length,
    simExpiringSoon: driversWithSimStatus.filter(d => d.daysUntilExpiry > 0 && d.daysUntilExpiry <= 30).length,
  }), [driversWithSimStatus]);

  return (
    <Layout>
      <div className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10 animate-fade-in no-scrollbar bg-slate-50/50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
            <div>
              <h2 className="text-3xl font-extrabold font-headline tracking-tight text-on-surface">User & Driver Management</h2>
              <p className="text-slate-500 font-body mt-1">Manage personnel, driver SIM tracking, and dispatch eligibility.</p>
            </div>
            <div className="flex gap-3">
              <Link
                to="/users/new"
                className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">person_add</span>
                <span>Create User</span>
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="glass-panel p-4 rounded-xl border border-slate-200/50 bg-white dark:bg-slate-800">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-slate-500 text-[20px]">people</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Drivers</span>
              </div>
              <p className="text-2xl font-black font-headline text-on-surface">{stats.totalDrivers}</p>
            </div>
            <div className="glass-panel p-4 rounded-xl border border-slate-200/50 bg-white dark:bg-slate-800">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Available</span>
              </div>
              <p className="text-2xl font-black font-headline text-primary">{stats.available}</p>
            </div>
            <div className="glass-panel p-4 rounded-xl border border-slate-200/50 bg-white dark:bg-slate-800">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-secondary text-[20px]">local_shipping</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">On Dispatch</span>
              </div>
              <p className="text-2xl font-black font-headline text-secondary">{stats.onDispatch}</p>
            </div>
            <div className="glass-panel p-4 rounded-xl border border-slate-200/50 bg-white dark:bg-slate-800">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-amber-600 text-[20px]">warning</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Expiring Soon</span>
              </div>
              <p className="text-2xl font-black font-headline text-amber-600">{stats.simExpiringSoon}</p>
            </div>
            <div className="glass-panel p-4 rounded-xl border border-slate-200/50 bg-white dark:bg-slate-800">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-error text-[20px]">block</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">SIM Expired</span>
              </div>
              <p className="text-2xl font-black font-headline text-error">{stats.simExpired}</p>
            </div>
          </div>

          {/* SIM Expiry Alerts (F-UM-01) */}
          {simAlerts.length > 0 && (
            <div className={`glass-panel rounded-2xl p-6 border ${
              blockedDrivers.length > 0 ? 'border-error/20 bg-error/5' : 'border-amber-200/50 bg-amber-50/50 dark:bg-amber-900/10'
            }`}>
              <div className="flex items-center gap-2 mb-4">
                <span className={`material-symbols-outlined ${blockedDrivers.length > 0 ? 'text-error' : 'text-amber-600'}`}>
                  {blockedDrivers.length > 0 ? 'block' : 'warning'}
                </span>
                <h3 className={`text-sm font-bold font-headline ${blockedDrivers.length > 0 ? 'text-error' : 'text-amber-700 dark:text-amber-400'}`}>
                  {blockedDrivers.length > 0 ? 'Dispatch Blocked — SIM Expired' : 'SIM Expiry Alerts (F-UM-01)'}
                </h3>
              </div>
              <div className="space-y-2">
                {simAlerts.map(driver => (
                  <div key={driver.id} className={`flex items-center justify-between p-3 rounded-xl border ${
                    driver.daysUntilExpiry <= 0
                      ? 'bg-white dark:bg-slate-800 border-error/20'
                      : 'bg-white dark:bg-slate-800 border-amber-200 dark:border-amber-800'
                  }`}>
                    <div>
                      <p className="text-sm font-bold text-on-surface">{driver.name} ({driver.id})</p>
                      <p className="text-xs text-slate-500">SIM {driver.sim} — {driver.simNumber} — Expires: {new Date(driver.simExpiry).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {driver.daysUntilExpiry <= 0 ? (
                        <span className="px-2 py-1 text-[10px] uppercase font-bold rounded-md bg-error/10 text-error">
                          EXPIRED ({Math.abs(driver.daysUntilExpiry)} days ago)
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-[10px] uppercase font-bold rounded-md bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                          {driver.daysUntilExpiry} days left
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {blockedDrivers.length > 0 && (
                <p className="text-xs text-error mt-3 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">cancel</span>
                  {blockedDrivers.length} driver(s) cannot be assigned to dispatch due to expired SIM
                </p>
              )}
            </div>
          )}

          {/* Drivers Table */}
          <div className="glass-panel rounded-2xl overflow-hidden shadow-lg border border-slate-200/50 bg-white dark:bg-slate-800">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-bold font-headline text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">badge</span>
                Drivers
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-900/30 border-b border-slate-200 dark:border-slate-700 text-slate-500">
                    <th className="py-4 px-6 font-bold uppercase text-xs tracking-wider">Driver ID</th>
                    <th className="py-4 px-6 font-bold uppercase text-xs tracking-wider">Name</th>
                    <th className="py-4 px-6 font-bold uppercase text-xs tracking-wider">SIM Type</th>
                    <th className="py-4 px-6 font-bold uppercase text-xs tracking-wider">SIM Expiry</th>
                    <th className="py-4 px-6 font-bold uppercase text-xs tracking-wider">Phone</th>
                    <th className="py-4 px-6 font-bold uppercase text-xs tracking-wider">Status</th>
                    <th className="py-4 px-6 font-bold uppercase text-xs tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {driversWithSimStatus.map((driver) => (
                    <tr key={driver.id} className="hover:bg-primary/5 dark:hover:bg-primary/5 transition-colors">
                      <td className="py-4 px-6 font-bold text-on-surface font-mono">{driver.id}</td>
                      <td className="py-4 px-6 text-on-surface">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary text-[16px]">person</span>
                          </div>
                          <div>
                            <p className="font-bold text-on-surface">{driver.name}</p>
                            <p className="text-[10px] text-slate-400">Joined {new Date(driver.joinDate).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm font-bold text-on-surface">{driver.sim}</span>
                        <p className="text-[10px] text-slate-400">{driver.simNumber}</p>
                      </td>
                      <td className="py-4 px-6">
                        <p className={`text-sm font-bold ${
                          driver.daysUntilExpiry <= 0 ? 'text-error' :
                          driver.daysUntilExpiry <= 30 ? 'text-amber-600' : 'text-on-surface'
                        }`}>
                          {new Date(driver.simExpiry).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                        <p className={`text-[10px] ${
                          driver.daysUntilExpiry <= 0 ? 'text-error' :
                          driver.daysUntilExpiry <= 30 ? 'text-amber-600' : 'text-slate-400'
                        }`}>
                          {driver.daysUntilExpiry <= 0 ? `Expired ${Math.abs(driver.daysUntilExpiry)}d ago` :
                           driver.daysUntilExpiry <= 30 ? `${driver.daysUntilExpiry}d left` : ''}
                        </p>
                      </td>
                      <td className="py-4 px-6 text-slate-500">{driver.phone}</td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-[10px] uppercase font-bold rounded-md ${driver.statusConfig.color}`}>
                          <span className="material-symbols-outlined text-[12px]">{driver.statusConfig.icon}</span>
                          {driver.statusConfig.label}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button className="text-primary hover:text-[#3a533a] font-bold text-xs">
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* System Users Table */}
          <div className="glass-panel rounded-2xl overflow-hidden shadow-lg border border-slate-200/50 bg-white dark:bg-slate-800">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-bold font-headline text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">admin_panel_settings</span>
                System Users
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-900/30 border-b border-slate-200 dark:border-slate-700 text-slate-500">
                    <th className="py-4 px-6 font-bold uppercase text-xs tracking-wider">Name</th>
                    <th className="py-4 px-6 font-bold uppercase text-xs tracking-wider">Email</th>
                    <th className="py-4 px-6 font-bold uppercase text-xs tracking-wider">Role</th>
                    <th className="py-4 px-6 font-bold uppercase text-xs tracking-wider">Last Active</th>
                    <th className="py-4 px-6 font-bold uppercase text-xs tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {systemUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-primary/5 dark:hover:bg-primary/5 transition-colors">
                      <td className="py-4 px-6 font-bold text-on-surface">{user.name}</td>
                      <td className="py-4 px-6 text-slate-500">{user.email}</td>
                      <td className="py-4 px-6">
                        <span className="px-2 py-1 text-[10px] uppercase font-bold rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                          {user.role}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-500 text-xs">{user.lastActive}</td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-1 text-[10px] uppercase font-bold rounded-md ${
                          user.status === 'Active' ? 'bg-primary/10 text-primary' :
                          user.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {user.status}
                        </span>
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
