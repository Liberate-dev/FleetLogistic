import React from 'react';
import TopNavBar from '../components/TopNavBar';
import Layout from '../components/Layout';

export default function AddNewUser() {
  return (
    <Layout>
      <TopNavBar title="Add New User" breadcrumbs={['User Management', 'Add New User']} />
      
      <div className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10 animate-fade-in">
        <div className="max-w-7xl mx-auto space-y-8">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <nav className="flex gap-4 border-b border-outline-variant/30 w-full mb-6 pb-2">
              <span className="font-manrope text-sm font-bold text-emerald-700 dark:text-emerald-400 border-b-2 border-emerald-700 dark:border-emerald-400 cursor-pointer pb-2">General Information</span>
              <span className="font-manrope text-sm font-medium text-slate-500 hover:text-emerald-600 transition-colors cursor-pointer pb-2">Security Settings</span>
            </nav>
          </div>

          <div className="grid grid-cols-12 gap-8">
            {/* Form Section */}
            <div className="col-span-12 lg:col-span-7 space-y-8">
              
              {/* User Profile Header Card */}
              <div className="glass-panel hover:border-primary/30 transition-colors rounded-2xl p-8 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/80 group-hover:bg-primary transition-colors"></div>
                <div className="flex items-start gap-6">
                  <div className="relative group/avatar cursor-pointer">
                    <div className="w-24 h-24 rounded-2xl bg-surface-container-low flex items-center justify-center border-2 border-dashed border-outline-variant group-hover/avatar:border-primary transition-colors overflow-hidden relative">
                      <span className="material-symbols-outlined text-4xl text-slate-400 group-hover/avatar:scale-110 transition-transform">add_a_photo</span>
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-primary text-on-primary w-8 h-8 rounded-full flex items-center justify-center shadow-md">
                      <span className="material-symbols-outlined text-sm">edit</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold font-headline mb-1">Account Details</h2>
                    <p className="text-sm text-slate-500 mb-6 font-body">Create a new identity for the Fleet Ops ecosystem. Ensure credentials are accurate.</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">First Name</label>
                        <input type="text" placeholder="e.g. Marcus" className="w-full bg-surface-container-low dark:bg-slate-800/50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/40 shadow-inner" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Last Name</label>
                        <input type="text" placeholder="e.g. Aurelius" className="w-full bg-surface-container-low dark:bg-slate-800/50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/40 shadow-inner" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Work Details Bento Grid */}
              <div className="grid grid-cols-2 gap-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <div className="glass-panel rounded-2xl p-6 shadow-sm hover:border-primary/20 transition-all">
                  <div className="flex items-center gap-2 mb-4 text-primary">
                    <span className="material-symbols-outlined bg-primary/10 p-1.5 rounded-lg">work</span>
                    <h3 className="font-bold text-sm font-headline">Professional Assignment</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Employee ID</label>
                      <input type="text" placeholder="FO-9932" className="w-full bg-surface-container-low dark:bg-slate-800/50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/40 shadow-inner" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Department</label>
                      <select className="w-full bg-surface-container-low dark:bg-slate-800/50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/40 shadow-inner">
                        <option>Ground Logistics</option>
                        <option>Air Freight Ops</option>
                        <option>Warehouse Control</option>
                        <option>Strategic Planning</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="glass-panel rounded-2xl p-6 shadow-sm hover:border-secondary/20 transition-all">
                  <div className="flex items-center gap-2 mb-4 text-secondary">
                    <span className="material-symbols-outlined bg-secondary/10 p-1.5 rounded-lg">location_on</span>
                    <h3 className="font-bold text-sm font-headline">Deployment Region</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Primary Hub</label>
                      <input type="text" placeholder="Central Distribution" className="w-full bg-surface-container-low dark:bg-slate-800/50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-secondary/40 shadow-inner" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Reporting Manager</label>
                      <input type="text" placeholder="Search managers..." className="w-full bg-surface-container-low dark:bg-slate-800/50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-secondary/40 shadow-inner flex items-center bg-search-icon bg-no-repeat bg-[right_10px_center]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Access & Roles */}
              <div className="glass-panel rounded-2xl p-8 shadow-sm animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <h3 className="text-xl font-bold font-headline mb-6 flex items-center gap-2 text-on-surface">
                  <span className="material-symbols-outlined bg-slate-100 dark:bg-slate-800 p-2 rounded-lg text-slate-600 dark:text-slate-300">lock_open</span>
                  Role & Security Privileges
                </h3>
                <div className="space-y-4">
                  <label className="flex items-center justify-between p-5 rounded-2xl border-2 border-primary/20 bg-primary/5 hover:border-primary/50 cursor-pointer transition-all shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary-fixed flex items-center justify-center text-on-primary-fixed shadow-sm">
                        <span className="material-symbols-outlined">shield_person</span>
                      </div>
                      <div>
                        <div className="font-bold text-on-surface">Fleet Operator</div>
                        <div className="text-xs text-slate-500">Full access to telemetry, routing, and dispatch systems.</div>
                      </div>
                    </div>
                    <input type="radio" name="role" defaultChecked className="w-5 h-5 text-primary border-slate-300 focus:ring-primary" />
                  </label>

                  <label className="flex items-center justify-between p-5 rounded-2xl border-2 border-slate-100 dark:border-slate-800 hover:border-secondary/30 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-all shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed shadow-sm">
                        <span className="material-symbols-outlined">monitoring</span>
                      </div>
                      <div>
                        <div className="font-bold text-on-surface">Data Analyst</div>
                        <div className="text-xs text-slate-500">View-only access to reporting and historical fleet logs.</div>
                      </div>
                    </div>
                    <input type="radio" name="role" className="w-5 h-5 text-secondary border-slate-300 focus:ring-secondary" />
                  </label>

                  <label className="flex items-center justify-between p-5 rounded-2xl border-2 border-slate-100 dark:border-slate-800 hover:border-tertiary/30 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-all shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed shadow-sm">
                        <span className="material-symbols-outlined">inventory_2</span>
                      </div>
                      <div>
                        <div className="font-bold text-on-surface">Warehouse Supervisor</div>
                        <div className="text-xs text-slate-500">Manage local inventory levels and bay assignments.</div>
                      </div>
                    </div>
                    <input type="radio" name="role" className="w-5 h-5 text-tertiary border-slate-300 focus:ring-tertiary" />
                  </label>
                </div>
              </div>
            </div>

            {/* Preview/Permissions Sticky Sidebar */}
            <div className="col-span-12 lg:col-span-5 relative">
              <div className="sticky top-24 space-y-6">
                
                <div className="glass-panel rounded-2xl shadow-xl border border-primary/20 overflow-hidden">
                  <div className="bg-gradient-to-r from-primary to-[#3a533a] px-6 py-4 flex justify-between items-center text-white">
                    <span className="font-bold text-sm uppercase tracking-widest flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">verified_user</span>
                      Permission Matrix
                    </span>
                    <span className="bg-white/20 px-2 py-1 rounded text-[10px] font-black backdrop-blur-md">LIVE PREVIEW</span>
                  </div>
                  
                  <div className="p-6 space-y-6">
                    <div className="group">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-on-surface group-hover:text-primary transition-colors">Core Fleet Ops</span>
                        <span className="text-xs font-bold text-primary">FULL ACCESS</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-primary h-full rounded-full w-full"></div>
                      </div>
                    </div>
                    
                    <div className="group">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-on-surface">Financial Reporting</span>
                        <span className="text-xs font-bold text-slate-500">READ ONLY</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-secondary h-full rounded-full w-2/5"></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <div className="bg-surface-container-low dark:bg-slate-800/50 p-4 rounded-xl border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow">
                        <div className="text-[10px] uppercase font-bold text-slate-500 mb-2">Dispatching</div>
                        <div className="flex items-center gap-1.5 text-primary">
                          <span className="material-symbols-outlined text-sm shrink-0">check_circle</span>
                          <span className="text-xs font-bold">Enabled</span>
                        </div>
                      </div>
                      <div className="bg-surface-container-low dark:bg-slate-800/50 p-4 rounded-xl border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow">
                        <div className="text-[10px] uppercase font-bold text-slate-500 mb-2">Routing</div>
                        <div className="flex items-center gap-1.5 text-primary">
                          <span className="material-symbols-outlined text-sm shrink-0">check_circle</span>
                          <span className="text-xs font-bold">Enabled</span>
                        </div>
                      </div>
                      <div className="bg-surface-container-low dark:bg-slate-800/50 p-4 rounded-xl border-l-4 border-l-tertiary shadow-sm hover:shadow-md transition-shadow">
                        <div className="text-[10px] uppercase font-bold text-slate-500 mb-2">Inventory</div>
                        <div className="flex items-center gap-1.5 text-tertiary">
                          <span className="material-symbols-outlined text-sm shrink-0">cancel</span>
                          <span className="text-xs font-bold">Disabled</span>
                        </div>
                      </div>
                      <div className="bg-surface-container-low dark:bg-slate-800/50 p-4 rounded-xl border-l-4 border-l-error shadow-sm hover:shadow-md transition-shadow">
                        <div className="text-[10px] uppercase font-bold text-slate-500 mb-2">Admin Panel</div>
                        <div className="flex items-center gap-1.5 text-error">
                          <span className="material-symbols-outlined text-sm shrink-0">block</span>
                          <span className="text-xs font-bold">Restricted</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
                      <h4 className="text-xs font-black text-slate-400 uppercase mb-4 tracking-widest">Active Inherited Policies</h4>
                      <ul className="space-y-3">
                        <li className="flex items-start gap-3 bg-primary/5 p-3 rounded-lg border border-primary/10">
                          <span className="material-symbols-outlined text-primary text-lg">verified_user</span>
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Standard 2FA Enforcement (Hub Level 4)</span>
                        </li>
                        <li className="flex items-start gap-3 bg-secondary/5 p-3 rounded-lg border border-secondary/10">
                          <span className="material-symbols-outlined text-secondary text-lg">schedule</span>
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Working Hours Login Restriction (EST)</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                {/* Footer Actions */}
                <div className="flex flex-col gap-3 mt-8">
                  <button className="w-full py-4 bg-gradient-to-r from-primary to-primary-container text-white rounded-xl font-bold text-lg shadow-xl shadow-primary/30 hover:shadow-primary/50 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 group">
                    <span>Create Enterprise User</span>
                    <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">person_add</span>
                  </button>
                  <button className="w-full py-4 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm">
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
