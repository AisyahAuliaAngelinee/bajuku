# Bajuku — Sprint 1

Webapp pembukuan penjualan baju. Next.js App Router, TypeScript, Auth.js Google, PostgreSQL.

## Fitur

- Login Google, logout, dan halaman transaksi yang memerlukan sesi.
- Setiap akun hanya dapat membaca, mengedit, dan menghapus transaksinya sendiri. Identitas pemilik diambil dari sesi server, bukan input browser.
- Tambah, edit, hapus transaksi. Satu baris untuk satu model/varian baju.
- Tanggal, nomor nota, nama baju, ukuran/warna, jumlah pcs, harga jual/pcs, harga modal/pcs, pembayaran, catatan.
- Total penjualan = jumlah × harga jual. Total modal = jumlah × harga modal. Laba kotor = penjualan − modal.
- Filter tanggal Jakarta, pencarian produk/nota/varian, dan ringkasan berdasarkan hasil filter.
- `/demo` memakai data contoh di memori browser. Tidak menulis ke database; perubahan hilang saat reload.

## Jalankan lokal

Gunakan Node.js 22.13 atau lebih baru.

```sh
npm install
cp .env.example .env.local
```

Isi `.env.local` di perangkat sendiri (jangan bagikan secret lewat chat):

| Variabel | Isi |
|---|---|
| AUTH_SECRET | String acak minimal 32 byte, buat dengan `openssl rand -base64 32` |
| AUTH_GOOGLE_ID | Client ID Google OAuth tipe Web application |
| AUTH_GOOGLE_SECRET | Client Secret Google OAuth |
| AUTH_URL | `http://localhost:3000` untuk lokal, URL HTTPS aplikasi untuk produksi |
| DATABASE_URL | Connection string PostgreSQL; gunakan konfigurasi TLS dari penyedia database |

Google Cloud: konfigurasikan OAuth consent screen dan buat OAuth client **Web application**. Tambahkan redirect URI `http://localhost:3000/api/auth/callback/google`. Untuk produksi tambahkan `https://DOMAIN-APLIKASI/api/auth/callback/google`. Jika OAuth app masih Testing, tambahkan akun yang akan masuk sebagai test user. Scope hanya identitas dasar Google (openid, email, profile).

```sh
npm run db:migrate
npm run dev
```

Buka `http://localhost:3000`. Demo bisa dibuka di `/demo` tanpa database atau Google credential.

## Verifikasi

```sh
npm test
npm run typecheck
npm run build
```

Sebelum produksi: login dengan dua akun berbeda, buat transaksi di masing-masing akun, pastikan data terpisah; uji tambah/edit/hapus, reload, logout, dan akses halaman tanpa sesi.

## Deploy

Gunakan hosting Node.js yang mendukung Next.js serta PostgreSQL. Set seluruh environment variable di pengaturan secret hosting. Jalankan migrasi sekali sebelum aplikasi menerima transaksi. Build dengan `npm run build`, start dengan `npm run start`. Daftarkan URL callback produksi persis seperti domain hosting. Source ini tidak memakai autentikasi atau hosting Sites.

## Status penyerahan

Uji rumus harga satuan, jumlah, validasi tanggal/nominal, harga nol, dan rugi lulus. Pemeriksaan sintaks 11 file TypeScript/TSX juga lulus. Implementasi Sprint 1 tersedia sebagai source. Belum di-deploy. Instalasi dependensi di lingkungan pembuatan terhambat akses registry; full build, pemeriksaan tipe, login Google end-to-end, dan integrasi PostgreSQL belum terverifikasi. Jangan anggap mode demo sebagai bukti login atau penyimpanan online telah aktif.

Belum termasuk manajemen stok, retur, diskon, ongkir, biaya admin, akuntansi akrual, maupun laba bersih. Input harga rupiah bulat, jumlah pcs positif. Semua data penjualan akun dimuat untuk Sprint 1; pagination server diperlukan jika volume data bertambah besar.

## Referensi konfigurasi

- https://authjs.dev/getting-started/providers/google
- https://authjs.dev/getting-started/installation
- https://authjs.dev/getting-started/deployment
- https://developers.google.com/identity/protocols/oauth2/web-server
