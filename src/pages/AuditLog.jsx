import React from 'react';
import Layout from '../components/Layout';
import TopNavBar from '../components/TopNavBar';

export default function AuditLog() {
  const events = [
    { time: '10:42 AM', user: 'Alex Sterling', role: 'System Admin', action: 'Created new User Profile: M. Chen (Driver)', status: 'Success' },
    { time: '09:15 AM', user: 'System Worker', role: 'Automation', action: 'Auto-Geocoded coordinates for SJ-24091A', status: 'Success' },
    { time: 'Yesterday', user: 'Sarah Jenkins', role: 'Dispatcher', action: 'Requested override for Truck TRK-442 maintenance block', status: 'Denied' },
    { time: 'Yesterday', user: 'Alex Sterling', role: 'System Admin', action: 'Updated Global Logistics Corp billing terms to Net 60', status: 'Success' },
    { time: 'Oct 11', user: 'David Augusto', role: 'Platform Engineer', action: 'Deployed Phase 1 React Component Updates', status: 'Success' },
  ];

  return (
    <Layout>
      <TopNavBar title="Audit Log" breadcrumbs={['Security', 'System Audit Log']} />
      
      <div className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10 animate-fade-in">
        <div className="max-w-5xl mx-auto space-y-8">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div className="space-y-1">
              <h2 className="text-3xl font-extrabold font-headline tracking-tight text-on-surface">Audit Trail</h2>
              <p className="text-on-surface-variant font-body text-sm">Chronological record of system modifications and security events.</p>
            </div>
            
            <button className="px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-lg text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center gap-2">
               <span className="material-symbols-outlined text-[18px]">file_download</span>
               Export Compliance CSV
            </button>
          </div>
          
          <div className="glass-panel p-8 rounded-3xl relative">
             <div className="absolute left-10 top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-700 hidden md:block"></div>
             
             <div className="space-y-8 relative">
                {events.map((evt, idx) => (
                  <div key={idx} className="flex flex-col md:flex-row gap-6 relative group">
                    <div className="hidden md:flex w-6 h-6 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-600 absolute -left-[45px] top-4 items-center justify-center z-10 group-hover:border-primary transition-colors">
                      <div className="w-2 h-2 rounded-full bg-slate-200 group-hover:bg-primary transition-colors"></div>
                    </div>
                    
                    <div className="md:w-32 flex-shrink-0 pt-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                       {evt.time}
                    </div>
                    
                    <div className="flex-1 glass-panel bg-white/50 dark:bg-slate-800/20 p-5 rounded-2xl border border-slate-100 hover:border-slate-300 transition-colors">
                       <div className="flex flex-col md:flex-row md:items-center justify-between mb-3 gap-2">
                         <div className="flex items-center gap-2">
                           <span className="material-symbols-outlined text-slate-400 text-lg">person</span>
                           <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{evt.user}</span>
                           <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-bold uppercase text-slate-500">{evt.role}</span>
                         </div>
                         <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md ${evt.status === 'Success' ? 'text-emerald-600 bg-emerald-50' : 'text-error bg-error-container/50'}`}>
                           {evt.status}
                         </span>
                       </div>
                       <p className="text-sm font-medium text-slate-600 dark:text-slate-400 font-body">{evt.action}</p>
                    </div>
                  </div>
                ))}
             </div>
             
             <div className="mt-8 text-center">
               <button className="text-sm font-bold text-primary hover:text-primary-container transition-colors py-2 px-4 rounded-lg hover:bg-primary/5">
                 Load Older Events
               </button>
             </div>
          </div>
          
        </div>
      </div>
    </Layout>
  );
}
