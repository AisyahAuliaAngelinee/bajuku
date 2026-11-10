# Baju Thieo — Bantu Kawan

**Web Bantu Kawan dalam penginputan data** persediaan dan transaksi penjualan baju. Baju Thieo membantu kawan mencatat barang masuk, penjualan harian, harga dan modal, memantau stock, serta menyimpan laporan yang dapat diunduh kembali.

**Aplikasi:** https://bajuku-swart.vercel.app/ · **Demo:** https://bajuku-swart.vercel.app/demo

## Status sprint

Sprint 1 beserta seluruh iterasi permintaan sampai 10 November 2026 telah diimplementasikan dan dipublikasikan. Tahap berikut merupakan pengelompokan pekerjaan dalam Sprint 1, bukan nomor sprint baru. Catatan perubahan lengkap, revisi yang menggantikan permintaan lama, dan batas implementasi tersedia di [rekap sprint](docs/SPRINTS.md).

| Tahap | Lingkup yang diselesaikan |
| --- | --- |
| 1. Fondasi dan mobile | Perbaikan bleeding/overflow, ukuran tombol mobile, menu ikon di sebelah logo, AnimateUI, GitHub dan Vercel, login Google dan database |
| 2. Persediaan | Barang masuk di bawah grafik; barang keluar dari transaksi; stock kumulatif lintas hari; harga/modal per pcs; gambar opsional; edit/delete catatan |
| 3. Transaksi | Model dan varian dari barang masuk; harga otomatis; qty × harga; preview nota otomatis; detail dialog; badge varian; kolom ringkas; sort terbaru |
| 4. Navigasi dan identitas | Baju Thieo, sapaan waktu lokal dan nama, subjudul, foto Google, sidebar mengikuti urutan fitur, timezone perangkat |
| 5. Tabel dan grafik | Sort kolom data, pagination 5/15/25/50, scroll body setelah 5 baris, grouping lipat/edit, search konsisten, toggle periode grafik |
| 6. Laporan | PDF/Excel dengan border, sheet Grafik dengan line/bar chart dan legenda, Download History dengan unduh ulang |
| 7. History | Hapus sementara, checkbox dan floating menu, filter jenis, restore, hapus permanen terpilih, retensi 30 hari |
| 8. Pengalaman penggunaan | Skeleton per kartu/tabel/grafik tanpa menghilangkan sidebar, Alert harga, textarea catatan, indikator stock berwarna, footer kosong disembunyikan, toast global AnimateUI |

## Cara menggunakan

1. Login dengan Google, lalu **Catat barang masuk**: produk, varian ukuran/warna, jumlah, harga jual, modal, serta catatan/gambar opsional.
2. Di **Transaksi harian**, pilih **Catat transaksi**. Model dan varian berasal dari barang masuk; harga terisi otomatis. Periksa preview nota dan total, lalu simpan.
3. Barang keluar dan total stock dihitung ulang. Sisa stock tetap tersedia pada hari berikutnya tanpa input ulang.
4. Gunakan detail/edit, pencarian, sort, pagination, dan grup produk untuk mengelola catatan.
5. Ekspor Excel/PDF dari transaksi yang difilter. File asli tersedia di **Download History**.
6. Hapus sementara untuk memindahkan data ke **History**. Restore tersedia selama 30 hari; hapus permanen memerlukan konfirmasi dalam aplikasi.

## Perilaku penting

- **Total stock = barang masuk aktif − jumlah transaksi aktif**, kumulatif sampai tanggal lokal hari ini. Stock negatif masih dimungkinkan; peringatan meminta rekonsiliasi.
- Kartu total stock memakai angka absolut dan ikon: positif hijau, nol netral, negatif merah. Ini menunjukkan tanda saldo saat ini, bukan persentase perubahan terhadap hari sebelumnya. Tabel tetap menampilkan saldo akhir bertanda.
- **Harga total = qty × harga jual/pcs**. Harga/modal transaksi baru diturunkan kembali di server dari input barang masuk terbaru untuk varian tersebut.
- **Profit = penjualan − modal barang terjual**. Belum dikurangi ongkir, biaya admin, dan operasional; bukan laba bersih akuntansi penuh.
- History saat ini adalah tempat data yang dihapus sementara, **bukan audit log semua aktivitas**. Arsip download aktif tidak kedaluwarsa; arsip yang dihapus mengikuti retensi History.
- Demo: transaksi/stock/History memakai `sessionStorage`; arsip file memakai IndexedDB. Reload dalam sesi yang sama mempertahankan data demo. Demo tidak menulis ke database produksi.
- UI memakai primitive AnimateUI; Alert mengikuti komposisi shadcn. Input dan tabel memakai HTML semantik, grafik menggunakan Recharts.

## Dokumentasi

| Dokumen | Isi |
| --- | --- |
| [Rekap seluruh sprint/permintaan](docs/SPRINTS.md) | Pemetaan permintaan, hasil akhir, perubahan keputusan |
| [Use case](docs/USE_CASES.md) | Aktor, tujuan, prasyarat, skenario dan kegagalan |
| [Activity dan sequence](docs/ACTIVITY.md) | Alur penginputan, transaksi, History, ekspor, autentikasi |
| [Database dan ERD](docs/DATABASE.md) | Tabel, relasi aktual, kamus data, migrasi dan retensi |
| [Arsitektur dan kontrak](docs/ARCHITECTURE.md) | Komponen, route, server actions, isolasi akun dan rumus |
| [Operasional dan pengujian](docs/OPERATIONS.md) | Setup, OAuth, deploy, verifikasi dan troubleshooting |

Diagram Mermaid dapat dibaca langsung di GitHub.

## Teknologi

Next.js App Router · React · TypeScript · Auth.js + Google OAuth · PostgreSQL (`pg`) · AnimateUI + Base UI/Radix · Motion · Recharts · ExcelJS + JSZip · jsPDF + AutoTable · Vercel.

## Jalankan lokal

Gunakan Node.js 22.13+ yang kompatibel dengan versi dependency terkunci.

```sh
npm ci
cp .env.example .env.local
# Isi environment sesuai docs/OPERATIONS.md
npm run db:migrate
npm run dev
```

Buka `http://localhost:3000`; `/demo` dapat dipakai tanpa credential Google/database. Jangan commit `.env.local` atau secret.

```sh
node --import tsx --test tests/*.test.ts
npm run typecheck
npm run build -- --webpack
```

## Publikasi

Repository: [AisyahAuliaAngelinee/bajuku](https://github.com/AisyahAuliaAngelinee/bajuku). Push ke `main` memicu deployment Vercel; pastikan status deployment sukses. Konfigurasi environment, migrasi, OAuth callback, dan pemeriksaan pascadeploy dijelaskan di [operasional](docs/OPERATIONS.md).
