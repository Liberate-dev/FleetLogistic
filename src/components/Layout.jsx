import React from 'react';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import { useLayout } from '../context/LayoutContext';

export default function Layout({ children, className = '' }) {
  const { sidebarOpen, setSidebarOpen } = useLayout();

  return (
    <div className={`flex bg-background text-on-surface font-body ${className}`}>
      {/* Desktop Sidebar - togglable */}
      <div className={`hidden md:block shrink-0 transition-all duration-300 overflow-hidden ${sidebarOpen ? 'w-64' : 'w-0'}`}>
        <Sidebar />
      </div>

      {/* Mobile Navigation */}
      <MobileNav />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen bg-surface">
        {/* Desktop Header with Burger Button */}
        <DesktopHeader sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Mobile Header */}
        <MobileHeader />

        {/* Page Content - takes remaining space */}
        <main className="flex-1 flex flex-col">
          {children}
        </main>
      </div>
    </div>
  );
}

function DesktopHeader({ sidebarOpen, setSidebarOpen }) {
  return (
    <header className="hidden md:flex shrink-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-outline-variant/20 px-6 py-3 items-center gap-4">
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="w-10 h-10 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
        title={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
      >
        <span className="material-symbols-outlined text-2xl">{sidebarOpen ? 'menu_open' : 'menu'}</span>
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
