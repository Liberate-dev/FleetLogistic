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

  const clientPerformanceData = useMemo(() => {
    const clients = {};
    suratJalan.forEach(sj => {
      const name = sj.customer?.name || sj.clientName || 'General Client';
      if (!clients[name]) {
        clients[name] = {
          name,
          totalShipments: 0,
          completed: 0,
          inTransit: 0,
          podsCount: 0,
          goodPodsCount: 0,
        };
      }
      clients[name].totalShipments += 1;
      if (sj.status === 'COMPLETED') {
        clients[name].completed += 1;
      } else if (['ASSIGNED', 'DISPATCHED', 'DELIVERED', 'IN TRANSIT'].includes(sj.status)) {
        clients[name].inTransit += 1;
      }

      // Find POD
      const pod = pods.find(p => p.sjNumber === sj.number);
      if (pod) {
        clients[name].podsCount += 1;
        const condition = (pod.deliveryCondition || pod.condition || '').toLowerCase();
        if (condition === 'good' || condition === 'received' || !condition) {
          clients[name].goodPodsCount += 1;
        }
      }
    });

    return Object.values(clients);
  }, [suratJalan, pods]);

  const monthlyRevenueData = useMemo(() => {
    const months = {};
    suratJalan.forEach(sj => {
      const dateStr = sj.loadingDate || sj.date || sj.createdAt;
      if (!dateStr) return;
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return;
      
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = date.toLocaleDateString('id-ID', { year: 'numeric', month: 'long' });

      if (!months[key]) {
        months[key] = {
          key,
          label: monthLabel,
          trips: 0,
          tonnage: 0,
          revenue: 0,
          lpjCost: 0,
        };
      }

      months[key].trips += 1;
      
      // Tonnage
      let weight = parseFloat(sj.totalWeight);
      if (isNaN(weight) || weight <= 0) {
        const itemWeight = sj.items?.reduce((sum, item) => sum + Number(item.weight || 0), 0) || 0;
        weight = itemWeight / 1000;
      }
      months[key].tonnage += weight;

      // Simulated Revenue based on destination & weight
      const dest = (sj.destination || '').toLowerCase();
      let baseRate = 1200000;
      let perTonRate = 90000;
      if (dest.includes('surabaya')) {
        baseRate = 1500000;
        perTonRate = 100000;
      } else if (dest.includes('jakarta')) {
        baseRate = 5000000;
        perTonRate = 120000;
      } else if (dest.includes('malang')) {
        baseRate = 600000;
        perTonRate = 80000;
      }
      const calculatedRevenue = baseRate + (weight * perTonRate);
      months[key].revenue += calculatedRevenue;

      // LPJ Costs for this SJ
      const sjLpjs = lpjRecords.filter(lpj => lpj.sjNumber === sj.number);
      const lpjSum = sjLpjs.reduce((sum, lpj) => sum + Number(lpj.totalAmount || 0), 0);
      months[key].lpjCost += lpjSum;
    });

    return Object.values(months).sort((a, b) => b.key.localeCompare(a.key));
  }, [suratJalan, lpjRecords]);

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

      case 'client_perf':
        const totalClients = clientPerformanceData.length;
        const totalShipmentsAll = clientPerformanceData.reduce((sum, c) => sum + c.totalShipments, 0);
        const totalPodsAll = clientPerformanceData.reduce((sum, c) => sum + c.podsCount, 0);
        const totalGoodPodsAll = clientPerformanceData.reduce((sum, c) => sum + c.goodPodsCount, 0);
        const averageSuccessRate = totalPodsAll > 0 ? Math.round((totalGoodPodsAll / totalPodsAll) * 100) : 100;
        
        return (
          <>
            <header className="border-b-2 border-slate-800 pb-6 mb-8 flex justify-between items-end">
              <div>
                <h1 className="text-3xl font-black font-headline tracking-tighter">Client Delivery Performance</h1>
                <p className="text-sm font-semibold text-slate-500 mt-1">Generated: {new Date().toLocaleDateString('id-ID')} &bull; {totalClients} clients</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-black text-primary tracking-widest uppercase">Fleet Ops</p>
                <p className="text-xs text-slate-500">Analytics Division</p>
              </div>
            </header>

            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Total Active Clients</p>
                <p className="text-2xl font-black text-primary">{totalClients}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Total Deliveries</p>
                <p className="text-2xl font-black">{totalShipmentsAll}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Avg. Success Rate</p>
                <p className={`text-2xl font-black ${averageSuccessRate >= 95 ? 'text-primary' : averageSuccessRate >= 80 ? 'text-amber-600' : 'text-error'}`}>{averageSuccessRate}%</p>
              </div>
            </div>

            <table className="w-full text-left text-sm mb-8">
              <thead>
                <tr className="border-b border-slate-300">
                  <th className="py-2 font-bold uppercase text-xs">Client Name</th>
                  <th className="py-2 font-bold uppercase text-xs text-center">Total Shipments</th>
                  <th className="py-2 font-bold uppercase text-xs text-center">Completed</th>
                  <th className="py-2 font-bold uppercase text-xs text-center">In Transit</th>
                  <th className="py-2 font-bold uppercase text-xs text-center">PODs Received</th>
                  <th className="py-2 font-bold uppercase text-xs text-center">Success Rate</th>
                  <th className="py-2 font-bold uppercase text-xs text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clientPerformanceData.map((c, i) => {
                  const successRate = c.podsCount > 0 ? Math.round((c.goodPodsCount / c.podsCount) * 100) : 100;
                  let statusColor = 'bg-primary/10 text-primary';
                  let statusText = 'Excellent';
                  if (successRate < 80) {
                    statusColor = 'bg-error/10 text-error';
                    statusText = 'Critical';
                  } else if (successRate < 95) {
                    statusColor = 'bg-amber-100 text-amber-700';
                    statusText = 'Needs Attention';
                  }
                  return (
                    <tr key={i}>
                      <td className="py-3 font-semibold text-slate-800">{c.name}</td>
                      <td className="py-3 text-center">{c.totalShipments}</td>
                      <td className="py-3 text-center">{c.completed}</td>
                      <td className="py-3 text-center">{c.inTransit}</td>
                      <td className="py-3 text-center">{c.podsCount}</td>
                      <td className="py-3 text-center font-bold">{successRate}%</td>
                      <td className="py-3 text-right">
                        <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase ${statusColor}`}>{statusText}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </>
        );

      case 'revenue':
        const totalRevenue = monthlyRevenueData.reduce((sum, m) => sum + m.revenue, 0);
        const totalTonnage = monthlyRevenueData.reduce((sum, m) => sum + m.tonnage, 0);
        const totalTrips = monthlyRevenueData.reduce((sum, m) => sum + m.trips, 0);
        const avgRevPerTrip = totalTrips > 0 ? Math.round(totalRevenue / totalTrips) : 0;
        
        return (
          <>
            <header className="border-b-2 border-slate-800 pb-6 mb-8 flex justify-between items-end">
              <div>
                <h1 className="text-3xl font-black font-headline tracking-tighter">Monthly Revenue & Tonnage</h1>
                <p className="text-sm font-semibold text-slate-500 mt-1">Generated: {new Date().toLocaleDateString('id-ID')} &bull; {monthlyRevenueData.length} months</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-black text-primary tracking-widest uppercase">Fleet Ops</p>
                <p className="text-xs text-slate-500">Finance Division</p>
              </div>
            </header>

            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Total Revenue</p>
                <p className="text-2xl font-black text-primary">{formatCurrency(totalRevenue)}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Total Tonnage</p>
                <p className="text-2xl font-black text-slate-700">{totalTonnage.toFixed(2)} Tons</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Avg Revenue / Trip</p>
                <p className="text-2xl font-black text-emerald-600">{formatCurrency(avgRevPerTrip)}</p>
              </div>
            </div>

            <table className="w-full text-left text-sm mb-8">
              <thead>
                <tr className="border-b border-slate-300">
                  <th className="py-2 font-bold uppercase text-xs">Month</th>
                  <th className="py-2 font-bold uppercase text-xs text-center">Total Trips</th>
                  <th className="py-2 font-bold uppercase text-xs text-right">Tonnage</th>
                  <th className="py-2 font-bold uppercase text-xs text-right">Revenue</th>
                  <th className="py-2 font-bold uppercase text-xs text-right">Est. Expense (LPJ)</th>
                  <th className="py-2 font-bold uppercase text-xs text-right">Est. Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {monthlyRevenueData.map((m, i) => {
                  const margin = m.revenue - m.lpjCost;
                  return (
                    <tr key={i}>
                      <td className="py-3 font-semibold text-slate-800">{m.label}</td>
                      <td className="py-3 text-center">{m.trips}</td>
                      <td className="py-3 text-right">{m.tonnage.toFixed(2)} Tons</td>
                      <td className="py-3 text-right font-semibold text-primary">{formatCurrency(m.revenue)}</td>
                      <td className="py-3 text-right text-slate-600">{m.lpjCost > 0 ? formatCurrency(m.lpjCost) : '-'}</td>
                      <td className="py-3 text-right font-bold text-emerald-600">{formatCurrency(margin)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
