import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import Modal from '../components/ui/Modal';
import FileUpload from '../components/ui/FileUpload';
import StatusBadge from '../components/ui/StatusBadge';
import { useFleetOps } from '../context';
import { documentNumberingService, auditLogger } from '../utils';
import { LPJ_EXPENSE_CATEGORIES, SJ_STATUS } from '../constants';

const LPJ_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
};

export default function LPJKeuangan() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { sjNumber } = useParams();
  const { suratJalan, dispatches, lpjRecords, createLPJ, updateLPJ, changeSJStatus, setLoading, addNotification } = useFleetOps();

  // LPJ number
  const [lpjNumber, setLpjNumber] = useState('');

  // SJ Selection
  const [selectedSJ, setSelectedSJ] = useState(sjNumber || searchParams.get('sj') || '');

  // Driver Info
  const [driverName, setDriverName] = useState('');
  const [truckPlate, setTruckPlate] = useState('');

  // Expenses: [{ categoryId, amount, description, receipts: [] }]
  const [expenses, setExpenses] = useState([]);

  // Cash advance received
  const [uangJalanReceived, setUangJalanReceived] = useState('');
  const [danaCadanganReceived, setDanaCadanganReceived] = useState('');

  // Notes
  const [notes, setNotes] = useState('');

  // Submitted By - auto-populated from current user, locked from editing
  const [submittedBy, setSubmittedBy] = useState(auditLogger.currentUser || 'System Admin');

  // Confirmation
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Generate LPJ number or load existing
  useEffect(() => {
    if (sjNumber) {
      const existingLpj = lpjRecords.find(l => l.sjNumber === sjNumber);
      if (existingLpj) {
        setLpjNumber(existingLpj.id);
        setSelectedSJ(existingLpj.sjNumber);
        setDriverName(existingLpj.driverName || '');
        setTruckPlate(existingLpj.truckPlate || '');
        setSubmittedBy(existingLpj.submittedBy || auditLogger.currentUser || 'System Admin');
        setExpenses(existingLpj.expenses || []);
        if (existingLpj.cashAdvance) {
          setUangJalanReceived(existingLpj.cashAdvance.uangJalan || '');
          setDanaCadanganReceived(existingLpj.cashAdvance.danaCadangan || '');
        }
        setNotes(existingLpj.notes || '');
        return;
      }
    }
    const result = documentNumberingService.generateNumber('LPJ', 'malang');
    setLpjNumber(result.number);
  }, [sjNumber, lpjRecords]);

  // Available SJ: only DELIVERED or COMPLETED status (must have POD ideally)
  const availableSJ = useMemo(() =>
    suratJalan.filter(sj =>
      sj.status === SJ_STATUS.DELIVERED ||
      sj.status === SJ_STATUS.COMPLETED
    ),
    [suratJalan]
  );

  const selectedSJData = useMemo(() =>
    suratJalan.find(sj => sj.number === selectedSJ),
    [suratJalan, selectedSJ]
  );

  // Auto-fill driver and truck from dispatch
  useEffect(() => {
    const dispatch = dispatches.find(d => d.sjNumber === selectedSJ);
    if (dispatch) {
      setDriverName(dispatch.driverName || '');
      setTruckPlate(dispatch.truckPlate || '');
    }
  }, [selectedSJ, dispatches]);

  // Auto-fill cash advance from SJ
  useEffect(() => {
    if (selectedSJData?.cashAdvance) {
      setUangJalanReceived(selectedSJData.cashAdvance.uangJalan?.nominal || '');
      setDanaCadanganReceived(selectedSJData.cashAdvance.danaCadangan?.nominal || '');
    }
  }, [selectedSJData]);

  // Auto-select from URL param
  useEffect(() => {
    const sjParam = searchParams.get('sj');
    if (sjParam && suratJalan.some(s => s.number === sjParam)) {
      setSelectedSJ(sjParam);
    }
  }, [searchParams, suratJalan]);

  // Add expense row
  const addExpense = (categoryId) => {
    setExpenses([...expenses, {
      id: Date.now(),
      categoryId,
      amount: '',
      description: '',
      receipts: [],
    }]);
  };

  // Update expense
  const updateExpense = (id, field, value) => {
    setExpenses(expenses.map(exp =>
      exp.id === id ? { ...exp, [field]: value } : exp
    ));
  };

  // Remove expense
  const removeExpense = (id) => {
    setExpenses(expenses.filter(exp => exp.id !== id));
  };

  // Handle receipt upload
  const handleReceiptUpload = (expenseId) => (results) => {
    setExpenses(expenses.map(exp =>
      exp.id === expenseId
        ? { ...exp, receipts: [...(exp.receipts || []), ...results] }
        : exp
    ));
  };

  // Computed totals
  const expenseByCategory = useMemo(() => {
    const totals = {};
    LPJ_EXPENSE_CATEGORIES.forEach(cat => {
      totals[cat.id] = expenses
        .filter(e => e.categoryId === cat.id)
        .reduce((sum, e) => sum + Number(e.amount || 0), 0);
    });
    return totals;
  }, [expenses]);

  const totalExpenses = useMemo(() =>
    expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0),
    [expenses]
  );

  const totalCashAdvance = Number(uangJalanReceived || 0) + Number(danaCadanganReceived || 0);
  const balance = totalCashAdvance - totalExpenses;

  const totalReceipts = useMemo(() =>
    expenses.reduce((sum, e) => sum + (e.receipts?.length || 0), 0),
    [expenses]
  );

  // Validate
  const canSubmit = useMemo(() => {
    return selectedSJ &&
      submittedBy &&
      expenses.length > 0 &&
      expenses.every(e => e.amount && Number(e.amount) > 0);
  }, [selectedSJ, submittedBy, expenses]);

  // Submit
  const handleSubmit = () => {
    setLoading(true);

    const lpjData = {
      id: lpjNumber,
      number: lpjNumber,
      sjNumber: selectedSJ,
      status: LPJ_STATUS.PENDING,
      driverName,
      truckPlate,
      submittedBy,
      expenses,
      expenseByCategory,
      totalAmount: totalExpenses,
      cashAdvance: {
        uangJalan: Number(uangJalanReceived || 0),
        danaCadangan: Number(danaCadanganReceived || 0),
        total: totalCashAdvance,
      },
      balance,
      totalReceipts,
      notes,
      submittedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const existing = lpjRecords.find(l => l.id === lpjNumber);
    if (existing) {
      updateLPJ(lpjData);
    } else {
      createLPJ(lpjData);
    }

    // Update SJ status to COMPLETED
    if (selectedSJData) {
      changeSJStatus(selectedSJ, selectedSJData.status, SJ_STATUS.COMPLETED, `LPJ ${lpjNumber} submitted`);
    }

    auditLogger.log({
      action: 'CREATE',
      documentType: 'LPJ',
      documentId: lpjNumber,
      details: `LPJ ${lpjNumber} created for SJ ${selectedSJ} — Total: ${totalExpenses}`,
      metadata: { driver: driverName, totalAmount: totalExpenses, balance },
    });

    setLoading(false);
    setShowConfirmModal(false);
    alert(`LPJ ${lpjNumber} berhasil dibuat!`);
    navigate('/lpj');
  };

  const formatCurrency = (val) => `Rp ${Number(val || 0).toLocaleString('id-ID')}`;

  return (
    <Layout>
      {/* Header */}
      <header className="w-full h-[72px] shrink-0 sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-outline-variant/20 flex items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-6">
            <h1 className="font-headline text-xl font-bold tracking-tight text-emerald-900 dark:text-emerald-100">LPJ Keuangan</h1>
            <div className="hidden sm:block h-6 w-px bg-slate-300 dark:bg-slate-700"></div>
            <div className="hidden sm:flex items-center gap-2 text-slate-500">
              <span className="material-symbols-outlined text-sm">edit_note</span>
              <span className="text-sm font-medium font-body bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">{lpjNumber}</span>
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
        <div className="max-w-5xl mx-auto space-y-8 pb-36">

          {/* Section 1: Select SJ */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-4">
              <h2 className="text-3xl font-extrabold text-on-surface font-headline leading-tight tracking-tight">Delivery Info</h2>
              <p className="text-sm text-slate-500 mt-2 font-body pr-4">Select the completed Surat Jalan for this LPJ.</p>
            </div>

            <div className="lg:col-span-8 glass-panel rounded-2xl p-6 md:p-8 shadow-sm space-y-6 hover:shadow-md transition-shadow">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-primary uppercase tracking-wider block">Surat Jalan *</label>
                <select
                  value={selectedSJ}
                  onChange={(e) => setSelectedSJ(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border-2 border-primary/50 rounded-xl py-3.5 px-4 text-sm font-bold text-on-surface focus:ring-2 focus:ring-primary focus:border-primary transition-all appearance-none cursor-pointer shadow-sm"
                >
                  <option value="">-- Pilih Surat Jalan --</option>
                  {availableSJ.length === 0 ? (
                    <option disabled>Tidak ada SJ yang selesai</option>
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
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-wider">Referensi SJ</p>
                    <StatusBadge status={selectedSJData.status} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Nomor SJ</p>
                      <p className="font-bold text-on-surface font-mono">{selectedSJData.number}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Dibuat Oleh SJ</p>
                      <p className="font-bold text-on-surface">{selectedSJData.createdByName || '-'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Klien (Untuk Siapa)</p>
                      <p className="font-bold text-on-surface">{selectedSJData.clientName || '-'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Tujuan</p>
                      <p className="font-bold text-on-surface">{selectedSJData.destination || '-'}</p>
                    </div>
                  </div>
                  {selectedSJData.items && selectedSJData.items.length > 0 && (
                    <div className="border-t border-primary/10 pt-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px] text-primary">inventory_2</span>
                        Cargo ({selectedSJData.items.length} item)
                      </p>
                      {selectedSJData.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-xs text-slate-600">
                          <span className="font-mono text-primary">{item.sku || item.material?.code}</span>
                          <span>{item.name || item.material?.name}</span>
                          <span className="font-bold">{item.qty || item.quantity} {item.unit}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Driver & Truck Info + Submitted By */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Driver</label>
                  <input
                    type="text"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    placeholder="Auto-filled from dispatch"
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Plat Truck</label>
                  <input
                    type="text"
                    value={truckPlate}
                    onChange={(e) => setTruckPlate(e.target.value)}
                    placeholder="Auto-filled from dispatch"
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    Disubmit Oleh *
                    <span className="material-symbols-outlined text-[12px] text-slate-400" title="Otomatis dari user yang login">lock</span>
                  </label>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm font-bold text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-primary">account_circle</span>
                    <span>{submittedBy}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>


          {/* Section 2: Cash Advance Summary */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-4">
              <h2 className="text-3xl font-extrabold text-on-surface font-headline leading-tight tracking-tight">Cash Advance</h2>
              <p className="text-sm text-slate-500 mt-2 font-body pr-4">Dana yang diterima dari SJ (auto-filled).</p>
            </div>

            <div className="lg:col-span-8 glass-panel rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Uang Jalan</p>
                  <p className="text-lg font-bold text-on-surface mt-1">{formatCurrency(uangJalanReceived)}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Dana Cadangan</p>
                  <p className="text-lg font-bold text-on-surface mt-1">{formatCurrency(danaCadanganReceived)}</p>
                </div>
              </div>
              <div className="mt-4 p-3 rounded-xl bg-primary/5 border border-primary/20 flex justify-between items-center">
                <span className="text-sm font-bold text-slate-500">Total Cash Advance</span>
                <span className="text-xl font-black font-headline text-primary">{formatCurrency(totalCashAdvance)}</span>
              </div>
            </div>
          </section>

          {/* Section 3: Expense Breakdown (F-LPJ-01) */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-4">
              <h2 className="text-3xl font-extrabold text-on-surface font-headline leading-tight tracking-tight">Expense Breakdown</h2>
              <p className="text-sm text-slate-500 mt-2 font-body pr-4">Detail pengeluaran selama operasional. Setiap item wajib ada bukti struk/nota.</p>

              {/* Add Expense Buttons */}
              <div className="mt-6 space-y-2">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tambah Pengeluaran</p>
                {LPJ_EXPENSE_CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => addExpense(cat.id)}
                    className="w-full flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary/50 hover:bg-primary/5 transition-all text-left"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-slate-400 text-[18px]">{cat.icon}</span>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{cat.label}</span>
                    {cat.requiresReceipt && (
                      <span className="ml-auto text-[9px] font-bold text-amber-600 bg-amber-100 dark:bg-amber-900/30 px-1.5 py-0.5 rounded">+Struk</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-8 space-y-4">
              {expenses.length === 0 ? (
                <div className="glass-panel rounded-2xl p-8 text-center border border-slate-200/50">
                  <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600 mb-3 block">receipt_long</span>
                  <p className="text-sm text-slate-400">Belum ada pengeluaran. Klik kategori di samping untuk menambahkan.</p>
                </div>
              ) : (
                expenses.map((exp, idx) => {
                  const catConfig = LPJ_EXPENSE_CATEGORIES.find(c => c.id === exp.categoryId);
                  return (
                    <div key={exp.id} className="glass-panel rounded-2xl p-5 shadow-sm border border-slate-200/50 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary text-[18px]">{catConfig?.icon || 'receipt'}</span>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-on-surface">{catConfig?.label || 'Lainnya'}</p>
                            <p className="text-[10px] text-slate-400">Item #{idx + 1}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeExpense(exp.id)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-error hover:bg-error/10 transition-colors"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Jumlah (Rp) *</label>
                          <input
                            type="number"
                            value={exp.amount}
                            onChange={(e) => updateExpense(exp.id, 'amount', e.target.value)}
                            placeholder="0"
                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-primary focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            Keterangan {catConfig?.requiresDescription && '*'}
                          </label>
                          <input
                            type="text"
                            value={exp.description}
                            onChange={(e) => updateExpense(exp.id, 'description', e.target.value)}
                            placeholder={catConfig?.requiresDescription ? 'Jelaskan detail perbaikan...' : 'Opsional'}
                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Receipt Upload */}
                      {catConfig?.requiresReceipt && (
                        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Bukti Struk / Nota *</p>
                          <FileUpload
                            documentId={`${lpjNumber}_${exp.id}`}
                            category="lpj_struk"
                            fileType="photo"
                            label="Upload Struk"
                            multiple
                            maxFiles={5}
                            onUploadComplete={handleReceiptUpload(exp.id)}
                            existingFiles={exp.receipts || []}
                          />
                          {(exp.receipts?.length || 0) > 0 && (
                            <div className="mt-2 p-2 bg-primary/10 rounded-lg border border-primary/20">
                              <p className="text-xs font-bold text-primary flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                                {exp.receipts.length} struk diupload
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}

              {/* Expense Summary */}
              {expenses.length > 0 && (
                <div className="glass-panel rounded-2xl p-6 shadow-sm bg-gradient-to-r from-primary/5 to-transparent border border-primary/20">
                  <h3 className="text-sm font-bold font-headline text-on-surface mb-4">Ringkasan Pengeluaran</h3>
                  <div className="space-y-2">
                    {LPJ_EXPENSE_CATEGORIES.map(cat => {
                      const total = expenseByCategory[cat.id] || 0;
                      if (total === 0) return null;
                      return (
                        <div key={cat.id} className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-slate-400 text-[16px]">{cat.icon}</span>
                            <span className="text-sm text-slate-600 dark:text-slate-300">{cat.label}</span>
                          </div>
                          <span className="text-sm font-bold text-on-surface">{formatCurrency(total)}</span>
                        </div>
                      );
                    })}
                    <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                      <span className="text-base font-bold text-on-surface">Total Pengeluaran</span>
                      <span className="text-xl font-black font-headline text-primary">{formatCurrency(totalExpenses)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Section 4: Balance Summary */}
          {expenses.length > 0 && (
            <section className="glass-panel rounded-2xl p-6 shadow-sm border border-slate-200/50">
              <h3 className="text-lg font-bold font-headline text-on-surface mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">account_balance_wallet</span>
                Saldo & Sisa Dana
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 text-center">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Cash Advance</p>
                  <p className="text-lg font-bold text-on-surface mt-1">{formatCurrency(totalCashAdvance)}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 text-center">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Pengeluaran</p>
                  <p className="text-lg font-bold text-on-surface mt-1">{formatCurrency(totalExpenses)}</p>
                </div>
                <div className={`p-4 rounded-xl border text-center ${
                  balance >= 0
                    ? 'bg-primary/5 border-primary/20'
                    : 'bg-error/5 border-error/20'
                }`}>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Sisa / Kekurangan</p>
                  <p className={`text-lg font-bold mt-1 ${
                    balance >= 0 ? 'text-primary' : 'text-error'
                  }`}>
                    {formatCurrency(Math.abs(balance))}
                    {balance < 0 && ' (Kurang)'}
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Section 5: Notes */}
          <section className="glass-panel rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200/50">
            <h3 className="text-sm font-bold font-headline text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-slate-400">note</span>
              Catatan Tambahan
            </h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Catatan terkait pengeluaran atau perjalanan..."
              rows={3}
              className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary focus:outline-none resize-none"
            />
          </section>

        </div>
      </div>

      {/* Footer Action Bar */}
      <div className="sticky bottom-0 left-0 w-full z-40 flex-shrink-0">
        <div className="backdrop-blur-xl bg-white/90 dark:bg-slate-900/90 border-t border-outline-variant/30 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-4">
            {canSubmit ? (
              <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
                <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
                <span className="text-[11px] font-bold text-primary uppercase tracking-widest">Ready to Submit</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Incomplete</span>
              </div>
            )}
            {expenses.length > 0 && (
              <span className="text-sm font-bold text-slate-500">Total: {formatCurrency(totalExpenses)}</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (!canSubmit) {
                  alert('Mohon lengkapi semua field: pilih SJ dan tambahkan minimal 1 pengeluaran dengan jumlah valid.');
                  return;
                }
                setShowConfirmModal(true);
              }}
              disabled={!canSubmit}
              className="px-8 py-3 rounded-xl bg-primary hover:bg-[#3a533a] text-white font-bold shadow-lg shadow-primary/30 hover:shadow-xl hover:-translate-y-0.5 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:translate-y-0"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              Submit LPJ
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm LPJ"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-500">You are about to submit LPJ with the following details:</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">LPJ Number</p>
              <p className="text-sm font-bold text-on-surface">{lpjNumber}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Surat Jalan</p>
              <p className="text-sm font-bold text-on-surface">{selectedSJ}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Driver</p>
              <p className="text-sm font-bold text-on-surface">{driverName || '-'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Cash Advance</p>
              <p className="text-sm font-bold text-on-surface">{formatCurrency(totalCashAdvance)}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Expenses</p>
              <p className="text-sm font-bold text-primary">{formatCurrency(totalExpenses)}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Balance</p>
              <p className={`text-sm font-bold ${balance >= 0 ? 'text-primary' : 'text-error'}`}>
                {formatCurrency(Math.abs(balance))} {balance < 0 && '(Kurang)'}
              </p>
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
              Confirm LPJ
            </button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}
