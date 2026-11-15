# Uang diterima dan rincian transaksi

Form Catat transaksi baru dan Edit transaksi memisahkan harga jual barang dari uang yang diterima. Isi uang bersih yang disimpan setelah kembalian, jika ada. Nominal kelebihan yang tetap disimpan dicatat sebagai kelebihan tanpa kembalian.

| Total belanja | Uang diterima | Sisa utang | Kelebihan | Status |
| --- | --- | --- | --- | --- |
| Rp100.000 | Rp0 | Rp100.000 | Rp0 | Belum dibayar |
| Rp100.000 | Rp60.000 | Rp40.000 | Rp0 | Dibayar sebagian |
| Rp100.000 | Rp100.000 | Rp0 | Rp0 | Lunas |
| Rp100.000 | Rp110.000 | Rp0 | Rp10.000 | Lunas + kelebihan |

Kartu rincian menampilkan produk/varian, jumlah × harga per pcs, total belanja, uang diterima, sisa utang, kelebihan tanpa kembalian, dan status pembayaran. Jumlah uang diterima tidak mengubah harga jual, jumlah barang keluar, total penjualan, atau profit barang. Kelebihan disimpan sebagai rincian terpisah; profit barang tetap harga jual dikurangi modal, bukan arus kas.

Default transaksi baru mengikuti total belanja, kecuali pilihan Utang yang mulai dari 0. Setelah pengguna mengisi nominal secara manual, perubahan jumlah atau harga tidak menimpa uang yang telah diisi. Edit transaksi memakai nominal tersimpan. Untuk pelunasan, ubah Uang diterima menjadi jumlah kumulatif pembayaran; ini belum merupakan buku cicilan dengan tanggal pembayaran terpisah.

## Penyimpanan dan kompatibilitas

`transactions.amount_received` adalah bigint nullable, bilangan bulat nonnegatif hingga 100.000.000.000.000. Migrasi `008_transaction_receipts.sql` bersifat idempoten dan juga dijalankan oleh bootstrap skema sebelum pembacaan/penyimpanan transaksi. Tidak ada data lama yang ditimpa.

Data lama tanpa nominal menggunakan aturan kompatibilitas: pembayaran Utang diasumsikan belum dibayar (0); metode lainnya diasumsikan lunas sebesar total harga. Jika data lama memiliki pembayaran sebagian, koreksi melalui Edit transaksi. Hapus sementara dan restore mempertahankan nominal pada catatan sumber.

Rincian dapat dilihat kembali melalui Detail transaksi, sheet Pembayaran pada unduhan Excel baru, dan kolom Pembayaran PDF baru. Arsip unduhan lama tetap menyimpan format saat dibuat.

## Validasi

`tests/payment.test.ts` memeriksa perhitungan, batas nominal, kompatibilitas data lama, total stok seluruh hari, dan ekspor. `tests/payment-db.test.ts` memeriksa penyimpanan/readback melalui mock database, scope pemilik, dan kesamaan migrasi runtime dengan berkas SQL. Pengujian database tidak menggantikan pemeriksaan koneksi database produksi.
