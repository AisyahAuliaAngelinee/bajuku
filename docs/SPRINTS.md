# Rekap Sprint 1 dan seluruh iterasi

Dokumen ini merangkum permintaan selama pengembangan Baju Thieo / Bantu Kawan sampai 10 November 2026. Semua tahap di bawah merupakan iterasi Sprint 1. Permintaan paling baru menjadi acuan bila mengubah keputusan sebelumnya.

| ID | Permintaan | Hasil akhir dan lokasi |
| --- | --- | --- |
| S01 | Fix bleeding mobile dan sesuaikan semua tombol | Layout menyusut, scroll horizontal dibatasi kontainer tabel; tombol/form mobile disesuaikan (`app/globals.css`) |
| S02 | Tombol lipat menu di sebelah logo, ikon saja | Sidebar desktop dan drawer mobile (`app/ui/sidebar.tsx`) |
| S03 | Komponen AnimateUI | Button, dialog, alert dialog, select, checkbox, toggle group, toast dan animasi memakai primitive resmi; tabel/input tetap semantik, chart Recharts |
| S04 | Push GitHub, deploy Vercel, Google login dan database | Auth.js Google, PostgreSQL, deploy `main`; data dipisahkan berdasarkan pemilik |
| S05 | Hapus jenis pergerakan saat input | Form hanya mencatat barang masuk; barang keluar dihitung dari transaksi |
| S06 | Barang masuk di awal di bawah grafik | Urutan dashboard: grafik → persediaan → ringkasan/transaksi |
| S07 | Stock tergantung barang yang ditransaksikan | Agregasi model/varian aktif; edit/delete/restore memengaruhi saldo |
| S08 | Empty state riwayat di tengah | Empty state terpusat; teks mengikuti halaman History saat ini |
| S09 | Edit/delete seluruh fitur | Transaksi dan catatan barang masuk dapat diedit/dihapus; arsip unduhan immutable, History restore/delete permanen, bukan edit |
| S10 | Hapus filter semua pergerakan | Tidak ada filter arah di persediaan; History memakai filter jenis data |
| S11 | Saldo negatif dan rekonsiliasi | Kekurangan muncul jika penjualan melebihi catatan masuk; koreksi catatan awal, bukan otomatis membuat stok palsu |
| S12 | Produk/nota tergencet pada mobile | Lebar minimum kolom produk/nota, scroll tabel; ukuran/warna berupa badge |
| S13 | Foto profil dari Google | Foto sesi Google dengan fallback inisial |
| S14 | Toggle group grafik pada mobile | Toggle AnimateUI untuk Hari/Bulan/Tahun/Custom tanggal; opsi Minggu dihapus |
| S15 | Model, ukuran, warna dari barang masuk | Katalog berasal dari catatan barang masuk aktif; dipilih pada transaksi baru |
| S16 | Nota kode model-ukuran-warna-3 angka + preview default | Reservasi nomor 001–999 per prefix dan pemilik; preview otomatis; nota lama dipertahankan; pembatalan dapat menyisakan celah nomor |
| S17 | Sort pada tiap tabel/kolom | Kolom data dapat diurutkan; aksi dan checkbox tidak sortable. Default input terbaru; pencarian/filter terpisah dari sort |
| S18 | Riwayat pergerakan terpisah | Route `/transaction-history`; kemudian berevolusi menjadi History data terhapus |
| S19 | Sejajarkan ikon + teks Catat transaksi | Tombol menggunakan tata letak inline flex; toolbar transaksi |
| S20 | Hapus pilih tanggal dan minggu grafik | Filter Minggu dihapus; pilihan akhir Hari/Bulan/Tahun/Custom tanggal. Rentang tanggal manual tetap tersedia dalam Custom |
| S21 | Loading tabel lalu skeleton semua kartu | Skeleton untuk tabel, chart, info; workspace/sidebar tetap tampil saat fetch/refresh |
| S22 | Riwayat hanya delete, hapus setelah 30 hari | Keputusan akhir: restore dan hapus permanen terpilih; otomatis kedaluwarsa setelah 30 hari |
| S23 | Saldo stock → total stock; saldo pcs → stock pcs | Label akhir Total stock / TOTAL STOCK (PCS) |
| S24 | Detail transaksi popup; ringkas kolom | Kode nota, produk, tanggal, qty, harga/pcs, harga total, pembayaran, aksi; modal/catatan/gambar di dialog |
| S25 | Excel/PDF di kiri search; Catat transaksi hanya di bagian transaksi | Ketiganya di toolbar transaksi; Muat ulang di heading atas |
| S26 | Download History dan unduh ulang | Arsip menyimpan binary asli yang independen dari edit transaksi berikutnya |
| S27 | Harga jual otomatis; jumlah mengalikan harga; hapus input modal | Harga per pcs tetap, total meningkat sesuai qty; modal disimpan untuk perhitungan namun tidak diinput ulang pada transaksi |
| S28 | Ringkasan bawah dialog hanya total penjualan | Preview total qty × harga; form barang masuk punya harga dan modal/pcs |
| S29 | Barang keluar merah, total stock indikator | Merah dipertegas; total stock tanpa minus di kartu dengan ikon hijau/netral/merah berdasarkan tanda saldo |
| S30 | Sisa stock terbawa hari selanjutnya | Saldo dihitung kumulatif; tidak menggandakan baris barang masuk |
| S31 | Card laba bersih/profit | Card Profit tersedia dengan keterangan belum termasuk biaya operasional; tidak mengklaim laba bersih penuh |
| S32 | Hapus kolom laba kotor; penjualan → harga total | Kolom utama tidak memuat laba kotor; label harga total |
| S33 | Upload gambar opsional barang masuk | JPG/PNG/WebP ≤3 MB, produksi; gambar transaksi juga didukung |
| S34 | Zona waktu sesuai user | Browser menentukan zona waktu; tanggal bisnis dan timestamp dibedakan |
| S35 | Reposisi menu sidebar | Ringkasan, barang masuk/keluar, transaksi, History, Download History |
| S36 | Sapaan waktu + nama + 🫰🏻, judul/subjudul, Baju Thieo | Sapaan lokal; “Penjualan, lebih tertata.” menjadi subjudul |
| S37 | Grouping produk dengan varian/size | Grup produk otomatis berdasarkan nama yang dinormalisasi; varian tetap terpisah |
| S38 | Pagination 5/15/25/50; body scroll >5 baris | Komponen tabel bersama; header tetap terlihat; grup dihitung sebagai unit produk |
| S39 | Border PDF/Excel; line/bar chart dan legend | Tabel berborder; sheet Grafik berisi chart Excel native beserta legenda |
| S40 | Tabel stock hanya saldo akhir; keluar merah | Saldo akhir per varian/grup, bukan daftar saldo setiap kejadian |
| S41 | History menyimpan semua data yang dihapus | Sale, stock, download; data lama yang sudah dihapus permanen sebelum fitur ini tidak dapat direkonstruksi |
| S42 | Checkbox setiap tabel + floating delete sementara | Pilih baris/halaman; grup stock memilih catatan barang masuk; transaksi dipilih terpisah |
| S43 | Search History + filter jenis + restore | Semua jenis/Transaksi harian/Barang masuk/Unduhan; restore data asli |
| S44 | Checkbox History, floating restore/delete permanen | Aksi massal, konfirmasi permanen; validasi pemilik dan rollback bila pilihan stale |
| S45 | Search bar konsisten, jangan terlalu lebar | Lebar desktop diseragamkan dengan transaksi; mobile mengikuti ruang tersedia |
| S46 | Alert harga memakai shadcn | Komposisi Alert/Title/Description, ditata dengan CSS aplikasi |
| S47 | Catatan semua dialog textarea selebar dialog | Textarea transaksi dan barang masuk, maksimal 500 karakter |
| S48 | Grup collapsible dan level 1 dapat diedit | Chevron buka/lipat; Edit grup membuka catatan semua variannya untuk memilih data sumber yang diedit, bukan menimpa agregat |
| S49 | Footer hilang saat tabel kosong | Pagination/footer transaksi disembunyikan saat hasil kosong, termasuk hasil pencarian kosong |
| S50 | Toast seluruh aktivitas, AnimateUI Base UI Toast | Feedback login/logout, simpan/edit/delete, restore/permanen, download, refresh dan error; bukan audit aktivitas persisten |
| S51 | README tujuan Bantu Kawan + use case/activity/database/dll | README dan direktori `docs/`; dokumentasi mengikuti perilaku kode saat ini |

## Keputusan yang menggantikan rancangan lama

- History awalnya audit create/update/delete. Migrasi 007 menghentikan trigger lama; History sekarang menampilkan sumber yang soft-delete dan dapat dipulihkan.
- Permintaan edit/delete semua fitur dibatasi oleh sifat data: agregat dibuka ke catatan asal, file arsip tidak diedit, History tidak diedit.
- “Naik/turun” pada kartu stock saat ini menunjukkan positif/negatif terhadap nol, bukan perubahan terhadap periode pembanding.
- “Profit” bukan perhitungan biaya operasional; biaya tersebut belum memiliki modul pencatatan.
- Sorting berlaku pada kolom data, bukan menu filter unik pada setiap header. Filter produk/nota/varian memakai search; History memiliki filter jenis.

## Verifikasi dan batas

Build produksi dan TypeScript telah lulus pada rilis kode terakhir. Suite menguji rumus, validasi, stock/varian, waktu, nota, grouping, ekspor dan kontrak soft-delete/restore/permanen. Mock SQL bukan pengujian integrasi PostgreSQL nyata. Verifikasi OAuth, isolasi dua akun, UI mobile, dan alur browser lengkap mengikuti checklist operasional; tidak semuanya diulang pada setiap perubahan dokumentasi.
