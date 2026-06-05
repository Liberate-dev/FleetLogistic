import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNavBar from '../components/TopNavBar';
import Layout from '../components/Layout';
import { useFleetOps } from '../context';

export default function AddNewUser() {
  const navigate = useNavigate();
  const { addUser, setLoading, addNotification } = useFleetOps();

  const [activeTab, setActiveTab] = useState('general');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    employeeId: '',
    department: 'Ground Logistics',
    primaryHub: '',
    reportingManager: '',
    role: 'fleet_operator',
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.firstName || !formData.lastName || !formData.employeeId) {
      addNotification({
        type: 'error',
        title: 'Form Tidak Lengkap',
        message: 'Mohon isi field yang wajib diisi.',
      });
      return;
    }

    setLoading(true);
    try {
      const userData = {
        ...formData,
        id: `USR-${Date.now()}`,
        name: `${formData.firstName} ${formData.lastName}`,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
      };

      await addUser(userData);

      addNotification({
        type: 'success',
        title: 'User Berhasil Ditambahkan',
        message: `${formData.firstName} ${formData.lastName} telah didaftarkan.`,
      });

      setTimeout(() => navigate('/users'), 1500);
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Gagal Menambahkan User',
        message: error.message || 'Terjadi kesalahan.',
      });
    } finally {
      setLoading(false);
    }
  };

  const roleConfig = {
    fleet_operator: { label: 'Fleet Operator', desc: 'Full access to telemetry, routing, and dispatch systems.', color: 'primary' },
    analyst: { label: 'Data Analyst', desc: 'View-only access to reporting and historical fleet logs.', color: 'secondary' },
    supervisor: { label: 'Warehouse Supervisor', desc: 'Manage local inventory levels and bay assignments.', color: 'tertiary' },
  };

  return (
    <Layout>
      <TopNavBar title="Add New User" breadcrumbs={['User Management', 'Add New User']} showBack={true} />

      <div className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10 animate-fade-in">
        <div className="max-w-7xl mx-auto space-y-8">

          <div className="flex items-center justify-between">
            <nav className="flex gap-6 border-b border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setActiveTab('general')}
                className={`pb-2 font-bold text-sm border-b-2 transition-colors ${
                  activeTab === 'general'
                    ? 'text-emerald-700 dark:text-emerald-400 border-emerald-700 dark:border-emerald-400'
                    : 'text-slate-500 border-transparent hover:text-emerald-600'
                }`}
              >
                General Information
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`pb-2 font-bold text-sm border-b-2 transition-colors ${
                  activeTab === 'security'
                    ? 'text-emerald-700 dark:text-emerald-400 border-emerald-700 dark:border-emerald-400'
                    : 'text-slate-500 border-transparent hover:text-emerald-600'
                }`}
              >
                Security Settings
              </button>
            </nav>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/users')}
                className="px-5 py-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-primary text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">person_add</span>
                Create User
              </button>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 lg:col-span-7 space-y-8">
              {activeTab === 'general' && (
                <>
                  <div className="glass-panel rounded-2xl p-8 shadow-sm">
                    <div className="flex items-start gap-6 mb-6">
                      <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-600 cursor-pointer hover:border-primary transition-colors">
                        <span className="material-symbols-outlined text-3xl text-slate-400">add_a_photo</span>
                      </div>
                      <div className="flex-1">
                        <h2 className="text-xl font-bold font-headline mb-1">Account Details</h2>
                        <p className="text-sm text-slate-500">Create a new identity for the Fleet Ops ecosystem.</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">First Name *</label>
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => handleChange('firstName', e.target.value)}
                          placeholder="e.g. Marcus"
                          className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Last Name *</label>
                        <input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => handleChange('lastName', e.target.value)}
                          placeholder="e.g. Aurelius"
                          className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="glass-panel rounded-2xl p-6 shadow-sm">
                      <div className="flex items-center gap-2 mb-4 text-primary">
                        <span className="material-symbols-outlined bg-primary/10 p-1.5 rounded-lg">work</span>
                        <h3 className="font-bold text-sm">Professional Assignment</h3>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Employee ID *</label>
                          <input
                            type="text"
                            value={formData.employeeId}
                            onChange={(e) => handleChange('employeeId', e.target.value)}
                            placeholder="FO-9932"
                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Department</label>
                          <select
                            value={formData.department}
                            onChange={(e) => handleChange('department', e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                          >
                            <option>Ground Logistics</option>
                            <option>Air Freight Ops</option>
                            <option>Warehouse Control</option>
                            <option>Strategic Planning</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="glass-panel rounded-2xl p-6 shadow-sm">
                      <div className="flex items-center gap-2 mb-4 text-secondary">
                        <span className="material-symbols-outlined bg-secondary/10 p-1.5 rounded-lg">location_on</span>
                        <h3 className="font-bold text-sm">Deployment Region</h3>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Primary Hub</label>
                          <input
                            type="text"
                            value={formData.primaryHub}
                            onChange={(e) => handleChange('primaryHub', e.target.value)}
                            placeholder="Central Distribution"
                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-secondary focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Reporting Manager</label>
                          <input
                            type="text"
                            value={formData.reportingManager}
                            onChange={(e) => handleChange('reportingManager', e.target.value)}
                            placeholder="Search managers..."
                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-secondary focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'security' && (
                <div className="glass-panel rounded-2xl p-8 shadow-sm">
                  <h3 className="text-lg font-bold font-headline mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined bg-slate-100 dark:bg-slate-800 p-2 rounded-lg">lock_open</span>
                    Role & Security Privileges
                  </h3>
                  <div className="space-y-4">
                    {Object.entries(roleConfig).map(([key, config]) => (
                      <label
                        key={key}
                        className={`flex items-center justify-between p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                          formData.role === key
                            ? 'border-primary/50 bg-primary/5'
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl bg-${config.color}/10 flex items-center justify-center`}>
                            <span className="material-symbols-outlined">
                              {key === 'fleet_operator' ? 'shield_person' : key === 'analyst' ? 'monitoring' : 'inventory_2'}
                            </span>
                          </div>
                          <div>
                            <div className="font-bold">{config.label}</div>
                            <div className="text-xs text-slate-500">{config.desc}</div>
                          </div>
                        </div>
                        <input
                          type="radio"
                          name="role"
                          value={key}
                          checked={formData.role === key}
                          onChange={() => handleChange('role', key)}
                          className="w-5 h-5 text-primary focus:ring-primary"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="col-span-12 lg:col-span-5">
              <div className="sticky top-24 space-y-6">
                <div className="glass-panel rounded-2xl shadow-xl border border-slate-200/50 overflow-hidden">
                  <div className="bg-gradient-to-r from-primary to-[#3a533a] px-6 py-4 text-white">
                    <span className="font-bold text-sm uppercase tracking-widest flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">verified_user</span>
                      User Preview
                    </span>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex justify-center">
                      <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <span className="material-symbols-outlined text-3xl text-slate-400">
                          {formData.firstName?.[0] || '?'}{formData.lastName?.[0] || ''}
                        </span>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-lg">
                        {formData.firstName || 'First'}{' '}{formData.lastName || 'Last'}
                      </p>
                      <p className="text-sm text-slate-500">{formData.employeeId || 'Employee ID'}</p>
                    </div>
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Department</span>
                        <span className="font-medium">{formData.department}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Role</span>
                        <span className="font-medium text-primary">{roleConfig[formData.role]?.label}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  className="w-full py-4 bg-gradient-to-r from-primary to-primary-container text-white rounded-xl font-bold shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                >
                  <span>Create Enterprise User</span>
                  <span className="material-symbols-outlined">person_add</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
