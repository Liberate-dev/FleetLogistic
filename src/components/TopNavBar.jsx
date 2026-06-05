import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLayout } from '../context/LayoutContext';

export default function TopNavBar({ title, breadcrumbs, showBack = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { setMobileNavOpen } = useLayout();
  const isDashboard = location.pathname === '/';

  return (
    <header className="w-full h-16 sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-outline-variant/20 flex items-center justify-between px-4 md:px-8 transition-all shrink-0">
      <div className="flex items-center gap-3 md:gap-4">
        {showBack && (
          <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-primary hover:bg-primary/10 rounded-full transition-all" title="Go Back">
             <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
        )}

        {breadcrumbs ? (
          <div className="flex items-center gap-2 text-sm font-medium">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="material-symbols-outlined text-xs text-slate-400">chevron_right</span>}
                <span className={idx === breadcrumbs.length - 1 ? "text-on-surface font-bold" : "text-slate-500"}>
                  {crumb}
                </span>
              </React.Fragment>
            ))}
          </div>
        ) : (
          <span className="text-lg md:text-xl font-bold tracking-tight text-emerald-950 dark:text-emerald-50">{title}</span>
        )}
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        <div className="relative hidden lg:block group">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg group-focus-within:text-primary transition-colors">search</span>
          <input
            type="text"
            placeholder="Search orders, clients, assets..."
            className="bg-surface-container-low dark:bg-slate-800 border-none rounded-full pl-10 pr-4 py-2 text-sm w-64 md:w-80 focus:ring-2 focus:ring-primary/40 focus:bg-white dark:focus:bg-slate-900 transition-all font-body shadow-inner"
          />
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <button className="w-9 h-9 flex items-center justify-center text-slate-500 hover:text-primary hover:bg-primary/10 rounded-full transition-all">
            <span className="material-symbols-outlined text-xl">help_outline</span>
          </button>
          <div className="relative">
            <button className="w-9 h-9 flex items-center justify-center text-slate-500 hover:text-primary hover:bg-primary/10 rounded-full transition-all">
              <span className="material-symbols-outlined text-xl">notifications</span>
            </button>
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-error border-2 border-white dark:border-slate-900 rounded-full animate-pulse-slow"></span>
          </div>
        </div>
      </div>
    </header>
  );
}
