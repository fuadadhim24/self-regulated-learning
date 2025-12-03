# Dokumentasi Ekspor Data Kanban SRL

## Overview

Folder ini berisi script-script untuk mengekspor data dari sistem Kanban Self-Regulated Learning (SRL) ke format CSV. Script-script ini mengambil data langsung dari MongoDB database.

## Daftar File Ekspor

### 1. export_users.py
- **Deskripsi**: Mengekspor data user (mahasiswa)
- **Output**: `export_users_[timestamp].csv`
- **Kolom yang diekspor**:
  - `_id`: ID user
  - `username`: Username user
  - `first_name`: Nama depan
  - `last_name`: Nama belakang
  - `email`: Email user
  - `role`: Role user
  - `created_at`: Tanggal pembuatan akun

### 2. export_student_grades.py
- **Deskripsi**: Mengekspor nilai mahasiswa (setelah post test)
- **Output**: `export_student_grades_[timestamp].csv`
- **Kolom yang diekspor**:
  - `user_id`: ID user
  - `username`: Username mahasiswa
  - `first_name`: Nama depan
  - `last_name`: Nama belakang
  - `email`: Email mahasiswa
  - `card_id`: ID card/tugas
  - `card_title`: Judul lengkap tugas
  - `course_name`: Nama mata kuliah
  - `list_name`: Status tugas (Planning, Monitoring, Controlling, Reflection)
  - `pre_test_grade`: Nilai pre-test
  - `post_test_grade`: Nilai post-test
  - `learning_strategy`: Strategi belajar yang digunakan

### 3. export_difficulty_ratings.py
- **Deskripsi**: Mengekspor bobot penilaian mahasiswa terhadap mata kuliah (difficulty)
- **Output**: `export_difficulty_ratings_[timestamp].csv`
- **Kolom yang diekspor**:
  - `user_id`: ID user
  - `username`: Username mahasiswa
  - `first_name`: Nama depan
  - `last_name`: Nama belakang
  - `email`: Email mahasiswa
  - `card_id`: ID card/tugas
  - `card_title`: Judul lengkap tugas
  - `course_name`: Nama mata kuliah
  - `list_name`: Status tugas
  - `difficulty_level`: Level difficulty (easy/medium/hard)
  - `difficulty_value`: Nilai numerik difficulty (1/2/3)
  - `learning_strategy`: Strategi belajar yang digunakan

### 4. export_course_ratings.py
- **Deskripsi**: Mengekspor rating mahasiswa terhadap mata kuliah (1-5 bintang)
- **Output**: `export_course_ratings_[timestamp].csv`
- **Kolom yang diekspor**:
  - `user_id`: ID user
  - `username`: Username mahasiswa
  - `first_name`: Nama depan
  - `last_name`: Nama belakang
  - `email`: Email mahasiswa
  - `card_id`: ID card/tugas
  - `card_title`: Judul lengkap tugas
  - `course_name`: Nama mata kuliah
  - `list_name`: Status tugas
  - `rating`: Rating (1-5)
  - `learning_strategy`: Strategi belajar yang digunakan
  - `difficulty`: Level difficulty

### 5. export_card_activities.py
- **Deskripsi**: Mengekspor data aktivitas kartu dan riwayat perpindahan kartu dari masing-masing user
- **Output**: `export_card_activities_[timestamp].csv` dan `export_card_movements_[timestamp].csv`
- **Kolom yang diekspor (Card Activities)**:
  - `user_id`: ID user
  - `username`: Username user
  - `first_name`: Nama depan
  - `last_name`: Nama belakang
  - `email`: Email user
  - `card_id`: ID card/tugas
  - `card_title`: Judul lengkap tugas
  - `card_subtitle`: Subtitle tugas
  - `card_description`: Deskripsi tugas
  - `course_name`: Nama mata kuliah
  - `current_list`: List/kolom saat ini
  - `current_list_id`: ID list/kolom saat ini
  - `difficulty`: Level difficulty (easy/medium/hard)
  - `priority`: Prioritas tugas
  - `learning_strategy`: Strategi belajar yang digunakan
  - `pre_test_grade`: Nilai pre-test
  - `post_test_grade`: Nilai post-test
  - `rating`: Rating (1-5)
  - `notes`: Catatan/refleksi
  - `created_at`: Tanggal pembuatan kartu
  - `total_movements`: Jumlah total perpindahan kartu
  - `has_checklist`: Apakah memiliki checklist
  - `checklist_count`: Jumlah checklist
  - `has_links`: Apakah memiliki links
  - `links_count`: Jumlah links
  - `completed_checklist_items`: Jumlah checklist yang completed
- **Kolom yang diekspor (Card Movements)**:
  - `user_id`: ID user
  - `username`: Username user
  - `first_name`: Nama depan
  - `last_name`: Nama belakang
  - `email`: Email user
  - `card_id`: ID card/tugas
  - `card_title`: Judul lengkap tugas
  - `course_name`: Nama mata kuliah
  - `movement_number`: Nomor urut perpindahan
  - `from_column`: ID kolom asal
  - `from_column_name`: Nama kolom asal
  - `to_column`: ID kolom tujuan
  - `to_column_name`: Nama kolom tujuan
  - `movement_timestamp`: Timestamp perpindahan (ISO format)
  - `movement_date`: Tanggal perpindahan (format YYYY-MM-DD HH:MM:SS)
  - `is_initial_movement`: Apakah perpindahan awal (dari "initial")
  - `is_to_reflection`: Apakah perpindahan ke kolom Reflection (Done)

### 6. export_all_kanban_data.py
- **Deskripsi**: Script utama yang menjalankan semua script ekspor sekaligus
- **Output**: Menjalankan kelima script di atas dan menghasilkan 6 file CSV

## Cara Penggunaan

### Persyaratan
- Python 3.x
- Library yang dibutuhkan (terinstall di requirements.txt):
  - pandas
  - pymongo
  - python-dotenv
  - pytz

### Menjalankan Script Individual

Untuk menjalankan masing-masing script secara individual:

```bash
cd py
python export_users.py
python export_student_grades.py
python export_difficulty_ratings.py
python export_course_ratings.py
python export_card_activities.py
```

### Menjalankan Semua Script Sekaligus

Untuk menjalankan semua script ekspor sekaligus:

```bash
cd py
python export_all_kanban_data.py
```

## Konfigurasi

Pastikan file `.env` di folder `py` sudah dikonfigurasi dengan benar:

```
MONGO_URI="mongodb+srv://username:password@cluster.mongodb.net/database_name"
MONGO_DB="database_name"
MONGO_COLLECTION="logs"
JWT_SECRET_KEY="your_secret_key"
```

## Output

Setiap script akan menghasilkan file CSV dengan format nama:
- `export_users_[YYYYMMDD_HHMMSS].csv`
- `export_student_grades_[YYYYMMDD_HHMMSS].csv`
- `export_difficulty_ratings_[YYYYMMDD_HHMMSS].csv`
- `export_course_ratings_[YYYYMMDD_HHMMSS].csv`
- `export_card_activities_[YYYYMMDD_HHMMSS].csv`
- `export_card_movements_[YYYYMMDD_HHMMSS].csv`

Timestamp pada nama file menunjukkan waktu pembuatan file.

## Statistik yang Ditampilkan

Setiap script akan menampilkan statistik ringkas di terminal:
1. **export_users.py**: Jumlah total user
2. **export_student_grades.py**: 
   - Total data nilai
   - Jumlah mahasiswa
   - Jumlah mata kuliah
   - Rata-rata nilai per mata kuliah
3. **export_difficulty_ratings.py**:
   - Total data difficulty
   - Jumlah mahasiswa
   - Jumlah mata kuliah
   - Distribusi difficulty level
   - Rata-rata difficulty per mata kuliah
4. **export_course_ratings.py**:
   - Total data rating
   - Jumlah mahasiswa
   - Jumlah mata kuliah
   - Distribusi rating (1-5 bintang)
   - Rata-rata rating per mata kuliah
   - Analisis rating berdasarkan difficulty
5. **export_card_activities.py**:
   - Total kartu
   - Jumlah user
   - Jumlah mata kuliah
   - Distribusi kartu per list
   - Distribusi difficulty level
   - Top 10 user dengan kartu terbanyak
   - Total perpindahan kartu
   - Distribusi perpindahan per kolom tujuan
   - Hari paling aktif
   - Top 10 user dengan perpindahan terbanyak

## Catatan

- Data yang diekspor hanya mencakup card yang tidak diarsipkan dan tidak dihapus
- Untuk data nilai, hanya card yang memiliki nilai post-test yang akan diekspor
- Untuk data difficulty, hanya card yang memiliki pengaturan difficulty yang akan diekspor
- Untuk data rating, hanya card yang memiliki rating (> 0) yang akan diekspor
- Untuk data aktivitas kartu, filter berdasarkan tanggal 20 Agustus - 25 November 2024
- Data perpindahan kartu diambil dari array `column_movements` pada setiap card
- Nama mata kuliah diekstrak dari judul card dengan format "Nama MK [Detail Tugas]"