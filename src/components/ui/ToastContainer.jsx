import React, { useEffect } from 'react';
import { useFleetOps } from '../../context';

const TYPE_CONFIG = {
  success: {
    bg: 'bg-emerald-50 dark:bg-emerald-900/30',
    border: 'border-emerald-200 dark:border-emerald-700',
    icon: 'check_circle',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    titleColor: 'text-emerald-800 dark:text-emerald-200',
  },
  error: {
    bg: 'bg-red-50 dark:bg-red-900/30',
    border: 'border-red-200 dark:border-red-700',
    icon: 'error',
    iconColor: 'text-red-600 dark:text-red-400',
    titleColor: 'text-red-800 dark:text-red-200',
  },
  warning: {
    bg: 'bg-amber-50 dark:bg-amber-900/30',
    border: 'border-amber-200 dark:border-amber-700',
    icon: 'warning',
    iconColor: 'text-amber-600 dark:text-amber-400',
    titleColor: 'text-amber-800 dark:text-amber-200',
  },
  info: {
    bg: 'bg-blue-50 dark:bg-blue-900/30',
    border: 'border-blue-200 dark:border-blue-700',
    icon: 'info',
    iconColor: 'text-blue-600 dark:text-blue-400',
    titleColor: 'text-blue-800 dark:text-blue-200',
  },
};

export default function ToastContainer() {
  const { notifications, removeNotification } = useFleetOps();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm w-full pointer-events-none">
      {notifications.map((notification) => {
        const config = TYPE_CONFIG[notification.type] || TYPE_CONFIG.info;

        return (
          <Toast
            key={notification.id}
            id={notification.id}
            title={notification.title}
            message={notification.message}
            type={notification.type}
            onClose={() => removeNotification(notification.id)}
          />
        );
      })}
    </div>
  );
}

function Toast({ id, title, message, type = 'info', onClose }) {
  const config = TYPE_CONFIG[type] || TYPE_CONFIG.info;

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`pointer-events-auto ${config.bg} ${config.border} border rounded-xl shadow-lg p-4 animate-slide-in-right`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <span className={`material-symbols-outlined ${config.iconColor} shrink-0 text-[20px]`}>
          {config.icon}
        </span>
        <div className="flex-1 min-w-0">
          {title && (
            <p className={`text-sm font-bold ${config.titleColor}`}>{title}</p>
          )}
          {message && (
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">{message}</p>
          )}
        </div>
        <button
          onClick={onClose}
          className="shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>
    </div>
  );
}
