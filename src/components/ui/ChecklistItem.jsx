import React, { useState } from 'react';

export default function ChecklistItem({
  item,
  value,
  onChange,
  photoRequired = false,
  photoUploaded = false,
  onPhotoUpload = null,
  disabled = false,
}) {
  const [showNotes, setShowNotes] = useState(!!value?.notes);

  const statusColors = {
    baik: 'text-primary',
    'perlu perhatian': 'text-amber-600 dark:text-amber-400',
    'tidak layak': 'text-error',
  };

  const handleStatusChange = (newStatus) => {
    if (disabled) return;
    onChange({
      ...value,
      status: newStatus,
      timestamp: new Date().toISOString(),
    });
  };

  const handleNotesChange = (notes) => {
    if (disabled) return;
    onChange({
      ...value,
      notes,
    });
  };

  const isCritical = value?.status === 'TIDAK LAYAK';
  const isWarning = value?.status === 'PERLU PERHATIAN';

  return (
    <div className={`
      p-4 rounded-xl border transition-all
      ${isCritical ? 'border-error/30 bg-error/5' : ''}
      ${isWarning ? 'border-amber-300/50 bg-amber-50/50 dark:bg-amber-900/10' : ''}
      ${!isCritical && !isWarning ? 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800' : ''}
      ${disabled ? 'opacity-50 pointer-events-none' : ''}
    `}>
      {/* Item Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1">
          <h4 className="text-sm font-bold text-on-surface font-headline">
            {item.label}
          </h4>
          {item.description && (
            <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
          )}
        </div>

        {/* Photo Badge */}
        {photoRequired && (
          <span className={`
            inline-flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider
            ${photoUploaded
              ? 'bg-primary/10 text-primary'
              : 'bg-error/10 text-error animate-pulse'
            }
          `}>
            <span className="material-symbols-outlined text-[12px]">
              {photoUploaded ? 'photo' : 'photo_library'}
            </span>
            {photoUploaded ? 'Photo ✓' : 'Photo Required'}
          </span>
        )}
      </div>

      {/* Status Options */}
      {item.type === 'choice' && (
        <div className="flex flex-wrap gap-2 mb-3">
          {item.options?.map((option) => {
            const isSelected = value?.status === option;
            const optionKey = option.toLowerCase();

            return (
              <button
                key={option}
                onClick={() => handleStatusChange(option)}
                disabled={disabled}
                className={`
                  px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border
                  ${isSelected
                    ? `${statusColors[optionKey]} border-current bg-current/10`
                    : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300 dark:hover:border-slate-600'
                  }
                  ${disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:shadow-sm'}
                `}
                type="button"
              >
                {option}
              </button>
            );
          })}
        </div>
      )}

      {/* Checkbox Type */}
      {item.type === 'checkbox' && (
        <button
          onClick={() => handleStatusChange(value?.checked ? 'unchecked' : 'checked')}
          disabled={disabled}
          className={`
            flex items-center gap-2 px-3 py-2 rounded-lg border transition-all w-full
            ${value?.checked
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-slate-200 dark:border-slate-700 text-slate-500'
            }
          `}
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">
            {value?.checked ? 'check_box' : 'check_box_outline_blank'}
          </span>
          <span className="text-sm font-medium">{item.checkboxLabel || 'Confirm'}</span>
        </button>
      )}

      {/* Input Type (e.g., odometer) */}
      {item.type === 'input' && (
        <div className="mb-3">
          <input
            type={item.inputType || 'text'}
            value={value?.inputValue || ''}
            onChange={(e) => onChange({ ...value, inputValue: e.target.value })}
            placeholder={item.placeholder}
            disabled={disabled}
            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary focus:outline-none disabled:opacity-50"
          />
        </div>
      )}

      {/* Notes Field */}
      {(showNotes || isWarning || isCritical) && (
        <div className="mt-3">
          <textarea
            value={value?.notes || ''}
            onChange={(e) => handleNotesChange(e.target.value)}
            placeholder={isCritical ? 'Wajib isi catatan untuk item Tidak Layak' : 'Tambahkan catatan (opsional)'}
            disabled={disabled}
            required={isCritical}
            rows={2}
            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary focus:outline-none disabled:opacity-50 resize-none"
          />
        </div>
      )}

      {/* Toggle Notes Button */}
      {!showNotes && !isWarning && !isCritical && (
        <button
          onClick={() => setShowNotes(true)}
          className="text-xs text-slate-400 hover:text-primary flex items-center gap-1 mt-2"
          type="button"
        >
          <span className="material-symbols-outlined text-[14px]">add_comment</span>
          Tambah catatan
        </button>
      )}

      {/* Photo Upload Button */}
      {photoRequired && onPhotoUpload && (
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
          {onPhotoUpload()}
        </div>
      )}
    </div>
  );
}
