import React, { useState } from 'react';
import { fonnteService } from '../../services/fonnteService';

export default function DigitalSignature({
  sjNumber,
  driverPhone,
  driverName,
  nominal,
  signatureConfirmed = false,
  onConfirmed = null,
  onStatusChange = null,
  disabled = false,
}) {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  const handleSendRequest = async () => {
    if (!driverPhone) {
      setError('Nomor WhatsApp driver belum tersedia');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await fonnteService.sendSignatureRequest({
        phone: driverPhone,
        driverName: driverName || 'Driver',
        sjNumber: sjNumber,
        nominal: nominal || 0,
      });

      if (result.success) {
        setSent(true);
        onStatusChange?.('sent');
      } else {
        setError(result.error || 'Gagal mengirim permintaan');
      }
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const formattedNominal = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(nominal || 0);

  return (
    <div className={`rounded-xl border ${signatureConfirmed ? 'border-primary/30 bg-primary/5' : 'border-slate-200 dark:border-slate-700'} p-4`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${signatureConfirmed ? 'bg-primary/20' : 'bg-slate-100 dark:bg-slate-800'}`}>
          <span className={`material-symbols-outlined ${signatureConfirmed ? 'text-primary' : 'text-slate-400'} text-xl`}>
            {signatureConfirmed ? 'verified' : 'draw'}
          </span>
        </div>
        <div>
          <h4 className="text-sm font-bold text-on-surface">Konfirmasi Tanda Tangan</h4>
          <p className="text-xs text-slate-500">
            {signatureConfirmed
              ? 'Driver telah mengkonfirmasi via WhatsApp'
              : 'Kirim permintaan konfirmasi ke WhatsApp driver'}
          </p>
        </div>
      </div>

      {/* Amount info */}
      <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg mb-4">
        <div className="flex justify-between items-center">
          <span className="text-xs text-slate-500">Uang Jalan</span>
          <span className="text-lg font-black font-headline text-primary">
            {formattedNominal}
          </span>
        </div>
      </div>

      {/* Status */}
      {!signatureConfirmed ? (
        <>
          {sent ? (
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-sm font-bold text-amber-700 flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">schedule</span>
                Menunggu Konfirmasi Driver
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Driver harus ketik <span className="font-bold">KONFIRMASI {sjNumber}</span> di WhatsApp
              </p>
            </div>
          ) : (
            <>
              {/* Driver info */}
              {driverPhone && (
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                  <span className="material-symbols-outlined text-[14px]">phone</span>
                  <span>{driverPhone}</span>
                  {driverName && <span className="text-slate-400">• {driverName}</span>}
                </div>
              )}

              {/* Error message */}
              {error && (
                <div className="p-3 bg-error/5 rounded-lg border border-error/20 mb-3">
                  <p className="text-xs text-error flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">error</span>
                    {error}
                  </p>
                </div>
              )}

              {/* Send button */}
              <button
                onClick={handleSendRequest}
                disabled={disabled || loading || !driverPhone}
                className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                  disabled || loading || !driverPhone
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-primary text-white hover:bg-[#3a533a] shadow-md hover:shadow-lg'
                }`}
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                    <span>Mengirim...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">send</span>
                    <span>Kirim Permintaan TTD ke WhatsApp</span>
                  </>
                )}
              </button>

              {/* Helper text */}
              <p className="text-[10px] text-slate-400 text-center mt-2">
                Driver harus ketik "KONFIRMASI {sjNumber}" via WhatsApp
              </p>
            </>
          )}
        </>
      ) : (
        <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg border border-primary/20">
          <span className="material-symbols-outlined text-primary text-[20px]">done_all</span>
          <div>
            <p className="text-sm font-bold text-primary">TTD Dikonfirmasi</p>
            <p className="text-xs text-slate-500">Driver telah konfirmasi via WhatsApp</p>
          </div>
        </div>
      )}
    </div>
  );
}