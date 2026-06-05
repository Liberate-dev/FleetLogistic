import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import StatusBadge from '../components/ui/StatusBadge';
import { useFleetOps } from '../context';
import { DISPATCH_STATUS } from '../constants';

const STATUS_CONFIG = {
  [DISPATCH_STATUS.PLANNED]: { color: 'slate', icon: 'calendar_today', label: 'Planned' },
  [DISPATCH_STATUS.READY]: { color: 'primary', icon: 'check_circle', label: 'Ready' },
  [DISPATCH_STATUS.DISPATCHED]: { color: 'secondary', icon: 'departure_board', label: 'Dispatched' },
  [DISPATCH_STATUS.IN_TRANSIT]: { color: 'amber', icon: 'local_shipping', label: 'In Transit' },
  [DISPATCH_STATUS.DELIVERED]: { color: 'tertiary', icon: 'fact_check', label: 'Delivered' },
  [DISPATCH_STATUS.COMPLETED]: { color: 'slate', icon: 'task_alt', label: 'Completed' },
  [DISPATCH_STATUS.CANCELLED]: { color: 'error', icon: 'cancel', label: 'Cancelled' },
};

export default function DispatchDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { dispatches, suratJalan, drivers, fleet } = useFleetOps();

  const dispatch = dispatches.find(d => d.id === id || d.number === id);
  const sj = dispatch ? suratJalan.find(s => s.number === dispatch.sjNumber) : null;
  const driver = dispatch ? drivers.find(d => d.id === dispatch.driverId || d.name === dispatch.driverName) : null;
  const truck = dispatch ? fleet.find(t => t.id === dispatch.truckId || t.plate === dispatch.truckPlate) : null;

  const formatCurrency = (val) => `Rp ${Number(val || 0).toLocaleString('id-ID')}`;
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!dispatch) {
    return (
      <Layout>
        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="glass-panel rounded-2xl p-12 text-center">
              <span className="material-symbols-outlined text-5xl text-slate-300 mb-4 block">error</span>
              <h3 className="text-lg font-bold font-headline text-on-surface mb-2">Dispatch Tidak Ditemukan</h3>
              <p className="text-sm text-slate-500 mb-6">Dispatch dengan ID "{id}" tidak ditemukan dalam sistem.</p>
              <button
                onClick={() => navigate('/dispatch')}
                className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold"
              >
                Kembali ke Daftar
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const statusConfig = STATUS_CONFIG[dispatch.status] || STATUS_CONFIG[DISPATCH_STATUS.PLANNED];

  return (
    <Layout>
      <header className="w-full h-[72px] shrink-0 sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-outline-variant/20 flex items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-6">
            <h1 className="font-headline text-xl font-bold tracking-tight text-emerald-900 dark:text-emerald-100">Detail Dispatch</h1>
            <div className="hidden sm:block h-6 w-px bg-slate-300 dark:bg-slate-700"></div>
            <div className="hidden sm:flex items-center gap-2 text-slate-500">
              <span className="material-symbols-outlined text-sm">tag</span>
              <span className="text-sm font-medium font-body bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">{dispatch.number}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span className="hidden sm:inline">Kembali</span>
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10 animate-fade-in bg-slate-50/50 dark:bg-slate-900/50">
        <div className="max-w-4xl mx-auto space-y-6">

          {/* Status Card */}
          <div className="glass-panel rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</p>
                <div className="flex items-center gap-2 mt-1">
                  <StatusBadge status={dispatch.status} />
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Dibuat Oleh</p>
                <p className="text-sm font-bold text-on-surface mt-1">{sj?.createdByName || 'Sistema'}</p>
              </div>
            </div>
          </div>

          {/* SJ Info */}
          <div className="glass-panel rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">description</span>
              Info Surat Jalan
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nomor SJ</p>
                <button
                  onClick={() => navigate(`/sj/${sj?.number}`)}
                  className="text-primary font-bold hover:underline"
                >
                  {dispatch.sjNumber}
                </button>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tujuan</p>
                <p className="text-sm font-medium text-on-surface">{sj?.destination || '-'}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Klien</p>
                <p className="text-sm font-medium text-on-surface">{sj?.clientName || '-'}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">driverName</p>
                <p className="text-sm font-medium text-on-surface">{sj?.contactPerson || '-'}</p>
              </div>
            </div>
          </div>

          {/* Vehicle & Driver */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-panel rounded-2xl p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">local_shipping</span>
                Kendaraan
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Plat Nomor</p>
                  <p className="text-sm font-bold text-on-surface">{dispatch.truckPlate || '-'}</p>
                </div>
                {truck && (
                  <>
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tipe</p>
                      <p className="text-sm text-on-surface">{truck.type || '-'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Kapasitas</p>
                      <p className="text-sm text-on-surface">{truck.capacity || '-'} Ton</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">person</span>
                Driver
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nama Driver</p>
                  <p className="text-sm font-bold text-on-surface">{dispatch.driverName || '-'}</p>
                </div>
                {driver && (
                  <>
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">No. HP</p>
                      <p className="text-sm text-on-surface">{driver.phone || '-'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">SIM</p>
                      <p className="text-sm text-on-surface">{driver.simType || '-'}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Cost Estimate */}
          {dispatch.costEstimate && (
            <div className="glass-panel rounded-2xl p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">payments</span>
                Estimasi Biaya
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">BBM</p>
                  <p className="text-sm font-bold text-on-surface">{formatCurrency(dispatch.costEstimate.fuelCost)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Toll</p>
                  <p className="text-sm font-bold text-on-surface">{formatCurrency(dispatch.costEstimate.tollCost)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Uang Jalan</p>
                  <p className="text-sm font-bold text-on-surface">{formatCurrency(dispatch.costEstimate.driverAllowance)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total</p>
                  <p className="text-sm font-bold text-primary">{formatCurrency(dispatch.costEstimate.total)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="glass-panel rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">schedule</span>
              Riwayat Waktu
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Dibuat</p>
                <p className="text-xs text-on-surface">{formatDate(dispatch.createdAt)}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Di-dispatch</p>
                <p className="text-xs text-on-surface">{formatDate(dispatch.dispatchedAt)}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Sampai Tujuan</p>
                <p className="text-xs text-on-surface">{formatDate(dispatch.deliveredAt)}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Selesai</p>
                <p className="text-xs text-on-surface">{formatDate(dispatch.completedAt)}</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
}