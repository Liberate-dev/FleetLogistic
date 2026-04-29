import React from 'react';

const FONNTE_STATUS_CONFIG = {
  idle: {
    icon: 'chat',
    color: 'text-slate-400',
    bgColor: 'bg-slate-100',
    borderColor: 'border-slate-200',
    label: 'WhatsApp Not Sent',
  },
  pending: {
    icon: 'schedule',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    label: 'Menunggu Response',
  },
  sent: {
    icon: 'check_circle',
    color: 'text-primary',
    bgColor: 'bg-primary/5',
    borderColor: 'border-primary/20',
    label: 'Notifikasi Terkirim',
  },
  received: {
    icon: 'done_all',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    label: 'Diterima',
  },
  confirmed: {
    icon: 'verified',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/30',
    label: 'Dikonfirmasi',
  },
  failed: {
    icon: 'error',
    color: 'text-error',
    bgColor: 'bg-error/5',
    borderColor: 'border-error/20',
    label: 'Gagal',
  },
};

export default function FonnteStatus({
  type = 'idle',
  phone = null,
  message = null,
  onRetry = null,
  compact = false,
}) {
  const config = FONNTE_STATUS_CONFIG[type] || FONNTE_STATUS_CONFIG.idle;

  if (compact) {
    return (
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${config.bgColor} border ${config.borderColor}`}>
        <span className={`material-symbols-outlined ${config.color} text-[16px]`}>
          {config.icon}
        </span>
        <span className={`text-xs font-bold ${config.color}`}>
          {config.label}
        </span>
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-xl ${config.bgColor} border ${config.borderColor}`}>
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${config.bgColor} border ${config.borderColor}`}>
          <span className={`material-symbols-outlined ${config.color} text-xl`}>
            {config.icon}
          </span>
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className={`text-sm font-bold ${config.color}`}>
              {config.label}
            </span>
            {onRetry && type === 'failed' && (
              <button
                onClick={onRetry}
                className="text-[10px] font-bold text-error hover:underline flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[12px]">refresh</span>
                Coba Lagi
              </button>
            )}
          </div>

          {phone && (
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">phone</span>
              {phone}
            </p>
          )}

          {message && (
            <p className="text-xs text-slate-500 mt-1 italic">
              "{message}"
            </p>
          )}

          {/* Status indicator dots */}
          {type !== 'idle' && type !== 'failed' && (
            <div className="flex items-center gap-1 mt-2">
              <div className={`w-1.5 h-1.5 rounded-full ${type === 'sent' || type === 'received' || type === 'confirmed' ? 'bg-primary' : 'bg-amber-500'} ${type === 'pending' ? 'animate-pulse' : ''}`}></div>
              <span className="text-[10px] text-slate-400 font-medium">
                {type === 'pending' ? 'Driver belum merespons' : 'Via Fonnte WhatsApp'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}