import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function SearchableSelect({ value, onChange, options, placeholder = '-- Pilih --', label }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const wrapperRef = useRef(null);

  // Calculate position and close on outside click
  useEffect(() => {
    function updatePosition() {
      if (wrapperRef.current && isOpen) {
        const rect = wrapperRef.current.getBoundingClientRect();
        setPosition({
          top: rect.bottom + 4,
          left: rect.left,
          width: rect.width,
        });
      }
    }

    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    if (isOpen) updatePosition();

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen]);

  // Sync search text with selected value
  useEffect(() => {
    if (!isOpen) {
      const selected = options.find(o => o.value === value);
      setSearch(selected ? selected.label : '');
    }
  }, [value, isOpen, options]);

  const filtered = options.filter(o =>
    o.label.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (val) => {
    onChange(val);
    setIsOpen(false);
    setSearch(options.find(o => o.value === val)?.label || '');
  };

  const dropdown = (
    <div
      className="z-[9999] w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden"
      style={{
        position: 'fixed',
        top: `${position.top}px`,
        left: `${position.left}px`,
        width: `${position.width}px`,
      }}
    >
      {/* Search input */}
      <div className="p-2 border-b border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 rounded-lg px-3 py-2">
          <span className="material-symbols-outlined text-slate-400 text-[18px]">search</span>
          <input
            autoFocus
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ketik untuk mencari..."
            className="flex-1 bg-transparent text-sm text-on-surface outline-none placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Options list */}
      <div className="max-h-64 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="px-4 py-3 text-sm text-slate-400 text-center">Tidak ditemukan</div>
        ) : (
          filtered.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                option.value === value
                  ? 'bg-primary/10 text-primary font-bold'
                  : 'text-on-surface hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
              type="button"
            >
              {option.label}
            </button>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="relative" ref={wrapperRef}>
      {label && (
        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">{label}</label>
      )}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3 text-sm font-bold text-on-surface focus:ring-2 focus:ring-primary focus:border-primary transition-all cursor-pointer flex items-center justify-between appearance-none"
      >
        <span className={search ? 'text-on-surface truncate' : 'text-slate-400 truncate'}>
          {search || placeholder}
        </span>
        <span className="material-symbols-outlined text-slate-400 text-[18px] shrink-0">
          {isOpen ? 'expand_less' : 'expand_more'}
        </span>
      </div>

      {isOpen && createPortal(dropdown, document.body)}
    </div>
  );
}
