import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import TopNavBar from '../components/TopNavBar';
import { documentNumberingService } from '../utils';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general');
  const [docFormat, setDocFormat] = useState('{docType}/{branch}/{year}/{month}/{sequence}');
  const [preview, setPreview] = useState('');
  
  useEffect(() => {
    setDocFormat(documentNumberingService.getFormat());
  }, []);

  useEffect(() => {
    setPreview(documentNumberingService.generatePreview(docFormat));
  }, [docFormat]);

  const handleSaveFormat = () => {
    documentNumberingService.setFormat(docFormat);
    alert('Document Numbering Format saved successfully!');
  };

  return (
    <Layout>
      <TopNavBar title="System Settings" breadcrumbs={['Platform', 'System Settings']} />
      
      <div className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10 animate-fade-in">
        <div className="max-w-4xl mx-auto space-y-8">
          
          <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-white shadow-lg">
              <span className="material-symbols-outlined text-3xl">build</span>
            </div>
            <div>
              <h2 className="text-4xl font-extrabold font-headline tracking-tight">Organization Profile</h2>
              <p className="text-slate-500 font-body mt-1">Manage global preferences and system defaults.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             <div className="md:col-span-1 border-r border-slate-100 dark:border-slate-800 pr-6">
               <nav className="flex flex-col gap-2">
                 <button onClick={() => setActiveTab('general')} className={`text-left px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-3 transition-colors ${activeTab === 'general' ? 'bg-primary/10 text-primary' : 'text-slate-500 hover:bg-slate-50'}`}>
                   <span className="material-symbols-outlined text-[20px]">domain</span> General Profile
                 </button>
                 <button onClick={() => setActiveTab('numbering')} className={`text-left px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-3 transition-colors ${activeTab === 'numbering' ? 'bg-primary/10 text-primary' : 'text-slate-500 hover:bg-slate-50'}`}>
                   <span className="material-symbols-outlined text-[20px]">pin</span> Document Numbering
                 </button>
                 <button className="text-left px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-50 font-bold text-sm flex items-center gap-3 transition-colors">
                   <span className="material-symbols-outlined text-[20px]">notifications</span> Notifications
                 </button>
                 <button className="text-left px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-50 font-bold text-sm flex items-center gap-3 transition-colors">
                   <span className="material-symbols-outlined text-[20px]">api</span> Integrations
                 </button>
                 <button className="text-left px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-50 font-bold text-sm flex items-center gap-3 transition-colors">
                   <span className="material-symbols-outlined text-[20px]">security</span> Security Policies
                 </button>
               </nav>
             </div>
             
             <div className="md:col-span-2 space-y-8">
                {activeTab === 'general' && (
                  <>
                    <section>
                      <h3 className="font-headline font-bold text-lg mb-4">Branding</h3>
                      <div className="glass-panel p-6 rounded-2xl flex items-center gap-6">
                         <div className="w-20 h-20 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-200 cursor-pointer transition-colors">
                           <span className="material-symbols-outlined">add_photo_alternate</span>
                         </div>
                         <div>
                           <p className="text-sm font-bold text-slate-800">Upload Company Logo</p>
                           <p className="text-xs text-slate-500 mt-1 mb-3 max-w-sm">Requires a square PNG/SVG file. Recommended size 256x256px.</p>
                           <button className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold hover:border-primary hover:text-primary transition-colors">Choose File</button>
                         </div>
                      </div>
                    </section>
                    
                    <section>
                      <h3 className="font-headline font-bold text-lg mb-4">Contact Information</h3>
                      <div className="glass-panel p-6 rounded-2xl grid grid-cols-2 gap-6">
                        <div className="col-span-2">
                           <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Display Name</label>
                           <input type="text" defaultValue="Fleet Ops Indonesia" className="w-full bg-surface-container-low dark:bg-slate-800/50 border-none rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-primary shadow-inner" />
                        </div>
                        <div>
                           <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Support Email</label>
                           <input type="email" defaultValue="support@fleetops.co.id" className="w-full bg-surface-container-low dark:bg-slate-800/50 border-none rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-primary shadow-inner" />
                        </div>
                        <div>
                           <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Billing Currency</label>
                           <select className="w-full bg-surface-container-low dark:bg-slate-800/50 border-none rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-primary shadow-inner">
                             <option>IDR - Indonesian Rupiah</option>
                             <option>USD - US Dollar</option>
                           </select>
                        </div>
                      </div>
                    </section>
                    
                    <div className="flex justify-end pt-4">
                       <button className="px-8 py-3 bg-gradient-to-r from-primary to-primary-container text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all">Save Changes</button>
                    </div>
                  </>
                )}

                {activeTab === 'numbering' && (
                  <section>
                    <h3 className="font-headline font-bold text-lg mb-4">Document Numbering Format</h3>
                    <div className="glass-panel p-6 rounded-2xl space-y-6">
                      
                      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                        <h4 className="text-sm font-bold text-on-surface mb-2">Available Variables</h4>
                        <div className="flex flex-wrap gap-2">
                          <span className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono text-primary">{'{docType}'}</span>
                          <span className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono text-primary">{'{branch}'}</span>
                          <span className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono text-primary">{'{year}'}</span>
                          <span className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono text-primary">{'{month}'}</span>
                          <span className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono text-primary">{'{sequence}'}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-3">Variables will be dynamically replaced when generating new documents like Surat Jalan, LPJ, or POD.</p>
                      </div>

                      <div>
                         <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Format Template</label>
                         <input 
                           type="text" 
                           value={docFormat} 
                           onChange={e => setDocFormat(e.target.value)} 
                           className="w-full bg-surface-container-low dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-primary shadow-inner font-mono" 
                         />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Live Preview</label>
                        <div className="w-full bg-primary/5 border border-primary/20 rounded-xl p-4 text-center">
                          <p className="text-xl font-mono font-bold text-primary">{preview}</p>
                        </div>
                      </div>

                      <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                         <button onClick={handleSaveFormat} className="px-8 py-3 bg-gradient-to-r from-primary to-primary-container text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all">Save Format</button>
                      </div>
                    </div>
                  </section>
                )}
             </div>
          </div>
          
        </div>
      </div>
    </Layout>
  );
}
