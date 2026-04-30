import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNavBar from '../components/TopNavBar';
import Layout from '../components/Layout';
import { useFleetOps } from '../context';

export default function AddNewTruck() {
  const navigate = useNavigate();
  const { addVehicle, setLoading, addNotification } = useFleetOps();

  const [formData, setFormData] = useState({
    assetName: '',
    vinNumber: '',
    makeModel: '',
    productionYear: new Date().getFullYear(),
    maxPayload: 45000,
    fuelCapacity: 200,
    engineType: 'Diesel-Turbo',
    hasGps: true,
    hasColdChain: false,
    status: 'READY',
  });

  const [activeTab, setActiveTab] = useState('registration');

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.assetName || !formData.vinNumber || !formData.makeModel) {
      addNotification({
        type: 'error',
        title: 'Form Tidak Lengkap',
        message: 'Mohon isi field yang wajib diisi.',
      });
      return;
    }

    setLoading(true);
    try {
      const truckData = {
        ...formData,
        id: `TRK-${Date.now()}`,
        plate: formData.assetName,
        type: formData.makeModel,
        capacity: formData.maxPayload / 1000,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
      };

      await addVehicle(truckData);

      addNotification({
        type: 'success',
        title: 'Truck Berhasil Ditambahkan',
        message: `${formData.assetName} telah didaftarkan.`,
      });

      setTimeout(() => navigate('/fleet'), 1500);
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Gagal Menambahkan Truck',
        message: error.message || 'Terjadi kesalahan.',
      });
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'registration', label: 'Registration', icon: 'description' },
    { id: 'compliance', label: 'Compliance', icon: 'verified_user' },
    { id: 'assignment', label: 'Assignment', icon: 'assignment' },
  ];

  return (
    <Layout>
      <TopNavBar title="Add New Truck" breadcrumbs={['Fleet', 'Add New Truck']} />

      <div className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10 animate-fade-in">
        <div className="max-w-6xl mx-auto space-y-8">

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-extrabold font-headline tracking-tight">Add New Truck</h2>
            </div>
            <nav className="flex gap-6 items-center flex-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`h-10 flex items-center font-manrope text-sm font-bold border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'text-emerald-700 dark:text-emerald-400 border-emerald-700 dark:border-emerald-400'
                      : 'text-slate-500 border-transparent hover:text-emerald-600'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px] mr-1">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
            <div className="flex items-center gap-3">
              <button
                onClick={handleSubmit}
                className="bg-gradient-to-r from-primary to-primary-container text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg flex items-center gap-2 hover:shadow-xl transition-all"
              >
                <span className="material-symbols-outlined text-sm">save</span>
                Publish Asset
              </button>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 lg:col-span-8 flex flex-col gap-8">
              {activeTab === 'registration' && (
                <>
                  <section className="glass-panel rounded-2xl p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-1.5 h-8 bg-primary rounded-full"></div>
                      <h2 className="text-xl font-bold font-headline">Vehicle Identity</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase">Asset Name *</label>
                        <input
                          type="text"
                          value={formData.assetName}
                          onChange={(e) => handleChange('assetName', e.target.value)}
                          placeholder="e.g. Heavy Hauler 01"
                          className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase">VIN Number *</label>
                        <input
                          type="text"
                          value={formData.vinNumber}
                          onChange={(e) => handleChange('vinNumber', e.target.value)}
                          placeholder="17-digit Identifier"
                          className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase">Make / Model *</label>
                        <select
                          value={formData.makeModel}
                          onChange={(e) => handleChange('makeModel', e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                        >
                          <option value="">Select Manufacturer</option>
                          <option>Freightliner Cascadia</option>
                          <option>Volvo FH16</option>
                          <option>Peterbilt 579</option>
                          <option>Hino 500</option>
                          <option>Isuzu Giga</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase">Production Year</label>
                        <input
                          type="number"
                          value={formData.productionYear}
                          onChange={(e) => handleChange('productionYear', parseInt(e.target.value))}
                          className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                        />
                      </div>
                    </div>
                  </section>

                  <section className="glass-panel rounded-2xl p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-1.5 h-8 bg-secondary rounded-full"></div>
                      <h2 className="text-xl font-bold font-headline">Technical Details</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Max Payload (LBS)</label>
                        <input
                          type="number"
                          value={formData.maxPayload}
                          onChange={(e) => handleChange('maxPayload', parseInt(e.target.value))}
                          className="w-full bg-transparent border-b border-slate-300 dark:border-slate-600 py-1 text-lg font-bold focus:ring-0 focus:border-secondary"
                        />
                      </div>
                      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Fuel Capacity (GAL)</label>
                        <input
                          type="number"
                          value={formData.fuelCapacity}
                          onChange={(e) => handleChange('fuelCapacity', parseInt(e.target.value))}
                          className="w-full bg-transparent border-b border-slate-300 dark:border-slate-600 py-1 text-lg font-bold focus:ring-0 focus:border-secondary"
                        />
                      </div>
                      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Engine Type</label>
                        <select
                          value={formData.engineType}
                          onChange={(e) => handleChange('engineType', e.target.value)}
                          className="w-full bg-transparent border-b border-slate-300 dark:border-slate-600 py-1 text-sm font-bold focus:ring-0 focus:border-secondary"
                        >
                          <option>Diesel-Turbo</option>
                          <option>Electric-EV</option>
                          <option>LNG Hybrid</option>
                        </select>
                      </div>
                    </div>

                    <div className="mt-6 space-y-3">
                      <label className="text-xs font-bold text-slate-500 uppercase">On-Board Telemetry</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className="flex items-center gap-4 p-4 border-2 border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:border-primary/40 transition-all">
                          <input
                            type="checkbox"
                            checked={formData.hasGps}
                            onChange={(e) => handleChange('hasGps', e.target.checked)}
                            className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
                          />
                          <div>
                            <span className="text-sm font-bold block">GPS Real-time Tracking</span>
                            <span className="text-xs text-slate-500">Active positioning every 5s</span>
                          </div>
                        </label>
                        <label className="flex items-center gap-4 p-4 border-2 border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:border-primary/40 transition-all">
                          <input
                            type="checkbox"
                            checked={formData.hasColdChain}
                            onChange={(e) => handleChange('hasColdChain', e.target.checked)}
                            className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
                          />
                          <div>
                            <span className="text-sm font-bold block">Cold-Chain Sensors</span>
                            <span className="text-xs text-slate-500">Integrated thermal monitoring</span>
                          </div>
                        </label>
                      </div>
                    </div>
                  </section>

                  <section className="glass-panel rounded-2xl p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-1.5 h-8 bg-tertiary rounded-full"></div>
                      <h2 className="text-xl font-bold font-headline">Asset Readiness</h2>
                    </div>
                    <div className="space-y-4">
                      <label className="text-xs font-bold text-slate-500 uppercase block">Current Status</label>
                      <div className="flex flex-wrap gap-3">
                        {['READY', 'IN_MAINTENANCE', 'PENDING'].map(status => (
                          <button
                            key={status}
                            onClick={() => handleChange('status', status)}
                            className={`px-6 py-2 rounded-full text-xs font-bold border-2 transition-all ${
                              formData.status === status
                                ? 'bg-primary-fixed text-on-primary-fixed border-primary shadow-sm'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-transparent hover:border-slate-300'
                            }`}
                          >
                            {status === 'READY' ? 'Ready for Service' : status === 'IN_MAINTENANCE' ? 'In Maintenance' : 'Pending Inspection'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </section>
                </>
              )}

              {activeTab === 'compliance' && (
                <section className="glass-panel rounded-2xl p-8 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-1.5 h-8 bg-tertiary rounded-full"></div>
                    <h2 className="text-xl font-bold font-headline">Compliance Documents</h2>
                  </div>
                  <div className="text-center py-12 text-slate-400">
                    <span className="material-symbols-outlined text-5xl mb-3">construction</span>
                    <p className="text-sm">Compliance section coming soon</p>
                  </div>
                </section>
              )}

              {activeTab === 'assignment' && (
                <section className="glass-panel rounded-2xl p-8 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-1.5 h-8 bg-tertiary rounded-full"></div>
                    <h2 className="text-xl font-bold font-headline">Assignment</h2>
                  </div>
                  <div className="text-center py-12 text-slate-400">
                    <span className="material-symbols-outlined text-5xl mb-3">construction</span>
                    <p className="text-sm">Assignment section coming soon</p>
                  </div>
                </section>
              )}
            </div>

            <div className="col-span-12 lg:col-span-4">
              <div className="sticky top-24 space-y-6">
                <div className="glass-panel rounded-2xl overflow-hidden shadow-lg border border-slate-200/50">
                  <div className="h-40 bg-gradient-to-br from-primary to-primary-container flex items-center justify-center">
                    <span className="material-symbols-outlined text-6xl text-white/50">local_shipping</span>
                  </div>
                  <div className="p-6 bg-white dark:bg-slate-900">
                    <h3 className="text-xl font-bold font-headline mb-1">New Fleet Asset</h3>
                    <p className="text-xs text-slate-500 mb-4">Draft status - Not yet published</p>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-slate-100">
                        <span className="text-xs text-slate-500">Asset Type</span>
                        <span className="text-xs font-bold text-emerald-800">{formData.makeModel || '-'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-100">
                        <span className="text-xs text-slate-500">Telemetry</span>
                        <span className={`text-xs font-bold ${formData.hasGps ? 'text-emerald-800' : 'text-slate-400'}`}>
                          {formData.hasGps ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-xs text-slate-500">VIN</span>
                        <span className="text-xs font-mono">{formData.vinNumber || '-'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-6 border border-amber-200 dark:border-amber-800">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="material-symbols-outlined text-amber-600">info</span>
                    <span className="text-xs font-bold text-amber-800 uppercase">Tip</span>
                  </div>
                  <p className="text-sm text-amber-800">
                    Pastikan VIN cocok dengan plat fisik di frame pintu. Registrasi yang salah bisa menyebabkan keterlambatan regulasi.
                  </p>
                </div>

                <button
                  onClick={handleSubmit}
                  className="w-full py-4 bg-primary text-white rounded-xl font-bold text-sm shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all"
                >
                  Validate & Finalize
                </button>
                <button
                  onClick={() => navigate('/fleet')}
                  className="w-full py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
