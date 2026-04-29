import React, { useState } from 'react';
import Layout from '../components/Layout';
import TopNavBar from '../components/TopNavBar';

export default function Archiving() {
  const records = [
    { id: 'SJ-24091A', date: '2023-10-14', customer: 'Global Logistics Corp', origin: 'Jakarta', dest: 'Surabaya', status: 'Completed' },
    { id: 'SJ-24091B', date: '2023-10-12', customer: 'TechFlow Systems', origin: 'Bandung', dest: 'Jakarta', status: 'Completed' },
    { id: 'SJ-24088X', date: '2023-10-10', customer: 'Nexus Industrial', origin: 'Semarang', dest: 'Bali', status: 'Archived' },
    { id: 'SJ-24075C', date: '2023-09-28', customer: 'Global Logistics Corp', origin: 'Jakarta', dest: 'Medan', status: 'Archived' },
    { id: 'SJ-24012Z', date: '2023-08-15', customer: 'Prime Materials', origin: 'Surabaya', dest: 'Makassar', status: 'Archived' },
  ];

  const [selectedRecord, setSelectedRecord] = useState(null);

  const handleView = (e, rec) => {
    e.stopPropagation();
    setSelectedRecord(rec);
  };

  return (
    <Layout>
      <TopNavBar title="Document Archive" breadcrumbs={['Records', 'Document Archive']} />
      
      <div className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10 animate-fade-in flex flex-col">
        <div className="max-w-7xl mx-auto w-full space-y-6">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div className="space-y-1">
              <h2 className="text-3xl font-extrabold font-headline tracking-tight">System Archive</h2>
              <p className="text-slate-500 font-body text-sm">Search and retrieve completed Surat Jalan and historical dispatches.</p>
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
               <div className="relative flex-1 md:w-64">
                 <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
                 <input type="text" placeholder="Search SJ Number or Client..." className="w-full bg-white dark:bg-slate-800 border-none rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary shadow-sm" />
               </div>
               <button className="p-2.5 bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:text-primary transition-colors border border-slate-100 dark:border-slate-700 flex items-center justify-center">
                 <span className="material-symbols-outlined">filter_list</span>
               </button>
            </div>
          </div>
          
          <div className="glass-panel rounded-2xl overflow-hidden shadow-lg border border-slate-200/50 dark:border-slate-800/50">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-800 text-slate-500">
                    <th className="py-4 px-6 font-bold uppercase tracking-wider text-xs">Document ID</th>
                    <th className="py-4 px-6 font-bold uppercase tracking-wider text-xs">Date Created</th>
                    <th className="py-4 px-6 font-bold uppercase tracking-wider text-xs">Client</th>
                    <th className="py-4 px-6 font-bold uppercase tracking-wider text-xs">Route</th>
                    <th className="py-4 px-6 font-bold uppercase tracking-wider text-xs">Status</th>
                    <th className="py-4 px-6 font-bold uppercase tracking-wider text-xs text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {records.map((rec, i) => (
                    <tr key={i} className="hover:bg-primary/5 transition-colors group cursor-pointer">
                      <td className="py-4 px-6 font-bold text-slate-800 dark:text-slate-200 font-mono">{rec.id}</td>
                      <td className="py-4 px-6 text-slate-600 dark:text-slate-400">{rec.date}</td>
                      <td className="py-4 px-6 font-semibold">{rec.customer}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 text-slate-500">
                           <span className="truncate max-w-[100px]">{rec.origin}</span>
                           <span className="material-symbols-outlined text-[10px]">arrow_forward</span>
                           <span className="truncate max-w-[100px]">{rec.dest}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-md ${rec.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                          {rec.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button className="p-1.5 text-slate-400 hover:text-primary transition-colors opacity-0 group-hover:opacity-100">
                          <span className="material-symbols-outlined text-lg">download</span>
                        </button>
                        <button onClick={(e) => handleView(e, rec)} className="p-1.5 text-slate-400 hover:text-primary transition-colors opacity-0 group-hover:opacity-100 ml-1">
                          <span className="material-symbols-outlined text-lg">visibility</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-sm text-slate-500 bg-white/50 dark:bg-slate-900/50">
               <p>Showing 5 of 1,248 records</p>
               <div className="flex items-center gap-1">
                 <button className="p-1 hover:text-primary disabled:opacity-30" disabled><span className="material-symbols-outlined">chevron_left</span></button>
                 <button className="w-8 h-8 rounded-lg bg-primary text-white font-bold flex items-center justify-center shadow-md">1</button>
                 <button className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center">2</button>
                 <button className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center">3</button>
                 <span>...</span>
                 <button className="p-1 hover:text-primary"><span className="material-symbols-outlined">chevron_right</span></button>
               </div>
            </div>
          </div>
          
        </div>
      </div>

      {/* Professional Formatting Document Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 md:p-8 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-100 dark:bg-slate-800 w-full max-w-4xl max-h-full rounded-2xl shadow-2xl flex flex-col animate-slide-up border border-slate-200 dark:border-slate-700 overflow-hidden">
            
            {/* Modal Header Controls */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-white dark:bg-slate-900 z-10 shrink-0">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">description</span>
                <span className="font-bold text-slate-700 dark:text-slate-200">Archive Document Viewer</span>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
                  <span className="material-symbols-outlined text-[18px]">print</span> Print
                </button>
                <button onClick={() => setSelectedRecord(null)} className="px-3 py-1.5 text-slate-500 hover:text-error hover:bg-error/10 rounded-lg transition-colors flex items-center gap-2 text-sm font-bold">
                  <span className="material-symbols-outlined text-[18px]">close</span> Close
                </button>
              </div>
            </div>

            {/* Document Body (Scrollable Container) */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-200/80 dark:bg-slate-950/80 flex justify-center no-scrollbar">
              
              {/* Actual Paper Element */}
              <div className="w-full max-w-3xl bg-white shadow-xl p-8 md:p-12 relative print:shadow-none print:p-0 my-auto text-slate-800 font-sans">
                {/* Watermark */}
                <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none overflow-hidden">
                   <div className="text-[120px] font-black rotate-[-45deg] tracking-widest text-slate-800 whitespace-nowrap">FLEET OPS</div>
                </div>

                {/* Doc Header */}
                <div className="flex flex-col md:flex-row justify-between items-start border-b-2 border-slate-800 pb-6 mb-6 gap-6 relative z-10">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                      <span className="material-symbols-outlined text-4xl">local_shipping</span>
                      FLEET OPS LOGISTICS
                    </h1>
                    <p className="text-xs text-slate-500 mt-2 max-w-[250px] leading-relaxed">
                      Operation Center Building Lt 4.<br />
                      Jl. Gatot Subroto Kav. 7A, Jakarta 12190<br/>
                      Phone: (021) 555-0192 | info@fleetops.id
                    </p>
                  </div>
                  <div className="text-left md:text-right w-full md:w-auto">
                    <h2 className="text-2xl font-bold text-slate-800 mb-1">SURAT JALAN</h2>
                    <p className="text-slate-500 text-sm font-bold tracking-widest uppercase">Delivery Manifest</p>
                    <div className="mt-4 flex flex-col text-sm border-2 border-slate-200 p-4 bg-slate-50 w-full md:w-64 ml-auto">
                      <div className="flex justify-between gap-4 mb-2">
                        <span className="font-semibold text-slate-600">Doc No.</span>
                        <span className="font-bold text-slate-800 font-mono">{selectedRecord.id}</span>
                      </div>
                      <div className="flex justify-between gap-4 mb-2">
                        <span className="font-semibold text-slate-600">Date</span>
                        <span className="font-bold text-slate-800">{selectedRecord.date}</span>
                      </div>
                      <div className="flex justify-between gap-4 pt-2 border-t border-slate-200">
                        <span className="font-semibold text-slate-600">Status</span>
                        <span className="font-bold text-primary uppercase tracking-wider">{selectedRecord.status}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Routing Elements */}
                <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 mb-8 border-b-2 border-slate-100 pb-8 relative z-10">
                  <div className="flex-1 space-y-1 text-sm bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <h3 className="font-bold text-slate-400 uppercase tracking-widest text-[10px] mb-3">Shipped To (Penerima)</h3>
                    <p className="font-bold text-slate-800 text-lg">{selectedRecord.customer}</p>
                    <p className="text-slate-600 flex items-start gap-1.5 mt-2">
                      <span className="material-symbols-outlined text-[18px] shrink-0">location_on</span> 
                      <span>{selectedRecord.dest} Logistics Facility<br/>Kawasan Industri, Indonesia</span>
                    </p>
                  </div>
                  <div className="flex-1 space-y-1 text-sm bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <h3 className="font-bold text-slate-400 uppercase tracking-widest text-[10px] mb-3">Origin Facility (Asal)</h3>
                    <p className="font-bold text-slate-800 text-lg">Fleet Ops Hub - {selectedRecord.origin}</p>
                    <p className="text-slate-600 flex items-start gap-1.5 mt-2">
                      <span className="material-symbols-outlined text-[18px] shrink-0">warehouse</span> 
                      <span>Main Distribution Center<br/>{selectedRecord.origin}, Indonesia</span>
                    </p>
                  </div>
                </div>

                {/* Items Table Mock */}
                <div className="mb-8 relative z-10">
                  <table className="w-full text-sm border-collapse border border-slate-300">
                    <thead>
                      <tr className="bg-slate-800 text-white border border-slate-800">
                        <th className="py-3 px-4 text-left font-bold w-12 border-r border-slate-600">No</th>
                        <th className="py-3 px-4 text-left font-bold border-r border-slate-600">Description of Goods</th>
                        <th className="py-3 px-4 text-center font-bold w-20 border-r border-slate-600">Qty</th>
                        <th className="py-3 px-4 text-center font-bold w-24 border-r border-slate-600">Unit</th>
                        <th className="py-3 px-4 text-right font-bold w-32">Weight</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr>
                        <td className="py-4 px-4 font-semibold border-r border-slate-200 text-center">1</td>
                        <td className="py-4 px-4 border-r border-slate-200">Standard Cargo Container Box</td>
                        <td className="py-4 px-4 text-center border-r border-slate-200 font-bold">24</td>
                        <td className="py-4 px-4 text-center border-r border-slate-200">Pallets</td>
                        <td className="py-4 px-4 text-right text-slate-600">2.4 Ton</td>
                      </tr>
                      <tr>
                        <td className="py-4 px-4 font-semibold border-r border-slate-200 text-center">2</td>
                        <td className="py-4 px-4 border-r border-slate-200">Steel Pipe Materials (Grade A)</td>
                        <td className="py-4 px-4 text-center border-r border-slate-200 font-bold">150</td>
                        <td className="py-4 px-4 text-center border-r border-slate-200">Pcs</td>
                        <td className="py-4 px-4 text-right text-slate-600">8.0 Ton</td>
                      </tr>
                      {/* Empty pad row to make it look like a full invoice */}
                      <tr className="h-16">
                        <td className="py-4 px-4 border-r border-slate-200"></td>
                        <td className="py-4 px-4 border-r border-slate-200"></td>
                        <td className="py-4 px-4 border-r border-slate-200"></td>
                        <td className="py-4 px-4 border-r border-slate-200"></td>
                        <td className="py-4 px-4"></td>
                      </tr>
                      <tr className="bg-slate-100 font-bold border-t-2 border-slate-800">
                        <td colSpan="4" className="py-4 px-4 text-right uppercase tracking-wider text-xs">Total Cargo Weight</td>
                        <td className="py-4 px-4 text-right text-slate-800 text-base">10.4 Ton</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Remarks & Signatures */}
                <div className="text-sm relative z-10">
                  <div className="mb-8">
                    <p className="font-bold text-slate-800 mb-2">Remarks / Catatan:</p>
                    <p className="text-slate-600 italic p-4 bg-slate-50 border border-slate-200 rounded leading-relaxed border-l-4 border-l-slate-400">
                      "Barang telah diverifikasi sesuai dengan DO. Diterima dalam kondisi utuh dan tersegel. Dilarang dibanting (Fragile components included). Harap kembalikan copy biru ke bagian Finance setelah POD."
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-center text-center pt-8 mt-12 mb-4 gap-8">
                     <div className="w-full sm:w-48">
                       <p className="font-bold text-slate-800 mb-20 text-xs uppercase tracking-wider">Penerima (Receiver)</p>
                       <div className="border-b-2 border-slate-800"></div>
                       <p className="text-xs font-bold text-slate-500 mt-2">Nama Terang & Cap Perusahaan</p>
                     </div>
                     <div className="w-full sm:w-48">
                       <p className="font-bold text-slate-800 mb-[4.5rem] text-xs uppercase tracking-wider">Driver / Armada</p>
                       <div className="inline-block p-1 border-2 border-red-500/30 text-red-500/50 -rotate-12 rounded opacity-50 absolute align-middle transform -translate-y-6">POD CONFIRMED</div>
                       <div className="border-b-2 border-slate-800"></div>
                       <p className="text-xs font-bold text-slate-500 mt-2">Nama & Nomor Plat Kendaraan</p>
                     </div>
                     <div className="w-full sm:w-48">
                       <p className="font-bold text-slate-800 mb-20 text-xs uppercase tracking-wider">Admin Logistik</p>
                       <div className="border-b-2 border-slate-800"></div>
                       <p className="text-xs font-bold text-slate-500 mt-2">Fleet Ops Hub</p>
                     </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
