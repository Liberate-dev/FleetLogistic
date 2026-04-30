import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import StatusBadge from '../components/ui/StatusBadge';
import GateCheck from '../components/ui/GateCheck';
import Modal from '../components/ui/Modal';
import { useFleetOps } from '../context';
import { documentNumberingService, auditLogger, expiryTracker } from '../utils';
import { SJ_STATUS, DISPATCH_STATUS, VEHICLE_STATUS } from '../constants';

// Sample fleet data (would come from context in real app)
const SAMPLE_FLEET = [
  { id: 'TRK-001', plate: 'B 9102 UXA', type: 'Tronton', status: VEHICLE_STATUS.ACTIVE, capacity: 25 },
  { id: 'TRK-002', plate: 'D 8831 XYZ', type: 'Engkel', status: VEHICLE_STATUS.ACTIVE, capacity: 10 },
  { id: 'TRK-003', plate: 'B 1120 ABC', type: 'Fuso', status: VEHICLE_STATUS.MAINTENANCE, capacity: 15 },
];

const SAMPLE_DRIVERS = [
  { id: 'DRV-001', name: 'Sudirman P.', sim: 'B2', simExpiry: '2027-06-15', status: 'ACTIVE' },
  { id: 'DRV-002', name: 'Agus M.', sim: 'C', simExpiry: '2026-12-01', status: 'ACTIVE' },
  { id: 'DRV-003', name: 'Budi S.', sim: 'B2', simExpiry: '2026-03-01', status: 'ON_DISPATCH' },
];

const PRIORITY_CONFIG = {
  standard: { label: 'Standard', color: 'slate', surcharge: 0, icon: 'schedule' },
  high: { label: 'High Priority', color: 'primary', surcharge: 150000, icon: 'priority_high' },
  critical: { label: 'Critical / Express', color: 'error', surcharge: 350000, icon: 'bolt' },
};

export default function NewDispatch() {
  const navigate = useNavigate();
  const { suratJalan, dispatches, addDispatch, setLoading, addNotification, changeSJStatus, fleet, drivers, checklists } = useFleetOps();

  // Dispatch number
  const [dispatchNumber, setDispatchNumber] = useState('');

  // Form State
  const [selectedSJ, setSelectedSJ] = useState('');
  const [selectedDriver, setSelectedDriver] = useState('');
  const [selectedTruck, setSelectedTruck] = useState('');
  const [priority, setPriority] = useState('standard');

  // Gate checks
  const [gateChecks, setGateChecks] = useState([]);

  // Cost estimation
  const [costEstimate, setCostEstimate] = useState(null);

  // Confirmation modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Generate dispatch number
  useEffect(() => {
    const result = documentNumberingService.generateNumber('DP', 'malang');
    setDispatchNumber(result.number);
  }, []);

  // Available SJ: only ASSIGNED status (created but not yet dispatched)
  const availableSJ = useMemo(() =>
    suratJalan.filter(sj => sj.status === SJ_STATUS.ASSIGNED || sj.status === SJ_STATUS.DRAFT),
    [suratJalan]
  );

  // Available trucks: only ACTIVE status, not in maintenance
  const availableTrucks = useMemo(() =>
    (fleet.length > 0 ? fleet : SAMPLE_FLEET).filter(t => t.status === VEHICLE_STATUS.ACTIVE),
    [fleet]
  );

  // Available drivers: only ACTIVE status
  const availableDrivers = useMemo(() =>
    (drivers.length > 0 ? drivers : SAMPLE_DRIVERS).filter(d => d.status === 'ACTIVE'),
    [drivers]
  );

  // Selected SJ data
  const selectedSJData = useMemo(() =>
    suratJalan.find(sj => sj.number === selectedSJ),
    [suratJalan, selectedSJ]
  );

  // Selected truck data
  const selectedTruckData = useMemo(() =>
    (fleet.length > 0 ? fleet : SAMPLE_FLEET).find(t => t.id === selectedTruck || t.plate === selectedTruck),
    [fleet, selectedTruck]
  );

  // Selected driver data
  const selectedDriverData = useMemo(() =>
    (drivers.length > 0 ? drivers : SAMPLE_DRIVERS).find(d => d.id === selectedDriver || d.name === selectedDriver),
    [drivers, selectedDriver]
  );

  // Compute gate checks
  useEffect(() => {
    const checks = [];

    // 1. Pre-departure checklist done — check by selected vehicle plate
    const lastChecklistForVehicle = selectedTruckData
      ? checklists
        .filter(cl =>
          cl.type === 'pre-departure' &&
          (cl.vehiclePlate === selectedTruckData.plate || cl.vehiclePlate === selectedTruckData.id)
        )
        .sort((a, b) => new Date(b.completedAt || b.date) - new Date(a.completedAt || a.date))[0]
      : null;

    const hasChecklist = !!lastChecklistForVehicle;
    const checklistIsLayak = hasChecklist && (() => {
      const values = lastChecklistForVehicle.itemValues || {};
      return !Object.values(values).some(cat =>
        Object.values(cat).some(item => item.status === 'TIDAK LAYAK')
      );
    })();

    checks.push({
      id: 'pre_departure_checklist',
      label: 'Pre-Departure Checklist (F-VIC-01)',
      met: hasChecklist && checklistIsLayak,
      required: true,
      description: hasChecklist
        ? checklistIsLayak
          ? `Last: ${lastChecklistForVehicle.id} (${new Date(lastChecklistForVehicle.completedAt || lastChecklistForVehicle.date).toLocaleDateString('id-ID')})`
          : 'Last checklist has "Tidak Layak" finding'
        : 'No pre-departure checklist found for this vehicle',
    });

    // 2. Foto muatan uploaded
    checks.push({
      id: 'foto_muatan',
      label: 'Foto Muatan (F-SJ-03)',
      met: selectedSJData?.photoCount > 0,
      required: true,
      description: 'Minimal 1 foto tampak dalam bak truk',
    });

    // 3. Cash advance approved
    checks.push({
      id: 'cash_advance',
      label: 'Cash Advance Approved (F-SJ-02)',
      met: selectedSJData?.cashAdvance?.uangJalan?.nominal && selectedSJData?.cashAdvance?.uangJalan?.signed,
      required: true,
      description: 'Uang jalan supir harus disetujui dan ditandatangani',
    });

    // 4. SIM driver valid
    const simValid = selectedDriverData
      ? expiryTracker.isEntityValid(selectedDriverData.id, 'driver')
      : null;
    checks.push({
      id: 'sim_valid',
      label: 'SIM Driver Valid',
      met: simValid !== null ? simValid : false,
      required: true,
      status: simValid === null ? 'warning' : undefined,
      description: 'SIM harus masih berlaku dan sesuai kelas kendaraan',
    });

    // 5. Truck not in maintenance
    const truckNotMaintenance = selectedTruckData
      ? selectedTruckData.status !== VEHICLE_STATUS.MAINTENANCE
      : null;
    checks.push({
      id: 'truck_not_maintenance',
      label: 'Truck Tidak Dalam Perbaikan',
      met: truckNotMaintenance !== null ? truckNotMaintenance : false,
      required: true,
      status: truckNotMaintenance === null ? 'warning' : undefined,
      description: 'Truck tidak boleh dalam status maintenance',
    });

    // 6. Truck documents valid (STNK, KIR)
    const truckDocsValid = selectedTruckData
      ? expiryTracker.isEntityValid(selectedTruckData.id, 'truck')
      : null;
    checks.push({
      id: 'truck_docs_valid',
      label: 'Dokumen Kendaraan (STNK/KIR)',
      met: truckDocsValid !== null ? truckDocsValid : false,
      required: true,
      status: truckDocsValid === null ? 'warning' : undefined,
      description: 'STNK dan KIR harus masih berlaku',
    });

    setGateChecks(checks);
  }, [selectedSJ, selectedSJData, selectedDriverData, selectedTruckData, checklists]);

  // All gate checks passed
  const allChecksPassed = useMemo(() =>
    gateChecks.every(check => !check.required || check.met),
    [gateChecks]
  );

  const failedRequiredChecks = useMemo(() =>
    gateChecks.filter(check => check.required && !check.met),
    [gateChecks]
  );

  // Compute cost estimation (F-DP-02)
  useEffect(() => {
    if (!selectedSJData) {
      setCostEstimate(null);
      return;
    }

    const distance = 500; // Default estimate; would come from route planning
    const fuelRate = 3.5; // km per liter
    const fuelPrice = 10000; // Rp per liter
    const tollCost = distance * 500; // Rp per km

    const fuelNeeded = distance / fuelRate;
    const fuelCost = Math.round(fuelNeeded * fuelPrice);
    const surcharge = PRIORITY_CONFIG[priority].surcharge;
    const uangJalan = Number(selectedSJData?.cashAdvance?.uangJalan?.nominal || 0);
    const danaCadangan = Number(selectedSJData?.cashAdvance?.danaCadangan?.nominal || 0);
    const driverAllowance = uangJalan;
    const total = fuelCost + tollCost + surcharge + driverAllowance + danaCadangan;

    setCostEstimate({
      distance,
      fuelCost,
      tollCost,
      surcharge,
      driverAllowance,
      danaCadangan,
      total,
    });
  }, [selectedSJData, priority]);

  // Submit dispatch
  const handleSubmit = () => {
    setLoading(true);

    const dispatchData = {
      id: dispatchNumber,
      number: dispatchNumber,
      sjNumber: selectedSJ,
      driverId: selectedDriverData?.id || selectedDriver,
      driverName: selectedDriverData?.name || selectedDriver,
      truckId: selectedTruckData?.id || selectedTruck,
      truckPlate: selectedTruckData?.plate || selectedTruck,
      priority,
      status: DISPATCH_STATUS.READY,
      costEstimate,
      gateChecks,
      createdAt: new Date().toISOString(),
      dispatchedAt: null,
      deliveredAt: null,
      completedAt: null,
    };

    addDispatch(dispatchData);

    // Update SJ status to ASSIGNED
    if (selectedSJData && (selectedSJData.status === SJ_STATUS.DRAFT || selectedSJData.status === SJ_STATUS.ASSIGNED)) {
      changeSJStatus(selectedSJ, selectedSJData.status, SJ_STATUS.ASSIGNED, `Dispatch ${dispatchNumber} created`);
    }

    auditLogger.log({
      action: 'CREATE',
      documentType: 'DISPATCH',
      documentId: dispatchNumber,
      details: `Dispatch ${dispatchNumber} created for SJ ${selectedSJ}`,
      metadata: { driver: selectedDriver, truck: selectedTruck, priority },
    });

    setLoading(false);
    setShowConfirmModal(false);
    addNotification({
      type: 'success',
      title: 'Dispatch Berhasil Dibuat',
      message: `Dispatch ${dispatchNumber} untuk SJ ${selectedSJ} telah diinisialisasi.`,
    });
    navigate('/dispatch');
  };

  const formatCurrency = (val) => `Rp ${Number(val).toLocaleString('id-ID')}`;

  return (
    <Layout>
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10 animate-fade-in no-scrollbar">
        <div className="max-w-5xl mx-auto space-y-8 pb-24">

          {/* Section 1: Core Assignment */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-4">
              <h2 className="text-3xl font-extrabold text-on-surface font-headline leading-tight tracking-tight">Core Assignment</h2>
              <p className="text-sm text-slate-500 mt-2 font-body pr-4">Select an active order (SJ) and establish the primary operational link between personnel and asset.</p>
              <div className="mt-6 flex items-center gap-3">
                <span className="w-1.5 h-8 bg-primary rounded-full shadow-[0_0_10px_rgba(70,99,71,0.5)]"></span>
                <span className="text-xs font-black text-primary uppercase tracking-widest">Mandatory Fields</span>
              </div>
            </div>

            <div className="lg:col-span-8 glass-panel rounded-2xl p-6 md:p-8 shadow-sm space-y-6 hover:shadow-md transition-shadow">

              {/* SJ Selection */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-primary uppercase tracking-wider block">Surat Jalan (Order) *</label>
                <select
                  value={selectedSJ}
                  onChange={(e) => setSelectedSJ(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border-2 border-primary/50 rounded-xl py-3.5 px-4 text-sm font-bold text-on-surface focus:ring-2 focus:ring-primary focus:border-primary transition-all appearance-none cursor-pointer shadow-sm"
                >
                  <option value="">-- Pilih Surat Jalan --</option>
                  {availableSJ.length === 0 ? (
                    <option disabled>Tidak ada SJ yang tersedia</option>
                  ) : (
                    availableSJ.map(sj => (
                      <option key={sj.number} value={sj.number}>
                        {sj.number} — {sj.clientName || sj.destination || 'No destination'}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Driver Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Driver *</label>
                  <select
                    value={selectedDriver}
                    onChange={(e) => setSelectedDriver(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl py-3.5 px-4 text-sm font-bold text-on-surface focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all appearance-none cursor-pointer shadow-inner"
                  >
                    <option value="">-- Pilih Driver --</option>
                    {availableDrivers.length === 0 ? (
                      <option disabled>Tidak ada driver tersedia</option>
                    ) : (
                      availableDrivers.map(d => (
                        <option key={d.id} value={d.id}>{d.name} ({d.id})</option>
                      ))
                    )}
                  </select>
                </div>

                {/* Truck Selection */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Assigned Vehicle *</label>
                  <select
                    value={selectedTruck}
                    onChange={(e) => setSelectedTruck(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl py-3.5 px-4 text-sm font-bold text-on-surface focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all appearance-none cursor-pointer shadow-inner"
                  >
                    <option value="">-- Pilih Truck --</option>
                    {availableTrucks.length === 0 ? (
                      <option disabled>Tidak ada truck tersedia</option>
                    ) : (
                      availableTrucks.map(t => (
                        <option key={t.id} value={t.id}>{t.plate} — {t.type} ({t.id})</option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              {/* Priority Selection */}
              <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Operational Priority</label>
                <div className="flex flex-col sm:flex-row gap-3">
                  {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => (
                    <label
                      key={key}
                      className={`flex-1 text-center py-3.5 px-4 rounded-xl border-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-semibold text-sm has-[:checked]:border-${cfg.color} shadow-sm bg-white dark:bg-slate-900 group ${
                        priority === key ? `border-${cfg.color} bg-${cfg.color}/5` : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <input type="radio" name="priority" value={key} checked={priority === key} onChange={() => setPriority(key)} className="hidden" />
                      <span className={`flex items-center justify-center gap-1.5 ${priority === key ? `text-${cfg.color}` : 'text-slate-600 dark:text-slate-300'}`}>
                        <span className="material-symbols-outlined text-sm">{cfg.icon}</span>
                        {cfg.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* SJ Preview (if selected) */}
              {selectedSJData && (
                <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/20">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Selected SJ Details</p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-slate-400">Number</p>
                      <p className="font-bold text-on-surface">{selectedSJData.number}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Client</p>
                      <p className="font-bold text-on-surface">{selectedSJData.clientName}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Destination</p>
                      <p className="font-bold text-on-surface">{selectedSJData.destination}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Items</p>
                      <p className="font-bold text-on-surface">{selectedSJData.items?.length || 0} items, {selectedSJData.totalWeight}T</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Section 2: Gate Check Validation (F-DP-01) */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-4">
              <h2 className="text-3xl font-extrabold text-on-surface font-headline leading-tight tracking-tight">Gate Check</h2>
              <p className="text-sm text-slate-500 mt-2 font-body pr-4">All required checks must pass before dispatch can be released.</p>

              {/* Validation Summary */}
              <div className="mt-6 flex items-center gap-3">
                {allChecksPassed ? (
                  <div className="flex items-center gap-2 bg-primary/10 px-3 py-2 rounded-full border border-primary/20">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
                    <span className="text-xs font-bold text-primary uppercase tracking-widest">All Checks Passed</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-error/10 px-3 py-2 rounded-full border border-error/20">
                    <span className="w-2.5 h-2.5 rounded-full bg-error"></span>
                    <span className="text-xs font-bold text-error uppercase tracking-widest">{failedRequiredChecks.length} Failed</span>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-8 glass-panel rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow">
              <GateCheck checks={gateChecks} />
            </div>
          </section>

          {/* Section 3: Cost Estimation (F-DP-02) */}
          {costEstimate && (
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="lg:col-span-4">
                <h2 className="text-3xl font-extrabold text-on-surface font-headline leading-tight tracking-tight">Cost Estimation</h2>
                <p className="text-sm text-slate-500 mt-2 font-body pr-4">Estimated operational costs based on route, cargo, and priority level.</p>
              </div>

              <div className="lg:col-span-8 glass-panel rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="space-y-4">
                  {/* Route Info */}
                  <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <span className="material-symbols-outlined text-primary">map</span>
                    <div>
                      <p className="text-xs text-slate-400">Estimated Distance</p>
                      <p className="text-lg font-bold font-headline text-on-surface">{costEstimate.distance.toLocaleString()} km</p>
                    </div>
                  </div>

                  {/* Cost Breakdown */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-slate-400 text-[18px]">local_gas_station</span>
                        <span className="text-sm text-slate-500">BBM (Est.)</span>
                      </div>
                      <span className="text-sm font-bold text-on-surface">{formatCurrency(costEstimate.fuelCost)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-slate-400 text-[18px]">toll</span>
                        <span className="text-sm text-slate-500">Tol (Est.)</span>
                      </div>
                      <span className="text-sm font-bold text-on-surface">{formatCurrency(costEstimate.tollCost)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-slate-400 text-[18px]">payments</span>
                        <span className="text-sm text-slate-500">Uang Jalan Driver</span>
                      </div>
                      <span className="text-sm font-bold text-on-surface">{formatCurrency(costEstimate.driverAllowance)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-slate-400 text-[18px]">{PRIORITY_CONFIG[priority].icon}</span>
                        <span className="text-sm text-slate-500">Priority Surcharge ({PRIORITY_CONFIG[priority].label})</span>
                      </div>
                      <span className="text-sm font-bold text-on-surface">{formatCurrency(costEstimate.surcharge)}</span>
                    </div>
                    {costEstimate.danaCadangan > 0 && (
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-slate-400 text-[18px]">build_circle</span>
                          <span className="text-sm text-slate-500">Dana Cadangan</span>
                        </div>
                        <span className="text-sm font-bold text-on-surface">{formatCurrency(costEstimate.danaCadangan)}</span>
                      </div>
                    )}
                  </div>

                  {/* Total */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-on-surface">Total Estimated Cost</span>
                      <span className="text-2xl font-black font-headline text-primary">{formatCurrency(costEstimate.total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Section 4: Route Preview */}
          {selectedSJData && (
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="lg:col-span-4">
                <h2 className="text-3xl font-extrabold text-on-surface font-headline leading-tight tracking-tight">Route Details</h2>
                <p className="text-sm text-slate-500 mt-2 font-body pr-4">Geographic trajectory from the selected Surat Jalan.</p>
              </div>

              <div className="lg:col-span-8 glass-panel rounded-2xl p-8 shadow-md">
                <div className="relative z-10 space-y-6">
                  <div className="flex items-stretch gap-6">
                    <div className="flex flex-col items-center pt-2">
                      <div className="w-5 h-5 rounded-full border-4 border-primary bg-white dark:bg-slate-900 shadow-sm z-10"></div>
                      <div className="w-px flex-1 bg-gradient-to-b from-primary via-slate-300 dark:via-slate-600 to-secondary mx-auto my-1"></div>
                      <div className="w-5 h-5 rounded-full bg-secondary shadow-sm z-10 border-4 border-white dark:border-slate-900 box-content"></div>
                    </div>

                    <div className="flex-1 space-y-6 py-1">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Origin</label>
                        <div className="text-lg font-bold text-on-surface font-headline leading-tight">
                          {selectedSJData.originDepot || 'Depot Malang'}
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Destination</label>
                        <div className="text-lg font-bold text-on-surface font-headline leading-tight">
                          {selectedSJData.destination}
                        </div>
                        <div className="text-sm text-primary font-bold mt-1 flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px]">person</span>
                          {selectedSJData.clientName}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

        </div>
      </div>

      {/* Footer Action Bar */}
      <div className="sticky bottom-0 left-0 w-full z-40 bg-white dark:bg-slate-900 border-t border-outline-variant/30">
        <div className="px-4 md:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6 w-full sm:w-auto">
            {allChecksPassed && selectedSJ && selectedDriver && selectedTruck ? (
              <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(70,99,71,0.8)]"></span>
                <span className="text-[11px] font-bold text-primary uppercase tracking-widest">Validation: Passed</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-full border border-amber-200 dark:border-amber-800">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-widest">Validation: {failedRequiredChecks.length} Failed</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {costEstimate && (
              <div className="hidden md:flex flex-col items-end mr-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Est. Total</span>
                <span className="text-sm font-bold text-primary">{formatCurrency(costEstimate.total)}</span>
              </div>
            )}
            <button
              onClick={() => {
                if (!allChecksPassed) {
                  addNotification({
                    type: 'error',
                    title: 'Gate Check Gagal',
                    message: `${failedRequiredChecks.length} check wajib belum terpenuhi. Dispatch tidak dapat dilanjutkan.`,
                  });
                  return;
                }
                setShowConfirmModal(true);
              }}
              disabled={!allChecksPassed || !selectedSJ || !selectedDriver || !selectedTruck}
              className="px-8 py-3 rounded-xl bg-primary hover:bg-[#3a533a] text-white font-bold shadow-lg shadow-primary/30 hover:shadow-xl hover:-translate-y-0.5 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:translate-y-0 overflow-hidden relative group"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
              <span>Initialize Dispatch</span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Dispatch"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-500">You are about to initialize dispatch with the following details:</p>

          <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Dispatch Number</p>
              <p className="text-sm font-bold text-on-surface">{dispatchNumber}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Surat Jalan</p>
              <p className="text-sm font-bold text-on-surface">{selectedSJ}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Driver</p>
              <p className="text-sm font-bold text-on-surface">{selectedDriverData?.name || selectedDriver}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Truck</p>
              <p className="text-sm font-bold text-on-surface">{selectedTruckData?.plate || selectedTruck}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Priority</p>
              <p className="text-sm font-bold text-on-surface">{PRIORITY_CONFIG[priority].label}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Est. Cost</p>
              <p className="text-sm font-bold text-primary">{formatCurrency(costEstimate?.total || 0)}</p>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setShowConfirmModal(false)}
              className="flex-1 px-5 py-3 rounded-xl font-bold text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              type="button"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 px-5 py-3 rounded-xl font-bold text-sm bg-primary text-white hover:bg-[#3a533a] transition-all shadow-md flex items-center justify-center gap-2"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              Confirm Dispatch
            </button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}
