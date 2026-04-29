import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Modal, FileUpload } from '../components/ui';
import { documentNumberingService, auditLogger } from '../utils';
import { useFleetOps } from '../context';
import { SJ_STATUS } from '../constants';

export default function CreateNewSJ() {
  const { createSJ, setLoading, addNotification, drivers } = useFleetOps();

  // Fallback sample drivers if context empty
  const sampleDrivers = [
    { id: 'DRV-001', employeeId: 'EMP-2022-001', name: 'Sudirman Pratama', phone: '081234567890', simType: 'B2', status: 'AVAILABLE' },
    { id: 'DRV-002', employeeId: 'EMP-2021-045', name: 'Agus Mahendra', phone: '081234567891', simType: 'C', status: 'AVAILABLE' },
    { id: 'DRV-003', employeeId: 'EMP-2021-012', name: 'Budi Santoso', phone: '081234567892', simType: 'B2', status: 'ON_DISPATCH' },
    { id: 'DRV-004', employeeId: 'EMP-2021-033', name: 'Rudi Hermawan', phone: '081234567893', simType: 'C', status: 'ON_LEAVE' },
    { id: 'DRV-005', employeeId: 'EMP-2023-008', name: 'Dewi Lestari', phone: '081234567894', simType: 'B1', status: 'AVAILABLE' },
  ];

  const allDrivers = drivers.length > 0 ? drivers : sampleDrivers;

  // F-SJ-01: Auto-generate SJ Number on mount
  const [sjNumber, setSjNumber] = useState(null);

  useEffect(() => {
    const generated = documentNumberingService.generateNumber('SJ', 'malang');
    setSjNumber(generated.number);
  }, []);

  // Form State
  const [formData, setFormData] = useState({
    loadingDate: '',
    originDepot: '',
    destination: '',
    clientName: '',
  });

  // Cargo Items
  const [items, setItems] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedSku, setSelectedSku] = useState('');
  const [addQty, setAddQty] = useState('');

  const masterMaterials = [
    { sku: 'LIME-KAPUR-001', name: 'Kapur Tohor (Quicklime)', unit: 'Kg', defaultWeight: 1, defaultVolume: 0.001, weightUnit: 'kg', volumeUnit: 'm³' },
    { sku: 'LIME-HYD-002', name: 'Kapur Padam (Hydrated Lime)', unit: 'Kg', defaultWeight: 1, defaultVolume: 0.0015, weightUnit: 'kg', volumeUnit: 'm³' },
    { sku: 'LIME-PEL-003', name: 'Kapur Pellet', unit: 'Kg', defaultWeight: 1, defaultVolume: 0.0012, weightUnit: 'kg', volumeUnit: 'm³' },
  ];

  // F-SJ-02: Cash Advance State
  const [isCashAdvanceOpen, setIsCashAdvanceOpen] = useState(false);
  const [cashAdvance, setCashAdvance] = useState({
    uangJalan: { nominal: '', recipient: '', signed: false },
    danaCadangan: { nominal: '' },
    status: 'pending', // pending, approved
  });

  // F-SJ-03: Photo Muatan State
  const [muatanPhotos, setMuatanPhotos] = useState([]);

  // WA Notification State
  const [waNotificationStatus, setWaNotificationStatus] = useState('idle'); // idle, sending, sent, failed

  // Stepper
  const [currentStep, setCurrentStep] = useState(1);
  const steps = [
    { id: 1, name: 'General Info', icon: 'description' },
    { id: 2, name: 'Cargo', icon: 'inventory' },
    { id: 3, name: 'Cash Advance', icon: 'payments' },
    { id: 4, name: 'Foto Muatan', icon: 'photo_library' },
    { id: 5, name: 'Review', icon: 'check_circle' },
  ];

  const selectedMaterial = masterMaterials.find(m => m.sku === selectedSku);
  const computedWeight = selectedMaterial && addQty ? (selectedMaterial.defaultWeight * parseFloat(addQty)).toFixed(0) : 0;
  const computedVolume = selectedMaterial && addQty ? (selectedMaterial.defaultVolume * parseFloat(addQty)).toFixed(2) : 0;

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!selectedMaterial || !addQty) return;
    setItems([...items, {
      id: Date.now(),
      sku: selectedMaterial.sku,
      name: selectedMaterial.name,
      qty: parseInt(addQty),
      unit: selectedMaterial.unit,
      weight: parseFloat(computedWeight),
      weightUnit: selectedMaterial.weightUnit,
      volume: parseFloat(computedVolume),
      volumeUnit: selectedMaterial.volumeUnit,
    }]);
    setIsAddModalOpen(false);
    setSelectedSku('');
    setAddQty('');
  };

  const handleDeleteItem = (id) => setItems(items.filter(item => item.id !== id));

  const handlePhotoUploadComplete = (results) => {
    setMuatanPhotos((prev) => [...prev, ...results]);
  };

  const totalWeight = items.reduce((sum, item) => sum + Number(item.weight || 0), 0);
  const totalWeightTon = (totalWeight / 1000).toFixed(2);
  const totalQty = items.reduce((sum, item) => sum + Number(item.qty || 0), 0);
  const maxWeight = 25.0;
  const weightPct = Math.min((totalWeightTon / maxWeight) * 100, 100).toFixed(0);

  const canProceed = (step) => {
    switch(step) {
      case 1: return formData.destination && formData.clientName && formData.loadingDate;
      case 2: return items.length > 0;
      case 3: return !cashAdvance.uangJalan.nominal || (cashAdvance.uangJalan.recipient);
      case 4: return muatanPhotos.length >= 1;
      case 5: return true;
      default: return true;
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    // Save SJ
    const sjData = {
      number: sjNumber,
      status: SJ_STATUS.DRAFT,
      ...formData,
      items,
      cashAdvance,
      totalWeight: totalWeightTon,
      totalQty,
      photoCount: muatanPhotos.length,
      createdAt: new Date().toISOString(),
    };

    try {
      await createSJ(sjData);
      auditLogger.log({
        action: 'CREATE',
        documentType: 'SJ',
        documentId: sjNumber,
        details: `Surat Jalan ${sjNumber} created`,
      });

      // Send WA to driver
      const selectedDriver = allDrivers.find(d => d.name === cashAdvance.uangJalan.recipient);
      console.log('[CreateNewSJ] Driver lookup:', {
        recipient: cashAdvance.uangJalan.recipient,
        found: selectedDriver,
        allDrivers: allDrivers.map(d => ({ name: d.name, phone: d.phone }))
      });
      let waSent = false;
      if (selectedDriver?.phone) {
        setWaNotificationStatus('sending');
        const message = `📋 *SURAT JALAN*\n\n` +
          `No: ${sjNumber}\n` +
          `Tanggal: ${formData.loadingDate}\n` +
          `Tujuan: ${formData.destination}\n` +
          `Klien: ${formData.clientName}\n` +
          `Total Berat: ${totalWeightTon} Ton\n\n` +
          `Uang Jalan: Rp ${Number(cashAdvance.uangJalan.nominal).toLocaleString()}\n\n` +
          `Mohon segera proses dispatch.`;

        try {
          await fetch('/api/fonnte/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              phone: selectedDriver.phone,
              message: message,
            }),
          });
          setWaNotificationStatus('sent');
          waSent = true;
        } catch (err) {
          console.error('WA send failed:', err);
          setWaNotificationStatus('failed');
        }
      }

      addNotification({
        type: 'success',
        title: 'Surat Jalan Berhasil Dibuat',
        message: waSent
          ? `${sjNumber} disimpan & notifikasi WA sudah dikirim ke ${selectedDriver.name}.`
          : `${sjNumber} telah disimpan.`,
      });
    } catch (error) {
      console.error('Submit error:', error);
      addNotification({
        type: 'error',
        title: 'Gagal Membuat SJ',
        message: error.message || 'Terjadi kesalahan saat menyimpan.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="max-w-5xl mx-auto w-full space-y-6">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-extrabold font-headline text-on-surface">Buat Surat Jalan Baru</h2>
              <p className="text-sm text-slate-500 mt-1">Isi data manifest pengiriman step-by-step</p>
            </div>
            {sjNumber && (
              <div className="px-4 py-2 bg-primary/10 rounded-xl border border-primary/20">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nomor SJ (Auto-Generated)</p>
                <p className="text-sm font-mono font-bold text-primary">{sjNumber}</p>
              </div>
            )}
          </div>

          {/* Stepper */}
          <div className="glass-panel rounded-2xl p-4 border border-slate-200/50 bg-white dark:bg-slate-800">
            <div className="flex items-center justify-between">
              {steps.map((step, idx) => (
                <React.Fragment key={step.id}>
                  <button
                    onClick={() => canProceed(currentStep) && idx < currentStep && setCurrentStep(step.id)}
                    className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
                      step.id === currentStep
                        ? 'bg-primary text-white shadow-md'
                        : step.id < currentStep
                        ? 'text-primary bg-primary/10'
                        : canProceed(currentStep)
                        ? 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer'
                        : 'text-slate-300 dark:text-slate-600'
                    }`}
                    disabled={!canProceed(currentStep) && step.id > currentStep}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[20px]">{step.icon}</span>
                    <span className="text-[10px] font-bold hidden sm:block">{step.name}</span>
                  </button>
                  {idx < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 rounded ${
                      step.id < currentStep ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Step Content */}
          {/* Step 1: General Info */}
          {currentStep === 1 && (
            <section className="glass-panel rounded-2xl p-6 md:p-8 border border-slate-200/50 bg-white dark:bg-slate-800">
              <h3 className="text-lg font-bold font-headline text-on-surface mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">description</span>
                Informasi Umum
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Loading Date *</label>
                  <input
                    type="date"
                    value={formData.loadingDate}
                    onChange={(e) => setFormData({...formData, loadingDate: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Depot Asal</label>
                  <select
                    value={formData.originDepot}
                    onChange={(e) => setFormData({...formData, originDepot: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    <option value="">-- Pilih Depot --</option>
                    <option>Warehouse A - Jakarta Timur</option>
                    <option>Warehouse B - Cikarang</option>
                    <option>Warehouse C - Surabaya</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tujuan *</label>
                  <input
                    type="text"
                    value={formData.destination}
                    onChange={(e) => setFormData({...formData, destination: e.target.value})}
                    placeholder="Contoh: PT. Indofood Sukses Makmur"
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Klien *</label>
                  <input
                    type="text"
                    value={formData.clientName}
                    onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                    placeholder="Nama perusahaan kontak"
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>
            </section>
          )}

          {/* Step 2: Cargo Manifest */}
          {currentStep === 2 && (
            <section className="glass-panel rounded-2xl p-6 md:p-8 border border-slate-200/50 bg-white dark:bg-slate-800">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold font-headline text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">inventory</span>
                  Cargo Manifest
                </h3>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-primary hover:bg-[#3a533a] text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span> Tambah Item
                </button>
              </div>

              {items.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <span className="material-symbols-outlined text-5xl mb-3">inventory_2</span>
                  <p className="text-sm">Belum ada item. Klik "Tambah Item" untuk mulai.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                      <tr className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        <th className="py-3 px-4">SKU / Nama</th>
                        <th className="py-3 px-4">Qty</th>
                        <th className="py-3 px-4">Berat</th>
                        <th className="py-3 px-4">Volume</th>
                        <th className="py-3 px-4 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-800">
                      {items.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="py-3 px-4">
                            <div className="font-bold text-on-surface">{item.sku}</div>
                            <div className="text-xs text-slate-500">{item.name}</div>
                          </td>
                          <td className="py-3 px-4 font-bold">{item.qty} {item.unit}</td>
                          <td className="py-3 px-4 font-bold">{item.weight.toLocaleString()} {item.weightUnit}</td>
                          <td className="py-3 px-4 font-bold">{item.volume.toFixed(2)} {item.volumeUnit}</td>
                          <td className="py-3 px-4 text-right">
                            <button onClick={() => handleDeleteItem(item.id)} className="w-8 h-8 rounded-lg flex items-center justify-center ml-auto text-slate-400 hover:text-error hover:bg-error/10 transition-colors" type="button">
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Summary */}
              {items.length > 0 && (
                <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-600">Total Berat</span>
                    <span className="text-xl font-black text-primary">{totalWeightTon} Tons / {maxWeight} Tons</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full mt-2 overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${Number(weightPct) > 90 ? 'bg-error' : 'bg-primary'}`} style={{ width: `${weightPct}%` }} />
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Step 3: Cash Advance (F-SJ-02) */}
          {currentStep === 3 && (
            <section className="glass-panel rounded-2xl p-6 md:p-8 border border-slate-200/50 bg-white dark:bg-slate-800">
              <h3 className="text-lg font-bold font-headline text-on-surface mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">payments</span>
                Cash Advance — Dana Operasional
              </h3>
              <div className="space-y-6">
                {/* Uang Jalan */}
                <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                  <h4 className="text-sm font-bold text-on-surface mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-tertiary">attach_money</span>
                    Uang Jalan Supir
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nominal (Rp) *</label>
                      <input
                        type="number"
                        value={cashAdvance.uangJalan.nominal}
                        onChange={(e) => setCashAdvance({...cashAdvance, uangJalan: {...cashAdvance.uangJalan, nominal: e.target.value}})}
                        placeholder="500000"
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Penerima *</label>
                      <select
                        value={cashAdvance.uangJalan.recipient}
                        onChange={(e) => setCashAdvance({...cashAdvance, uangJalan: {...cashAdvance.uangJalan, recipient: e.target.value}})}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary focus:outline-none appearance-none cursor-pointer"
                      >
                        <option value="">-- Pilih Driver --</option>
                        {allDrivers.map(d => (
                          <option key={d.id} value={d.name}>{d.name} ({d.employeeId})</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="uj_signed"
                      checked={cashAdvance.uangJalan.signed}
                      onChange={(e) => setCashAdvance({...cashAdvance, uangJalan: {...cashAdvance.uangJalan, signed: e.target.checked}})}
                      className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor="uj_signed" className="text-sm text-slate-600 dark:text-slate-300">Penerima sudah menandatangani (digital) penerimaan uang jalan</label>
                  </div>
                </div>

                {/* Dana Cadangan Perbaikan */}
                <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                  <h4 className="text-sm font-bold text-on-surface mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-600">build_circle</span>
                    Dana Cadangan Perbaikan
                  </h4>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nominal (Rp)</label>
                    <input
                      type="number"
                      value={cashAdvance.danaCadangan.nominal}
                      onChange={(e) => setCashAdvance({...cashAdvance, danaCadangan: {...cashAdvance.danaCadangan, nominal: e.target.value}})}
                      placeholder="300000"
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                    <p className="text-xs text-slate-400 mt-1">Hanya bisa diklaim jika ada foto bukti kerusakan</p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Step 4: Foto Muatan (F-SJ-03) */}
          {currentStep === 4 && (
            <section className="glass-panel rounded-2xl p-6 md:p-8 border border-slate-200/50 bg-white dark:bg-slate-800">
              <h3 className="text-lg font-bold font-headline text-on-surface mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">photo_library</span>
                Foto Bukti Muatan
              </h3>
              <p className="text-sm text-slate-500 mb-6">Minimal 1 foto tampak dalam bak truk setelah dimuat.</p>

              <FileUpload
                documentId={sjNumber || 'temp'}
                category="muatan"
                fileType="photo"
                label="Upload Foto Muatan (Backup)"
                multiple
                maxFiles={10}
                onUploadComplete={handlePhotoUploadComplete}
                existingFiles={muatanPhotos}
              />

              {muatanPhotos.length > 0 && (
                <div className="mt-4 p-3 bg-primary/10 rounded-xl border border-primary/20">
                  <p className="text-sm font-bold text-primary flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                    {muatanPhotos.length} foto berhasil diupload
                  </p>
                </div>
              )}
            </section>
          )}

          {/* Step 5: Review & Submit */}
          {currentStep === 5 && (
            <section className="glass-panel rounded-2xl p-6 md:p-8 border border-slate-200/50 bg-white dark:bg-slate-800">
              <h3 className="text-lg font-bold font-headline text-on-surface mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">check_circle</span>
                Review & Submit
              </h3>

              <div className="space-y-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nomor SJ</p>
                  <p className="text-lg font-mono font-bold text-primary">{sjNumber}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tujuan</p>
                    <p className="text-sm font-bold text-on-surface">{formData.destination}</p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Klien</p>
                    <p className="text-sm font-bold text-on-surface">{formData.clientName}</p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Jumlah Item</p>
                    <p className="text-sm font-bold text-on-surface">{items.length} item ({totalQty} unit)</p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Berat</p>
                    <p className="text-sm font-bold text-on-surface">{totalWeightTon} Tons</p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Uang Jalan</p>
                    <p className="text-sm font-bold text-on-surface">Rp {Number(cashAdvance.uangJalan.nominal).toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Foto Muatan</p>
                    <p className="text-sm font-bold text-on-surface">{muatanPhotos.length} foto</p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => currentStep > 1 && setCurrentStep(currentStep - 1)}
              disabled={currentStep === 1}
              className="px-5 py-3 rounded-xl font-bold text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              type="button"
            >
              ← Kembali
            </button>

            {currentStep < 5 ? (
              <button
                onClick={() => canProceed(currentStep) && setCurrentStep(currentStep + 1)}
                disabled={!canProceed(currentStep)}
                className="px-6 py-3 rounded-xl font-bold text-sm bg-primary text-white hover:bg-[#3a533a] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
                type="button"
              >
                Lanjut →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-primary to-primary-container text-white hover:shadow-lg transition-all shadow-md flex items-center gap-2"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                Buat Surat Jalan
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Add Item Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Tambah Item ke Manifest" size="md">
        <form onSubmit={handleAddItem} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Pilih Material</label>
            <select
              required
              value={selectedSku}
              onChange={(e) => setSelectedSku(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
            >
              <option value="">-- Pilih Material --</option>
              {masterMaterials.map(m => (
                <option key={m.sku} value={m.sku}>{m.sku} — {m.name}</option>
              ))}
            </select>
          </div>

          {selectedMaterial && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Jumlah ({selectedMaterial.unit})</label>
                <input
                  required
                  type="number"
                  min="1"
                  value={addQty}
                  onChange={(e) => setAddQty(e.target.value)}
                  placeholder={`Masukkan jumlah ${selectedMaterial.unit.toLowerCase()}`}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              {addQty && (
                <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-700">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Preview</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Berat Total:</span>
                    <span className="font-bold">{Number(computedWeight).toLocaleString()} {selectedMaterial.weightUnit}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-slate-600">Volume Total:</span>
                    <span className="font-bold">{Number(computedVolume).toFixed(2)} {selectedMaterial.volumeUnit}</span>
                  </div>
                </div>
              )}
            </>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-100 transition-colors">Batal</button>
            <button type="submit" className="bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md">Tambah ke Manifest</button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
}
