import React from 'react';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import { useLayout } from '../context/LayoutContext';

export default function Layout({ children }) {
  return (
    <div className="flex bg-background text-on-surface font-body">
      {/* Desktop Sidebar */}
      <div className="hidden md:block shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Navigation */}
      <MobileNav />

      {/* Main content */}
      <div className="flex-1 flex flex-col bg-surface">
        {/* Mobile Header */}
        <MobileHeader />

        {/* Page Content */}
        {children}
      </div>
    </div>
  );
}

function MobileHeader() {
  const { setMobileNavOpen } = useLayout();

  return (
    <header className="md:hidden shrink-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-outline-variant/20 px-4 py-3 flex items-center gap-3">
      <button
        onClick={() => setMobileNavOpen(true)}
        className="w-10 h-10 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
      >
        <span className="material-symbols-outlined text-2xl">menu</span>
      </button>
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-container rounded-lg flex items-center justify-center text-white">
          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>local_shipping</span>
        </div>
        <h1 className="text-lg font-bold text-emerald-950 dark:text-emerald-50">Fleet Ops</h1>
      </div>
    </header>
  );
}
