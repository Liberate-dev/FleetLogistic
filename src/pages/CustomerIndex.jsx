import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import TopNavBar from '../components/TopNavBar';

export default function CustomerIndex() {
  const [searchTerm, setSearchTerm] = useState('');

  const clients = [
    { name: 'Global Logistics Corp', tier: 'Enterprise', location: 'Chicago, IL', terms: 'Net 60', status: 'Active' },
    { name: 'Nexus Industrial', tier: 'Standard', location: 'Austin, TX', terms: 'Net 30', status: 'Active' },
    { name: 'Prime Materials', tier: 'Enterprise', location: 'Miami, FL', terms: 'Custom', status: 'Pending Verification' },
  ];

  const filteredClients = useMemo(() => {
    if (!searchTerm) return clients;
    const q = searchTerm.toLowerCase();
    return clients.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.location.toLowerCase().includes(q) ||
      c.terms.toLowerCase().includes(q)
    );
  }, [searchTerm]);

  return (
    <Layout>
      <TopNavBar title="Customers" breadcrumbs={['Master Data', 'Customers']} />
      <div className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10 animate-fade-in">
        <div className="max-w-7xl mx-auto space-y-8">
          
          <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
            <div>
              <h2 className="text-3xl font-extrabold font-headline tracking-tight text-emerald-950 dark:text-emerald-50">Client Directory</h2>
              <p className="text-slate-500 font-body mt-1">Manage B2B organizational profiles and billing arrangements.</p>
            </div>
            <Link to="/customers/new" className="px-6 py-2.5 bg-gradient-to-r from-primary to-primary-container text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">domain_add</span>
              <span>Add Customer</span>
            </Link>
          </div>

          <div className="mb-3 flex gap-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama organisasi atau lokasi..."
              className="flex-1 max-w-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-4 text-sm focus:ring-2 focus:ring-primary"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="px-3 py-1 text-sm border rounded-xl">Clear</button>
            )}
          </div>

          <div className="glass-panel rounded-2xl overflow-hidden shadow-lg border border-slate-200/50">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-200 text-slate-500">
                  <th className="py-4 px-6 font-bold uppercase text-xs">Organization Name</th>
                  <th className="py-4 px-6 font-bold uppercase text-xs">SLA Tier</th>
                  <th className="py-4 px-6 font-bold uppercase text-xs">Headquarters</th>
                  <th className="py-4 px-6 font-bold uppercase text-xs">Billing Terms</th>
                  <th className="py-4 px-6 font-bold uppercase text-xs">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredClients.map((item, i) => (
                  <tr key={i} className="hover:bg-primary/5 transition-colors cursor-pointer">
                    <td className="py-4 px-6 font-bold text-slate-800 dark:text-slate-200">{item.name}</td>
                    <td className="py-4 px-6 text-slate-600">{item.tier}</td>
                    <td className="py-4 px-6 text-slate-600 flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">location_on</span> {item.location}</td>
                    <td className="py-4 px-6 text-slate-600 font-medium">{item.terms}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 text-[10px] uppercase font-bold rounded-md ${item.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{item.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
