import React from 'react';

export default function GateCheck({ checks, onCheckChange }) {
  const allComplete = checks.every(c => c.met);

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden">
      {/* Header */}
      <div className="bg-slate-50 dark:bg-slate-900 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold font-headline text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">security_check</span>
            Gate Check Requirements
          </h3>
          <span className={`
            text-xs font-bold px-2 py-1 rounded-md
            ${allComplete
              ? 'bg-primary/10 text-primary'
              : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
            }
          `}>
            {checks.filter(c => c.met).length}/{checks.length} Complete
          </span>
        </div>
      </div>

      {/* Checks List */}
      <div className="divide-y divide-slate-100 dark:divide-slate-700">
        {checks.map((check, idx) => (
          <div
            key={idx}
            className={`
              px-4 py-3 flex items-center gap-3 transition-colors
              ${check.met ? 'bg-primary/5' : ''}
            `}
          >
            {/* Status Icon */}
            <div className={`
              w-6 h-6 rounded-full flex items-center justify-center shrink-0
              ${check.met
                ? 'bg-primary text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-400'
              }
            `}>
              <span className="material-symbols-outlined text-[16px]">
                {check.met ? 'check_circle' : 'radio_button_unchecked'}
              </span>
            </div>

            {/* Description */}
            <div className="flex-1 min-w-0">
              <p className={`
                text-sm font-medium
                ${check.met ? 'text-on-surface' : 'text-slate-500'}
              `}>
                {check.label}
              </p>
              {check.description && (
                <p className="text-xs text-slate-400 mt-0.5">{check.description}</p>
              )}
              {check.error && (
                <p className="text-xs text-error mt-0.5 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">error</span>
                  {check.error}
                </p>
              )}
            </div>

            {/* Status Badge */}
            {check.status && (
              <span className={`
                text-[9px] px-2 py-1 rounded-md font-bold uppercase tracking-wider
                ${check.status === 'warning'
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                  : check.status === 'error'
                  ? 'bg-error/10 text-error'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                }
              `}>
                {check.status}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Footer Warning */}
      {!allComplete && (
        <div className="bg-amber-50 dark:bg-amber-900/10 px-4 py-3 border-t border-amber-200 dark:border-amber-800">
          <p className="text-xs text-amber-700 dark:text-amber-400 flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">warning</span>
            Semua gate check harus terpenuhi sebelum dispatch dapat dikonfirmasi
          </p>
        </div>
      )}
    </div>
  );
}
