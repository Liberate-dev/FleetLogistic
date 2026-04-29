import React from 'react';
import TopNavBar from '../components/TopNavBar';
import Layout from '../components/Layout';

export default function AddNewTruck() {
  return (
    <Layout>
      <TopNavBar title="Add New Truck" breadcrumbs={['Fleet', 'Add New Truck']} />
      
      <div className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10 animate-fade-in">
        <div className="max-w-6xl mx-auto space-y-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-1 block md:hidden">
              <h2 className="text-4xl font-extrabold font-headline tracking-tight">Add New Truck</h2>
            </div>
            {/* Tabs extracted from original HTML logic conceptually */}
            <nav className="flex gap-6 items-center flex-1">
              <a href="#" className="text-emerald-700 dark:text-emerald-400 border-b-2 border-emerald-700 dark:border-emerald-400 h-10 flex items-center font-manrope text-sm font-bold">Registration</a>
              <a href="#" className="text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 border-b-2 border-transparent h-10 flex items-center font-manrope text-sm font-medium transition-colors">Compliance</a>
              <a href="#" className="text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 border-b-2 border-transparent h-10 flex items-center font-manrope text-sm font-medium transition-colors">Assignment</a>
            </nav>
            <div className="flex items-center gap-3">
              <button className="bg-gradient-to-r from-primary to-primary-container text-white px-6 py-2.5 rounded-xl font-manrope text-sm font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 focus:ring-2 focus:ring-primary/50 transition-all transform hover:-translate-y-1 flex items-center gap-2 micro-hover">
                <span className="material-symbols-outlined text-sm">save</span>
                Publish Asset
              </button>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-8">
            
            {/* Form Column */}
            <div className="col-span-12 md:col-span-8 flex flex-col gap-8 animate-slide-up">
              
              <section className="glass-panel rounded-2xl p-8 group hover:border-primary/30 transition-all shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-1.5 h-8 bg-primary rounded-full"></div>
                  <h2 className="text-2xl font-headline font-bold">Vehicle Identity</h2>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2 md:col-span-1 flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Asset Name</label>
                    <input type="text" placeholder="e.g. Heavy Hauler 01" className="bg-surface-container-low dark:bg-slate-800/50 border-none rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-primary shadow-inner" />
                  </div>
                  <div className="col-span-2 md:col-span-1 flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">VIN Number</label>
                    <input type="text" placeholder="17-digit Identifier" className="bg-surface-container-low dark:bg-slate-800/50 border-none rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-primary shadow-inner" />
                  </div>
                  <div className="col-span-2 md:col-span-1 flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Make / Model</label>
                    <select className="bg-surface-container-low dark:bg-slate-800/50 border-none rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-primary shadow-inner">
                      <option>Select Manufacturer</option>
                      <option>Freightliner Cascadia</option>
                      <option>Volvo FH16</option>
                      <option>Peterbilt 579</option>
                    </select>
                  </div>
                  <div className="col-span-2 md:col-span-1 flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Production Year</label>
                    <input type="number" placeholder="2024" className="bg-surface-container-low dark:bg-slate-800/50 border-none rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-primary shadow-inner" />
                  </div>
                </div>
              </section>

              <section className="glass-panel rounded-2xl p-8 group hover:border-secondary/30 transition-all shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-1.5 h-8 bg-secondary rounded-full"></div>
                  <h2 className="text-2xl font-headline font-bold">Technical Details</h2>
                </div>
                <div className="grid grid-cols-3 gap-6">
                  <div className="col-span-3 lg:col-span-1 flex flex-col gap-4 p-5 bg-surface-container-low dark:bg-slate-800/50 rounded-2xl shadow-inner border border-slate-100 dark:border-slate-800">
                    <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center text-secondary">
                      <span className="material-symbols-outlined">speed</span>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase">Max Payload</label>
                      <div className="flex items-end gap-2 mt-1">
                        <input type="text" defaultValue="45,000" className="bg-transparent border-b border-slate-300 dark:border-slate-600 w-20 text-lg font-bold p-0 focus:ring-0 focus:border-secondary text-on-surface" />
                        <span className="text-xs font-medium text-slate-400 pb-1">LBS</span>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-3 lg:col-span-1 flex flex-col gap-4 p-5 bg-surface-container-low dark:bg-slate-800/50 rounded-2xl shadow-inner border border-slate-100 dark:border-slate-800">
                    <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center text-secondary">
                      <span className="material-symbols-outlined">oil_barrel</span>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase">Fuel Capacity</label>
                      <div className="flex items-end gap-2 mt-1">
                        <input type="text" defaultValue="200" className="bg-transparent border-b border-slate-300 dark:border-slate-600 w-20 text-lg font-bold p-0 focus:ring-0 focus:border-secondary text-on-surface" />
                        <span className="text-xs font-medium text-slate-400 pb-1">GAL</span>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-3 lg:col-span-1 flex flex-col gap-4 p-5 bg-surface-container-low dark:bg-slate-800/50 rounded-2xl shadow-inner border border-slate-100 dark:border-slate-800">
                    <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center text-secondary">
                      <span className="material-symbols-outlined">settings_input_component</span>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase">Engine Type</label>
                      <div className="flex items-end gap-2 mt-1">
                        <select className="bg-transparent border-b border-slate-300 dark:border-slate-600 w-full text-sm font-bold p-0 focus:ring-0 focus:border-secondary text-on-surface">
                          <option>Diesel-Turbo</option>
                          <option>Electric-EV</option>
                          <option>LNG Hybrid</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex flex-col gap-4">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">On-Board Telemetry</label>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex items-center gap-4 p-4 border-2 border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-primary/40 transition-all shadow-sm">
                      <input type="checkbox" defaultChecked className="rounded border-slate-300 text-primary focus:ring-primary w-5 h-5" />
                      <div className="flex flex-col">
                        <span className="text-sm font-bold">GPS Real-time Tracking</span>
                        <span className="text-xs text-slate-500 mt-0.5">Active positioning every 5s</span>
                      </div>
                    </label>
                    <label className="flex items-center gap-4 p-4 border-2 border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-primary/40 transition-all shadow-sm">
                      <input type="checkbox" className="rounded border-slate-300 text-primary focus:ring-primary w-5 h-5" />
                      <div className="flex flex-col">
                        <span className="text-sm font-bold">Cold-Chain Sensors</span>
                        <span className="text-xs text-slate-500 mt-0.5">Integrated thermal monitoring</span>
                      </div>
                    </label>
                  </div>
                </div>
              </section>

              <section className="glass-panel rounded-2xl p-8 group hover:border-tertiary/30 transition-all shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-1.5 h-8 bg-tertiary rounded-full"></div>
                  <h2 className="text-2xl font-headline font-bold">Asset Readiness</h2>
                </div>
                <div className="grid grid-cols-1 gap-6">
                  <div className="flex flex-col gap-4">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current Status</label>
                    <div className="flex flex-wrap gap-3">
                      <button className="px-6 py-2 rounded-full bg-primary-fixed text-on-primary-fixed text-xs font-bold border-2 border-primary shadow-sm">Ready for Service</button>
                      <button className="px-6 py-2 rounded-full bg-surface-container-high dark:bg-slate-800 text-slate-500 text-xs font-bold border-2 border-transparent">In Maintenance</button>
                      <button className="px-6 py-2 rounded-full bg-surface-container-high dark:bg-slate-800 text-slate-500 text-xs font-bold border-2 border-transparent">Pending Inspection</button>
                      <button className="px-6 py-2 rounded-full bg-surface-container-high dark:bg-slate-800 text-slate-500 text-xs font-bold border-2 border-transparent">Decommissioned</button>
                    </div>
                  </div>
                  <div className="p-8 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center gap-3 text-center group-hover:border-primary/50 bg-slate-50/50 dark:bg-slate-800/20 transition-colors cursor-pointer mt-4">
                    <div className="w-16 h-16 rounded-full bg-white dark:bg-slate-900 shadow-md flex items-center justify-center group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-3xl text-slate-400 group-hover:text-primary">cloud_upload</span>
                    </div>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Upload Vehicle Documents</p>
                    <p className="text-xs text-slate-500 max-w-sm">PDF, JPG, or PNG (Max 10MB). Upload Registration, Insurance, and Inspection logs.</p>
                  </div>
                </div>
              </section>

            </div>

            {/* Right Sidebar: Contextual Help & Summary */}
            <div className="col-span-12 md:col-span-4">
              <div className="sticky top-24 flex flex-col gap-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <div className="glass-panel rounded-2xl overflow-hidden shadow-lg border border-slate-200/50">
                  <div className="h-40 relative">
                    <img src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7" alt="Preview" className="w-full h-full object-cover opacity-90" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
                    <div className="absolute bottom-4 left-4">
                      <span className="bg-primary px-2.5 py-1 rounded-md text-[10px] font-bold text-white uppercase tracking-widest shadow-md">Live Preview</span>
                    </div>
                  </div>
                  <div className="p-6 bg-white dark:bg-slate-900">
                    <h3 className="text-xl font-bold font-headline text-on-surface mb-1">New Fleet Asset</h3>
                    <p className="text-xs text-slate-500 mb-5 font-medium flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> Draft status • Not yet assigned
                    </p>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2.5 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-xs font-semibold text-slate-500">Asset Type</span>
                        <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400">Class 8 Heavy Duty</span>
                      </div>
                      <div className="flex justify-between items-center py-2.5 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-xs font-semibold text-slate-500">Telemetry</span>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                          <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400">Enabled</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center py-2.5">
                        <span className="text-xs font-semibold text-slate-500">Owner Entity</span>
                        <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400">Global Logistics Corp</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-900 dark:text-amber-200 rounded-2xl p-6 relative overflow-hidden border border-amber-200 dark:border-amber-900/50 shadow-sm">
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="material-symbols-outlined text-lg">info</span>
                      <span className="text-xs font-black uppercase tracking-widest">Compliance Tip</span>
                    </div>
                    <p className="text-sm leading-relaxed opacity-90">
                      Ensure the VIN matches the physical plate on the door frame. Incorrect registration can lead to regulatory delays during state-line crossings.
                    </p>
                  </div>
                  <span className="material-symbols-outlined absolute -bottom-6 -right-6 text-9xl opacity-[0.03]">verified</span>
                </div>

                <div className="flex flex-col gap-3 mt-4">
                  <button className="w-full py-4 bg-primary text-white rounded-xl font-bold text-sm shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all">
                    Validate & Finalize
                  </button>
                  <button className="w-full py-4 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm">
                    Save as Draft
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
