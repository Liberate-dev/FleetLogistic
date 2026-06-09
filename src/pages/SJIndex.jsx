import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPortal } from 'react-dom';
import Layout from '../components/Layout';
import TopNavBar from '../components/TopNavBar';
import DocumentPrintLayout from '../components/ui/DocumentPrintLayout';

export default function SJIndex() {
  const [suratJalan, setSuratJalan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSJ, setSelectedSJ] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    fetchSuratJalan();
  }, []);

  const fetchSuratJalan = async () => {
    try {
      const res = await fetch('/api/surat-jalan');
      const data = await res.json();
      setSuratJalan(data.suratJalan || []);
    } catch (err) {
      console.error('Failed to fetch SJ:', err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh every 10 seconds to pick up webhook updates
  useEffect(() => {
    const interval = setInterval(fetchSuratJalan, 10000);
    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = (status) => {
    const styles = {
      DRAFT: 'bg-slate-200 text-slate-600',
      ASSIGNED: 'bg-blue-100 text-blue-800',
      DISPATCHED: 'bg-amber-100 text-amber-800',
      DELIVERED: 'bg-purple-100 text-purple-800',
      COMPLETED: 'bg-emerald-100 text-emerald-800',
      CANCELLED: 'bg-red-100 text-red-600',
    };
    return styles[status] || 'bg-slate-200 text-slate-600';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  const formatDateTime = (d) => {
    if (!d) return '-';
    return new Date(d).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
  };

  // Filtered list based on search / status / date range
  const filteredSuratJalan = React.useMemo(() => {
    return suratJalan.filter((item) => {
      const num = (item.documentNumber || item.number || '').toLowerCase();
      const client = (item.customer?.name || item.clientName || '').toLowerCase();
      const dest = (item.destination || '').toLowerCase();
      const matchesSearch = !searchTerm ||
        num.includes(searchTerm.toLowerCase()) ||
        client.includes(searchTerm.toLowerCase()) ||
        dest.includes(searchTerm.toLowerCase());

      const matchesStatus = !statusFilter || item.status === statusFilter;

      let matchesDate = true;
      const rawDate = item.date || item.loadingDate || item.createdAt;
      if (rawDate && (dateFrom || dateTo)) {
        const d = new Date(rawDate);
        if (!isNaN(d.getTime())) {
          const dStr = d.toISOString().slice(0, 10);
          if (dateFrom && dStr < dateFrom) matchesDate = false;
          if (dateTo && dStr > dateTo) matchesDate = false;
        }
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [suratJalan, searchTerm, statusFilter, dateFrom, dateTo]);

  const getTotalWeight = (sj) => {
    if (sj.totalWeight) return Number(sj.totalWeight).toFixed(2);
    if (sj.items?.length > 0) {
      const total = sj.items.reduce((sum, i) => sum + (Number(i.weight || i.quantity) || 0), 0);
      return (total / 1000).toFixed(2);
    }
    return '0.00';
  };

  const handleCancelSJ = async (id) => {
    if (!window.confirm('Yakin batalkan SJ ini?')) return;
    setSuratJalan(suratJalan.map(sj => sj.id === id ? { ...sj, status: 'CANCELLED' } : sj));
    try {
      await fetch(`/api/surat-jalan/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' }),
      });
    } catch (err) {
      console.error('Cancel failed:', err);
      fetchSuratJalan();
    }
  };

  const handleReturnSJ = async (id) => {
    if (!window.confirm('Kembalikan SJ ini ke status aktif?')) return;
    setSuratJalan(suratJalan.map(sj => sj.id === id ? { ...sj, status: 'DRAFT' } : sj));
    try {
      await fetch(`/api/surat-jalan/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'DRAFT' }),
      });
    } catch (err) {
      console.error('Return failed:', err);
      fetchSuratJalan();
    }
  };

  const handleDeleteSJ = async (id) => {
    if (!window.confirm('Yakin hapus permanen SJ ini?')) return;
    setSuratJalan(suratJalan.filter(sj => sj.id !== id));
    try {
      await fetch(`/api/surat-jalan/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Delete failed:', err);
      fetchSuratJalan();
    }
  };

  const renderSJDetailModal = () => {
    if (!selectedSJ) return null;

    return (
      <>
        {/* Print-only layout - only visible during print */}
        <div className="hidden print:block print:absolute print:inset-0 print:min-h-screen z-[99999] bg-white">
          <div className="w-full h-auto overflow-visible">
            <DocumentPrintLayout
              docType="SJ"
              docNumber={selectedSJ.documentNumber || selectedSJ.number || ''}
              date={formatDate(selectedSJ.date || selectedSJ.loadingDate)}
              status={selectedSJ.status}
              metadata={[
                { label: 'Dibuat Oleh', value: selectedSJ.createdBy?.name || selectedSJ.createdByName || '-' },
                { label: 'Dibuat Pada', value: formatDateTime(selectedSJ.createdAt) },
                { label: 'Tipe', value: 'Surat Jalan' },
                { label: 'Driver / Pengemudi', value: selectedSJ.dispatch?.driver?.name || selectedSJ.driver?.name || selectedSJ.driverName || '-' },
                { label: 'Kendaraan', value: selectedSJ.dispatch?.vehicle?.plateNumber || selectedSJ.vehicleNumber || selectedSJ.plateNumber || '-' },
                { label: 'Status', value: selectedSJ.status },
              ]}
              parties={[
                {
                  label: 'Penerima (Shipped To)',
                  name: selectedSJ.customer?.name || selectedSJ.clientName || '-',
                  address: selectedSJ.destinationAddress || selectedSJ.destination,
                  icon: 'location_on',
                },
                {
                  label: 'Asal (Origin Facility)',
                  name: `Fleet Ops Hub - ${selectedSJ.originDepot || 'Main'}`,
                  address: selectedSJ.originDepot || 'Main Distribution Center',
                  icon: 'warehouse',
                },
              ]}
              body={(
                <table className="w-full text-sm border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-slate-800 text-white border border-slate-800">
                      <th className="py-3 px-4 text-left font-bold w-12 border-r border-slate-600">No</th>
                      <th className="py-3 px-4 text-left font-bold border-r border-slate-600">Description of Goods</th>
                      <th className="py-3 px-4 text-center font-bold w-20 border-r border-slate-600">Qty</th>
                      <th className="py-3 px-4 text-center font-bold w-24 border-r border-slate-600">Unit</th>
                      <th className="py-3 px-4 text-right font-bold w-32">Weight</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {selectedSJ.items?.length > 0 ? selectedSJ.items.map((item, idx) => {
                      const name = item.name || item.material?.name || '-';
                      const qty = item.qty ?? item.quantity ?? 0;
                      const unit = item.unit || item.material?.unit || '-';
                      const weight = Number(item.weight || item.quantity || 0).toLocaleString();
                      return (
                        <tr key={idx}>
                          <td className="py-4 px-4 font-semibold border-r border-slate-200 text-center">{idx + 1}</td>
                          <td className="py-4 px-4 border-r border-slate-200">{name}</td>
                          <td className="py-4 px-4 text-center border-r border-slate-200 font-bold">{qty}</td>
                          <td className="py-4 px-4 text-center border-r border-slate-200">{unit}</td>
                          <td className="py-4 px-4 text-right text-slate-600">{weight} kg</td>
                        </tr>
                      );
                    }) : (
                      <tr>
                        <td colSpan="5" className="py-8 text-center text-slate-400 border-r border-slate-200">No cargo items recorded</td>
                      </tr>
                    )}
                    <tr className="bg-slate-100 font-bold border-t-2 border-slate-800">
                      <td colSpan="4" className="py-4 px-4 text-right uppercase tracking-wider text-xs">Total Cargo Weight</td>
                      <td className="py-4 px-4 text-right text-slate-800 text-base">{getTotalWeight(selectedSJ)} Ton</td>
                    </tr>
                  </tbody>
                </table>
              )}
              signatures={[
                {
                  label: 'Penerima (Receiver)',
                  sub: 'Nama Terang & Cap Perusahaan',
                  autoName: selectedSJ?.receiverName || selectedSJ?.receivedBy || null
                },
                {
                  label: 'Driver / Armada',
                  sub: 'Nama & Nomor Plat Kendaraan',
                  autoName: selectedSJ?.dispatch?.driver?.name
                    ? `${selectedSJ.dispatch.driver.name}${selectedSJ.dispatch?.vehicle?.plateNumber ? ' - ' + selectedSJ.dispatch.vehicle.plateNumber : ''}`
                    : null
                },
                {
                  label: 'Admin Logistik',
                  sub: 'Nama Terang & Tanda Tangan',
                  autoName: selectedSJ?.createdBy?.name || selectedSJ?.createdByName || null
                },
              ]}
              remarks={selectedSJ.notes}
            />
          </div>
        </div>

        {/* Screen-only modal - hidden during print */}
        <div className="fixed inset-0 z-[9999] print:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setSelectedSJ(null)}
          />
          {/* Content */}
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden w-full max-w-3xl max-h-[90vh] flex flex-col">
              {/* Toolbar */}
              <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {selectedSJ?.documentNumber || selectedSJ?.number || ''}
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg text-sm font-bold flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">print</span> Print
                  </button>
                  <button
                    onClick={() => setSelectedSJ(null)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
              </div>
              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto p-6">
                <DocumentPrintLayout
                  docType="SJ"
                  docNumber={selectedSJ.documentNumber || selectedSJ.number || ''}
                  date={formatDate(selectedSJ.date || selectedSJ.loadingDate)}
                  status={selectedSJ.status}
                  metadata={[
                    { label: 'Dibuat Oleh', value: selectedSJ.createdBy?.name || selectedSJ.createdByName || '-' },
                    { label: 'Dibuat Pada', value: formatDateTime(selectedSJ.createdAt) },
                    { label: 'Tipe', value: 'Surat Jalan' },
                    { label: 'Driver / Pengemudi', value: selectedSJ.dispatch?.driver?.name || selectedSJ.driver?.name || selectedSJ.driverName || '-' },
                    { label: 'Kendaraan', value: selectedSJ.dispatch?.vehicle?.plateNumber || selectedSJ.vehicleNumber || selectedSJ.plateNumber || '-' },
                    { label: 'Status', value: selectedSJ.status },
                  ]}
                  parties={[
                    {
                      label: 'Penerima (Shipped To)',
                      name: selectedSJ.customer?.name || selectedSJ.clientName || '-',
                      address: selectedSJ.destinationAddress || selectedSJ.destination,
                      icon: 'location_on',
                    },
                    {
                      label: 'Asal (Origin Facility)',
                      name: `Fleet Ops Hub - ${selectedSJ.originDepot || 'Main'}`,
                      address: selectedSJ.originDepot || 'Main Distribution Center',
                      icon: 'warehouse',
                    },
                  ]}
                  body={(
                    <table className="w-full text-sm border-collapse border border-slate-300">
                      <thead>
                        <tr className="bg-slate-800 text-white border border-slate-800">
                          <th className="py-3 px-4 text-left font-bold w-12 border-r border-slate-600">No</th>
                          <th className="py-3 px-4 text-left font-bold border-r border-slate-600">Description of Goods</th>
                          <th className="py-3 px-4 text-center font-bold w-20 border-r border-slate-600">Qty</th>
                          <th className="py-3 px-4 text-center font-bold w-24 border-r border-slate-600">Unit</th>
                          <th className="py-3 px-4 text-right font-bold w-32">Weight</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {selectedSJ.items?.length > 0 ? selectedSJ.items.map((item, idx) => {
                          const name = item.name || item.material?.name || '-';
                          const qty = item.qty ?? item.quantity ?? 0;
                          const unit = item.unit || item.material?.unit || '-';
                          const weight = Number(item.weight || item.quantity || 0).toLocaleString();
                          return (
                            <tr key={idx}>
                              <td className="py-4 px-4 font-semibold border-r border-slate-200 text-center">{idx + 1}</td>
                              <td className="py-4 px-4 border-r border-slate-200">{name}</td>
                              <td className="py-4 px-4 text-center border-r border-slate-200 font-bold">{qty}</td>
                              <td className="py-4 px-4 text-center border-r border-slate-200">{unit}</td>
                              <td className="py-4 px-4 text-right text-slate-600">{weight} kg</td>
                            </tr>
                          );
                        }) : (
                          <tr>
                            <td colSpan="5" className="py-8 text-center text-slate-400 border-r border-slate-200">No cargo items recorded</td>
                          </tr>
                        )}
                        <tr className="bg-slate-100 font-bold border-t-2 border-slate-800">
                          <td colSpan="4" className="py-4 px-4 text-right uppercase tracking-wider text-xs">Total Cargo Weight</td>
                          <td className="py-4 px-4 text-right text-slate-800 text-base">{getTotalWeight(selectedSJ)} Ton</td>
                        </tr>
                      </tbody>
                    </table>
                  )}
                  signatures={[
                    {
                      label: 'Penerima (Receiver)',
                      sub: 'Nama Terang & Cap Perusahaan',
                      autoName: selectedSJ?.receiverName || selectedSJ?.receivedBy || null
                    },
                    {
                      label: 'Driver / Armada',
                      sub: 'Nama & Nomor Plat Kendaraan',
                      autoName: selectedSJ?.dispatch?.driver?.name
                        ? `${selectedSJ.dispatch.driver.name}${selectedSJ.dispatch?.vehicle?.plateNumber ? ' - ' + selectedSJ.dispatch.vehicle.plateNumber : ''}`
                        : null
                    },
                    {
                      label: 'Admin Logistik',
                      sub: 'Nama Terang & Tanda Tangan',
                      autoName: selectedSJ?.createdBy?.name || selectedSJ?.createdByName || null
                    },
                  ]}
                  remarks={selectedSJ.notes}
                />
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <>
      {selectedSJ && renderSJDetailModal()}
      <Layout className={selectedSJ ? 'print:hidden' : ''}>
        <TopNavBar title="Surat Jalan (Manifests)" breadcrumbs={['Operations', 'Surat Jalan']} />
        <div className={`flex-1 overflow-y-auto p-4 md:p-8 transition-all duration-300 ${selectedSJ ? 'blur-lg brightness-50' : ''} print:blur-none print:brightness-100 animate-fade-in`}>
          <div className="max-w-7xl mx-auto space-y-8">

          <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
            <div>
              <h2 className="text-3xl font-extrabold font-headline tracking-tight">Surat Jalan (SJ)</h2>
              <p className="text-slate-500 font-body mt-1">Manage delivery manifests and client shipping requests.</p>
            </div>
            <Link to="/sj/new" className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">note_add</span>
              <span>Create New SJ</span>
            </Link>
          </div>

          {/* Filters */}
          <div className="glass-panel rounded-2xl p-4 mb-3 border border-slate-200/50 bg-white dark:bg-slate-800">
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex-1 min-w-[200px]">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Cari</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Nomor SJ, klien, tujuan..."
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-sm min-w-[130px] focus:ring-2 focus:ring-primary"
                >
                  <option value="">Semua Status</option>
                  <option value="DRAFT">DRAFT</option>
                  <option value="ASSIGNED">ASSIGNED</option>
                  <option value="DISPATCHED">DISPATCHED</option>
                  <option value="DELIVERED">DELIVERED</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Tanggal Mulai</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-sm focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Tanggal Akhir</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-sm focus:ring-2 focus:ring-primary"
                />
              </div>

              <button
                onClick={() => { setSearchTerm(''); setStatusFilter(''); setDateFrom(''); setDateTo(''); }}
                className="px-4 py-2 text-sm font-bold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                type="button"
              >
                Reset
              </button>
            </div>
            <div className="text-[11px] text-slate-500 mt-2 font-medium">
              Menampilkan <span className="font-bold text-on-surface">{filteredSuratJalan.length}</span> dari {suratJalan.length} Surat Jalan
            </div>
          </div>

          <div className="glass-panel rounded-2xl overflow-hidden shadow-lg border border-slate-200/50">
            {loading ? (
              <div className="p-12 text-center text-slate-400">
                <span className="material-symbols-outlined text-4xl animate-spin">progress_activity</span>
                <p className="mt-2">Loading...</p>
              </div>
            ) : suratJalan.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <span className="material-symbols-outlined text-5xl">description</span>
                <p className="mt-2">No Surat Jalan yet. Create your first one!</p>
              </div>
            ) : filteredSuratJalan.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <span className="material-symbols-outlined text-5xl">filter_list</span>
                <p className="mt-2">Tidak ada hasil yang cocok dengan filter.</p>
                <button onClick={() => { setSearchTerm(''); setStatusFilter(''); setDateFrom(''); setDateTo(''); }} className="mt-2 text-primary text-sm font-bold underline">Reset filter</button>
              </div>
            ) : (
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-200 text-slate-500">
                    <th className="py-4 px-6 font-bold uppercase text-xs">SJ Number</th>
                    <th className="py-4 px-6 font-bold uppercase text-xs">Date</th>
                    <th className="py-4 px-6 font-bold uppercase text-xs">Client</th>
                    <th className="py-4 px-6 font-bold uppercase text-xs">Items</th>
                    <th className="py-4 px-6 font-bold uppercase text-xs">Photo</th>
                    <th className="py-4 px-6 font-bold uppercase text-xs">Status</th>
                    <th className="py-4 px-6 font-bold uppercase text-xs text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSuratJalan.map((item) => (
                    <tr key={item.id} className="hover:bg-primary/5 transition-colors cursor-pointer" onClick={() => setSelectedSJ(item)}>
                      <td className="py-4 px-6 font-mono font-bold text-slate-800 dark:text-slate-200">{item.documentNumber}</td>
                      <td className="py-4 px-6 text-slate-600">{formatDate(item.date)}</td>
                      <td className="py-4 px-6 text-slate-800 font-semibold">{item.customer?.name || '-'}</td>
                      <td className="py-4 px-6 text-slate-600">{item.items?.length || 0} items</td>
                      <td className="py-4 px-6">
                        {item.photoReceived ? (
                          <span className="flex items-center gap-1 text-emerald-600">
                            <span className="material-symbols-outlined text-[16px]">check_circle</span>
                            <span className="text-xs">OK</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-slate-400">
                            <span className="material-symbols-outlined text-[16px]">photo</span>
                            <span className="text-xs">-</span>
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-1 text-[10px] uppercase font-bold rounded-md ${getStatusBadge(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        {item.status === 'CANCELLED' ? (
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReturnSJ(item.id);
                              }}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-colors"
                              title="Return"
                            >
                              <span className="material-symbols-outlined text-[18px]">undo</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteSJ(item.id);
                              }}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-error hover:bg-error/10 transition-colors"
                              title="Hapus Permanen"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete_forever</span>
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancelSJ(item.id);
                            }}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-amber-600 hover:bg-amber-50 border border-amber-200 transition-colors"
                            title="Batalkan SJ"
                          >
                            <span className="material-symbols-outlined text-[18px]">cancel</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
      </Layout>
      {/* SJ Detail Modal - rendered as portal to body, on top of everything */}
      {renderSJDetailModal()}
    </>
  );
}
