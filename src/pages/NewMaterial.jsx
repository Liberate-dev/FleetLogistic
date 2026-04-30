import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNavBar from '../components/TopNavBar';
import Layout from '../components/Layout';
import { useFleetOps } from '../context';

export default function NewMaterial() {
  const navigate = useNavigate();
  const { addMaterial, setLoading, addNotification } = useFleetOps();

  const [activeTab, setActiveTab] = useState('overview');
  const [formData, setFormData] = useState({
    materialName: '',
    skuCode: `MAT-${Date.now().toString().slice(-6)}`,
    category: 'Construction & Heavy Infrastructure',
    unitWeight: 1200,
    storageVolume: 1.5,
    isHazardous: false,
    isFragile: false,
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.materialName) {
      addNotification({
        type: 'error',
        title: 'Form Tidak Lengkap',
        message: 'Mohon isi nama material.',
      });
      return;
    }

    setLoading(true);
    try {
      const materialData = {
        ...formData,
        id: formData.skuCode,
        createdAt: new Date().toISOString(),
      };

      await addMaterial(materialData);

      addNotification({
        type: 'success',
        title: 'Material Berhasil Ditambahkan',
        message: `${formData.materialName} telah didaftarkan.`,
      });

      setTimeout(() => navigate('/materials'), 1500);
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Gagal Menambahkan Material',
        message: error.message || 'Terjadi kesalahan.',
      });
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'info' },
    { id: 'physical', label: 'Physical Spec', icon: 'straighten' },
    { id: 'handling', label: 'Handling & Safety', icon: 'warning' },
  ];

  return (
    <Layout>
      <TopNavBar title="New Material Registration" breadcrumbs={['Materials', 'Add Material']} />

      <div className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10 animate-fade-in">
        <div className="max-w-6xl mx-auto space-y-8">

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-extrabold font-headline tracking-tight">New Material Registration</h2>
            </div>
            <nav className="flex gap-6 items-center border-b border-slate-200 dark:border-slate-700 pb-2">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-2 font-bold text-sm border-b-2 transition-colors flex items-center gap-1.5 ${
                    activeTab === tab.id
                      ? 'text-emerald-700 dark:text-emerald-400 border-emerald-700 dark:border-emerald-400'
                      : 'text-slate-500 border-transparent hover:text-emerald-600'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            <div className="md:col-span-8 flex flex-col gap-8">
              {activeTab === 'overview' && (
                <section className="glass-panel rounded-2xl p-8 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-1.5 h-8 bg-primary rounded-full"></div>
                    <h2 className="text-xl font-bold font-headline">Material Overview</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Material / SKU Name *</label>
                      <input
                        type="text"
                        value={formData.materialName}
                        onChange={(e) => handleChange('materialName', e.target.value)}
                        placeholder="e.g. Pre-cast Concrete Column"
                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">System Code (Auto)</label>
                      <div className="flex items-center gap-2 w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-sm">
                        <span className="material-symbols-outlined text-slate-400 text-sm">lock</span>
                        <span className="font-mono text-slate-600 dark:text-slate-300 font-semibold">{formData.skuCode}</span>
                      </div>
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Primary Category</label>
                      <select
                        value={formData.category}
                        onChange={(e) => handleChange('category', e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                      >
                        <option>Construction & Heavy Infrastructure</option>
                        <option>Precision Electronics</option>
                        <option>Raw Chemicals</option>
                        <option>Agricultural Products</option>
                      </select>
                    </div>
                  </div>
                </section>
              )}

              {activeTab === 'physical' && (
                <section className="glass-panel rounded-2xl p-8 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-1.5 h-8 bg-secondary rounded-full"></div>
                    <h2 className="text-xl font-bold font-headline">Physical Dimensions</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                      <label className="text-xs font-bold text-slate-500 uppercase block mb-3">Unit Weight (KG)</label>
                      <input
                        type="number"
                        value={formData.unitWeight}
                        onChange={(e) => handleChange('unitWeight', parseFloat(e.target.value))}
                        className="w-full bg-transparent border-b-2 border-slate-300 dark:border-slate-600 py-2 text-2xl font-black font-headline focus:border-secondary focus:ring-0"
                      />
                    </div>
                    <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                      <label className="text-xs font-bold text-slate-500 uppercase block mb-3">Storage Volume (CBM)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.storageVolume}
                        onChange={(e) => handleChange('storageVolume', parseFloat(e.target.value))}
                        className="w-full bg-transparent border-b-2 border-slate-300 dark:border-slate-600 py-2 text-2xl font-black font-headline focus:border-secondary focus:ring-0"
                      />
                    </div>
                  </div>
                  <div className="mt-6 p-4 bg-secondary/10 rounded-xl border border-secondary/20 text-sm">
                    <span className="material-symbols-outlined text-secondary mr-2">info</span>
                    Weight and volume data digunakan untuk routing engine dalam penempatan kendaraan.
                  </div>
                </section>
              )}

              {activeTab === 'handling' && (
                <section className="glass-panel rounded-2xl p-8 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-1.5 h-8 bg-tertiary rounded-full"></div>
                    <h2 className="text-xl font-bold font-headline">Handling & Compliance</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="flex items-center gap-4 p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 cursor-pointer hover:border-tertiary/40 transition-all">
                      <input
                        type="checkbox"
                        checked={formData.isHazardous}
                        onChange={(e) => handleChange('isHazardous', e.target.checked)}
                        className="w-5 h-5 text-tertiary rounded border-slate-300 focus:ring-tertiary"
                      />
                      <div>
                        <span className="font-bold text-sm block">Hazardous / Toxic</span>
                        <span className="text-xs text-slate-500">Requires Hazmat License B</span>
                      </div>
                    </label>
                    <label className="flex items-center gap-4 p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 cursor-pointer hover:border-tertiary/40 transition-all">
                      <input
                        type="checkbox"
                        checked={formData.isFragile}
                        onChange={(e) => handleChange('isFragile', e.target.checked)}
                        className="w-5 h-5 text-tertiary rounded border-slate-300 focus:ring-tertiary"
                      />
                      <div>
                        <span className="font-bold text-sm block">Fragile Handling</span>
                        <span className="text-xs text-slate-500">Pneumatic suspension required</span>
                      </div>
                    </label>
                  </div>
                </section>
              )}
            </div>

            <div className="md:col-span-4">
              <div className="sticky top-24 space-y-6">
                <div className="glass-panel rounded-2xl shadow-xl border border-slate-200/50 overflow-hidden">
                  <div className="bg-gradient-to-br from-primary to-[#3a533a] p-6 text-white">
                    <span className="bg-white/20 px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest mb-2 inline-block">Preview</span>
                    <h3 className="text-xl font-bold font-headline">{formData.materialName || 'Material Name'}</h3>
                    <p className="text-primary-fixed text-sm font-medium">{formData.skuCode}</p>
                  </div>
                  <div className="p-6 bg-white dark:bg-slate-900 space-y-4">
                    <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                      <span className="text-xs font-semibold text-slate-500 uppercase">Weight</span>
                      <span className="text-xs font-bold">{formData.unitWeight.toLocaleString()} KG</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                      <span className="text-xs font-semibold text-slate-500 uppercase">Volume</span>
                      <span className="text-xs font-bold">{formData.storageVolume} CBM</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-slate-500 uppercase">Flags</span>
                      <div className="flex gap-1">
                        {formData.isHazardous && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded">HAZMAT</span>
                        )}
                        {formData.isFragile && (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded">FRAGILE</span>
                        )}
                        {!formData.isHazardous && !formData.isFragile && (
                          <span className="text-xs text-slate-400">None</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleSubmit}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-primary-container text-white font-bold text-sm shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all text-center"
                  >
                    Register Material
                  </button>
                  <button
                    onClick={() => navigate('/materials')}
                    className="w-full py-3 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
