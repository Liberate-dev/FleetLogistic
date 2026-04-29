import React from 'react';
import TopNavBar from '../components/TopNavBar';
import Layout from '../components/Layout';

export default function AddNewCustomer() {
  return (
    <Layout>
      <TopNavBar title="Add New Customer" breadcrumbs={['Customers', 'Add New Customer']} />
      
      <div className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10 animate-fade-in">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface">Client Intake</h2>
              <p className="text-on-surface-variant font-body">Initialize new organizational profile and billing configuration.</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-6 py-2.5 rounded-xl text-primary font-semibold hover:bg-primary/10 transition-colors">Discard Draft</button>
              <button className="px-8 py-2.5 bg-gradient-to-r from-primary to-primary-container text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">save</span>
                <span>Create Profile</span>
              </button>
            </div>
          </div>

          {/* Bento Grid Layout for Form */}
          <div className="grid grid-cols-12 gap-8">
            
            {/* Primary Information Card */}
            <div className="col-span-12 lg:col-span-7 space-y-8">
              <section className="glass-panel rounded-2xl p-8 relative overflow-hidden group hover:border-primary/30 transition-colors">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/80 group-hover:bg-primary transition-colors"></div>
                <h3 className="text-xl font-bold font-headline mb-6 flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">domain</span>
                  Organization Details
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Legal Company Name</label>
                    <input type="text" placeholder="e.g. Global Logistics Corp" className="w-full bg-surface-container-low dark:bg-slate-800/50 border-none rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-primary/40 focus:bg-white dark:focus:bg-slate-800 transition-all shadow-inner" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Internal Alias</label>
                    <input type="text" placeholder="GLC_WEST" className="w-full bg-surface-container-low dark:bg-slate-800/50 border-none rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-primary/40 focus:bg-white dark:focus:bg-slate-800 transition-all shadow-inner" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Industry Sector</label>
                    <select className="w-full bg-surface-container-low dark:bg-slate-800/50 border-none rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-primary/40 focus:bg-white dark:focus:bg-slate-800 transition-all shadow-inner">
                      <option>Pharmaceuticals</option>
                      <option>Heavy Manufacturing</option>
                      <option>Cold Chain Supply</option>
                      <option>Retail/E-commerce</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Primary Contact Email</label>
                    <input type="email" placeholder="operations@company.com" className="w-full bg-surface-container-low dark:bg-slate-800/50 border-none rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-primary/40 focus:bg-white dark:focus:bg-slate-800 transition-all shadow-inner" />
                  </div>
                </div>
              </section>

              <section className="glass-panel rounded-2xl p-8 relative group hover:border-secondary/30 transition-colors">
                <h3 className="text-xl font-bold font-headline mb-6 flex items-center gap-3">
                  <span className="material-symbols-outlined text-secondary bg-secondary/10 p-2 rounded-lg">payments</span>
                  Billing & Compliance
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Tax ID / VAT Number</label>
                    <input type="text" placeholder="XX-XXXXXXX" className="w-full bg-surface-container-low dark:bg-slate-800/50 border-none rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-secondary/40 focus:bg-white dark:focus:bg-slate-800 transition-all shadow-inner" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Payment Terms</label>
                    <select className="w-full bg-surface-container-low dark:bg-slate-800/50 border-none rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-secondary/40 focus:bg-white dark:focus:bg-slate-800 transition-all shadow-inner">
                      <option>Net 30</option>
                      <option>Net 60</option>
                      <option>Due on Receipt</option>
                      <option>Custom Contract</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary-fixed/50 dark:bg-secondary/10 border border-secondary-fixed text-on-secondary-fixed-variant dark:text-secondary-fixed">
                      <span className="material-symbols-outlined">info</span>
                      <p className="text-sm">Standard corporate verification applies to all new Net 60 accounts.</p>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Side Information (Geographic/Map) */}
            <div className="col-span-12 lg:col-span-5 space-y-8 animate-slide-up">
              <section className="glass-panel rounded-2xl overflow-hidden">
                <div className="h-64 relative bg-surface-dim overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1519046904884-53103b34b206" alt="Map View" className="w-full h-full object-cover opacity-80" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
                  <div className="absolute bottom-4 left-6 text-white">
                    <span className="px-3 py-1 bg-primary rounded-md text-[10px] font-bold uppercase tracking-widest mb-2 inline-block shadow-lg">Headquarters</span>
                    <p className="text-xl font-bold font-headline leading-tight">Address Verification</p>
                  </div>
                </div>
                <div className="p-8 space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Street Address</label>
                    <input type="text" placeholder="123 Logistics Way" className="w-full bg-surface-container-low dark:bg-slate-800/50 border-none rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-primary/40 focus:bg-white transition-all shadow-inner" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">City</label>
                      <input type="text" placeholder="Chicago" className="w-full bg-surface-container-low dark:bg-slate-800/50 border-none rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-primary/40 focus:bg-white transition-all shadow-inner" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">State/Prov</label>
                      <input type="text" placeholder="IL" className="w-full bg-surface-container-low dark:bg-slate-800/50 border-none rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-primary/40 focus:bg-white transition-all shadow-inner" />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 py-4 px-6 rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
                    <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-primary shadow-sm">
                      <span className="material-symbols-outlined">location_on</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold">Auto-Geocode</p>
                      <p className="text-xs text-slate-500">Coordinates found: 41.8781° N</p>
                    </div>
                    <button className="ml-auto text-primary text-sm font-semibold hover:text-primary-container transition-colors">Refine</button>
                  </div>
                </div>
              </section>

              {/* Operational Configuration */}
              <section className="glass-panel rounded-2xl p-8 relative">
                <h3 className="text-xl font-bold font-headline mb-6 flex items-center gap-3">
                  <span className="material-symbols-outlined text-tertiary bg-tertiary/10 p-2 rounded-lg">settings_input_component</span>
                  Service Level
                </h3>
                <div className="space-y-4">
                  <label className="group block relative flex items-start gap-4 p-5 rounded-2xl border-2 border-primary/20 hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all shadow-sm">
                    <input type="radio" name="sla" defaultChecked className="mt-1 text-primary focus:ring-primary" />
                    <div>
                      <p className="font-bold text-sm">Enterprise Priority</p>
                      <p className="text-xs text-slate-500 my-1">24/7 dedicated dispatch and custom reporting.</p>
                    </div>
                    <span className="absolute top-4 right-4 px-2 py-1 bg-primary-fixed text-on-primary-fixed text-[10px] font-bold rounded-md shadow-sm">RECOMMENDED</span>
                  </label>
                  
                  <label className="group block flex items-start gap-4 p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-primary/50 cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-slate-800">
                    <input type="radio" name="sla" className="mt-1 text-primary focus:ring-primary" />
                    <div>
                      <p className="font-bold text-sm">Standard Managed</p>
                      <p className="text-xs text-slate-500 my-1">Regular portal access and scheduled reports.</p>
                    </div>
                  </label>
                </div>
              </section>
            </div>
          </div>

          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-6">
              <p className="text-slate-500 text-sm max-w-md mx-auto">By creating this profile, you confirm that the organization has passed initial risk assessment and legal vetting protocols.</p>
              <button className="px-12 py-4 bg-gradient-to-br from-primary to-[#2a3d2b] text-white rounded-2xl font-extrabold shadow-xl hover:shadow-2xl hover:shadow-primary/30 transition-all transform hover:-translate-y-1 active:scale-95 text-lg">
                Finalize Registration
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
