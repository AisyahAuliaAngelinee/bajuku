# Activity dan sequence

## Input barang dan penjualan

```mermaid
flowchart TD
  Start["Login Google"] --> Stock["Catat barang masuk, varian, harga dan modal"]
  Stock --> Select["Pilih model dan varian transaksi"]
  Select --> Ready{"Harga dan modal lengkap?"}
  Ready -->|Tidak| Alert["Tampilkan Alert; lengkapi barang masuk"]
  Alert --> Stock
  Ready -->|Ya| Invoice["Reservasi dan preview nomor nota"]
  Invoice --> Form["Isi qty, pembayaran dan catatan"]
  Form --> Validate{"Validasi server berhasil?"}
  Validate -->|Tidak| Error["Toast error; perbaiki input"]
  Error --> Form
  Validate -->|Ya| Commit["Simpan transaksi dalam database"]
  Commit --> Result["Hitung ulang stock, total dan profit; toast sukses"]
```

```mermaid
sequenceDiagram
  participant U as Pengguna
  participant UI as Form transaksi
  participant S as Server
  participant DB as PostgreSQL
  U->>UI: Pilih model dan varian
  UI->>S: previewInvoice
  S->>DB: Verifikasi katalog; increment counter atomik
  DB-->>S: Nomor berikutnya
  S-->>UI: Preview dan tanda tangan reservasi
  U->>UI: Simpan
  UI->>S: Input dan bukti reservasi
  S->>S: Verifikasi sesi, schema dan tanda tangan
  S->>DB: Harga terbaru; cek duplikat; INSERT dalam transaksi
  DB-->>S: COMMIT atau ROLLBACK
  S-->>UI: Hasil dan revalidasi
  UI-->>U: Toast; data terbarui
```

## Siklus History

```mermaid
flowchart TD
  Active["Record aktif"] --> Delete["Hapus sementara"]
  Delete --> Hidden["Isi deleted_at; keluarkan dari kalkulasi"]
  Hidden --> History["History selama 30 hari"]
  History --> Choice{"Tindakan"}
  Choice -->|Restore sebelum kedaluwarsa| Restore["Kosongkan deleted_at"]
  Restore --> Active
  Choice -->|Hapus permanen dan konfirmasi| Purge["DELETE source yang terpilih"]
  Choice -->|Lewat 30 hari| Sweep["Cleanup saat read atau jadwal harian"]
  Sweep --> Purge
```

Bulk mutation mengelompokkan ID berdasarkan sumber; server memakai daftar tabel tetap, scope pemilik dan transaksi database. Bila jumlah record yang terkena tidak sesuai pilihan, seluruh operasi rollback. Tidak ada recursive soft-delete atas item History.

## Ekspor dan arsip

```mermaid
flowchart TD
  Filter["Pilih tanggal, search dan sort"] --> Export["Klik Excel atau PDF"]
  Export --> Owner["Server membaca data akun sesuai filter"]
  Owner --> Generate["Buat binary laporan"]
  Generate --> Save["Simpan snapshot di download_history"]
  Save --> Download["Unduh file dan tampilkan toast"]
  Save --> Later["Download History di kemudian hari"]
  Later --> Check["Verifikasi pemilik dan arsip aktif"]
  Check --> Original["Kirim binary asli"]
```

Excel memiliki tabel transaksi berborder serta sheet Grafik dengan line/bar chart dan legenda. PDF memiliki tabel berborder. Mengubah transaksi berikutnya tidak mengubah arsip lama.

## Auth, waktu dan refresh

Login beralih ke Google; toast berhasil baru ditampilkan di callback tujuan ketika sesi tersedia. Logout menjalankan signOut lalu menuju login; toast berhasil membutuhkan sesi tidak aktif. Error autentikasi menuju login. Penanda feedback pada URL dibersihkan setelah diproses.

Zona waktu perangkat menentukan tanggal lokal dan tampilan timestamp. `sale_date`/`movement_date` adalah tanggal bisnis, sedangkan `created_at`/`deleted_at` adalah timestamp. Reload memakai skeleton pada area data, bukan menghapus workspace shell/sidebar. Toast refresh bersifat feedback pemuatan, bukan bukti audit database.
