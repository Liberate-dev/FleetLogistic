import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import Modal from '../components/ui/Modal';
import FileUpload from '../components/ui/FileUpload';
import ChecklistItem from '../components/ui/ChecklistItem';
import SearchableSelect from '../components/ui/SearchableSelect';
import { useFleetOps } from '../context';
import { documentNumberingService } from '../utils/documentNumbering';
import { auditLogger } from '../utils/auditLogger';
import { storageService } from '../utils/storageService';
import {
  PRE_DEPARTURE_CATEGORIES,
  POST_ARRIVAL_CATEGORIES,
  CHECKLIST_STATUS,
  CHECKLIST_ITEM_STATUS,
  AUDIT_ACTIONS,
  USER_ROLES,
} from '../constants';

export default function VehicleChecklist() {
  const { sjNumber: paramSJ } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { checklists, fleet, drivers, suratJalan, createChecklist, updateChecklist, setLoading } = useFleetOps();

  // Fallback sample drivers if context empty
  const sampleDrivers = [
    { id: 'DRV-001', employeeId: 'EMP-2022-001', name: 'Sudirman Pratama', phone: '081234567890', simType: 'B2', status: 'AVAILABLE' },
    { id: 'DRV-002', employeeId: 'EMP-2021-045', name: 'Agus Mahendra', phone: '081234567891', simType: 'C', status: 'AVAILABLE' },
    { id: 'DRV-003', employeeId: 'EMP-2021-012', name: 'Budi Santoso', phone: '081234567892', simType: 'B2', status: 'ON_DISPATCH' },
    { id: 'DRV-004', employeeId: 'EMP-2021-033', name: 'Rudi Hermawan', phone: '081234567893', simType: 'C', status: 'ON_LEAVE' },
    { id: 'DRV-005', employeeId: 'EMP-2023-008', name: 'Dewi Lestari', phone: '081234567894', simType: 'B1', status: 'AVAILABLE' },
  ];

  const allDrivers = drivers.length > 0 ? drivers : sampleDrivers;

  const [activeTab, setActiveTab] = useState('pre-departure');
  const [checklistNumber, setChecklistNumber] = useState('');
  const [sjNumber, setSJNumber] = useState(paramSJ || '');
  const [vehiclePlate, setVehiclePlate] = useState(searchParams.get('plate') || '');
  const [vehicleId, setVehicleId] = useState(searchParams.get('vehicle') || '');
  const [driverName, setDriverName] = useState('');
  const [checklistDate, setChecklistDate] = useState(new Date().toISOString().split('T')[0]);

  // Item values: { [categoryId]: { [itemId]: { status, inputValue, notes, photos: [] } } }
  const [itemValues, setItemValues] = useState({});
  const [expandedCategories, setExpandedCategories] = useState({});

  // Fleet manager approval modal
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [pendingApprovalItem, setPendingApprovalItem] = useState(null);
  const [approvalNote, setApprovalNote] = useState('');

  // Blocker modal
  const [showBlockerModal, setShowBlockerModal] = useState(false);
  const [blockingItems, setBlockingItems] = useState([]);

  // Odometer photos
  const [odometerPhotos, setOdometerPhotos] = useState({});

  // Computed values
  const categories = activeTab === 'pre-departure' ? PRE_DEPARTURE_CATEGORIES : POST_ARRIVAL_CATEGORIES;

  const odometerAwal = itemValues['bak']?.['odometer']?.inputValue || '';
  const odometerAkhir = itemValues['bak_post']?.['odometer_akhir']?.inputValue || '';
  const distanceTraveled = odometerAwal && odometerAkhir
    ? Number(odometerAkhir) - Number(odometerAwal)
    : 0;

  // Progress calculation
  const getProgress = useCallback((category) => {
    const items = category.items || [];
    const filled = items.filter(item => {
      const val = itemValues[category.id]?.[item.id];
      if (!val) return false;
      if (item.type === 'choice') return !!val.status;
      if (item.type === 'checkbox') return val.checked !== undefined;
      if (item.type === 'input') return !!val.inputValue;
      return false;
    }).length;
    return { filled, total: items.length, percent: items.length > 0 ? Math.round((filled / items.length) * 100) : 0 };
  }, [itemValues]);

  // Blocking items
  const getBlockingItems = useCallback(() => {
    const blockers = [];
    categories.forEach(cat => {
      cat.items.forEach(item => {
        const val = itemValues[cat.id]?.[item.id];
        if (val?.status === CHECKLIST_ITEM_STATUS.TIDAK_LAYAK) {
          blockers.push({ categoryId: cat.id, itemId: item.id, label: item.label, categoryName: cat.name });
        }
      });
    });
    return blockers;
  }, [categories, itemValues]);

  // Warning items (Perlu Perhatian)
  const getWarningItems = useCallback(() => {
    const warnings = [];
    categories.forEach(cat => {
      cat.items.forEach(item => {
        const val = itemValues[cat.id]?.[item.id];
        if (val?.status === CHECKLIST_ITEM_STATUS.PERLU_PERHATIAN) {
          warnings.push({ categoryId: cat.id, itemId: item.id, label: item.label, categoryName: cat.name, approved: val.fleetManagerApproved });
        }
      });
    });
    return warnings;
  }, [categories, itemValues]);

  // Generate checklist number on mount
  useEffect(() => {
    const result = documentNumberingService.generateNumber('CL', 'malang');
    setChecklistNumber(result.number);
    if (paramSJ) setSJNumber(paramSJ);
  }, [paramSJ]);

  // Auto-expand first category
  useEffect(() => {
    if (categories.length > 0) {
      setExpandedCategories(prev => ({ ...prev, [categories[0].id]: true }));
    }
  }, [activeTab]);

  // Handle item value change
  const handleItemChange = (categoryId, itemId, value) => {
    setItemValues(prev => ({
      ...prev,
      [categoryId]: {
        ...(prev[categoryId] || {}),
        [itemId]: value,
      },
    }));

    // Audit log for status changes to critical values
    if (value?.status === CHECKLIST_ITEM_STATUS.TIDAK_LAYAK || value?.status === CHECKLIST_ITEM_STATUS.PERLU_PERHATIAN) {
      auditLogger.log({
        action: AUDIT_ACTIONS.STATUS_CHANGE,
        documentType: 'CHECKLIST',
        documentId: checklistNumber,
        details: `Item "${itemId}" marked as ${value.status}`,
        metadata: { categoryId, itemId, status: value.status },
      });

      if (value.status === CHECKLIST_ITEM_STATUS.TIDAK_LAYAK) {
        // Auto-show blocker notification
        setBlockingItems(getBlockingItems());
        setShowBlockerModal(true);
      } else if (value.status === CHECKLIST_ITEM_STATUS.PERLU_PERHATIAN) {
        // Require fleet manager approval
        setPendingApprovalItem({ categoryId, itemId, value });
        setShowApprovalModal(true);
      }
    }
  };

  // Handle fleet manager approval
  const handleFleetManagerApproval = () => {
    if (!pendingApprovalItem) return;
    const { categoryId, itemId } = pendingApprovalItem;

    setItemValues(prev => ({
      ...prev,
      [categoryId]: {
        ...(prev[categoryId] || {}),
        [itemId]: {
          ...(prev[categoryId]?.[itemId] || {}),
          fleetManagerApproved: true,
          fleetManagerNote: approvalNote,
          fleetManagerApprovedAt: new Date().toISOString(),
        },
      },
    }));

    auditLogger.log({
      action: AUDIT_ACTIONS.APPROVE,
      documentType: 'CHECKLIST',
      documentId: checklistNumber,
      details: `Fleet Manager approved item "${itemId}" (Perlu Perhatian)`,
      metadata: { categoryId, itemId, approvalNote },
    });

    setShowApprovalModal(false);
    setPendingApprovalItem(null);
    setApprovalNote('');
  };

  // Handle checklist submit
  const handleSubmit = () => {
    const blockers = getBlockingItems();
    if (blockers.length > 0) {
      setBlockingItems(blockers);
      setShowBlockerModal(true);
      return;
    }

    const warnings = getWarningItems();
    const unapprovedWarnings = warnings.filter(w => !w.approved);
    if (unapprovedWarnings.length > 0) {
      setBlockingItems(unapprovedWarnings.map(w => ({
        ...w,
        reason: 'Requires Fleet Manager approval',
      })));
      setShowBlockerModal(true);
      return;
    }

    // Check all items are filled
    let allFilled = true;
    categories.forEach(cat => {
      const progress = getProgress(cat);
      if (progress.filled < progress.total) allFilled = false;
    });

    if (!allFilled) {
      // Still allow submit but warn
      if (!window.confirm('Not all checklist items are filled. Submit anyway?')) return;
    }

    const status = activeTab === 'pre-departure'
      ? CHECKLIST_STATUS['PRE-DEPARTURE DONE']
      : CHECKLIST_STATUS['POST-ARRIVAL DONE'];

    const checklistData = {
      id: checklistNumber,
      number: checklistNumber,
      type: activeTab,
      sjNumber,
      vehiclePlate,
      driverName,
      date: checklistDate,
      status,
      itemValues,
      odometerAwal,
      odometerAkhir,
      distanceTraveled,
      odometerPhotos,
      completedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Check if updating existing
    const existing = checklists.find(cl => cl.id === checklistNumber);
    if (existing) {
      updateChecklist(checklistData);
    } else {
      createChecklist(checklistData);
    }

    auditLogger.log({
      action: AUDIT_ACTIONS.UPDATE,
      documentType: 'CHECKLIST',
      documentId: checklistNumber,
      details: `Checklist completed: ${status}`,
      metadata: { type: activeTab, sjNumber, vehiclePlate },
    });

    // Show success and navigate
    alert(`Checklist ${checklistNumber} saved successfully!`);
    navigate('/dispatch');
  };

  // Toggle category expand
  const toggleCategory = (catId) => {
    setExpandedCategories(prev => ({ ...prev, [catId]: !prev[catId] }));
  };

  // Render photo upload for a specific item
  const renderItemPhotoUpload = (categoryId, itemId) => {
    const photos = odometerPhotos[`${categoryId}_${itemId}`] || [];
    return (
      <FileUpload
        documentId={`${checklistNumber}_${categoryId}_${itemId}`}
        category={`checklist_${activeTab}`}
        fileType="photo"
        label="Foto Bukti"
        multiple={false}
        maxFiles={3}
        onUploadComplete={(results) => {
          setOdometerPhotos(prev => ({
            ...prev,
            [`${categoryId}_${itemId}`]: results,
          }));
          storageService.storeFile(
            checklistNumber,
            'photo',
            `checklist_${categoryId}_${itemId}`,
            results[0]?.dataUrl || '',
            { itemId, categoryId }
          );
        }}
        existingFiles={photos}
      />
    );
  };

  // Render a single checklist item
  const renderChecklistItem = (item, category) => {
    const value = itemValues[category.id]?.[item.id] || {};
    const hasPhoto = (odometerPhotos[`${category.id}_${item.id}`] || []).length > 0;
    const needsPhoto = item.photoRequired === true || item.photoRequired === 'conditional';

    return (
      <ChecklistItem
        key={item.id}
        item={item}
        value={value}
        onChange={(val) => handleItemChange(category.id, item.id, val)}
        photoRequired={needsPhoto}
        photoUploaded={hasPhoto}
        onPhotoUpload={needsPhoto ? () => renderItemPhotoUpload(category.id, item.id) : null}
      />
    );
  };

  return (
    <Layout>
      {/* Top Navigation Bar */}
      <header className="w-full h-[72px] shrink-0 sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-outline-variant/20 flex items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-4">
          <button className="md:hidden text-on-surface" onClick={() => navigate(-1)} type="button">
            <span className="material-symbols-outlined">menu</span>
          </button>
          <div className="flex items-center gap-6">
            <h1 className="font-headline text-xl font-bold tracking-tight text-emerald-900 dark:text-emerald-100">
              Vehicle Inspection Checklist
            </h1>
            <div className="hidden sm:block h-6 w-px bg-slate-300 dark:bg-slate-700"></div>
            <div className="hidden sm:flex items-center gap-2 text-slate-500">
              <span className="material-symbols-outlined text-sm">edit_note</span>
              <span className="text-sm font-medium font-body bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                {checklistNumber}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm flex items-center gap-2 active:scale-95"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span className="hidden sm:inline">Kembali</span>
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-primary hover:bg-[#3a533a] text-white rounded-xl text-sm font-bold transition-all shadow-md active:scale-95 flex items-center gap-2"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">save</span>
            <span className="hidden sm:inline">Simpan Checklist</span>
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10 animate-fade-in no-scrollbar bg-slate-50/50 dark:bg-slate-900/50">
        <div className="max-w-5xl mx-auto space-y-8 pb-36">

          {/* Header Section */}
          <section className="glass-panel rounded-2xl p-6 md:p-8 shadow-sm space-y-6 hover:shadow-md transition-shadow bg-white dark:bg-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-primary">directions_car</span>
              <h2 className="text-xl font-bold font-headline text-on-surface">Informasi Checklist</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-primary uppercase tracking-wider">Nomor Checklist</label>
                <div className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3 text-sm font-bold text-on-surface">
                  {checklistNumber}
                </div>
              </div>

              <SearchableSelect
                value={sjNumber}
                onChange={setSJNumber}
                label="Nomor SJ *"
                placeholder="Ketik atau pilih SJ..."
                options={suratJalan.map(sj => ({
                  value: sj.number,
                  label: `${sj.number} — ${sj.destination} (${sj.clientName})`,
                }))}
              />

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Plat Kendaraan</label>
                <input
                  type="text"
                  value={vehiclePlate}
                  onChange={(e) => setVehiclePlate(e.target.value)}
                  placeholder="Contoh: B 1234 XYZ"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3 text-sm font-bold text-on-surface focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Nama Driver</label>
                <select
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3 text-sm font-bold text-on-surface focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none appearance-none cursor-pointer"
                >
                  <option value="">-- Pilih Driver --</option>
                  {allDrivers.map(d => (
                    <option key={d.id} value={d.name}>{d.name} ({d.employeeId})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tanggal Checklist</label>
                <input
                  type="date"
                  value={checklistDate}
                  onChange={(e) => setChecklistDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3 text-sm font-bold text-on-surface focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tipe Checklist</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab('pre-departure')}
                    className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold transition-all border ${
                      activeTab === 'pre-departure'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300'
                    }`}
                    type="button"
                  >
                    Pre-Departure
                  </button>
                  <button
                    onClick={() => setActiveTab('post-arrival')}
                    className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold transition-all border ${
                      activeTab === 'post-arrival'
                        ? 'border-secondary bg-secondary/10 text-secondary'
                        : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300'
                    }`}
                    type="button"
                  >
                    Post-Arrival
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Odometer Distance Summary (Post-Arrival only) */}
          {activeTab === 'post-arrival' && odometerAwal && odometerAkhir && (
            <section className="glass-panel rounded-2xl p-6 shadow-sm bg-gradient-to-r from-secondary/5 to-tertiary/5 border border-secondary/20 dark:border-secondary/10">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary text-2xl">speed</span>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Jarak Tempuh</p>
                  <p className="text-2xl font-black font-headline text-on-surface">
                    {distanceTraveled.toLocaleString()} km
                  </p>
                </div>
                <div className="ml-auto flex items-center gap-4 text-sm">
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 uppercase">Awal</p>
                    <p className="font-bold">{Number(odometerAwal).toLocaleString()} km</p>
                  </div>
                  <span className="material-symbols-outlined text-slate-300">arrow_forward</span>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 uppercase">Akhir</p>
                    <p className="font-bold">{Number(odometerAkhir).toLocaleString()} km</p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Blocking Items Alert */}
          {getBlockingItems().length > 0 && (
            <section className="glass-panel rounded-2xl p-6 shadow-sm border border-error/20 bg-error/5">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-error text-2xl mt-0.5">block</span>
                <div>
                  <h3 className="font-bold font-headline text-error">Dispatch Diblokir</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                    {getBlockingItems().length} item(s) berstatus "Tidak Layak". Dispatch tidak dapat dilanjutkan.
                  </p>
                  <ul className="mt-2 space-y-1">
                    {getBlockingItems().map((item, idx) => (
                      <li key={idx} className="text-xs text-slate-500 flex items-center gap-2">
                        <span className="material-symbols-outlined text-error text-sm">cancel</span>
                        {item.label} ({item.categoryName})
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-slate-500 mt-3 italic">
                    Hubungi Fleet Manager untuk persetujuan atau tindak lanjut perbaikan.
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Categories */}
          {categories.map((category, catIdx) => {
            const progress = getProgress(category);
            const isExpanded = expandedCategories[category.id];

            return (
              <section
                key={category.id}
                className="glass-panel rounded-2xl shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-slate-800 overflow-hidden"
              >
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="w-full flex items-center justify-between p-5 md:p-6 text-left hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors"
                  type="button"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 dark:bg-primary/5 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary">{category.icon}</span>
                    </div>
                    <div>
                      <h3 className="text-base font-bold font-headline text-on-surface">{category.name}</h3>
                      <p className="text-xs text-slate-500">
                        {progress.filled}/{progress.total} item terisi
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Progress Bar */}
                    <div className="hidden sm:flex items-center gap-2 w-24">
                      <div className="flex-1 bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            progress.percent === 100 ? 'bg-primary' : 'bg-slate-400'
                          }`}
                          style={{ width: `${progress.percent}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-bold text-slate-400 w-8 text-right">{progress.percent}%</span>
                    </div>
                    <span className="material-symbols-outlined text-slate-400 transition-transform duration-200"
                      style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                      expand_more
                    </span>
                  </div>
                </button>

                {/* Category Items */}
                {isExpanded && (
                  <div className="px-5 md:px-6 pb-5 md:pb-6 space-y-3 border-t border-slate-100 dark:border-slate-700/50 pt-4">
                    {category.items.map(item => (
                      <React.Fragment key={item.id}>
                        {renderChecklistItem(item, category)}
                      </React.Fragment>
                    ))}
                  </div>
                )}
              </section>
            );
          })}

        </div>
      </div>

      {/* Footer Action Bar */}
      <div className="sticky bottom-0 left-0 w-full z-40 flex-shrink-0">
        <div className="backdrop-blur-xl bg-white/90 dark:bg-slate-900/90 border-t border-outline-variant/30 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            {/* Overall Progress */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Progress:</span>
              {(() => {
                let totalFilled = 0;
                let totalItems = 0;
                categories.forEach(cat => {
                  const p = getProgress(cat);
                  totalFilled += p.filled;
                  totalItems += p.total;
                });
                const pct = totalItems > 0 ? Math.round((totalFilled / totalItems) * 100) : 0;
                return (
                  <>
                    <div className="w-20 bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${pct}%` }}></div>
                    </div>
                    <span className="text-xs font-bold text-primary">{pct}%</span>
                  </>
                );
              })()}
            </div>
            <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(70,99,71,0.8)]"></span>
              <span className="text-[11px] font-bold text-primary uppercase tracking-widest">
                {activeTab === 'pre-departure' ? 'Pre-Departure' : 'Post-Arrival'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm"
              type="button"
            >
              Batal
            </button>
            <button
              onClick={handleSubmit}
              className="px-8 py-3 rounded-xl bg-primary hover:bg-[#3a533a] text-white font-bold shadow-lg shadow-primary/30 hover:shadow-xl hover:-translate-y-0.5 transition-all text-sm flex items-center justify-center gap-2 w-full sm:w-auto overflow-hidden relative group"
              type="button"
            >
              <span className="relative flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                Selesai & Simpan
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Fleet Manager Approval Modal */}
      <Modal
        isOpen={showApprovalModal}
        onClose={() => {
          setShowApprovalModal(false);
          setPendingApprovalItem(null);
          setApprovalNote('');
        }}
        title="Persetujuan Fleet Manager"
        size="md"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-xl">
            <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-2xl mt-0.5">warning</span>
            <div>
              <p className="text-sm font-bold text-amber-800 dark:text-amber-300">Item memerlukan persetujuan</p>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                Item "<strong>{pendingApprovalItem?.itemId}</strong>" berstatus "Perlu Perhatian".
                Fleet Manager harus memberikan persetujuan eksplisit sebelum checklist dapat diselesaikan.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Catatan Persetujuan
            </label>
            <textarea
              value={approvalNote}
              onChange={(e) => setApprovalNote(e.target.value)}
              placeholder="Tulis alasan persetujuan atau tindak lanjut yang diperlukan..."
              rows={3}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3 text-sm font-medium text-on-surface focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => {
                setShowApprovalModal(false);
                setPendingApprovalItem(null);
                setApprovalNote('');
              }}
              className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              type="button"
            >
              Nanti
            </button>
            <button
              onClick={handleFleetManagerApproval}
              className="flex-1 px-4 py-2.5 bg-primary hover:bg-[#3a533a] text-white rounded-xl text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              Setujui
            </button>
          </div>
        </div>
      </Modal>

      {/* Blocker Modal */}
      <Modal
        isOpen={showBlockerModal}
        onClose={() => {
          setShowBlockerModal(false);
          setBlockingItems([]);
        }}
        title="Checklist Diblokir"
        size="lg"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-error/5 border border-error/20 rounded-xl">
            <span className="material-symbols-outlined text-error text-2xl mt-0.5">block</span>
            <div>
              <p className="text-sm font-bold text-error">Dispatch tidak dapat dilanjutkan</p>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                {blockingItems.length} item(s) menghalangi dispatch. Selesaikan masalah berikut sebelum melanjutkan:
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {blockingItems.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 bg-error/5 border border-error/10 rounded-xl"
              >
                <span className="material-symbols-outlined text-error text-lg mt-0.5">cancel</span>
                <div>
                  <p className="text-sm font-bold text-on-surface">{item.label}</p>
                  <p className="text-xs text-slate-500">{item.categoryName}</p>
                  {item.reason && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">{item.reason}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => {
                setShowBlockerModal(false);
                setBlockingItems([]);
              }}
              className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              type="button"
            >
              Mengerti
            </button>
            <button
              onClick={() => {
                setShowBlockerModal(false);
                setBlockingItems([]);
              }}
              className="flex-1 px-4 py-2.5 bg-primary hover:bg-[#3a533a] text-white rounded-xl text-sm font-bold transition-all shadow-md"
              type="button"
            >
              Kembali ke Checklist
            </button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}
