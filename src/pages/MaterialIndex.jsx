import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import TopNavBar from '../components/TopNavBar';

export default function MaterialIndex() {
  const materials = [
    { sku: 'MAT-9901', name: 'Industrial Lubricant XL', category: 'Chemicals / Liquids', hazmat: 'Yes', stock: '450 Barrels' },
    { sku: 'MAT-8842', name: 'Steel Coils 3mm', category: 'Raw Metals', hazmat: 'No', stock: '24 Tons' },
    { sku: 'MAT-1105', name: 'Consumer Electronics Pallets', category: 'Finished Goods', hazmat: 'No', stock: '85 Units' },
  ];

  return (
    <Layout>
      <TopNavBar title="Material Profiles" breadcrumbs={['Master Data', 'Materials']} />
      <div className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10 animate-fade-in">
        <div className="max-w-7xl mx-auto space-y-8">
          
          <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
            <div>
              <h2 className="text-3xl font-extrabold font-headline tracking-tight">Material Profiles</h2>
              <p className="text-slate-500 font-body mt-1">Manage transportable materials, handling instructions, and safety data.</p>
            </div>
            <Link to="/materials/new" className="px-6 py-2.5 bg-gradient-to-r from-secondary to-[#2c3e5a] text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">add_box</span>
              <span>Add Material</span>
            </Link>
          </div>

          <div className="glass-panel rounded-2xl overflow-hidden shadow-lg border border-slate-200/50">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-200 text-slate-500">
                  <th className="py-4 px-6 font-bold uppercase text-xs">SKU</th>
                  <th className="py-4 px-6 font-bold uppercase text-xs">Item Name</th>
                  <th className="py-4 px-6 font-bold uppercase text-xs">Category</th>
                  <th className="py-4 px-6 font-bold uppercase text-xs">Hazmat Flag</th>
                  <th className="py-4 px-6 font-bold uppercase text-xs">Inventory/Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {materials.map((item, i) => (
                  <tr key={i} className="hover:bg-secondary/5 transition-colors cursor-pointer">
                    <td className="py-4 px-6 font-bold text-slate-800 dark:text-slate-200">{item.sku}</td>
                    <td className="py-4 px-6 text-slate-800 font-semibold">{item.name}</td>
                    <td className="py-4 px-6 text-slate-600">{item.category}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 text-[10px] uppercase font-bold rounded-md ${item.hazmat === 'Yes' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-600'}`}>{item.hazmat}</span>
                    </td>
                    <td className="py-4 px-6 text-slate-600 font-medium">{item.stock}</td>
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
