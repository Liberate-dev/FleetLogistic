import React, { useState } from 'react';
import Layout from '../components/Layout';
import Modal from '../components/ui/Modal';
import { useFleetOps } from '../context';
import { expiryTracker } from '../utils';

const DRIVER_STATUS_CONFIG = {
  AVAILABLE: { label: 'Available', color: 'bg-primary/10 text-primary', icon: 'check_circle' },
  ON_DISPATCH: { label: 'On Dispatch', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: 'local_shipping' },
  ON_LEAVE: { label: 'On Leave', color: 'bg-slate-100 text-slate-500', icon: 'pause_circle' },
  INACTIVE: { label: 'Inactive', color: 'bg-slate-200 text-slate-600', icon: 'block' },
};

export default function DriverIndex() {
  const { drivers, addDriver, updateDriver, addNotification } = useFleetOps();

  // Local state for sample data if context empty
  const [localDrivers, setLocalDrivers] = useState([
    { id: 'DRV-001', employeeId: 'EMP-2022-001', name: 'Sudirman Pratama', phone: '081234567890', simType: 'B2', simNumber: 'SIM-2022-001', simExpiry: '2027-06-15', status: 'AVAILABLE', joinDate: '2022-01-15' },
    { id: 'DRV-002', employeeId: 'EMP-2021-045', name: 'Agus Mahendra', phone: '081234567891', simType: 'C', simNumber: 'SIM-2021-045', simExpiry: '2026-12-01', status: 'AVAILABLE', joinDate: '2021-06-20' },
    { id: 'DRV-003', employeeId: 'EMP-2021-012', name: 'Budi Santoso', phone: '081234567892', simType: 'B2', simNumber: 'SIM-2021-012', simExpiry: '2026-03-01', status: 'ON_DISPATCH', joinDate: '2021-03-10' },
    { id: 'DRV-004', employeeId: 'EMP-2021-033', name: 'Rudi Hermawan', phone: '081234567893', simType: 'C', simNumber: 'SIM-2021-033', simExpiry: '2026-04-10', status: 'ON_LEAVE', joinDate: '2021-09-05' },
    { id: 'DRV-005', employeeId: 'EMP-2023-008', name: 'Dewi Lestari', phone: '081234567894', simType: 'B1', simNumber: 'SIM-2023-008', simExpiry: '2025-01-20', status: 'AVAILABLE', joinDate: '2023-02-15' },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    employeeId: '',
    phone: '',
    simType: 'B2',
    simNumber: '',
    simExpiry: '',
    status: 'AVAILABLE',
  });

  const allDrivers = drivers.length > 0 ? drivers : localDrivers;

  // Compute SIM status
  const driversWithStatus = allDrivers.map(d => {
    const simExpiryDate = new Date(d.simExpiry);
    const daysUntilExpiry = Math.ceil((simExpiryDate - new Date()) / (1000 * 60 * 60 * 24));
    const statusConfig = DRIVER_STATUS_CONFIG[d.status] || DRIVER_STATUS_CONFIG.AVAILABLE;

    // Override status if SIM expired
    let computedStatus = d.status;
    if (daysUntilExpiry <= 0) {
      computedStatus = 'INACTIVE';
    }

    return {
      ...d,
      daysUntilExpiry,
      computedStatus,
      statusConfig: DRIVER_STATUS_CONFIG[computedStatus] || DRIVER_STATUS_CONFIG.AVAILABLE,
      isExpired: daysUntilExpiry <= 0,
      isExpiringSoon: daysUntilExpiry > 0 && daysUntilExpiry <= 30,
    };
  });

  // Stats
  const stats = {
    total: driversWithStatus.length,
    available: driversWithStatus.filter(d => d.computedStatus === 'AVAILABLE').length,
    onDispatch: driversWithStatus.filter(d => d.computedStatus === 'ON_DISPATCH').length,
    onLeave: driversWithStatus.filter(d => d.computedStatus === 'ON_LEAVE').length,
    expired: driversWithStatus.filter(d => d.isExpired).length,
    expiringSoon: driversWithStatus.filter(d => d.isExpiringSoon).length,
  };

  const handleOpenModal = (driver = null) => {
    if (driver) {
      setEditingDriver(driver);
      setFormData({
        name: driver.name,
        employeeId: driver.employeeId,
        phone: driver.phone,
        simType: driver.simType,
        simNumber: driver.simNumber,
        simExpiry: driver.simExpiry,
        status: driver.status,
      });
    } else {
      setEditingDriver(null);
      setFormData({
        name: '',
        employeeId: '',
        phone: '',
        simType: 'B2',
        simNumber: '',
        simExpiry: '',
        status: 'AVAILABLE',
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingDriver) {
        // Update to backend
        const res = await fetch(`/api/drivers/${editingDriver.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error('Failed to update driver');

        // Update local state
        const updated = localDrivers.map(d =>
          d.id === editingDriver.id ? { ...d, ...formData } : d
        );
        setLocalDrivers(updated);
        updateDriver?.({ id: editingDriver.id, ...formData });
        addNotification({ type: 'success', title: 'Driver Diperbarui', message: `${formData.name} berhasil diperbarui` });
      } else {
        // Create in backend
        const res = await fetch('/api/drivers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error('Failed to create driver');

        const newDriver = await res.json();

        // Update local state
        setLocalDrivers([...localDrivers, newDriver]);
        addDriver?.(newDriver);
        addNotification({ type: 'success', title: 'Driver Ditambahkan', message: `${newDriver.name} berhasil ditambahkan` });
      }
    } catch (err) {
      console.error('Driver save error:', err);
      addNotification({ type: 'error', title: 'Gagal', message: err.message });
    }

    setShowModal(false);
  };

  const handleDelete = (id) => {
    if (confirm('Yakin hapus driver ini?')) {
      setLocalDrivers(localDrivers.filter(d => d.id !== id));
      addNotification({ type: 'success', title: 'Driver Dihapus', message: 'Driver berhasil dihapus' });
    }
  };

  return (
    <Layout>
      <div className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10 animate-fade-in no-scrollbar bg-slate-50/50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
            <div>
              <h2 className="text-3xl font-extrabold font-headline tracking-tight text-on-surface">Driver Management</h2>
              <p className="text-slate-500 font-body mt-1">Kelola data supir dan pantau SIM expiry</p>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="px-6 py-2.5 bg-primary hover:bg-[#3a533a] text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">person_add</span>
              <span>Tambah Driver</span>
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="glass-panel p-4 rounded-xl border border-slate-200/50 bg-white dark:bg-slate-800">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-slate-500 text-[20px]">people</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total</span>
              </div>
              <p className="text-2xl font-black font-headline text-on-surface">{stats.total}</p>
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
                <span className="material-symbols-outlined text-blue-600 text-[20px]">local_shipping</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">On Dispatch</span>
              </div>
              <p className="text-2xl font-black font-headline text-blue-600">{stats.onDispatch}</p>
            </div>
            <div className="glass-panel p-4 rounded-xl border border-slate-200/50 bg-white dark:bg-slate-800">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-amber-600 text-[20px]">schedule</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Expiring Soon</span>
              </div>
              <p className="text-2xl font-black font-headline text-amber-600">{stats.expiringSoon}</p>
            </div>
            <div className="glass-panel p-4 rounded-xl border border-slate-200/50 bg-white dark:bg-slate-800">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-error text-[20px]">warning</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Expired</span>
              </div>
              <p className="text-2xl font-black font-headline text-error">{stats.expired}</p>
            </div>
          </div>

          {/* SIM Expiry Alerts */}
          {stats.expiringSoon > 0 && (
            <div className="glass-panel rounded-2xl p-6 border border-amber-200/50 bg-amber-50/50 dark:bg-amber-900/10">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-amber-600">warning</span>
                <h3 className="text-sm font-bold font-headline text-amber-700 dark:text-amber-400">SIM Expiry Alerts</h3>
              </div>
              <div className="space-y-2">
                {driversWithStatus.filter(d => d.isExpiringSoon).map(driver => (
                  <div key={driver.id} className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-800">
                    <div>
                      <p className="text-sm font-bold text-on-surface">{driver.name}</p>
                      <p className="text-xs text-slate-500">{driver.simType} — {driver.simNumber}</p>
                    </div>
                    <span className="px-2 py-1 text-[10px] uppercase font-bold rounded-md bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                      {driver.daysUntilExpiry} days left
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Drivers Table */}
          <div className="glass-panel rounded-2xl overflow-hidden shadow-lg border border-slate-200/50 bg-white dark:bg-slate-800">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-900/30 border-b border-slate-200 dark:border-slate-700 text-slate-500">
                    <th className="py-4 px-6 font-bold uppercase text-xs tracking-wider">Employee ID</th>
                    <th className="py-4 px-6 font-bold uppercase text-xs tracking-wider">Name</th>
                    <th className="py-4 px-6 font-bold uppercase text-xs tracking-wider">SIM</th>
                    <th className="py-4 px-6 font-bold uppercase text-xs tracking-wider">SIM Expiry</th>
                    <th className="py-4 px-6 font-bold uppercase text-xs tracking-wider">Phone</th>
                    <th className="py-4 px-6 font-bold uppercase text-xs tracking-wider">Status</th>
                    <th className="py-4 px-6 font-bold uppercase text-xs tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {driversWithStatus.map((driver) => (
                    <tr key={driver.id} className="hover:bg-primary/5 dark:hover:bg-primary/5 transition-colors">
                      <td className="py-4 px-6 font-bold text-on-surface font-mono">{driver.employeeId}</td>
                      <td className="py-4 px-6 text-on-surface">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary text-[16px]">person</span>
                          </div>
                          <span className="font-bold">{driver.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-bold text-on-surface">{driver.simType}</span>
                        <p className="text-[10px] text-slate-400">{driver.simNumber}</p>
                      </td>
                      <td className="py-4 px-6">
                        <p className={`text-sm font-bold ${
                          driver.isExpired ? 'text-error' :
                          driver.isExpiringSoon ? 'text-amber-600' : 'text-on-surface'
                        }`}>
                          {new Date(driver.simExpiry).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                        {driver.isExpiringSoon && (
                          <p className="text-[10px] text-amber-600">{driver.daysUntilExpiry}d left</p>
                        )}
                        {driver.isExpired && (
                          <p className="text-[10px] text-error">Expired</p>
                        )}
                      </td>
                      <td className="py-4 px-6 text-slate-500">{driver.phone}</td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-[10px] uppercase font-bold rounded-md ${driver.statusConfig.color}`}>
                          <span className="material-symbols-outlined text-[12px]">{driver.statusConfig.icon}</span>
                          {driver.statusConfig.label}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleOpenModal(driver)}
                          className="text-primary hover:text-[#3a533a] font-bold text-xs mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(driver.id)}
                          className="text-error hover:opacity-80 font-bold text-xs"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingDriver ? 'Edit Driver' : 'Tambah Driver Baru'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Lengkap *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Employee ID *</label>
              <input
                type="text"
                required
                value={formData.employeeId}
                onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
                placeholder="EMP-YYYY-XXX"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">No. HP</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="08xxxxxxxxx"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary focus:outline-none appearance-none cursor-pointer"
              >
                <option value="AVAILABLE">Available</option>
                <option value="ON_DISPATCH">On Dispatch</option>
                <option value="ON_LEAVE">On Leave</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">SIM Type *</label>
              <select
                required
                value={formData.simType}
                onChange={(e) => setFormData({...formData, simType: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary focus:outline-none appearance-none cursor-pointer"
              >
                <option value="A">SIM A</option>
                <option value="B1">SIM B1</option>
                <option value="B2">SIM B2</option>
                <option value="C">SIM C</option>
                <option value="D">SIM D</option>
              </select>
            </div>
            <div className="space-y-1.5 col-span-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">No. SIM *</label>
              <input
                type="text"
                required
                value={formData.simNumber}
                onChange={(e) => setFormData({...formData, simNumber: e.target.value})}
                placeholder="SIM-YYYY-XXX"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">SIMExpiry *</label>
            <input
              type="date"
              required
              value={formData.simExpiry}
              onChange={(e) => setFormData({...formData, simExpiry: e.target.value})}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl font-bold text-sm bg-primary text-white hover:bg-[#3a533a] transition-colors shadow-md"
            >
              {editingDriver ? 'Simpan Perubahan' : 'Tambah Driver'}
            </button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
}