import React from 'react';
import StatusBadge from './StatusBadge';

export default function DocumentCard({
  documentNumber,
  title,
  subtitle,
  status,
  date,
  icon,
  actions = [],
  onClick = null,
  metadata = {},
  className = '',
}) {
  return (
    <div
      className={`
        glass-panel rounded-2xl p-5 shadow-sm border border-slate-200/50
        hover:shadow-md hover:border-primary/30 transition-all
        ${onClick ? 'cursor-pointer group' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-start gap-3 flex-1">
          {icon && (
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <span className="material-symbols-outlined text-[20px]">{icon}</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h4 className={`
              text-sm font-bold font-headline text-on-surface truncate
              ${onClick ? 'group-hover:text-primary transition-colors' : ''}
            `}>
              {documentNumber}
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">{title}</p>
            {subtitle && (
              <p className="text-[10px] text-slate-400 mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>

        {status && <StatusBadge status={status} size="sm" />}
      </div>

      {/* Metadata */}
      {Object.keys(metadata).length > 0 && (
        <div className="grid grid-cols-2 gap-2 mb-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
          {Object.entries(metadata).map(([key, value]) => (
            <div key={key}>
              <p className="text-[9px] uppercase tracking-wider font-bold text-slate-400">{key}</p>
              <p className="text-xs font-medium text-on-surface mt-0.5">{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <span className="material-symbols-outlined text-[14px]">calendar_today</span>
          {new Date(date).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </div>

        {/* Actions */}
        {actions.length > 0 && (
          <div className="flex items-center gap-2">
            {actions.map((action, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  action.onClick();
                }}
                className={`
                  px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5
                  ${action.variant === 'primary'
                    ? 'bg-primary text-white hover:bg-primary/90'
                    : action.variant === 'error'
                    ? 'bg-error/10 text-error hover:bg-error/20'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }
                `}
                type="button"
              >
                {action.icon && (
                  <span className="material-symbols-outlined text-[14px]">{action.icon}</span>
                )}
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
