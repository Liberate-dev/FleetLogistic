import React from 'react';
import Layout from '../components/Layout';
import TopNavBar from '../components/TopNavBar';

export default function Monitoring() {
  const activeFleet = [
    { id: 'TRK-981', status: 'moving', location: 'I-95 North, VA', speed: '62 mph', driver: 'J. Smith' },
    { id: 'TRK-442', status: 'stopped', location: 'Rest Stop 44, NC', speed: '0 mph', driver: 'A. Davis' },
    { id: 'TRK-105', status: 'delayed', location: 'Traffic Zone, NY', speed: '12 mph', driver: 'M. Chen' }
  ];

  return (
    <Layout>
      <TopNavBar title="Live Monitoring" breadcrumbs={['Fleet', 'Live Monitoring']} />
      
      <div className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10 animate-fade-in flex flex-col h-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
          <div className="space-y-1">
            <h2 className="text-3xl font-extrabold font-headline tracking-tight text-on-surface">Fleet Tracking</h2>
            <p className="text-on-surface-variant font-body text-sm">Real-time GPS telemetry and asset status.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-white dark:bg-slate-800 px-4 py-2 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Sync Active
            </span>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6 flex-1 min-h-[500px]">
          {/* Main Map View */}
          <div className="col-span-12 lg:col-span-8 glass-panel rounded-2xl overflow-hidden relative flex flex-col">
            <div className="flex-1 bg-surface-dim relative overflow-hidden">
              <iframe 
                width="100%" 
                height="100%" 
                frameBorder="0" 
                scrolling="no" 
                marginHeight="0" 
                marginWidth="0" 
                src="https://www.openstreetmap.org/export/embed.html?bbox=106.61117553710939%2C-6.388854060851862%2C107.03964233398439%2C-6.108253106518464&amp;layer=mapnik" 
                className="w-full h-full object-cover absolute inset-0 mix-blend-luminosity opacity-80 dark:opacity-60 grayscale hover:grayscale-0 hover:mix-blend-normal transition-all duration-500"
                title="Live Map"
              ></iframe>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent pointer-events-none"></div>
              
              <div className="absolute bottom-6 left-6 text-white">
                 <p className="text-sm font-bold opacity-80 uppercase tracking-widest">Selected Asset</p>
                 <h3 className="text-3xl font-headline font-black">TRK-981</h3>
                 <p className="text-sm">En route to Chicago Hub &bull; ETA 4h 15m</p>
              </div>
            </div>
          </div>
          
          {/* Right Sidebar - Status Stream */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
             <div className="glass-panel p-6 rounded-2xl">
               <h3 className="font-headline font-bold text-lg mb-4">Active Fleet</h3>
               <div className="space-y-3">
                 {activeFleet.map((fleet, idx) => (
                   <div key={idx} className="p-4 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-primary/40 bg-white dark:bg-slate-800 transition-colors cursor-pointer group">
                     <div className="flex justify-between items-center mb-2">
                       <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{fleet.id}</span>
                       <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${
                          fleet.status === 'moving' ? 'bg-emerald-100 text-emerald-800' :
                          fleet.status === 'delayed' ? 'bg-amber-100 text-amber-800' :
                          'bg-slate-100 text-slate-800'
                       }`}>{fleet.status}</span>
                     </div>
                     <div className="flex justify-between items-end">
                       <p className="text-xs text-slate-500 font-medium">{fleet.location}</p>
                       <span className="text-xs font-bold font-mono text-primary group-hover:scale-110 transition-transform origin-right">{fleet.speed}</span>
                     </div>
                   </div>
                 ))}
               </div>
             </div>
             
             <div className="glass-panel p-6 rounded-2xl flex-1">
                <h3 className="font-headline font-bold text-lg mb-4">Weather Alerts</h3>
                <div className="flex items-start gap-4 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
                  <span className="material-symbols-outlined mt-0.5">warning</span>
                  <div>
                    <h4 className="font-bold text-sm">Heavy Rain Warning</h4>
                    <p className="text-xs mt-1">Interstate 95 corridor currently experiencing delays due to weather.</p>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
