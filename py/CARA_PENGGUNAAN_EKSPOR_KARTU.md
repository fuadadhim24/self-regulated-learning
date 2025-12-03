# Cara Penggunaan Script Ekspor Data Aktivitas Kartu

## 📋 Overview

Script ini telah berhasil dibuat untuk mengekspor data aktivitas kartu dari masing-masing user di database Gamatutor, termasuk riwayat perpindahan kartu dari tanggal 19 Agustus - 19 November 2025.

## 📁 File yang Dihasilkan

### 1. **export_card_activities_[timestamp].csv**
Data lengkap semua kartu user:
- Informasi user (username, nama, email)
- Detail kartu (judul, deskripsi, mata kuliah)
- Status saat ini (list/kolom)
- Difficulty, learning strategy, grades
- Checklist, links, notes
- Total movements per kartu

### 2. **export_card_movements_[timestamp].csv**
Riwayat perpindahan kartu detail:
- Setiap perpindahan kartu antar kolom
- Timestamp perpindahan
- Dari kolom mana ke kolom mana
- Hari dan waktu perpindahan
- Informasi user dan kartu

### 3. **export_user_summary_[timestamp].csv**
Ringkasan per user:
- Total kartu dan perpindahan
- Completion rate (kartu yang selesai)
- Rata-rata difficulty dan rating
- Jumlah mata kuliah
- Total grades

## 🚀 Cara Menjalankan Script

### Opsi 1: Script Standar
```bash
cd py
python3 export_card_activities.py
```

### Opsi 2: Script Lengkap dengan Summary
```bash
cd py
python3 export_card_activities_custom_date.py
```

### Opsi 3: Semua Script Sekaligus
```bash
cd py
python3 export_all_kanban_data.py
```

## 📊 Statistik yang Didapat ( dari data terakhir)

### Data Keseluruhan:
- **Total User**: 97 user
- **Total Kartu**: 555 kartu
- **Total Perpindahan**: 1,561 perpindahan
- **Mata Kuliah**: 28 mata kuliah berbeda

### Distribusi Kartu:
- Reflection (Done): 209 kartu (37.7%)
- Planning (To Do): 138 kartu (24.9%)
- Controlling (Review): 117 kartu (21.1%)
- Monitoring (In Progress): 91 kartu (16.4%)

### Top User:
1. **Kayyisa**: 55 kartu, 147 perpindahan
2. **Farida**: 47 kartu, 124 perpindahan
3. **kareemaedna**: 30 kartu, 108 perpindahan

### Hari Paling Aktif:
- **Senin**: Hari dengan perpindahan terbanyak
- **25 Agustus 2025**: Hari paling aktif (69 perpindahan)

## 🔧 Kustomisasi Tanggal

Untuk mengubah rentang tanggal, edit file `export_card_activities_custom_date.py`:

```python
# Ubah bagian ini
START_DATE = utc.localize(datetime(2025, 8, 19))  # Tanggal mulai
END_DATE = utc.localize(datetime(2025, 11, 19, 23, 59, 59))  # Tanggal akhir
```

## 📈 Tips Analisis Data

1. **Sorting di Excel**: Gunakan fitur Sort & Filter untuk menganalisis per user atau per mata kuliah
2. **Pivot Table**: Buat pivot table untuk melihat pola perpindahan kartu
3. **Visualisasi**: Gunakan chart untuk melihat distribusi difficulty dan completion rate
4. **Filter Tanggal**: Filter berdasarkan movement_date untuk analisis harian/mingguan

## 🎯 Kolom Penting untuk Analisis

### Untuk Tracking User:
- `username`, `first_name`, `last_name`, `email`
- `total_cards`, `total_movements`, `completion_rate`

### Untuk Analisis Kartu:
- `card_title`, `course_name`, `current_list`
- `difficulty`, `learning_strategy`, `rating`

### Untuk Tracking Perpindahan:
- `movement_date`, `from_column_name`, `to_column_name`
- `day_of_week`, `is_to_reflection`

## ⚠️ Catatan Penting

- Data yang diekspor hanya kartu yang tidak diarsipkan dan tidak dihapus
- Rentang tanggal aktual: 19 Agustus - 19 November 2025
- Semua timestamp dalam format UTC
- File CSV bisa dibuka di Excel, Google Sheets, atau spreadsheet lainnya

## 🆘 Troubleshooting

Jika ada error:
1. Pastikan semua library terinstall: `pip3 install pymongo pandas python-dotenv pytz`
2. Cek koneksi internet dan database
3. Pastikan file .env sudah terkonfigurasi dengan benar

---

**Script berhasil dibuat dan diuji pada 25 November 2025**
**Total data yang berhasil diekspor: 555 kartu dari 97 user dengan 1,561 perpindahan**