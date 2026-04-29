import React from 'react';
import TopNavBar from '../components/TopNavBar';
import Layout from '../components/Layout';

export default function NewMaterial() {
  return (
    <Layout>
      <TopNavBar title="New Material Registration" breadcrumbs={['Materials', 'Add Material']} />
      
      <div className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10 animate-fade-in no-scrollbar">
        <div className="max-w-6xl mx-auto space-y-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-1 block md:hidden">
              <h2 className="text-3xl font-extrabold text-on-surface font-headline tracking-tight">New Material Registration</h2>
            </div>
            
            <nav className="flex gap-6 items-center flex-1 border-b border-outline-variant/30 pb-2">
              <a href="#" className="font-manrope text-sm font-bold text-emerald-700 dark:text-emerald-400 border-b-2 border-emerald-700 dark:border-emerald-400 pb-2 -mb-[10px]">Overview</a>
              <a href="#" className="font-manrope text-sm font-medium text-slate-500 hover:text-emerald-600 transition-colors pb-2 -mb-[10px] border-b-2 border-transparent">Physical Spec</a>
              <a href="#" className="font-manrope text-sm font-medium text-slate-500 hover:text-emerald-600 transition-colors pb-2 -mb-[10px] border-b-2 border-transparent">Handling & Safety</a>
            </nav>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            
            {/* Form Section */}
            <div className="md:col-span-8 flex flex-col gap-8">
              
              {/* Section 1: Overview */}
              <section className="glass-panel rounded-2xl p-8 hover:shadow-md transition-shadow group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <span className="material-symbols-outlined text-8xl">inventory_2</span>
                </div>
                <div className="flex items-center gap-3 mb-8 relative z-10">
                  <div className="w-1.5 h-8 bg-primary rounded-full"></div>
                  <h2 className="text-2xl font-bold font-headline text-on-surface">Material Overview</h2>
                </div>
                <div className="grid grid-cols-2 gap-6 relative z-10">
                  <div className="col-span-2 md:col-span-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Material / SKU Name</label>
                    <input type="text" placeholder="e.g. Pre-cast Concrete Column" className="w-full bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-primary shadow-inner" />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">System Code (Auto)</label>
                    <div className="flex items-center gap-2 w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl p-3 text-sm opacity-80 shadow-inner">
                      <span className="material-symbols-outlined text-slate-400 text-sm">lock</span>
                      <span className="font-mono text-slate-600 dark:text-slate-300 font-semibold tracking-wider">MAT-2023-889</span>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Primary Category</label>
                    <select className="w-full bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-primary shadow-inner appearance-none relative">
                      <option>Construction & Heavy Infrastructure</option>
                      <option>Precision Electronics</option>
                      <option>Raw Chemicals</option>
                    </select>
                  </div>
                </div>
              </section>

              {/* Section 2: Physical Dimensions */}
              <section className="glass-panel rounded-2xl p-8 hover:shadow-md transition-shadow group animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-1.5 h-8 bg-secondary rounded-full"></div>
                  <h2 className="text-2xl font-bold font-headline text-on-surface">Physical Dimensions</h2>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2 md:col-span-1 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 border border-slate-100 dark:border-slate-700 hover:border-secondary/30 transition-colors shadow-inner flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center text-secondary">
                        <span className="material-symbols-outlined font-light text-[20px]">fitness_center</span>
                      </div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Unit Weight</label>
                    </div>
                    <div className="flex items-end gap-2 px-2">
                      <input type="text" defaultValue="1,200" className="bg-transparent border-b-2 border-slate-300 dark:border-slate-600 focus:border-secondary focus:ring-0 px-0 py-1 w-24 text-2xl font-black font-headline text-on-surface" />
                      <span className="text-sm font-bold text-slate-400 mb-1">KG</span>
                    </div>
                  </div>
                  
                  <div className="col-span-2 md:col-span-1 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 border border-slate-100 dark:border-slate-700 hover:border-secondary/30 transition-colors shadow-inner flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center text-secondary">
                        <span className="material-symbols-outlined font-light text-[20px]">aspect_ratio</span>
                      </div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Storage Volume</label>
                    </div>
                    <div className="flex items-end gap-2 px-2">
                      <input type="text" defaultValue="1.5" className="bg-transparent border-b-2 border-slate-300 dark:border-slate-600 focus:border-secondary focus:ring-0 px-0 py-1 w-24 text-2xl font-black font-headline text-on-surface" />
                      <span className="text-sm font-bold text-slate-400 mb-1">CBM</span>
                    </div>
                  </div>
                  
                  <div className="col-span-2">
                    <div className="flex items-center gap-4 bg-secondary-fixed/50 dark:bg-secondary/10 p-4 rounded-xl border border-secondary-fixed/50 dark:border-secondary/30 text-slate-800 dark:text-slate-300 text-sm">
                      <span className="material-symbols-outlined text-secondary text-xl shrink-0">info</span>
                      <p>Entering accurate physics data is critical. The routing engine utilizes CBM and weight matrix for vehicle assignments.</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 3: Handling & Compliance */}
              <section className="glass-panel rounded-2xl p-8 hover:shadow-md transition-shadow group animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-1.5 h-8 bg-tertiary rounded-full"></div>
                  <h2 className="text-2xl font-bold font-headline text-on-surface">Handling & Compliance</h2>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center gap-4 p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-tertiary/40 transition-colors group/label shadow-sm">
                    <input type="checkbox" className="w-5 h-5 text-tertiary rounded border-slate-300 focus:ring-tertiary shadow-sm" />
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-on-surface group-hover/label:text-tertiary transition-colors">Hazardous / Toxic</span>
                      <span className="text-xs text-slate-500 mt-0.5">Requires Hazmat License B</span>
                    </div>
                  </label>
                  
                  <label className="flex items-center gap-4 p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-tertiary/40 transition-colors group/label shadow-sm">
                    <input type="checkbox" className="w-5 h-5 text-tertiary rounded border-slate-300 focus:ring-tertiary shadow-sm" />
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-on-surface group-hover/label:text-tertiary transition-colors">Fragile Handling</span>
                      <span className="text-xs text-slate-500 mt-0.5">Pneumatic suspension required</span>
                    </div>
                  </label>
                </div>
                
                <div className="mt-8 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-primary/40 transition-colors group/upload bg-slate-50/30">
                  <div className="w-16 h-16 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center shadow-md mb-4 group-hover/upload:scale-110 group-hover/upload:text-primary transition-all">
                    <span className="material-symbols-outlined text-3xl text-slate-400 group-hover/upload:text-primary">upload_file</span>
                  </div>
                  <h3 className="text-sm font-bold text-on-surface mb-2">Upload Material Data Sheet (MSDS)</h3>
                  <p className="text-xs text-slate-500 max-w-sm">PDF or DOCX (Max 5MB). Required for all hazardous or chemical-based materials.</p>
                </div>
              </section>
            </div>

            {/* Right Sidebar: Quick Action & Preview */}
            <div className="md:col-span-4 relative">
              <div className="sticky top-24 space-y-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                
                <div className="glass-panel rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
                  <div className="bg-gradient-to-br from-primary to-[#3a533a] p-6 text-white relative overflow-hidden">
                    <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-10 pointer-events-none">
                      <span className="material-symbols-outlined text-9xl">view_in_ar</span>
                    </div>
                    <span className="bg-white/20 px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest backdrop-blur-md mb-4 inline-block">Draft Item</span>
                    <h3 className="text-2xl font-bold font-headline leading-tight">Pre-cast Concrete</h3>
                    <p className="text-primary-fixed mt-1 text-sm font-medium">MAT-2023-889</p>
                  </div>
                  
                  <div className="p-6 bg-white dark:bg-slate-900 space-y-4">
                    <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Weight Class</span>
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded">Ultra-Heavy</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Volume Constraint</span>
                      <span className="text-xs font-bold text-on-surface">1.5 CBM / Unit</span>
                    </div>
                    <div className="flex justify-between items-center pb-1">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Special Flags</span>
                      <span className="text-xs font-bold text-slate-400">None Set</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-3">
                  <button className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-primary-container text-white font-bold text-sm shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 hover:-translate-y-0.5 active:scale-95 transition-all text-center">
                    Register Material to DB
                  </button>
                  <button className="w-full py-4 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm text-center">
                    Save Details as Draft
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
