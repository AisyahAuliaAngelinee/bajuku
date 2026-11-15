# Persediaan harian

Barang Masuk (`#inventory`) dan Barang Keluar (`#outgoing`) memiliki menu, tabel, pencarian, pagination, dan filter tanggal masing-masing. Tanggal awal mengikuti hari lokal perangkat pengguna.

## Perhitungan per produk dan varian

- Stok awal = semua barang masuk sebelum tanggal terpilih − semua penjualan sebelum tanggal terpilih.
- Masuk hari ini = barang masuk baru tepat pada tanggal terpilih.
- Tersedia = stok awal + masuk hari ini.
- Total stock = tersedia − penjualan pada tanggal terpilih.
- Barang Keluar hanya berisi transaksi pada tanggal terpilih, diurutkan dari input terbaru.

Contoh: 10 pcs masuk dan 3 pcs terjual kemarin menghasilkan stok awal 7 pcs. Tambahan 5 pcs hari ini menghasilkan tersedia 12 pcs. Jika 2 pcs terjual hari ini, sisa 10 pcs menjadi stok awal besok. Barang keluar besok tetap kosong sampai ada transaksi baru.

Stok bawaan tidak disimpan sebagai catatan baru, sehingga tidak terjadi penggandaan stok. Hari tanpa aktivitas tetap membawa saldo akhir sebelumnya. Catatan masa depan tidak ikut dihitung. Kekurangan stok tetap dibawa sebagai saldo negatif agar dapat direkonsiliasi.

Checkbox Barang Masuk hanya memilih catatan masuk baru pada tanggal terpilih. Stok bawaan dapat dikoreksi melalui kelola catatan sumber. Checkbox Barang Keluar memilih transaksi penjualan sumbernya; hapus/restore memengaruhi transaksi dan stok terkait. Semua perubahan sumber menghitung ulang saldo harian secara otomatis. Tidak diperlukan migrasi database.

## Validasi

`tests/daily-inventory.test.ts` memeriksa bawaan stok, penambahan baru, pengeluaran harian, tanggal tanpa aktivitas, tanggal masa depan, pemisahan varian, koreksi setelah hapus/restore, dan urutan input terbaru.
