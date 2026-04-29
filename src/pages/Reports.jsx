import React, { useState, useMemo } from 'react';
import Layout from '../components/Layout';
import { useFleetOps } from '../context';

const REPORT_TYPES = [
  { id: 'fleet_util', label: 'Fleet Utilization Summary', icon: 'local_shipping', category: 'Operations' },
  { id: 'cash_advance', label: 'Cash Advance Recap (F-RP-01)', icon: 'payments', category: 'Finance' },
  { id: 'distance', label: 'Distance Tracking (F-RP-01)', icon: 'speed', category: 'Operations' },
  { id: 'checklist', label: 'Checklist Findings (F-RP-01)', icon: 'assignment', category: 'Compliance' },
  { id: 'pod_disc', label: 'POD Discrepancies (F-RP-01)', icon: 'warning', category: 'Compliance' },
  { id: 'client_perf', label: 'Client Delivery Performance', icon: 'analytics', category: 'Analytics' },
  { id: 'revenue', label: 'Monthly Revenue & Tonnage', icon: 'account_balance', category: 'Finance' },
];

export default function Reports() {
  const { suratJalan, dispatches, pods, checklists, lpjRecords, fleet } = useFleetOps();
  const [isGenerated, setIsGenerated] = useState(false);
  const [selectedType, setSelectedType] = useState('fleet_util');

  const handleGenerate = () => {
    setIsGenerated(true);
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 100);
  };

  const selectedReport = REPORT_TYPES.find(r => r.id === selectedType);

  // Report data computations
  const cashAdvanceData = useMemo(() => {
    return suratJalan
      .filter(sj => sj.cashAdvance?.uangJalan?.nominal)
      .map(sj => ({
        number: sj.number,
        destination: sj.destination,
        uangJalan: Number(sj.cashAdvance.uangJalan.nominal),
        danaCadangan: Number(sj.cashAdvance.danaCadangan?.nominal || 0),
        status: sj.status,
      }));
  }, [suratJalan]);

  const distanceData = useMemo(() => {
    return checklists
      .filter(cl => cl.type === 'post-arrival' && cl.distanceTraveled > 0)
      .sort((a, b) => new Date(b.date || b.completedAt) - new Date(a.date || a.completedAt));
  }, [checklists]);

  const checklistFindings = useMemo(() => {
    const findings = [];
    checklists.forEach(cl => {
      Object.entries(cl.itemValues || {}).forEach(([catId, items]) => {
        Object.entries(items).forEach(([itemId, val]) => {
          if (val.status === 'TIDAK LAYAK' || val.status === 'PERLU PERHATIAN') {
            findings.push({
              checklistId: cl.id,
              vehiclePlate: cl.vehiclePlate,
              driverName: cl.driverName,
              date: cl.date || cl.completedAt,
              itemLabel: itemId,
              status: val.status,
              notes: val.notes || '',
            });
          }
        });
      });
    });
    return findings;
  }, [checklists]);

  const podDiscrepancies = useMemo(() => {
    return pods
      .filter(p => p.status === 'POD DISCREPANCY')
      .map(p => ({
        number: p.number,
        sjNumber: p.sjNumber,
        receiver: p.receiverName,
        condition: p.deliveryCondition,
        details: p.discrepancyDetails,
        date: p.receivedAt,
      }));
  }, [pods]);

  const formatCurrency = (val) => `Rp ${Number(val || 0).toLocaleString('id-ID')}`;

  const renderReport = () => {
    switch (selectedType) {
      case 'cash_advance':
        const totalUangJalan = cashAdvanceData.reduce((sum, d) => sum + d.uangJalan, 0);
        const totalDanaCadangan = cashAdvanceData.reduce((sum, d) => sum + d.danaCadangan, 0);
        return (
          <>
            <header className="border-b-2 border-slate-800 pb-6 mb-8 flex justify-between items-end">
              <div>
                <h1 className="text-3xl font-black font-headline tracking-tighter">Cash Advance Recap</h1>
                <p className="text-sm font-semibold text-slate-500 mt-1">Generated: {new Date().toLocaleDateString('id-ID')} &bull; {cashAdvanceData.length} records</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-black text-primary tracking-widest uppercase">Fleet Ops</p>
                <p className="text-xs text-slate-500">Finance Division (F-RP-01)</p>
              </div>
            </header>

            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Total Uang Jalan</p>
                <p className="text-2xl font-black text-primary">{formatCurrency(totalUangJalan)}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Total Dana Cadangan</p>
                <p className="text-2xl font-black text-amber-600">{formatCurrency(totalDanaCadangan)}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Total Disbursed</p>
                <p className="text-2xl font-black">{formatCurrency(totalUangJalan + totalDanaCadangan)}</p>
              </div>
            </div>

            <table className="w-full text-left text-sm mb-8">
              <thead>
                <tr className="border-b border-slate-300">
                  <th className="py-2 font-bold uppercase text-xs">SJ Number</th>
                  <th className="py-2 font-bold uppercase text-xs">Destination</th>
                  <th className="py-2 font-bold uppercase text-xs">Uang Jalan</th>
                  <th className="py-2 font-bold uppercase text-xs">Dana Cadangan</th>
                  <th className="py-2 font-bold uppercase text-xs">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cashAdvanceData.map((d, i) => (
                  <tr key={i}>
                    <td className="py-3 font-semibold text-primary">{d.number}</td>
                    <td className="py-3">{d.destination}</td>
                    <td className="py-3 font-bold">{formatCurrency(d.uangJalan)}</td>
                    <td className="py-3">{d.danaCadangan > 0 ? formatCurrency(d.danaCadangan) : '-'}</td>
                    <td className="py-3">
                      <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase ${
                        d.status === 'COMPLETED' ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-500'
                      }`}>{d.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        );

      case 'distance':
        const totalDistance = distanceData.reduce((sum, cl) => sum + (cl.distanceTraveled || 0), 0);
        const avgDistance = distanceData.length > 0 ? Math.round(totalDistance / distanceData.length) : 0;
        const maxDistance = distanceData.length > 0 ? Math.max(...distanceData.map(cl => cl.distanceTraveled || 0)) : 0;
        return (
          <>
            <header className="border-b-2 border-slate-800 pb-6 mb-8 flex justify-between items-end">
              <div>
                <h1 className="text-3xl font-black font-headline tracking-tighter">Distance Tracking Report</h1>
                <p className="text-sm font-semibold text-slate-500 mt-1">Generated: {new Date().toLocaleDateString('id-ID')} &bull; {distanceData.length} trips</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-black text-primary tracking-widest uppercase">Fleet Ops</p>
                <p className="text-xs text-slate-500">Operations Division (F-RP-01)</p>
              </div>
            </header>

            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Total Distance</p>
                <p className="text-2xl font-black text-primary">{totalDistance.toLocaleString()} km</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Average per Trip</p>
                <p className="text-2xl font-black">{avgDistance.toLocaleString()} km</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Longest Trip</p>
                <p className="text-2xl font-black">{maxDistance.toLocaleString()} km</p>
              </div>
            </div>

            <table className="w-full text-left text-sm mb-8">
              <thead>
                <tr className="border-b border-slate-300">
                  <th className="py-2 font-bold uppercase text-xs">Checklist ID</th>
                  <th className="py-2 font-bold uppercase text-xs">Vehicle</th>
                  <th className="py-2 font-bold uppercase text-xs">Driver</th>
                  <th className="py-2 font-bold uppercase text-xs">Date</th>
                  <th className="py-2 font-bold uppercase text-xs">Odo Awal</th>
                  <th className="py-2 font-bold uppercase text-xs">Odo Akhir</th>
                  <th className="py-2 font-bold uppercase text-xs text-right">Distance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {distanceData.map((cl, i) => (
                  <tr key={i}>
                    <td className="py-3 font-semibold text-primary">{cl.id}</td>
                    <td className="py-3">{cl.vehiclePlate}</td>
                    <td className="py-3">{cl.driverName}</td>
                    <td className="py-3">{cl.date ? new Date(cl.date).toLocaleDateString('id-ID') : '-'}</td>
                    <td className="py-3">{Number(cl.odometerAwal).toLocaleString()} km</td>
                    <td className="py-3">{Number(cl.odometerAkhir).toLocaleString()} km</td>
                    <td className="py-3 text-right font-bold">{cl.distanceTraveled?.toLocaleString()} km</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        );

      case 'checklist':
        const totalFindings = checklistFindings.length;
        const tidakLayak = checklistFindings.filter(f => f.status === 'TIDAK LAYAK').length;
        const perluPerhatian = checklistFindings.filter(f => f.status === 'PERLU PERHATIAN').length;
        return (
          <>
            <header className="border-b-2 border-slate-800 pb-6 mb-8 flex justify-between items-end">
              <div>
                <h1 className="text-3xl font-black font-headline tracking-tighter">Checklist Findings Report</h1>
                <p className="text-sm font-semibold text-slate-500 mt-1">Generated: {new Date().toLocaleDateString('id-ID')} &bull; {totalFindings} findings</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-black text-primary tracking-widest uppercase">Fleet Ops</p>
                <p className="text-xs text-slate-500">Compliance Division (F-RP-01)</p>
              </div>
            </header>

            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Total Findings</p>
                <p className="text-2xl font-black">{totalFindings}</p>
              </div>
              <div className="bg-error/5 p-4 rounded-lg border border-error/20">
                <p className="text-xs font-bold text-error uppercase mb-1">Tidak Layak</p>
                <p className="text-2xl font-black text-error">{tidakLayak}</p>
              </div>
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <p className="text-xs font-bold text-amber-700 uppercase mb-1">Perlu Perhatian</p>
                <p className="text-2xl font-black text-amber-700">{perluPerhatian}</p>
              </div>
            </div>

            <table className="w-full text-left text-sm mb-8">
              <thead>
                <tr className="border-b border-slate-300">
                  <th className="py-2 font-bold uppercase text-xs">Checklist ID</th>
                  <th className="py-2 font-bold uppercase text-xs">Vehicle</th>
                  <th className="py-2 font-bold uppercase text-xs">Driver</th>
                  <th className="py-2 font-bold uppercase text-xs">Item</th>
                  <th className="py-2 font-bold uppercase text-xs">Status</th>
                  <th className="py-2 font-bold uppercase text-xs">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {checklistFindings.map((f, i) => (
                  <tr key={i}>
                    <td className="py-3 font-semibold text-primary">{f.checklistId}</td>
                    <td className="py-3">{f.vehiclePlate}</td>
                    <td className="py-3">{f.driverName}</td>
                    <td className="py-3">{f.itemLabel}</td>
                    <td className="py-3">
                      <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase ${
                        f.status === 'TIDAK LAYAK' ? 'bg-error/10 text-error' : 'bg-amber-100 text-amber-700'
                      }`}>{f.status}</span>
                    </td>
                    <td className="py-3">{f.date ? new Date(f.date).toLocaleDateString('id-ID') : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        );

      case 'pod_disc':
        return (
          <>
            <header className="border-b-2 border-slate-800 pb-6 mb-8 flex justify-between items-end">
              <div>
                <h1 className="text-3xl font-black font-headline tracking-tighter">POD Discrepancies Report</h1>
                <p className="text-sm font-semibold text-slate-500 mt-1">Generated: {new Date().toLocaleDateString('id-ID')} &bull; {podDiscrepancies.length} cases</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-black text-primary tracking-widest uppercase">Fleet Ops</p>
                <p className="text-xs text-slate-500">Compliance Division (F-RP-01)</p>
              </div>
            </header>

            {podDiscrepancies.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <span className="material-symbols-outlined text-4xl mb-3 block">check_circle</span>
                <p className="text-lg font-bold">No discrepancies found. All deliveries completed successfully.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-6 mb-8">
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">Total PODs</p>
                    <p className="text-2xl font-black">{pods.length}</p>
                  </div>
                  <div className="bg-error/5 p-4 rounded-lg border border-error/20">
                    <p className="text-xs font-bold text-error uppercase mb-1">Discrepancies</p>
                    <p className="text-2xl font-black text-error">{podDiscrepancies.length}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">Success Rate</p>
                    <p className="text-2xl font-black text-primary">
                      {pods.length > 0 ? Math.round(((pods.length - podDiscrepancies.length) / pods.length) * 100) : 100}%
                    </p>
                  </div>
                </div>

                <table className="w-full text-left text-sm mb-8">
                  <thead>
                    <tr className="border-b border-slate-300">
                      <th className="py-2 font-bold uppercase text-xs">POD Number</th>
                      <th className="py-2 font-bold uppercase text-xs">SJ Number</th>
                      <th className="py-2 font-bold uppercase text-xs">Received By</th>
                      <th className="py-2 font-bold uppercase text-xs">Condition</th>
                      <th className="py-2 font-bold uppercase text-xs">Details</th>
                      <th className="py-2 font-bold uppercase text-xs">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {podDiscrepancies.map((p, i) => (
                      <tr key={i}>
                        <td className="py-3 font-semibold text-primary">{p.number}</td>
                        <td className="py-3">{p.sjNumber}</td>
                        <td className="py-3">{p.receiver}</td>
                        <td className="py-3">
                          <span className="text-[10px] px-2 py-1 rounded font-bold uppercase bg-error/10 text-error">
                            {p.condition?.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 text-xs max-w-xs truncate">{p.details || '-'}</td>
                        <td className="py-3">{p.date ? new Date(p.date).toLocaleDateString('id-ID') : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </>
        );

      case 'fleet_util':
      default:
        return (
          <>
            <header className="border-b-2 border-slate-800 pb-6 mb-8 flex justify-between items-end">
              <div>
                <h1 className="text-3xl font-black font-headline tracking-tighter">Fleet Utilization Summary</h1>
                <p className="text-sm font-semibold text-slate-500 mt-1">Generated: {new Date().toLocaleDateString('id-ID')}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-black text-primary tracking-widest uppercase">Fleet Ops</p>
                <p className="text-xs text-slate-500">Logistics Division</p>
              </div>
            </header>

            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Total Assets</p>
                <p className="text-2xl font-black">{fleet.length || 3}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Total Dispatches</p>
                <p className="text-2xl font-black">{dispatches.length}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Total SJ</p>
                <p className="text-2xl font-black">{suratJalan.length}</p>
              </div>
            </div>

            <table className="w-full text-left text-sm mb-8">
              <thead>
                <tr className="border-b border-slate-300">
                  <th className="py-2 font-bold uppercase text-xs">Asset ID</th>
                  <th className="py-2 font-bold uppercase text-xs">Total Dispatches</th>
                  <th className="py-2 font-bold uppercase text-xs">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(fleet.length > 0 ? fleet : [
                  { id: 'TRK-001', plate: 'B 9102 UXA', status: 'READY' },
                  { id: 'TRK-002', plate: 'D 8831 XYZ', status: 'READY' },
                  { id: 'TRK-003', plate: 'B 1120 ABC', status: 'MAINTENANCE' },
                ]).map((t, i) => {
                  const dispatchCount = dispatches.filter(d => d.truckId === t.id || d.truckPlate === t.plate).length;
                  return (
                    <tr key={i}>
                      <td className="py-3 font-semibold">{t.id} ({t.plate})</td>
                      <td className="py-3">{dispatchCount}</td>
                      <td className="py-3">
                        <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase ${
                          t.status === 'READY' ? 'bg-primary/10 text-primary' : 'bg-error/10 text-error'
                        }`}>{t.status}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </>
        );
    }
  };

  return (
    <Layout>
      <div className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10 animate-fade-in no-scrollbar bg-slate-50/50 dark:bg-slate-900/50">
        <div className="max-w-4xl mx-auto space-y-8">

          <div className="space-y-1 text-center mb-10">
            <div className="w-16 h-16 bg-primary/10 text-primary mx-auto rounded-full flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-3xl">assessment</span>
            </div>
            <h2 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface">Generate Report</h2>
            <p className="text-slate-500 font-body">Extract operational data and metrics into standardized formats.</p>
          </div>

          <div className="glass-panel p-8 rounded-3xl border border-white/60 shadow-xl space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

              <div className="space-y-6">
                <h3 className="font-bold font-headline text-lg flex items-center gap-2 border-b border-slate-100 pb-3">
                  <span className="material-symbols-outlined text-primary text-sm">tune</span>
                  Configuration
                </h3>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Report Type</label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-primary shadow-inner"
                  >
                    {REPORT_TYPES.map(r => (
                      <option key={r.id} value={r.id}>{r.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Category</label>
                  <p className="text-sm font-bold text-on-surface px-3 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                    {selectedReport?.category || 'General'}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="font-bold font-headline text-lg flex items-center gap-2 border-b border-slate-100 pb-3">
                  <span className="material-symbols-outlined text-secondary text-sm">calendar_month</span>
                  Timeframe
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Start Date</label>
                    <input type="date" className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-[13px] focus:ring-2 focus:ring-secondary shadow-inner" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">End Date</label>
                    <input type="date" className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-[13px] focus:ring-2 focus:ring-secondary shadow-inner" />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors">Last 7 Days</button>
                  <button className="flex-1 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors">This Month</button>
                  <button className="flex-1 py-2 text-xs font-bold bg-secondary/10 text-secondary rounded-lg transition-colors">Q3 2023</button>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="radio" name="format" defaultChecked className="text-primary focus:ring-primary" />
                  <span className="text-sm font-bold flex items-center gap-1 group-hover:text-primary"><span className="material-symbols-outlined text-primary text-lg">picture_as_pdf</span> PDF Preview</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="radio" name="format" className="text-emerald-500 focus:ring-emerald-500" />
                  <span className="text-sm font-bold flex items-center gap-1 group-hover:text-emerald-600"><span className="material-symbols-outlined text-emerald-500 text-lg">data_table</span> CSV</span>
                </label>
              </div>

              <button
                onClick={handleGenerate}
                className="w-full md:w-auto px-8 py-3.5 bg-gradient-to-r from-primary to-primary-container text-white rounded-xl font-extrabold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">analytics</span>
                {isGenerated ? "Regenerate Report" : "Generate Preview"}
              </button>
            </div>
          </div>

          {/* REPORT DISPLAY */}
          {isGenerated && (
            <div className="mt-8 animate-fade-in">
              <div className="bg-white dark:bg-slate-800 rounded-t-lg border border-slate-200 border-b-0 p-4 flex justify-between items-center">
                <div className="flex gap-2">
                  <button className="text-slate-500 hover:text-primary"><span className="material-symbols-outlined text-lg">zoom_in</span></button>
                  <button className="text-slate-500 hover:text-primary"><span className="material-symbols-outlined text-lg">zoom_out</span></button>
                </div>
                <div className="text-sm font-semibold text-slate-600">Page 1 of 1</div>
                <button
                  onClick={() => {
                    const content = document.getElementById('report-content');
                    if (content) {
                      const blob = new Blob([content.innerText], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${selectedReport?.label || 'report'}_${new Date().toISOString().split('T')[0]}.txt`;
                      a.click();
                    }
                  }}
                  className="text-primary hover:text-primary-container font-bold text-sm flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-lg">download</span> Download
                </button>
              </div>
              <div id="report-content" className="bg-white dark:bg-slate-800 w-full shadow-2xl border border-slate-200 p-12 min-h-[600px] flex flex-col relative text-slate-800">
                {renderReport()}
                <div className="mt-auto pt-8 border-t border-slate-200 text-xs text-slate-500 flex justify-between">
                  <p>System Generated Report. Not for external distribution without authorization.</p>
                  <p>Page 1 / 1</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
