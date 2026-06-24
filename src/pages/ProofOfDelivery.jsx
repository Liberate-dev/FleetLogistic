import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import Modal from '../components/ui/Modal';
import FileUpload from '../components/ui/FileUpload';
import StatusBadge from '../components/ui/StatusBadge';
import SignatureCanvas from '../components/ui/SignatureCanvas';
import { useFleetOps } from '../context';
import { documentNumberingService, auditLogger } from '../utils';
import { SJ_STATUS } from '../constants';
import DocumentPrintLayout from '../components/ui/DocumentPrintLayout';

const POD_STATUS = {
  PENDING: 'POD PENDING',
  RECEIVED: 'POD RECEIVED',
  DISCREPANCY: 'POD DISCREPANCY',
};

export default function ProofOfDelivery() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { sjNumber } = useParams();
  const { suratJalan, pods, createPOD, updatePOD, changeSJStatus, setLoading, addNotification } = useFleetOps();

  // SJ Selection
  const [selectedSJ, setSelectedSJ] = useState(sjNumber || searchParams.get('sj') || '');

  // POD number
  const [podNumber, setPodNumber] = useState('');

  const existingPod = useMemo(() => pods.find(p => p.sjNumber === selectedSJ), [pods, selectedSJ]);

  // Receiver Info
  const [receiverName, setReceiverName] = useState('');
  const [receiverTitle, setReceiverTitle] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [receivedAt, setReceivedAt] = useState(new Date().toISOString().slice(0, 16));

  // Delivery Condition
  const [deliveryCondition, setDeliveryCondition] = useState('good'); // good, partial_damage, damaged, missing

  // Discrepancy Details
  const [discrepancyDetails, setDiscrepancyDetails] = useState('');
  const [damagedItems, setDamagedItems] = useState([]);
  const [missingItems, setMissingItems] = useState([]);

  // Notes
  const [notes, setNotes] = useState('');

  // Signatures
  const [receiverSignature, setReceiverSignature] = useState('');
  const [driverSignature, setDriverSignature] = useState('');
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signatureTarget, setSignatureTarget] = useState(''); // 'receiver' or 'driver'

  // Photos
  const [barangPhotos, setBarangPhotos] = useState([]);
  const [kerusakanPhotos, setKerusakanPhotos] = useState([]);

  // Confirmation
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Generate POD number or load existing
  useEffect(() => {
    if (sjNumber) {
      const existingPod = pods.find(p => p.sjNumber === sjNumber);
      if (existingPod) {
        setPodNumber(existingPod.number || existingPod.id);
        setSelectedSJ(existingPod.sjNumber);
        setReceiverName(existingPod.receiverName || '');
        setReceiverTitle(existingPod.receiverTitle || '');
        setReceiverPhone(existingPod.receiverPhone || '');
        if (existingPod.receivedAt) {
          setReceivedAt(new Date(existingPod.receivedAt).toISOString().slice(0, 16));
        }
        setDeliveryCondition(existingPod.deliveryCondition || 'good');
        setDiscrepancyDetails(existingPod.discrepancyDetails || '');
        setNotes(existingPod.notes || '');
        setBarangPhotos(existingPod.photos?.barang || []);
        setKerusakanPhotos(existingPod.photos?.kerusakan || []);
        // Load existing signature data
        if (existingPod.receiverSignature) {
          setReceiverSignature(existingPod.receiverSignature);
        }
        if (existingPod.driverSignature) {
          setDriverSignature(existingPod.driverSignature);
        }
        return;
      }
    }
  }, [sjNumber, pods]);

  // Derive POD number from selected Surat Jalan
  // Also auto-set receivedAt for new PODs (non-editable, detected at create time)
  useEffect(() => {
    if (existingPod) {
      setPodNumber(existingPod.number || existingPod.id);
      if (existingPod.receivedAt) {
        setReceivedAt(new Date(existingPod.receivedAt).toISOString().slice(0, 16));
      }
      return;
    }
    if (selectedSJ) {
      const derived = selectedSJ.toUpperCase().startsWith('SJ')
        ? selectedSJ.replace(/^SJ/i, 'POD')
        : `POD/${selectedSJ}`;
      setPodNumber(derived);
      // Auto-detect receive time at the moment user starts creating POD for this SJ
      setReceivedAt(new Date().toISOString().slice(0, 16));
    } else {
      setPodNumber('');
    }
  }, [selectedSJ, existingPod]);

  // Available SJ: only DISPATCHED or DELIVERED status
  const availableSJ = useMemo(() =>
    suratJalan.filter(sj =>
      sj.status === SJ_STATUS.DISPATCHED ||
      sj.status === SJ_STATUS.DELIVERED ||
      sj.status === SJ_STATUS.COMPLETED
    ),
    [suratJalan]
  );

  const selectedSJData = useMemo(() =>
    suratJalan.find(sj => sj.number === selectedSJ),
    [suratJalan, selectedSJ]
  );

  // Auto-select from URL param
  useEffect(() => {
    const sjParam = searchParams.get('sj');
    if (sjParam && suratJalan.some(s => s.number === sjParam)) {
      setSelectedSJ(sjParam);
    }
  }, [searchParams, suratJalan]);

  const handlePhotoUpload = (setter) => (results) => {
    setter(results);
  };

  // Validate form
  const canSubmit = useMemo(() => {
    return selectedSJ &&
      receiverName &&
      receivedAt &&
      barangPhotos.length >= 1;
  }, [selectedSJ, receiverName, receivedAt, barangPhotos]);

  // Submit
  const handleSubmit = () => {
    setLoading(true);

    // Determine final status
    let status = POD_STATUS.RECEIVED;
    if (deliveryCondition === 'partial_damage' || deliveryCondition === 'damaged') {
      status = POD_STATUS.DISCREPANCY;
    }

    const podData = {
      id: podNumber,
      number: podNumber,
      sjNumber: selectedSJ,
      status,
      receiverName,
      receiverTitle,
      receiverPhone,
      receivedAt: new Date(receivedAt).toISOString(),
      deliveryCondition,
      discrepancyDetails: status === POD_STATUS.DISCREPANCY ? discrepancyDetails : '',
      damagedItems,
      missingItems,
      notes,
      receiverSignature,
      driverSignature,
      photoCount: barangPhotos.length + kerusakanPhotos.length,
      photos: {
        barang: barangPhotos,
        kerusakan: kerusakanPhotos,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Check if updating existing
    const existing = pods.find(p => p.id === podNumber);
    if (existing) {
      updatePOD(podData);
    } else {
      createPOD(podData);
    }

    // Update SJ status to DELIVERED if it was DISPATCHED
    if (selectedSJData && selectedSJData.status === SJ_STATUS.DISPATCHED) {
      changeSJStatus(selectedSJ, SJ_STATUS.DISPATCHED, SJ_STATUS.DELIVERED, `POD ${podNumber} created`);
    }

    auditLogger.log({
      action: 'CREATE',
      documentType: 'POD',
      documentId: podNumber,
      details: `POD ${podNumber} created for SJ ${selectedSJ} — ${status}`,
      metadata: { receiver: receiverName, condition: deliveryCondition, status },
    });

    setLoading(false);
    setShowConfirmModal(false);
    addNotification({
      type: 'success',
      title: 'POD Berhasil Dibuat',
      message: `POD ${podNumber} untuk SJ ${selectedSJ} telah disimpan.`,
    });
    navigate('/pod');
  };

  const CONDITION_CONFIG = {
    good: { label: 'Barang Diterima Baik', color: 'primary', icon: 'check_circle' },
    partial_damage: { label: 'Sebagian Rusak', color: 'amber', icon: 'warning' },
    damaged: { label: 'Barang Rusak', color: 'red', icon: 'error' },
    missing: { label: 'Barang Hilang', color: 'red', icon: 'cancel' },
  };

  return (
    <Layout>
      {/* Header */}
      <header className="w-full h-14 sm:h-[72px] shrink-0 sticky top-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-3 sm:px-8 shadow-sm print:hidden">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => navigate(-1)}
            className="sm:hidden w-10 h-10 flex items-center justify-center text-slate-600 dark:text-slate-300 active:bg-slate-100 dark:active:bg-slate-800 rounded-full transition-colors"
            type="button"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="flex items-center gap-3 sm:gap-6">
            <h1 className="font-headline text-[18px] sm:text-xl font-bold tracking-tight text-emerald-900 dark:text-emerald-100">Proof of Delivery</h1>
            <div className="hidden sm:block h-6 w-px bg-slate-300 dark:bg-slate-700"></div>
            <div className="hidden sm:flex items-center gap-2 text-slate-500">
              <span className="material-symbols-outlined text-sm">edit_note</span>
              <span className="text-sm font-medium font-body bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">{podNumber}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {existingPod && (
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-primary hover:bg-[#3a533a] text-white rounded-xl text-sm font-bold transition-all shadow-sm flex items-center gap-2"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">print</span>
              <span>Cetak POD</span>
            </button>
          )}
          <button
            onClick={() => navigate(-1)}
            className="hidden sm:flex px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm items-center gap-2"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>Kembali</span>
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto relative z-10 animate-fade-in no-scrollbar bg-slate-100 dark:bg-slate-950 sm:bg-slate-50/50 sm:dark:bg-slate-900/50 print:hidden">
        <div className="max-w-5xl mx-auto flex flex-col gap-2 sm:gap-8 pb-36 sm:p-4 md:p-8 pt-2 sm:pt-4">

          {existingPod ? (
            <div className="w-full max-w-3xl mx-auto bg-white dark:bg-slate-900 sm:rounded-2xl sm:shadow-lg sm:border border-slate-200 dark:border-slate-800 overflow-hidden">
              <DocumentPrintLayout
                docType="POD"
                docNumber={existingPod.number || existingPod.id || '-'}
                date={(() => {
                  const dateVal = existingPod.receivedAt || existingPod.createdAt;
                  if (!dateVal) return '-';
                  const d = new Date(dateVal);
                  if (isNaN(d.getTime())) return '-';
                  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
                })()}
                status={existingPod.status || 'RECEIVED'}
                metadata={[
                  { label: 'Dibuat Oleh', value: 'Sopir / Driver' },
                  { label: 'Tanggal Diterima', value: (() => {
                    const dateVal = existingPod.receivedAt || existingPod.createdAt;
                    if (!dateVal) return '-';
                    const d = new Date(dateVal);
                    if (isNaN(d.getTime())) return '-';
                    return d.toLocaleDateString('id-ID');
                  })() },
                  { label: 'Tipe Dokumen', value: 'Bukti Serah Terima (POD)' },
                  { label: 'Kondisi Pengiriman', value: existingPod.deliveryCondition === 'good' ? 'Barang Diterima Baik' : existingPod.deliveryCondition === 'partial_damage' ? 'Sebagian Rusak' : existingPod.deliveryCondition === 'damaged' ? 'Barang Rusak' : 'Barang Hilang' },
                  { label: 'Nomor SJ Terkait', value: existingPod.sjNumber || '-' },
                ]}
                parties={[
                  {
                    label: 'Penerima Barang',
                    name: existingPod.receiverName || existingPod.receivedBy || '-',
                    address: `Jabatan: ${existingPod.receiverTitle || '-'} \nTelp: ${existingPod.receiverPhone || '-'}`,
                    icon: 'person',
                  },
                  {
                    label: 'Pengirim (Driver)',
                    name: selectedSJData?.dispatch?.driverName || selectedSJData?.driverName || 'Driver Operasional',
                    address: `No. Polisi: ${selectedSJData?.dispatch?.truckPlate || selectedSJData?.truckPlate || '-'}`,
                    icon: 'local_shipping',
                  },
                ]}
                body={(
                  <div className="space-y-6 font-body">
                    <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-800/30">
                      <h3 className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider mb-2">Detail Penerimaan & Catatan</h3>
                      <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">{existingPod.notes || 'Diterima dalam kondisi baik dan lengkap.'}</p>
                    </div>
                    {(existingPod.status === 'POD DISCREPANCY' || existingPod.deliveryCondition !== 'good') && (
                      <div className="border border-red-200 dark:border-red-900/30 rounded-xl p-4 bg-red-50/30 dark:bg-red-900/10">
                        <h3 className="font-bold text-red-800 dark:text-red-400 text-xs uppercase tracking-wider mb-2">Detail Temuan Kerusakan / Kehilangan</h3>
                        <p className="text-sm text-red-700 dark:text-red-300 font-medium">{existingPod.discrepancyDetails || 'Ada ketidaksesuaian jumlah atau kondisi barang.'}</p>
                      </div>
                    )}

                    {/* Foto Dokumentasi */}
                    <div className="space-y-3">
                      <h3 className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider">Foto Dokumentasi</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {(existingPod?.photos?.barang || barangPhotos).map((p, idx) => (
                          <div key={idx} className="relative rounded-xl overflow-hidden aspect-[4/3] border border-slate-200 dark:border-slate-700 bg-slate-100">
                            <img src={p} alt={`Barang ${idx + 1}`} className="w-full h-full object-cover" />
                            <span className="absolute bottom-1 right-1 bg-black/60 text-[9px] text-white px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Barang</span>
                          </div>
                        ))}
                        {(existingPod?.photos?.kerusakan || kerusakanPhotos).map((p, idx) => (
                          <div key={idx} className="relative rounded-xl overflow-hidden aspect-[4/3] border border-slate-200 dark:border-slate-700 bg-slate-100">
                            <img src={p} alt={`Kerusakan ${idx + 1}`} className="w-full h-full object-cover" />
                            <span className="absolute bottom-1 right-1 bg-red-600/80 text-[9px] text-white px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Temuan</span>
                          </div>
                        ))}
                        {(existingPod?.photos?.barang || barangPhotos).length === 0 && (existingPod?.photos?.kerusakan || kerusakanPhotos).length === 0 && (
                          <div className="col-span-full py-4 text-center text-slate-400 text-xs italic">Tidak ada foto dokumentasi.</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                signatures={[
                  { label: 'Diterima Oleh (Penerima)', name: existingPod.receiverName || existingPod.receivedBy || '-', image: existingPod.receiverSignature },
                  { label: 'Diserahkan Oleh (Driver)', name: selectedSJData?.dispatch?.driverName || selectedSJData?.driverName || 'Driver', image: existingPod.driverSignature },
                ]}
                footerText="Dokumen ini sah secara digital sebagai tanda terima barang logistik Fleet Ops."
              />
            </div>
          ) : (
            <>
              {/* Section 1: Select SJ */}
              <section className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-8 items-start bg-white dark:bg-slate-900 sm:bg-transparent p-5 sm:p-0">
                <div className="lg:col-span-4">
                  <h2 className="text-lg sm:text-3xl font-extrabold text-on-surface font-headline leading-tight tracking-tight">Delivery Info</h2>
                  <p className="text-[13px] sm:text-sm text-slate-500 mt-1 sm:mt-2 font-body pr-4">Select the Surat Jalan that this POD is for.</p>
                </div>

                <div className="lg:col-span-8 sm:glass-panel sm:rounded-2xl sm:p-6 md:p-8 sm:shadow-sm space-y-4 sm:space-y-6 sm:hover:shadow-md transition-shadow">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-primary uppercase tracking-wider block">Surat Jalan *</label>
                    <select
                      value={selectedSJ}
                      onChange={(e) => setSelectedSJ(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 sm:bg-white border sm:border-2 border-slate-200 sm:border-primary/50 dark:border-slate-700 rounded-xl py-3.5 px-4 text-[16px] sm:text-sm font-bold text-on-surface focus:ring-2 focus:ring-primary focus:border-primary transition-all appearance-none cursor-pointer shadow-sm"
                    >
                      <option value="">-- Pilih Surat Jalan --</option>
                      {availableSJ.length === 0 ? (
                        <option disabled>Tidak ada SJ yang siap dikirim</option>
                      ) : (
                        availableSJ.map(sj => (
                          <option key={sj.number} value={sj.number}>
                            {sj.number} — {sj.destination} ({sj.clientName})
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  {/* SJ Preview */}
                  {selectedSJData && (
                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-3">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-bold">Nomor SJ</p>
                          <p className="font-bold text-on-surface">{selectedSJData.number}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-bold">Klien</p>
                          <p className="font-bold text-on-surface">{selectedSJData.clientName}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-bold">Tujuan</p>
                          <p className="font-bold text-on-surface">{selectedSJData.destination}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-bold">Cargo</p>
                          <p className="font-bold text-on-surface">{selectedSJData.items?.length || 0} items, {selectedSJData.totalWeight || 0}T</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pt-2 border-t border-primary/10">
                        <StatusBadge status={selectedSJData.status} />
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* Section 2: Receiver Info */}
              <section className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-8 items-start bg-white dark:bg-slate-900 sm:bg-transparent p-5 sm:p-0">
                <div className="lg:col-span-4">
                  <h2 className="text-lg sm:text-3xl font-extrabold text-on-surface font-headline leading-tight tracking-tight">Receiver Info</h2>
                  <p className="text-[13px] sm:text-sm text-slate-500 mt-1 sm:mt-2 font-body pr-4">Identitas penerima barang di lokasi tujuan.</p>
                </div>

                <div className="lg:col-span-8 sm:glass-panel sm:rounded-2xl sm:p-6 md:p-8 sm:shadow-sm space-y-4 sm:space-y-6 sm:hover:shadow-md transition-shadow">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Penerima *</label>
                        {selectedSJData?.contactPerson && (
                          <button
                            type="button"
                            onClick={() => {
                              setReceiverName(selectedSJData.contactPerson);
                              if (selectedSJData.contactPhone) setReceiverPhone(selectedSJData.contactPhone);
                            }}
                            className="text-[10px] text-primary hover:underline font-bold transition-all"
                          >
                            Salin Kontak SJ
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={receiverName}
                        onChange={(e) => setReceiverName(e.target.value)}
                        placeholder="Nama lengkap penerima"
                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl p-3.5 text-[16px] sm:text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Jabatan / Title</label>
                      <input
                        type="text"
                        value={receiverTitle}
                        onChange={(e) => setReceiverTitle(e.target.value)}
                        placeholder="Contoh: Warehouse Manager"
                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl p-3.5 text-[16px] sm:text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">No. Telepon</label>
                      <input
                        type="tel"
                        value={receiverPhone}
                        onChange={(e) => setReceiverPhone(e.target.value)}
                        placeholder="0812xxxxxxxxx"
                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl p-3.5 text-[16px] sm:text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Tanggal &amp; Waktu Terima
                        <span className="ml-1 text-[10px] font-normal text-primary">(otomatis saat buat POD)</span>
                      </label>
                      <input
                        type="datetime-local"
                        value={receivedAt}
                        readOnly
                        disabled
                        className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-xl p-3.5 text-[16px] sm:text-sm text-slate-500 dark:text-slate-400 cursor-not-allowed"
                      />
                      <p className="text-[10px] text-slate-400">Waktu dicatat secara otomatis ketika POD dibuat dan tidak dapat diubah.</p>
                    </div>
                  </div>

                  {/* Signature Sections */}
                  <div className="border-t border-slate-100 dark:border-slate-800 pt-6 mt-6">
                    <h3 className="text-sm font-bold text-on-surface mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">draw</span>
                      Tanda Tangan
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      {/* Receiver Signature */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Penerima</label>
                        </div>
                        {receiverSignature ? (
                          <div className="relative border-2 border-primary/30 rounded-xl bg-white p-2">
                            <img src={receiverSignature} alt="TTD Penerima" className="w-full h-[120px] object-contain" />
                            <button
                              type="button"
                              onClick={() => {
                                setSignatureTarget('receiver');
                                setShowSignatureModal(true);
                              }}
                              className="absolute inset-0 w-full h-full bg-transparent active:bg-primary/10 sm:hover:bg-primary/10 rounded-xl flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                            >
                              <span className="bg-primary text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm">Ubah</span>
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setSignatureTarget('receiver');
                              setShowSignatureModal(true);
                            }}
                            className="w-full h-[120px] border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl active:bg-slate-50 sm:hover:border-primary sm:hover:bg-primary/5 transition-colors flex flex-col items-center justify-center gap-2 text-slate-500"
                          >
                            <span className="material-symbols-outlined text-[28px]">draw</span>
                            <span className="text-sm font-medium">Tanda Tangan</span>
                          </button>
                        )}
                      </div>

                      {/* Driver Signature */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Driver</label>
                        </div>
                        {driverSignature ? (
                          <div className="relative border-2 border-secondary/30 rounded-xl bg-white p-2">
                            <img src={driverSignature} alt="TTD Driver" className="w-full h-[120px] object-contain" />
                            <button
                              type="button"
                              onClick={() => {
                                setSignatureTarget('driver');
                                setShowSignatureModal(true);
                              }}
                              className="absolute inset-0 w-full h-full bg-transparent active:bg-secondary/10 sm:hover:bg-secondary/10 rounded-xl flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                            >
                              <span className="bg-secondary text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm">Ubah</span>
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setSignatureTarget('driver');
                              setShowSignatureModal(true);
                            }}
                            className="w-full h-[120px] border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl active:bg-slate-50 sm:hover:border-secondary sm:hover:bg-secondary/5 transition-colors flex flex-col items-center justify-center gap-2 text-slate-500"
                          >
                            <span className="material-symbols-outlined text-[28px]">draw</span>
                            <span className="text-sm font-medium">Tanda Tangan</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 3: Delivery Condition */}
              <section className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-8 items-start bg-white dark:bg-slate-900 sm:bg-transparent p-5 sm:p-0">
                <div className="lg:col-span-4">
                  <h2 className="text-lg sm:text-3xl font-extrabold text-on-surface font-headline leading-tight tracking-tight">Condition</h2>
                  <p className="text-[13px] sm:text-sm text-slate-500 mt-1 sm:mt-2 font-body pr-4">Kondisi barang saat diterima di tujuan.</p>
                </div>

                <div className="lg:col-span-8 sm:glass-panel sm:rounded-2xl sm:p-6 md:p-8 sm:shadow-sm space-y-4 sm:space-y-6 sm:hover:shadow-md transition-shadow">
                  {/* Condition Selection */}
                  <div className="space-y-3">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Kondisi Pengiriman *</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {Object.entries(CONDITION_CONFIG).map(([key, cfg]) => {
                        const isSelected = deliveryCondition === key;
                        const borderClass = isSelected && key === 'good' ? 'border-primary ring-1 ring-primary' :
                                           isSelected && key === 'partial_damage' ? 'border-amber-500 ring-1 ring-amber-500' :
                                           isSelected ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-200 dark:border-slate-700';
                        const bgClass = isSelected && key === 'good' ? 'bg-primary/5' :
                                        isSelected && key === 'partial_damage' ? 'bg-amber-50 dark:bg-amber-900/20' :
                                        isSelected ? 'bg-red-50 dark:bg-red-900/20' : 'bg-white dark:bg-slate-800';
                        const textClass = isSelected && key === 'good' ? 'text-primary' :
                                         isSelected && key === 'partial_damage' ? 'text-amber-600' :
                                         isSelected ? 'text-red-500' : 'text-slate-600 dark:text-slate-300';
                        const iconClass = textClass;
                        return (
                          <button
                            key={key}
                            onClick={() => setDeliveryCondition(key)}
                            className={`p-4 rounded-xl border-2 text-left transition-all ${borderClass} ${bgClass} active:scale-[0.98] ${!isSelected ? 'sm:hover:border-slate-300 dark:sm:hover:border-slate-600' : ''}`}
                            type="button"
                          >
                            <div className="flex items-center gap-3">
                              <span className={`material-symbols-outlined ${iconClass}`}>{cfg.icon}</span>
                              <span className={`text-sm font-bold ${textClass}`}>
                                {cfg.label}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Discrepancy Details (if damaged/partial_damage) */}
                  {(deliveryCondition === 'partial_damage' || deliveryCondition === 'damaged') && (
                    <div className="p-4 rounded-xl bg-error/5 border border-error/20 space-y-3 animate-fade-in">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-error text-[18px]">warning</span>
                        <h4 className="text-sm font-bold text-error">Detail Kerusakan</h4>
                      </div>
                      <textarea
                        value={discrepancyDetails}
                        onChange={(e) => setDiscrepancyDetails(e.target.value)}
                        placeholder="Jelaskan kerusakan yang terjadi pada barang..."
                        rows={3}
                        className="w-full bg-white dark:bg-slate-900 border border-error/30 rounded-xl p-3.5 text-[16px] sm:text-sm focus:ring-2 focus:ring-error focus:outline-none resize-none shadow-sm"
                      />
                      <p className="text-xs text-slate-500">Foto kerusakan wajib diupload di section bawah.</p>
                    </div>
                  )}

                  {/* Notes */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Catatan Tambahan</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Catatan opsional terkait pengiriman..."
                      rows={2}
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl p-3.5 text-[16px] sm:text-sm focus:ring-2 focus:ring-primary focus:outline-none resize-none"
                    />
                  </div>
                </div>
              </section>

              {/* Section 4: Photo Evidence (F-POD-02) */}
              <section className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-8 items-start bg-white dark:bg-slate-900 sm:bg-transparent p-5 sm:p-0">
                <div className="lg:col-span-4">
                  <h2 className="text-lg sm:text-3xl font-extrabold text-on-surface font-headline leading-tight tracking-tight">Photo Evidence</h2>
                  <p className="text-[13px] sm:text-sm text-slate-500 mt-1 sm:mt-2 font-body pr-4">Bukti foto serah terima dan kondisi barang.</p>
                  <div className="mt-4 sm:mt-6 flex items-center gap-3 bg-primary/5 sm:bg-transparent p-3 sm:p-0 rounded-lg">
                    <span className="w-1 h-6 bg-primary rounded-full shadow-[0_0_10px_rgba(70,99,71,0.5)]"></span>
                    <span className="text-[11px] font-black text-primary uppercase tracking-widest">Minimum 1 Foto</span>
                  </div>
                </div>

                <div className="lg:col-span-8 space-y-4 sm:space-y-6">
                  {/* Foto Barang Diturunkan */}
                  <div className="sm:glass-panel sm:rounded-2xl sm:p-6 md:p-8 sm:shadow-sm sm:hover:shadow-md transition-shadow">
                    <h3 className="text-sm font-bold font-headline text-on-surface mb-3 sm:mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[20px]">photo_camera</span>
                      Foto Barang Diturunkan (F-POD-02a) *
                    </h3>
                    <FileUpload
                      documentId={podNumber || 'temp-pod'}
                      category="pod_barang"
                      fileType="photo"
                      label="Upload Foto Barang"
                      multiple
                      required
                      maxFiles={10}
                      onUploadComplete={handlePhotoUpload(setBarangPhotos)}
                      existingFiles={barangPhotos}
                    />
                    {barangPhotos.length > 0 && (
                      <div className="mt-3 p-3 bg-primary/10 rounded-xl border border-primary/20">
                        <p className="text-xs font-bold text-primary flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px]">check_circle</span>
                          {barangPhotos.length} foto berhasil diupload
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Foto Kerusakan (if discrepancy) */}
                  {(deliveryCondition === 'partial_damage' || deliveryCondition === 'damaged') && (
                    <div className="sm:glass-panel sm:rounded-2xl sm:p-6 md:p-8 sm:shadow-sm sm:hover:shadow-md transition-shadow sm:border border-error/20 animate-fade-in mt-6 sm:mt-0 pt-6 sm:pt-0 border-t border-slate-100 dark:border-slate-800 sm:border-t-0">
                      <h3 className="text-sm font-bold font-headline text-error mb-3 sm:mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[20px]">broken_image</span>
                        Foto Kerusakan (F-POD-02c)
                      </h3>
                      <FileUpload
                        documentId={podNumber || 'temp-pod'}
                        category="pod_kerusakan"
                        fileType="photo"
                        label="Upload Foto Kerusakan"
                        multiple
                        maxFiles={10}
                        onUploadComplete={handlePhotoUpload(setKerusakanPhotos)}
                        existingFiles={kerusakanPhotos}
                      />
                      {kerusakanPhotos.length > 0 && (
                        <div className="mt-3 p-3 bg-error/10 rounded-xl border border-error/20">
                          <p className="text-xs font-bold text-error flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[16px]">check_circle</span>
                            {kerusakanPhotos.length} foto berhasil diupload
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </section>
            </>
          )}

        </div>
      </div>

      {/* Footer Action Bar */}
      {!existingPod && (
        <div className="sticky bottom-0 left-0 w-full z-40 flex-shrink-0">
          <div className="backdrop-blur-xl bg-white/95 dark:bg-slate-950/95 border-t border-slate-200 dark:border-slate-800 px-4 py-3 sm:px-6 sm:py-4 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] pb-[calc(env(safe-area-inset-bottom)+0.75rem)] sm:pb-4">
            <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-4">
              {canSubmit ? (
                <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
                  <span className="text-[11px] font-bold text-primary uppercase tracking-widest">Ready</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Incomplete</span>
                </div>
              )}
            </div>

          <div className="w-full sm:w-auto flex items-center gap-3">
            <button
              onClick={() => {
                if (!canSubmit) {
                  addNotification({
                    type: 'warning',
                    title: 'Form Belum Lengkap',
                    message: 'Mohon lengkapi semua field yang wajib diisi (Surat Jalan, Penerima, Tanggal, Foto Barang).',
                  });
                  return;
                }
                setShowConfirmModal(true);
              }}
              disabled={!canSubmit}
              className="w-full sm:w-auto px-6 py-3.5 sm:py-3 rounded-xl bg-primary hover:bg-[#3a533a] active:scale-[0.98] text-white font-bold shadow-lg shadow-primary/30 hover:shadow-xl hover:-translate-y-0.5 transition-all text-[15px] sm:text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:active:scale-100 disabled:hover:translate-y-0"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px] sm:text-[18px]">check_circle</span>
              Submit POD
            </button>
          </div>
        </div>
      </div>
      )}

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm POD"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-[15px] sm:text-sm text-slate-500">You are about to submit POD with the following details:</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">POD Number</p>
              <p className="text-sm font-bold text-on-surface">{podNumber}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Surat Jalan</p>
              <p className="text-sm font-bold text-on-surface">{selectedSJ}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Received By</p>
              <p className="text-sm font-bold text-on-surface">{receiverName}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Condition</p>
              <p className={`text-sm font-bold ${
                deliveryCondition === 'good' ? 'text-primary' : 'text-error'
              }`}>
                {CONDITION_CONFIG[deliveryCondition]?.label}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</p>
              <div className="mt-1">
                <StatusBadge status={deliveryCondition === 'good' ? POD_STATUS.RECEIVED : POD_STATUS.DISCREPANCY} />
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Photos</p>
              <p className="text-sm font-bold text-on-surface">
                {barangPhotos.length + kerusakanPhotos.length} uploaded
              </p>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
            <button
              onClick={() => setShowConfirmModal(false)}
              className="w-full sm:flex-1 px-5 py-3.5 sm:py-3 rounded-xl font-bold text-[15px] sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 active:bg-slate-50 sm:hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              type="button"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="w-full sm:flex-1 px-5 py-3.5 sm:py-3 rounded-xl font-bold text-[15px] sm:text-sm bg-primary text-white active:scale-[0.98] sm:hover:bg-[#3a533a] transition-all shadow-md flex items-center justify-center gap-2"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px] sm:text-[18px]">check_circle</span>
              Confirm POD
            </button>
          </div>
        </div>
      </Modal>

      {/* Signature Modal */}
      <Modal
        isOpen={showSignatureModal}
        onClose={() => setShowSignatureModal(false)}
        title={signatureTarget === 'receiver' ? 'Tanda Tangan Penerima' : 'Tanda Tangan Driver'}
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-[15px] sm:text-sm text-slate-500">
            {signatureTarget === 'receiver' 
              ? 'Silakan tanda tangan di bawah sebagai konfirmasi penerimaan barang.' 
              : 'Silakan tanda tangan di bawah sebagai konfirmasi driver.'}
          </p>
          
          <SignatureCanvas
            value={signatureTarget === 'receiver' ? receiverSignature : driverSignature}
            onChange={(data) => {
              if (signatureTarget === 'receiver') {
                setReceiverSignature(data);
              } else {
                setDriverSignature(data);
              }
            }}
            label={signatureTarget === 'receiver' ? 'Tanda Tangan Penerima' : 'Tanda Tangan Driver'}
          />
          
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
            <button
              onClick={() => setShowSignatureModal(false)}
              className="w-full sm:flex-1 px-5 py-3.5 sm:py-3 rounded-xl font-bold text-[15px] sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 active:bg-slate-50 sm:hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              type="button"
            >
              Batal
            </button>
            <button
              onClick={() => setShowSignatureModal(false)}
              className="w-full sm:flex-1 px-5 py-3.5 sm:py-3 rounded-xl font-bold text-[15px] sm:text-sm bg-primary text-white active:scale-[0.98] sm:hover:bg-[#3a533a] transition-all shadow-md flex items-center justify-center gap-2"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px] sm:text-[18px]">check</span>
              Simpan
            </button>
          </div>
        </div>
      </Modal>

      {existingPod && (
        <div className="hidden print:block print:absolute print:inset-0 print:min-h-screen z-[99999] bg-white">
          <div className="w-full h-auto overflow-visible">
            <DocumentPrintLayout
              docType="POD"
              docNumber={existingPod.number || existingPod.id || '-'}
              date={(() => {
                const dateVal = existingPod.receivedAt || existingPod.createdAt;
                if (!dateVal) return '-';
                const d = new Date(dateVal);
                if (isNaN(d.getTime())) return '-';
                return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
              })()}
              status={existingPod.status || 'RECEIVED'}
              metadata={[
                { label: 'Dibuat Oleh', value: 'Sopir / Driver' },
                { label: 'Tanggal Diterima', value: (() => {
                  const dateVal = existingPod.receivedAt || existingPod.createdAt;
                  if (!dateVal) return '-';
                  const d = new Date(dateVal);
                  if (isNaN(d.getTime())) return '-';
                  return d.toLocaleDateString('id-ID');
                })() },
                { label: 'Tipe Dokumen', value: 'Bukti Serah Terima (POD)' },
                { label: 'Kondisi Pengiriman', value: existingPod.deliveryCondition === 'good' ? 'Barang Diterima Baik' : existingPod.deliveryCondition === 'partial_damage' ? 'Sebagian Rusak' : existingPod.deliveryCondition === 'damaged' ? 'Barang Rusak' : 'Barang Hilang' },
                { label: 'Nomor SJ Terkait', value: existingPod.sjNumber || '-' },
              ]}
              parties={[
                {
                  label: 'Penerima Barang',
                  name: existingPod.receiverName || existingPod.receivedBy || '-',
                  address: `Jabatan: ${existingPod.receiverTitle || '-'} \nTelp: ${existingPod.receiverPhone || '-'}`,
                  icon: 'person',
                },
                {
                  label: 'Pengirim (Driver)',
                  name: selectedSJData?.dispatch?.driverName || selectedSJData?.driverName || 'Driver Operasional',
                  address: `No. Polisi: ${selectedSJData?.dispatch?.truckPlate || selectedSJData?.truckPlate || '-'}`,
                  icon: 'local_shipping',
                },
              ]}
              body={(
                <div className="space-y-4 font-body">
                  <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                    <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2">Detail Penerimaan & Catatan</h3>
                    <p className="text-sm text-slate-700 font-medium">{existingPod.notes || 'Diterima dalam kondisi baik dan lengkap.'}</p>
                  </div>
                  {(existingPod.status === 'POD DISCREPANCY' || existingPod.deliveryCondition !== 'good') && (
                    <div className="border border-red-200 rounded-xl p-4 bg-red-50/30">
                      <h3 className="font-bold text-red-800 text-xs uppercase tracking-wider mb-2">Detail Temuan Kerusakan / Kehilangan</h3>
                      <p className="text-sm text-red-700 font-medium">{existingPod.discrepancyDetails || 'Ada ketidaksesuaian jumlah atau kondisi barang.'}</p>
                    </div>
                  )}

                  {/* Foto Dokumentasi (print) */}
                  {((existingPod.photos?.barang?.length || 0) + (existingPod.photos?.kerusakan?.length || 0) > 0) && (
                    <div className="space-y-3">
                      <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Foto Dokumentasi</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {(existingPod.photos?.barang || []).map((p, idx) => (
                          <div key={idx} className="relative rounded-xl overflow-hidden aspect-[4/3] border border-slate-200 bg-slate-100">
                            <img src={p} alt={`Barang ${idx + 1}`} className="w-full h-full object-cover" />
                            <span className="absolute bottom-1 right-1 bg-black/60 text-[9px] text-white px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Barang</span>
                          </div>
                        ))}
                        {(existingPod.photos?.kerusakan || []).map((p, idx) => (
                          <div key={idx} className="relative rounded-xl overflow-hidden aspect-[4/3] border border-slate-200 bg-slate-100">
                            <img src={p} alt={`Kerusakan ${idx + 1}`} className="w-full h-full object-cover" />
                            <span className="absolute bottom-1 right-1 bg-red-600/80 text-[9px] text-white px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Temuan</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              signatures={[
                { label: 'Diterima Oleh (Penerima)', name: existingPod.receiverName || existingPod.receivedBy || '-', image: existingPod.receiverSignature },
                { label: 'Diserahkan Oleh (Driver)', name: selectedSJData?.dispatch?.driverName || selectedSJData?.driverName || 'Driver', image: existingPod.driverSignature },
              ]}
              footerText="Dokumen ini sah secara digital sebagai tanda terima barang logistik Fleet Ops."
            />
          </div>
        </div>
      )}
    </Layout>
  );
}
