import React, { useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import StatusBadge from '../components/ui/StatusBadge';
import { useFleetOps } from '../context';
import { expiryTracker } from '../utils';
import { VEHICLE_STATUS } from '../constants';

export default function FleetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fleet, checklists, dispatches } = useFleetOps();

  // Find vehicle
  const vehicle = useMemo(() => {
    const v = fleet.find(t => t.id === id);
    if (v) return v;
    // Fallback sample data
    return {
      id: id || 'TRK-001',
      plate: 'B 9102 UXA',
      model: 'Scania R500',
      type: 'Tronton',
      status: VEHICLE_STATUS.ACTIVE,
      capacity: 25,
      year: 2022,
    };
  }, [fleet, id]);

  // Document status for this vehicle (F-FL-01)
  const vehicleDocs = useMemo(() => {
    return expiryTracker.getDocumentsForEntity(vehicle.id, 'truck');
  }, [vehicle.id]);

  const earliestExpiry = useMemo(() => {
    return expiryTracker.getEarliestExpiry(vehicle.id, 'truck');
  }, [vehicle.id]);

  const isVehicleValid = useMemo(() => {
    return expiryTracker.isEntityValid(vehicle.id, 'truck');
  }, [vehicle.id]);

  // Checklist history timeline (F-FL-03)
  const checklistHistory = useMemo(() => {
    return checklists
      .filter(cl => cl.vehiclePlate === vehicle.plate)
      .sort((a, b) => new Date(b.date || b.completedAt) - new Date(a.date || a.completedAt));
  }, [checklists, vehicle.plate]);

  // Dispatch history
  const dispatchHistory = useMemo(() => {
    return dispatches
      .filter(d => d.truckId === vehicle.id || d.truckPlate === vehicle.plate)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [dispatches, vehicle.id, vehicle.plate]);

  // Stats
  const stats = useMemo(() => ({
    totalChecklists: checklistHistory.length,
    preDeparture: checklistHistory.filter(cl => cl.type === 'pre-departure').length,
    postArrival: checklistHistory.filter(cl => cl.type === 'post-arrival').length,
    totalDispatches: dispatchHistory.length,
  }), [checklistHistory, dispatchHistory]);

  // Distance tracking
  const totalDistance = useMemo(() =>
    checklistHistory
      .filter(cl => cl.type === 'post-arrival' && cl.distanceTraveled)
      .reduce((sum, cl) => sum + (cl.distanceTraveled || 0), 0),
    [checklistHistory]
  );

  return (
    <Layout>
      {/* Header */}
      <header className="w-full h-[72px] shrink-0 sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-outline-variant/20 flex items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-6">
            <h1 className="font-headline text-xl font-bold tracking-tight text-emerald-900 dark:text-emerald-100">
              Vehicle Details
            </h1>
            <div className="hidden sm:block h-6 w-px bg-slate-300 dark:bg-slate-700"></div>
            <div className="hidden sm:flex items-center gap-2 text-slate-500">
              <span className="text-sm font-medium font-body bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                {vehicle.plate}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm flex items-center gap-2"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span className="hidden sm:inline">Kembali</span>
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10 animate-fade-in no-scrollbar bg-slate-50/50 dark:bg-slate-900/50">
        <div className="max-w-5xl mx-auto space-y-8 pb-32">

          {/* Vehicle Info Card */}
          <section className="glass-panel rounded-2xl p-6 md:p-8 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              {/* Vehicle Icon */}
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary text-3xl">local_shipping</span>
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold font-headline text-on-surface">{vehicle.model}</h2>
                  <StatusBadge status={vehicle.status} />
                </div>
                <div className="flex flex-wrap gap-3 mt-4">
                  <button
                    onClick={() => navigate(`/checklist/new?vehicle=${vehicle.id}&plate=${vehicle.plate}`)}
                    className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">assignment</span>
                    New Checklist
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Asset ID</p>
                    <p className="text-sm font-bold font-mono text-on-surface">{vehicle.id}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Plate</p>
                    <p className="text-sm font-bold text-on-surface">{vehicle.plate}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Type</p>
                    <p className="text-sm font-bold text-on-surface">{vehicle.type}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Capacity</p>
                    <p className="text-sm font-bold text-on-surface">{vehicle.capacity} Tons</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-panel p-4 rounded-xl border border-slate-200/50 bg-white dark:bg-slate-800">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-primary text-[20px]">assignment</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Checklists</span>
              </div>
              <p className="text-2xl font-black font-headline text-on-surface">{stats.totalChecklists}</p>
              <p className="text-xs text-slate-400 mt-1">{stats.preDeparture} pre, {stats.postArrival} post</p>
            </div>
            <div className="glass-panel p-4 rounded-xl border border-slate-200/50 bg-white dark:bg-slate-800">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-secondary text-[20px]">route</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Dispatches</span>
              </div>
              <p className="text-2xl font-black font-headline text-on-surface">{stats.totalDispatches}</p>
            </div>
            <div className="glass-panel p-4 rounded-xl border border-slate-200/50 bg-white dark:bg-slate-800">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-tertiary text-[20px]">speed</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Distance</span>
              </div>
              <p className="text-2xl font-black font-headline text-on-surface">{totalDistance.toLocaleString()}</p>
              <p className="text-xs text-slate-400 mt-1">km</p>
            </div>
            <div className={`glass-panel p-4 rounded-xl border bg-white dark:bg-slate-800 ${
              isVehicleValid ? 'border-primary/20' : 'border-error/20'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`material-symbols-outlined text-[20px] ${isVehicleValid ? 'text-primary' : 'text-error'}`}>
                  {isVehicleValid ? 'verified' : 'warning'}
                </span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Doc Status</span>
              </div>
              <p className={`text-lg font-black font-headline ${isVehicleValid ? 'text-primary' : 'text-error'}`}>
                {isVehicleValid ? 'Valid' : 'Expired'}
              </p>
              {earliestExpiry && (
                <p className="text-xs text-slate-400 mt-1">
                  {earliestExpiry.daysUntil > 0 ? `Expires in ${earliestExpiry.daysUntil} days` : 'Expired'}
                </p>
              )}
            </div>
          </div>

          {/* Document Status (F-FL-01) */}
          <section className="glass-panel rounded-2xl p-6 md:p-8 shadow-sm">
            <h3 className="text-lg font-bold font-headline text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">description</span>
              Document Compliance (F-FL-01)
            </h3>

            {vehicleDocs.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <span className="material-symbols-outlined text-4xl mb-3 block">description</span>
                <p className="text-sm">No documents registered for this vehicle yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {vehicleDocs.map(doc => {
                  const expiryDate = new Date(doc.expiryDate);
                  const daysUntil = Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24));
                  const isValid = daysUntil > 0;

                  return (
                    <div key={doc.id} className={`flex items-center justify-between p-4 rounded-xl border ${
                      isValid ? 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50' : 'border-error/20 bg-error/5'
                    }`}>
                      <div className="flex items-center gap-3">
                        <span className={`material-symbols-outlined ${isValid ? 'text-primary' : 'text-error'}`}>
                          {isValid ? 'check_circle' : 'error'}
                        </span>
                        <div>
                          <p className="text-sm font-bold text-on-surface">{doc.docType}</p>
                          <p className="text-xs text-slate-400">{doc.documentNumber}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold ${isValid ? 'text-on-surface' : 'text-error'}`}>
                          {expiryDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                        <p className={`text-xs ${isValid ? 'text-slate-400' : 'text-error'}`}>
                          {daysUntil > 0 ? `${daysUntil} days left` : `Expired ${Math.abs(daysUntil)} days ago`}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Checklist History Timeline (F-FL-03) */}
          <section className="glass-panel rounded-2xl p-6 md:p-8 shadow-sm">
            <h3 className="text-lg font-bold font-headline text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">history</span>
              Checklist History Timeline (F-FL-03)
            </h3>

            {checklistHistory.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <span className="material-symbols-outlined text-4xl mb-3 block">history</span>
                <p className="text-sm">No checklist history for this vehicle.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {checklistHistory.map(cl => {
                  const hasIssues = Object.values(cl.itemValues || {}).some(cat =>
                    Object.values(cat).some(val => val.status === 'TIDAK LAYAK' || val.status === 'PERLU PERHATIAN')
                  );

                  return (
                    <div key={cl.id} className="flex gap-4">
                      {/* Timeline Line */}
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full ${hasIssues ? 'bg-error' : 'bg-primary'}`}></div>
                        <div className="w-px flex-1 bg-slate-200 dark:bg-slate-700"></div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 pb-4">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-on-surface">{cl.id}</p>
                            <StatusBadge status={cl.status} />
                          </div>
                          <p className="text-xs text-slate-400">
                            {cl.date ? new Date(cl.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">type</span>
                            {cl.type === 'pre-departure' ? 'Pre-Departure' : 'Post-Arrival'}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">person</span>
                            {cl.driverName || '-'}
                          </span>
                          {cl.distanceTraveled > 0 && (
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">speed</span>
                              {cl.distanceTraveled.toLocaleString()} km
                            </span>
                          )}
                        </div>
                        {hasIssues && (
                          <div className="mt-2 p-2 bg-error/5 rounded-lg border border-error/20">
                            <p className="text-xs text-error flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">warning</span>
                              Has "Tidak Layak" or "Perlu Perhatian" findings
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Dispatch History */}
          <section className="glass-panel rounded-2xl p-6 md:p-8 shadow-sm">
            <h3 className="text-lg font-bold font-headline text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">route</span>
              Dispatch History
            </h3>

            {dispatchHistory.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <span className="material-symbols-outlined text-4xl mb-3 block">route</span>
                <p className="text-sm">No dispatch history for this vehicle.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-700">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      <th className="py-3 px-4">Dispatch ID</th>
                      <th className="py-3 px-4">SJ Number</th>
                      <th className="py-3 px-4">Driver</th>
                      <th className="py-3 px-4">Priority</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                    {dispatchHistory.map(d => (
                      <tr key={d.id} className="hover:bg-primary/5 dark:hover:bg-primary/5 transition-colors">
                        <td className="py-3 px-4 font-bold font-mono text-on-surface">{d.number}</td>
                        <td className="py-3 px-4">
                          <Link to={`/sj/${d.sjNumber}`} className="text-primary font-bold underline">{d.sjNumber}</Link>
                        </td>
                        <td className="py-3 px-4 text-on-surface">{d.driverName}</td>
                        <td className="py-3 px-4">
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                            d.priority === 'critical' ? 'bg-error/10 text-error' :
                            d.priority === 'high' ? 'bg-primary/10 text-primary' :
                            'bg-slate-100 text-slate-500'
                          }`}>
                            {d.priority}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status={d.status} />
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-400">
                          {d.createdAt ? new Date(d.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

        </div>
      </div>
    </Layout>
  );
}
