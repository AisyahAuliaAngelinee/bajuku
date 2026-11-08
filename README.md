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

## Sprint 1: responsive UI dan produksi

- Layout mobile memakai grid yang dapat menyusut, form satu kolom, tombol minimal 44 px, dan tabel dengan scroll horizontal di dalam kontainernya.
- Tombol lipat sidebar berupa ikon di sebelah logo; navigasi mobile tersedia melalui drawer dengan focus management.
- Button, Dialog/Sheet, Alert Dialog, Select, dan animasi status menggunakan primitive resmi `@animate-ui/react`. Input tanggal/angka/file dan tabel tetap elemen semantik; grafik memakai Recharts karena bukan komponen Animate UI.
- Grafik harian/mingguan/bulanan/tahunan/custom, ekspor Excel/PDF, stok manual dan pengurangan stok dari transaksi.
- Nomor nota otomatis per akun, dibuat secara atomik di PostgreSQL.
- Gambar JPG/PNG/WebP maksimal 3 MB pada produksi agar sesuai batas request Vercel; akses gambar memerlukan sesi pemilik.
- Jalankan kedua migrasi dengan `npm run db:migrate` sebelum menerima transaksi. Migrasi bersifat aditif dan dicatat dalam `schema_migrations`.
- Build produksi dan pemeriksaan TypeScript lulus. Lima pengujian rumus/validasi, agregasi grafik, serta rekonsiliasi stok lulus.

Google OAuth produksi: gunakan `AUTH_URL=https://bajuku-swart.vercel.app` dan redirect URI `https://bajuku-swart.vercel.app/api/auth/callback/google`. Simpan secret hanya pada environment hosting. Aktivasi nyata perlu diverifikasi lewat login dan penyimpanan pada deployment.

## Referensi konfigurasi

- https://animate-ui.com/docs/react
- https://authjs.dev/getting-started/providers/google
- https://authjs.dev/getting-started/deployment

### Catalog, invoice previews, and table sorting

New transactions select a product and variant from incoming stock. Historical transactions may keep their original product/variant while being edited. Google session images are displayed in the account area with an initials fallback. Chart periods use Animate UI Toggle Group.

Invoice previews reserve a number atomically per account and generated model/size/color prefix, e.g. `ECT-L-HITAM-001`. Size is detected from slash-separated variants in either `L / Hitam` or `Hitam / L` order; missing size/color use `OS`/`NA`. The sequence is 001–999 per prefix; reaching 999 returns an explicit error. Existing invoice numbers remain immutable. Cancelled forms may leave gaps. A server signature binds the reserved number to the account and selected catalog entry; save verifies it and serializes duplicate checks. No schema migration is required.

Data-column headers toggle ascending/descending sorting in the sales, stock balance, and movement history tables. Action columns are not sortable.

### Transaction History and retention

`/transaction-history` is an authenticated audit page; `/demo/transaction-history` uses session-scoped demo activity. Database triggers record create/update/delete events atomically with stock and sales writes. History deletion affects only the log, never the source transaction or stock balance. Existing source records from the last 30 days are backfilled once by migration 003.

Migration 003 is guarded by the shared migration advisory lock and runs once on the first database read/write after deployment (or via `npm run db:migrate`). Its SQL is mirrored in `lib/history-schema.ts` for the server runtime. History older than 30 days is excluded and physically deleted on history reads. Vercel runs an additional fixed expiry sweep daily at 00:00 UTC through `/api/cron/history-cleanup`. This idempotent endpoint accepts no scope/cutoff parameters and returns no user data. Quiet-account physical deletion may wait until the daily sweep; old rows are never returned by the history page.

Table loading states cover initial route fetches and refresh/mutation transitions. Stock summary edit/delete controls open the underlying incoming-stock and sales records so aggregates are not overwritten ambiguously.
