# Setup, deployment dan pengujian

## Environment

| Variabel | Kegunaan |
| --- | --- |
| `AUTH_SECRET` | Secret Auth.js/signature; buat dengan `openssl rand -base64 32` |
| `AUTH_GOOGLE_ID` | Google OAuth Web application client ID |
| `AUTH_GOOGLE_SECRET` | Client secret Google |
| `AUTH_URL` | Origin aplikasi: lokal `http://localhost:3000`, produksi `https://bajuku-swart.vercel.app` |
| `DATABASE_URL` | Connection string PostgreSQL sesuai konfigurasi TLS provider |

Simpan lokal di `.env.local`, produksi di environment Vercel. Jangan unggah secret, database dump atau credential ke GitHub/dokumentasi.

## Instalasi

```sh
npm ci
cp .env.example .env.local
# Isi environment sebelum langkah berikut.
npm run db:migrate
npm run dev
```

Database kosong memerlukan seluruh migrasi 001–007. Runner melacak nama migrasi dan memakai advisory lock agar aman terhadap eksekusi bersamaan. Backup database sebelum perubahan skema pada data penting; restore backup dilakukan melalui provider PostgreSQL.

## Google OAuth

Buat client tipe Web application dan consent screen. Callback yang digunakan:

- Lokal: `http://localhost:3000/api/auth/callback/google`
- Produksi: `https://bajuku-swart.vercel.app/api/auth/callback/google`

Saat aplikasi OAuth berstatus Testing, akun penguji harus tercantum sebagai test user. Scope identitas dasar: openid, email, profile. Perubahan domain harus diikuti pembaruan AUTH_URL dan callback Google.

## Rilis Vercel

1. Pastikan build dan pemeriksaan yang sesuai perubahan lulus.
2. Push commit ke branch `main` repository `AisyahAuliaAngelinee/bajuku`.
3. Tunggu status Vercel **success/Ready** untuk SHA commit tersebut; jangan mengandalkan build deployment lama.
4. Pastikan production alias mengarah ke rilis yang dimaksud.
5. Uji baca halaman dan alur demo; jangan memakai data produksi untuk uji hapus permanen.

Pembaruan dokumentasi juga dipush sebagai commit sehingga integrasi GitHub–Vercel membangun deployment baru. Bila webhook tidak memicu build, pilih deployment baru dari commit `main` terkini melalui dashboard Vercel.

Rollback aplikasi: pilih deployment produksi terakhir yang diketahui baik. Rollback kode tidak otomatis membatalkan migrasi atau mengembalikan data yang telah dihapus permanen.

## Jadwal retensi

`vercel.json`: `0 0 * * *` memanggil `/api/cron/history-cleanup` setiap hari pukul **00.00 UTC / 07.00 WIB**. History read juga melakukan cleanup. Cutoff adalah 30 × 24 jam dari timestamp penghapusan; bukan akhir bulan. Penghapusan fisik akun yang sepi dapat menunggu sweep berikutnya. Verifikasi cron aktif di proyek Vercel; keberadaan konfigurasi saja tidak membuktikan eksekusi terakhir.

## Pemeriksaan otomatis

```sh
node --import tsx --test tests/*.test.ts
npm run typecheck
npm run build -- --webpack
```

Cakupan: rumus/validasi, waktu lintas zona, harga katalog, stock dan grouping, nota, sort, PDF/Excel binary/border/chart, serta soft-delete/restore/permanent. Pengujian SQL menggunakan mock untuk memeriksa scope/rollback; bukan integrasi live PostgreSQL. Jumlah tes dapat berubah; gunakan hasil checkout terbaru, bukan angka historis README.

## Checklist penerimaan manual

- [ ] Google login/logout berhasil, foto profil benar, toast muncul setelah hasil auth.
- [ ] Dua akun berbeda tidak dapat membaca/mengubah file, gambar atau record akun lain.
- [ ] Barang masuk → transaksi → stock dan profit cocok; qty mengalikan harga yang benar.
- [ ] Nota preview konsisten, batal form tidak menggunakan ulang nomor, nota edit tidak berubah.
- [ ] Edit grup membuka catatan semua varian; collapse tidak merusak pilihan grup.
- [ ] Checkbox baris/halaman, pilihan lintas halaman, hapus sementara dan restore benar.
- [ ] Uji permanen hanya dengan data uji; dialog batal mempertahankan data.
- [ ] PDF/Excel dapat dibuka; chart dan legenda terlihat; arsip tetap sama setelah transaksi diedit.
- [ ] Pada 360/390 px, tidak ada overflow halaman; tabel scroll di dalam card, dialog dan tombol bisa dipakai.
- [ ] Refresh menjaga sidebar; skeleton sesuai komponen; toast error tidak dilaporkan sebagai sukses simpan.
- [ ] Search kosong menyembunyikan footer; sort dan pagination tidak kehilangan data.
- [ ] Timezone lokal, chart custom, dan sisa stock lintas hari konsisten.
- [ ] History kedaluwarsa tidak tampil; cron terakhir dan backup provider diperiksa.

Daftar ini adalah prosedur penerimaan, bukan klaim bahwa seluruh item telah diuji otomatis.

## Troubleshooting

| Gejala | Pemeriksaan |
| --- | --- |
| OAuth redirect mismatch | Cocokkan origin/callback persis, termasuk protokol dan path |
| Login belum aktif | Periksa tiga variabel AUTH dan test user Google |
| Database tidak tersedia | DATABASE_URL, konektivitas, TLS dan migrasi; jangan mencetak connection string |
| Harga belum lengkap | Edit harga/modal pada barang masuk lama yang nullable |
| Stock negatif | Cek stok awal, qty varian, transaksi berlebih atau source di History; jangan menggandakan seluruh sisa stock |
| Nomor mencapai 999 | Counter prefix penuh; tidak ada reset otomatis yang dapat menabrak nota lama |
| Data tidak dapat direstore | Periksa sumber, pemilik, batas 30 hari, atau apakah sudah permanen |
| Gambar gagal | MIME JPG/PNG/WebP, ≤3 MB dan sesi pemilik |
| Deployment lama masih terlihat | Cocokkan SHA, status Ready, production alias, lalu reload browser |
