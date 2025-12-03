# 📋 Cara Pakai Script Ekspor Data User

## 🎯 Ini Apa?
Ada 2 script untuk mengambil data user dari database Gamatutor:

1. **Aktivitas Kartu User** - Data kartu dan riwayat perpindahan
2. **Login/Logout User** - Data timestamp login dan logout

## 🚀 Cara Pakai (Pilih Salah Satu)

### 1. Untuk Data Aktivitas Kartu:
```bash
cd py
python3 export_aktivitas_kartu_user.py
```

### 2. Untuk Data Login/Logout:
```bash
cd py
python3 export_login_logout.py
```

## 📁 Hasilnya Apa?

### 1. File Aktivitas Kartu: `AKTIVITAS_KARTU_USER_[tanggal].csv`
### 2. File Login/Logout: `LOGIN_LOGOUT_USER_[tanggal].csv`

## 📊 Isi File CSV

| Kolom | Isinya | Contoh |
|-------|--------|--------|
| Username | Username user | 7aurencia |
| Nama Lengkap | Nama lengkap user | Laurencia Zaharani |
| Email | Email user | laurencia@mail.ugm.ac.id |
| Judul Kartu | Judul lengkap tugas | Fisika Fluida [TKU211122] |
| Mata Kuliah | Nama mata kuliah | Fisika Fluida |
| Status Saat Ini | Posisi kartu sekarang | Monitoring (In Progress) |
| Difficulty | Level kesulitan | easy |
| Learning Strategy | Strategi belajar | Rehearsal Strategies |
| Pre-Test Grade | Nilai pre-test | 80 |
| Post-Test Grade | Nilai post-test | 85 |
| Rating | Rating 1-5 bintang | 4 |
| Jumlah Perpindahan | Berapa kali dipindah | 3 |
| **Riwayat Perpindahan** | **Catatan perpindahan kartu** | **25/08 14:09: Awal → Planning \| 06/09 14:35: Planning → Monitoring** |
| Tanggal Dibuat | Tanggal pembuatan kartu | 2025-08-25 |

## 🔍 Contoh Data

```
Username    | Judul Kartu                      | Status Saat Ini        | Riwayat Perpindahan
7aurencia   | Fisika Fluida [TKU211122]       | Monitoring (In Progress)| 25/08 14:09: Awal → Planning | 06/09 14:35: Planning → Monitoring
Kayyisa     | Kalkulus [TKU211101]             | Reflection (Done)      | 20/08 10:00: Awal → Planning | 25/08 15:30: Planning → Monitoring | 30/08 09:15: Monitoring → Reflection
```

## 📈 Statistik yang Muncul

Script akan menampilkan:
- Total user yang aktif
- Total kartu yang dibuat
- Total mata kuliah
- Kartu yang sudah selesai
- 5 user dengan kartu terbanyak
- Distribusi status kartu

## ⚙️ Kustomisasi Tanggal?

Kalau mau ubah periode tanggal, edit file `export_aktivitas_kartu_user.py`:

```python
# Ubah bagian ini
START_DATE = utc.localize(datetime(2025, 8, 19))  # Tanggal mulai
END_DATE = utc.localize(datetime(2025, 11, 19, 23, 59, 59))  # Tanggal akhir
```

## 💡 Tips Analisis

1. **Buka di Excel**: File CSV bisa langsung dibuka di Excel
2. **Filter by Username**: Lihat semua kartu 1 user
3. **Sort by Jumlah Perpindahan**: Lihat kartu yang paling sering dipindah
4. **Filter Status = Reflection (Done)**: Lihat kartu yang sudah selesai

## 🎯 Yang Kamu Dapat

✅ **Data lengkap per user**: Username, nama, email  
✅ **Info kartu detail**: Judul, mata kuliah, status, difficulty  
✅ **Riwayat perpindahan**: Bisa lihat kapan dan ke mana kartu dipindah  
✅ **Sorting otomatis**: Sudah diurut per user untuk kemudahan analisis  
✅ **Periode yang diminta**: 19 Agustus - 19 November 2025  

---

## 📊 Script Login/Logout - Apa Isinya?

| Kolom | Isinya | Contoh |
|-------|--------|--------|
| Username | Username user | 7aurencia |
| Aksi | Login atau Logout | login |
| **Waktu (WIB)** | **Timestamp dalam WIB** | **2025-08-25 14:06:51** |
| Tanggal | Tanggal saja | 2025-08-25 |
| Jam | Jam saja | 14:06:51 |
| Hari | Hari dalam seminggu | Monday |
| Deskripsi | Keterangan login/logout | 7aurencia logged in to the application |

### Statistik yang Ditampilkan:
- Total user yang login/logout
- Top 10 user dengan login terbanyak
- Distribusi login per hari dan per jam
- User paling pagi dan paling malam login

---

**Selesai! Pilih script yang kamu butuhkan dan jalankan dengan 1 command.**