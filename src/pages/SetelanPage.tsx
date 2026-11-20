import React, { useRef, useState } from 'react';
import {
  AlertTriangle,
  Bell,
  Clock,
  Download,
  Moon,
  RefreshCw,
  ShieldAlert,
  Sun,
  Trash2,
  Upload,
} from 'lucide-react';
import { ModalSheet } from '../components/ModalSheet';
import { AppState, AppTheme } from '../types/finance';
import { exportBackupJson, validateBackupPayload } from '../utils/backup';
import { formatDateId, formatDateTimeId } from '../utils/format';
import { NotificationSyncStatus } from '../utils/notifications';
import { isNativeApp } from '../utils/platform';
import { getFiveYearCutoffIso } from '../utils/retention';

interface SetelanPageProps {
  state: AppState;
  reminderStatus: NotificationSyncStatus;
  onToggleTheme: (theme: AppTheme) => void;
  onManualPrune: () => number;
  onResyncReminders: () => Promise<void>;
  onImportState: (nextState: AppState) => void;
  onResetAllData: () => void;
}

export const SetelanPage: React.FC<SetelanPageProps> = ({
  state,
  reminderStatus,
  onToggleTheme,
  onManualPrune,
  onResyncReminders,
  onImportState,
  onResetAllData,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [pendingImport, setPendingImport] = useState<AppState | null>(null);
  const [resetStep, setResetStep] = useState<0 | 1 | 2>(0);
  const [busyExport, setBusyExport] = useState(false);

  const cutoffIso = getFiveYearCutoffIso();

  const handleExport = async () => {
    setBusyExport(true);
    setFeedback(null);
    const result = await exportBackupJson(state);
    setBusyExport(false);
    if (result.success) {
      setFeedback({
        type: 'ok',
        text: `Backup berhasil dibuat: ${result.filename}`,
      });
    } else {
      setFeedback({
        type: 'err',
        text: result.error ?? 'Gagal membuat file backup.',
      });
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setFeedback(null);
    try {
      const text = await file.text();
      const validation = validateBackupPayload(text);
      if (!validation.valid) {
        setFeedback({ type: 'err', text: validation.error });
        return;
      }
      setPendingImport(validation.data);
    } catch {
      setFeedback({ type: 'err', text: 'Gagal membaca file yang dipilih.' });
    }
  };

  const handleConfirmImport = () => {
    if (!pendingImport) return;
    onImportState(pendingImport);
    setPendingImport(null);
    setFeedback({
      type: 'ok',
      text: 'Data backup berhasil dipulihkan ke aplikasi.',
    });
  };

  const handleManualPruneClick = () => {
    const pruned = onManualPrune();
    setFeedback({
      type: 'ok',
      text:
        pruned > 0
          ? `${pruned} transaksi kadaluarsa (> 5 tahun) dipangkas dan saldonya telah dilipat permanen.`
          : 'Tidak ada transaksi yang lebih tua dari 5 tahun. Semua data masih dalam masa retensi.',
    });
  };

  const handleResyncRemindersClick = async () => {
    await onResyncReminders();
    setFeedback({
      type: 'ok',
      text: isNativeApp()
        ? 'Jadwal pengingat tagihan H-7 berhasil diperbarui.'
        : 'Di Mode Preview Web, notifikasi lokal tidak dikirim. Instal APK Android untuk mengaktifkannya.',
    });
  };

  return (
    <div className="space-y-4">
      {feedback && (
        <div
          className={`rounded-2xl px-4 py-3 text-xs font-bold border ${
            feedback.type === 'ok'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-800/60'
              : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-200 dark:border-rose-800/60'
          }`}
        >
          {feedback.text}
        </div>
      )}

      {/* Tampilan Tema */}
      <section className="bento-card p-5 space-y-3">
        <div>
          <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
            Tampilan Aplikasi
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Pilih tema terang atau gelap yang nyaman di mata
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => onToggleTheme('light')}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-xs font-bold transition ${
              state.theme === 'light'
                ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                : 'border-sandline dark:border-slateborder text-slate-600 dark:text-slate-300'
            }`}
          >
            <Sun className="w-4 h-4 text-amber-500" />
            <span>Tema Terang</span>
          </button>
          <button
            type="button"
            onClick={() => onToggleTheme('dark')}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-xs font-bold transition ${
              state.theme === 'dark'
                ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300'
                : 'border-sandline dark:border-slateborder text-slate-600 dark:text-slate-300'
            }`}
          >
            <Moon className="w-4 h-4 text-blue-400" />
            <span>Tema Gelap</span>
          </button>
        </div>
      </section>

      {/* Pengingat Notifikasi Lokal H-7 */}
      <section className="bento-card p-5 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
                Pengingat Tagihan Wajib (H-7)
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {isNativeApp()
                ? reminderStatus.granted
                  ? `Aktif • ${reminderStatus.scheduledCount} pengingat terjadwal pukul 09:00 waktu lokal.`
                  : 'Izin notifikasi belum diberikan. Ketuk tombol di bawah untuk meminta izin.'
                : 'Berjalan otomatis di aplikasi Android APK. Mode Preview Web menonaktifkan API notifikasi native.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleResyncRemindersClick}
          className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl border border-sandline dark:border-slateborder bg-alabaster/70 dark:bg-obsidian text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Sinkronkan Pengingat H-7</span>
        </button>
      </section>

      {/* Kebijakan Retensi Data 5 Tahun (+1 Hari) */}
      <section className="bento-card p-5 space-y-3">
        <div className="flex items-start gap-2.5">
          <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
              Retensi Otomatis 5 Tahun (+1 Hari)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Transaksi sebelum tanggal{' '}
              <strong className="text-slate-700 dark:text-slate-200">
                {formatDateId(cutoffIso)}
              </strong>{' '}
              dipangkas otomatis agar aplikasi tetap ringan. Selisih bersihnya dilipat permanen ke saldo historis setiap dompet sehingga saldo tidak pernah berubah.
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-alabaster dark:bg-obsidian border border-sandline dark:border-slateborder px-3.5 py-2.5 text-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400">Pembersihan Terakhir</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {state.lastPrunedAt ? formatDateTimeId(state.lastPrunedAt) : 'Belum pernah'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400">Transaksi Dipangkas Terakhir</span>
            <span className="font-bold num-tabular text-slate-800 dark:text-slate-200">
              {state.lastPrunedCount} transaksi
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleManualPruneClick}
          className="w-full py-2.5 rounded-xl border border-sandline dark:border-slateborder bg-white dark:bg-obsidian text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
        >
          Jalankan Pemeriksaan Retensi Sekarang
        </button>
      </section>

      {/* Backup & Pemulihan Lokal */}
      <section className="bento-card p-5 space-y-3">
        <div>
          <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
            Backup & Pemulihan Data Lokal (.json)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            100% offline tanpa server. Simpan salinan file .json secara berkala di perangkat Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            type="button"
            disabled={busyExport}
            onClick={handleExport}
            className="inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white text-xs font-bold shadow-sm transition"
          >
            <Download className="w-4 h-4" />
            <span>{busyExport ? 'Menyiapkan...' : 'Ekspor Backup (.json)'}</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center justify-center gap-2 py-3 rounded-xl border border-sandline dark:border-slateborder bg-white dark:bg-obsidian text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold transition"
          >
            <Upload className="w-4 h-4" />
            <span>Impor Backup (.json)</span>
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleFileChange}
          className="hidden"
        />
      </section>

      {/* Zona Bahaya: Reset Data Lokal (Konfirmasi Ganda) */}
      <section className="rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 p-5 space-y-3">
        <div className="flex items-start gap-2.5">
          <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div>
            <h2 className="text-sm font-extrabold text-rose-900 dark:text-rose-200">
              Reset Semua Data Lokal
            </h2>
            <p className="text-xs text-rose-700 dark:text-rose-300/90 mt-0.5">
              Menghapus seluruh transaksi, dompet, tagihan wajib, dan catatan utang secara permanen dari perangkat ini.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setResetStep(1)}
          className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition"
        >
          <Trash2 className="w-4 h-4" />
          <span>Reset Data Lokal</span>
        </button>
      </section>

      {/* Modal Konfirmasi Impor Backup */}
      <ModalSheet
        open={Boolean(pendingImport)}
        onClose={() => setPendingImport(null)}
        title="Konfirmasi Impor Backup"
        subtitle="Data saat ini akan diganti dengan isi file backup"
      >
        {pendingImport && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-alabaster dark:bg-obsidian border border-sandline dark:border-slateborder p-4 text-xs space-y-1.5">
              <p className="font-bold text-slate-800 dark:text-slate-100">
                Ringkasan File Backup Valid:
              </p>
              <p className="text-slate-600 dark:text-slate-300">
                • Dompet & Buku: <strong>{pendingImport.wallets.length}</strong>
              </p>
              <p className="text-slate-600 dark:text-slate-300">
                • Transaksi: <strong>{pendingImport.transactions.length}</strong>
              </p>
              <p className="text-slate-600 dark:text-slate-300">
                • Tagihan Wajib: <strong>{pendingImport.bills.length}</strong>
              </p>
              <p className="text-slate-600 dark:text-slate-300">
                • Catatan Utang: <strong>{pendingImport.debts.length}</strong>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setPendingImport(null)}
                className="py-2.5 rounded-xl border border-sandline dark:border-slateborder text-xs font-bold text-slate-700 dark:text-slate-200"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmImport}
                className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
              >
                Timpa & Pulihkan
              </button>
            </div>
          </div>
        )}
      </ModalSheet>

      {/* Modal Konfirmasi Ganda Reset Data */}
      <ModalSheet
        open={resetStep > 0}
        onClose={() => setResetStep(0)}
        title={
          resetStep === 1
            ? 'Yakin Ingin Mereset Data?'
            : 'Konfirmasi Terakhir (Hapus Permanen)'
        }
      >
        <div className="space-y-4">
          <div className="flex items-start gap-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 p-3.5 text-xs text-rose-800 dark:text-rose-200">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <p>
              {resetStep === 1
                ? 'Pastikan Anda sudah mengekspor file backup .json terlebih dahulu. Tindakan ini akan mengosongkan seluruh catatan.'
                : 'Klik tombol merah di bawah untuk benar-benar menghapus semua data lokal Arbour Wallet sekarang.'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setResetStep(0)}
              className="py-2.5 rounded-xl border border-sandline dark:border-slateborder text-xs font-bold text-slate-700 dark:text-slate-200"
            >
              Batalkan
            </button>
            {resetStep === 1 ? (
              <button
                type="button"
                onClick={() => setResetStep(2)}
                className="py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold"
              >
                Lanjut Konfirmasi
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  onResetAllData();
                  setResetStep(0);
                  setFeedback({
                    type: 'ok',
                    text: 'Seluruh data lokal berhasil direset.',
                  });
                }}
                className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold"
              >
                Ya, Hapus Semua
              </button>
            )}
          </div>
        </div>
      </ModalSheet>
    </div>
  );
};
