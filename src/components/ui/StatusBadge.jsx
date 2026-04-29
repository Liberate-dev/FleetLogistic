import React from 'react';

const STATUS_CONFIG = {
  // SJ Status
  DRAFT: { label: 'Draft', color: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300', icon: 'draft' },
  ASSIGNED: { label: 'Assigned', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: 'assignment' },
  DISPATCHED: { label: 'Dispatched', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: 'departure_board' },
  DELIVERED: { label: 'Delivered', color: 'bg-secondary/10 text-secondary dark:bg-secondary/20 dark:text-secondary-fixed', icon: 'check_circle' },
  COMPLETED: { label: 'Completed', color: 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-fixed', icon: 'task_alt' },
  VOID: { label: 'Void', color: 'bg-error/10 text-error dark:bg-error/20 dark:text-error', icon: 'cancel' },

  // Vehicle Status
  READY: { label: 'Ready', color: 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-fixed', icon: 'check_circle' },
  'IN USE': { label: 'In Use', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: 'moving' },
  MAINTENANCE: { label: 'Maintenance', color: 'bg-error/10 text-error dark:bg-error/20 dark:text-error', icon: 'build' },
  'EXPIRED DOCS': { label: 'Expired Docs', color: 'bg-error/10 text-error dark:bg-error/20 dark:text-error', icon: 'warning' },

  // Checklist Status
  'PRE-DEPARTURE DONE': { label: 'Pre-Departure Done', color: 'bg-primary/10 text-primary', icon: 'check_circle' },
  'POST-ARRIVAL DONE': { label: 'Post-Arrival Done', color: 'bg-primary/10 text-primary', icon: 'check_circle' },

  // LPJ Status
  PENDING: { label: 'Pending', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: 'pending' },
  APPROVED: { label: 'Approved', color: 'bg-primary/10 text-primary', icon: 'check_circle' },
  REJECTED: { label: 'Rejected', color: 'bg-error/10 text-error', icon: 'cancel' },

  // Dispatch Status
  PLANNED: { label: 'Planned', color: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300', icon: 'calendar_today' },
  'IN TRANSIT': { label: 'In Transit', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: 'local_shipping' },

  // Checklist Item Status
  BAIK: { label: 'Baik', color: 'bg-primary/10 text-primary', icon: 'check_circle' },
  'PERLU PERHATIAN': { label: 'Perlu Perhatian', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: 'warning' },
  'TIDAK LAYAK': { label: 'Tidak Layak', color: 'bg-error/10 text-error', icon: 'error' },
};

export default function StatusBadge({ status, size = 'md' }) {
  const config = STATUS_CONFIG[status?.toUpperCase()] || {
    label: status || 'Unknown',
    color: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
    icon: 'help_outline',
  };

  const sizeClasses = {
    sm: 'text-[9px] px-1.5 py-0.5',
    md: 'text-[10px] px-2 py-1',
    lg: 'text-xs px-2.5 py-1',
  };

  return (
    <span className={`inline-flex items-center gap-1 rounded-md font-bold uppercase tracking-widest ${config.color} ${sizeClasses[size]}`}>
      <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>
        {config.icon}
      </span>
      {config.label}
    </span>
  );
}
