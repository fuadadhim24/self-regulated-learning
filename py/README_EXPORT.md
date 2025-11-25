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

### 5. export_all_kanban_data.py
- **Deskripsi**: Script utama yang menjalankan semua script ekspor sekaligus
- **Output**: Menjalankan keempat script di atas dan menghasilkan 4 file CSV

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

## Catatan

- Data yang diekspor hanya mencakup card yang tidak diarsipkan dan tidak dihapus
- Untuk data nilai, hanya card yang memiliki nilai post-test yang akan diekspor
- Untuk data difficulty, hanya card yang memiliki pengaturan difficulty yang akan diekspor
- Untuk data rating, hanya card yang memiliki rating (> 0) yang akan diekspor
- Nama mata kuliah diekstrak dari judul card dengan format "Nama MK [Detail Tugas]"