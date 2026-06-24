import React from 'react';
import { NavLink } from 'react-router-dom';
import { useFleetOps } from '../context';

const navGroups = [
  {
    group: "Operations",
    items: [
      { icon: 'menu_book', label: 'Dokumentasi Teknis', path: '/technical-docs' },
      { icon: 'dashboard', label: 'Dashboard', path: '/' },
      { icon: 'receipt_long', label: 'Surat Jalan (SJ)', path: '/sj' },
      { icon: 'route', label: 'Dispatch Planning', path: '/dispatch' },
      { icon: 'how_to_reg', label: 'Proof of Delivery', path: '/pod' },
      { icon: 'account_balance_wallet', label: 'LPJ Keuangan', path: '/lpj' },
      { icon: 'monitoring', label: 'Live Monitoring', path: '/monitoring' },
    ]
  },
  {
    group: "Master Data",
    items: [
      { icon: 'local_shipping', label: 'Fleet Assets', path: '/fleet' },
      { icon: 'person', label: 'Drivers', path: '/drivers' },
      { icon: 'groups', label: 'Customers', path: '/customers' },
      { icon: 'inventory_2', label: 'Materials', path: '/materials' },
    ]
  },
  {
    group: "Administration",
    items: [
      { icon: 'manage_accounts', label: 'User Management', path: '/users' },
      { icon: 'archive', label: 'Document Archive', path: '/archive' },
      { icon: 'assessment', label: 'Reports', path: '/reports' },
      { icon: 'history', label: 'Audit Log', path: '/audit' },
    ]
  }
];

export default function Sidebar({ isOpen = true }) {
  const { addNotification } = useFleetOps();

  const handleLogout = () => {
    addNotification({
      type: 'success',
      title: 'Logout Berhasil',
      message: 'Anda telah keluar dari sistem.',
    });
    // Reset prototype state
    setTimeout(() => {
      window.location.reload();
    }, 600);
  };

  return (
    <aside className={`h-full sticky top-0 left-0 bg-slate-50 border-r border-slate-200 dark:bg-[#121619] dark:border-slate-800 flex flex-col p-4 gap-1 z-0 shrink-0 shadow-sm transition-all duration-300 ${isOpen ? 'w-64' : 'w-0 overflow-hidden'}`}>
      <div className="flex items-center gap-3 px-4 py-4 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-container rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/30">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>local_shipping</span>
        </div>
        <div>
          <h1 className="text-xl font-black text-emerald-950 dark:text-emerald-50 leading-none tracking-tight">Fleet Ops</h1>
          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mt-1">Logistics</p>
        </div>
      </div>
      
      <nav className="flex flex-col gap-6 overflow-y-auto hide-scrollbar flex-1 pb-4">
        {navGroups.map((group, idx) => (
          <div key={idx} className="flex flex-col gap-1">
            {group.group !== "Operations" && (
                <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">{group.group}</p>
            )}
            
            {group.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-4 py-2 px-4 rounded-xl transition-all duration-300 font-manrope text-sm font-semibold transform active:scale-95 ${
                    isActive
                      ? 'bg-white dark:bg-slate-800 text-primary dark:text-primary-fixed shadow-sm border border-slate-100 dark:border-slate-700'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-700 dark:hover:text-slate-200'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span 
                      className={`material-symbols-outlined transition-colors ${isActive ? 'text-primary' : ''}`}
                      style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                    >
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
      
      <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-800">
        <NavLink 
          to="/settings" 
          className="flex items-center gap-4 text-slate-500 py-2.5 px-4 hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-xl transition-all duration-300 font-manrope text-sm font-semibold"
        >
          <span className="material-symbols-outlined">settings</span>
          <span>Settings</span>
        </NavLink>
        <div className="flex items-center gap-3 px-3 py-3 mt-2 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 group cursor-pointer hover:border-primary/30 transition-colors">
          <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden ring-2 ring-white">
            <img 
              src="https://ui-avatars.com/api/?name=Alex+Sterling&background=466347&color=fff" 
              alt="User" 
              className="w-full h-full object-cover" 
            />
          </div>
          <div className="overflow-hidden flex-1">
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-primary transition-colors">Alex Sterling</p>
            <p className="text-[10px] text-slate-500 truncate uppercase mt-0.5 font-semibold">System Admin</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="mt-2 w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors active:scale-[0.985]"
        >
          <span className="material-symbols-outlined text-base">logout</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
