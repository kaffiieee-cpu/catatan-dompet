# Arbour Wallet

Aplikasi pencatat keuangan pribadi **100% offline & gratis** berbasis React, TypeScript, Tailwind CSS, dan Capacitor Android.

## Fitur Utama
- **Dual-Mode Otomatis:**
  - **Mode Preview Web:** Berjalan di browser dengan data demo realistis di memori (tidak tersimpan permanen) + tombol **Download APK**.
  - **Mode APK Android:** Penyimpanan lokal permanen di perangkat + pengingat notifikasi lokal H-7 jam 09:00.
- **Beranda Disiplin Keuangan:** Ringkasan Dana Cair, Buku Investasi & Trading, Total Utang Aktif, serta progres **Target Pengeluaran Wajib Bulan Ini**.
- **Pengeluaran Wajib Bulanan:** Manajemen tagihan rutin, tombol **Bayar** (dari dompet atau pakai utang), tombol **Batalkan (Undo)**, dan reset otomatis setiap ganti bulan kalender.
- **Dompet, Buku Aset & Catatan Utang:** Pengelompokan Cash/Tunai, Bank & E-Wallet, Buku Investasi/Trading (BTC, Saham, Exness), pindah buku tanpa menggembungkan pengeluaran, dan pencatatan/cicilan utang.
- **Cashflow & Rekap:** Filter ketat **1 Bulan**, **6 Bulan**, dan **1 Tahun**, grafik perbandingan, rincian kategori, dan kartu analisis defisit (Mines).
- **Retensi Otomatis 5 Tahun (+1 Hari):** Transaksi lebih tua dari 5 tahun dipangkas otomatis dengan melipat selisih bersihnya ke saldo historis dompet sehingga saldo tidak pernah rusak.
- **Backup & Pemulihan Lokal (.json):** Ekspor/impor file cadangan tanpa server cloud.

## Cara Push ke GitHub & Aktifkan GitHub Pages (Build APK Otomatis)

1. **Inisialisasi Git & Push ke GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Rilis awal Arbour Wallet"
   git branch -M main
   git remote add origin https://github.com/USERNAME_ANDA/catatan-dompet.git
   git push -u origin main
   ```

2. **Aktifkan GitHub Pages:**
   - Buka repositori Anda di GitHub -> klik **Settings** -> **Pages**.
   - Pada bagian **Build and deployment** -> **Source**, pilih **GitHub Actions**.

3. **Pantau Build & Unduh APK:**
   - Buka tab **Actions** di GitHub. Workflow **Build APK & Deploy Web Preview** akan otomatis berjalan.
   - Setelah selesai:
     - **Web Preview** langsung dapat diakses melalui URL GitHub Pages Anda (`https://USERNAME_ANDA.github.io/catatan-dompet/`).
     - Tombol **Download APK** di banner atas Web Preview otomatis mengunduh `ArbourWallet.apk` terbaru.
     - Anda juga dapat mengunduh `ArbourWallet.apk` dari bagian **Artifacts** di halaman hasil workflow Actions.

## Menjalankan Secara Lokal
```bash
npm install
npm run dev
```
Untuk mem-build produksi:
```bash
npm run build
```
