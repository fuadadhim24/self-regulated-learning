from pymongo import MongoClient
import pandas as pd
import os
from dotenv import load_dotenv
from datetime import datetime
from bson.objectid import ObjectId
import pytz

load_dotenv()

MONGO_URI = os.getenv('MONGO_URI')
DB = os.getenv('MONGO_DB')

if not MONGO_URI or not DB:
    raise ValueError("Environment variables for MongoDB are not set properly.")

client = MongoClient(MONGO_URI)
db = client[DB]

# ===== KONFIGURASI TANGGAL =====
# Sesuai permintaan: 20 Agustus - 25 November 2025
# (disesuaikan dengan data aktual yang tersedia)
utc = pytz.UTC
START_DATE = utc.localize(datetime(2025, 5, 15))
END_DATE = utc.localize(datetime(2025, 6, 17, 23, 59, 59))

print(f"🔍 Mengekspor data aktivitas kartu user")
print(f"📅 Periode: {START_DATE.strftime('%d %B %Y')} - {END_DATE.strftime('%d %B %Y')}")
print(f"="*60)

# Ambil semua boards
boards = list(db.boards.find({}))
print(f"📊 Ditemukan {len(boards)} user boards")

# Filter boards yang memiliki aktivitas
filtered_boards = []
for board in boards:
    has_activity = False
    
    for list_data in board.get("lists", []):
        for card in list_data.get("cards", []):
            # Cek card creation date
            card_created = card.get("created_at")
            if card_created:
                try:
                    if isinstance(card_created, str):
                        card_date = datetime.fromisoformat(card_created.replace('Z', '+00:00'))
                    else:
                        card_date = card_created
                    if card_date.tzinfo is None:
                        card_date = utc.localize(card_date)
                    if START_DATE <= card_date <= END_DATE:
                        has_activity = True
                        break
                except:
                    pass
            
            # Cek movement timestamps
            movements = card.get("column_movements", [])
            for movement in movements:
                timestamp = movement.get("timestamp")
                if timestamp:
                    try:
                        movement_dt = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
                        if movement_dt.tzinfo is None:
                            movement_dt = utc.localize(movement_dt)
                        if START_DATE <= movement_dt <= END_DATE:
                            has_activity = True
                            break
                    except:
                        pass
            if has_activity:
                break
        if has_activity:
            break
    
    if has_activity:
        filtered_boards.append(board)

boards = filtered_boards
print(f"✅ {len(boards)} user memiliki aktivitas dalam periode tersebut")

# Siapkan data untuk CSV
aktivitas_user = []

for board in boards:
    user_id = board.get("user_id")
    user = db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        continue
        
    username = user.get("username", "")
    nama_lengkap = f"{user.get('first_name', '')} {user.get('last_name', '')}".strip()
    email = user.get("email", "")
    
    # Hitung total kartu user
    total_kartu = 0
    total_perpindahan = 0
    kartu_selesai = 0
    
    # Detail setiap kartu
    for list_data in board.get("lists", []):
        list_name = list_data.get("title", "")
        
        for card in list_data.get("cards", []):
            if card.get("archived") or card.get("deleted"):
                continue
                
            total_kartu += 1
            
            # Cek apakah kartu sudah selesai (di Reflection)
            if list_name == "Reflection (Done)":
                kartu_selesai += 1
            
            # Hitung perpindahan
            movements = card.get("column_movements", [])
            total_perpindahan += len(movements)
            
            # Buat riwayat perpindahan untuk setiap kartu
            riwayat_perpindahan = []
            for i, movement in enumerate(movements):
                timestamp = movement.get("timestamp", "")
                if timestamp:
                    try:
                        movement_dt = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
                        if movement_dt.tzinfo is None:
                            movement_dt = utc.localize(movement_dt)
                        
                        if START_DATE <= movement_dt <= END_DATE:
                            from_col = movement.get("fromColumn", "")
                            to_col = movement.get("toColumn", "")
                            
                            # Mapping column ID ke nama
                            column_names = {
                                "list1": "Planning (To Do)",
                                "list2": "Monitoring (In Progress)", 
                                "list3": "Controlling (Review)",
                                "list4": "Reflection (Done)",
                                "initial": "Awal"
                            }
                            
                            from_name = column_names.get(from_col, from_col)
                            to_name = column_names.get(to_col, to_col)
                            
                            riwayat_perpindahan.append(
                                f"{movement_dt.strftime('%d/%m %H:%M')}: {from_name} → {to_name}"
                            )
                    except:
                        continue
            
            # Format riwayat perpindahan
            riwayat_text = " | ".join(riwayat_perpindahan) if riwayat_perpindahan else "Tidak ada perpindahan"
            
            # Ambil info mata kuliah dari judul kartu
            card_title = card.get("title", "")
            mata_kuliah = ""
            if "[" in card_title:
                mata_kuliah = card_title.split("[")[0].strip()
            else:
                mata_kuliah = card_title
            
            aktivitas_user.append({
                "Username": username,
                "Nama Lengkap": nama_lengkap,
                "Email": email,
                "Judul Kartu": card_title,
                "Mata Kuliah": mata_kuliah,
                "Status Saat Ini": list_name,
                "Difficulty": card.get("difficulty", ""),
                "Learning Strategy": card.get("learning_strategy", ""),
                "Pre-Test Grade": card.get("pre_test_grade", ""),
                "Post-Test Grade": card.get("post_test_grade", ""),
                "Rating": card.get("rating", ""),
                "Jumlah Perpindahan": len(movements),
                "Riwayat Perpindahan": riwayat_text,
                "Tanggal Dibuat": card.get("created_at", "")[:19] if card.get("created_at") else ""
            })

# Buat DataFrame dan export ke CSV
df = pd.DataFrame(aktivitas_user)

if not df.empty:
    # Sort berdasarkan Username, lalu Mata Kuliah, lalu Judul Kartu
    df_sorted = df.sort_values(['Username', 'Mata Kuliah', 'Judul Kartu'])
    
    # Generate filename dengan timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"AKTIVITAS_KARTU_USER_{timestamp}.csv"
    
    # Export ke CSV
    df_sorted.to_csv(filename, index=False, encoding='utf-8-sig')
    
    # Tampilkan statistik
    print(f"\n📈 STATISTIK DATA:")
    print(f"👥 Total User: {df_sorted['Username'].nunique()}")
    print(f"🃏 Total Kartu: {len(df_sorted)}")
    print(f"📚 Total Mata Kuliah: {df_sorted['Mata Kuliah'].nunique()}")
    print(f"✅ Kartu Selesai: {len(df_sorted[df_sorted['Status Saat Ini'] == 'Reflection (Done)'])}")
    
    # Top 5 user dengan kartu terbanyak
    top_users = df_sorted['Username'].value_counts().head(5)
    print(f"\n🏆 Top 5 User dengan Kartu Terbanyak:")
    for username, count in top_users.items():
        print(f"   {username}: {count} kartu")
    
    # Distribusi status kartu
    status_dist = df_sorted['Status Saat Ini'].value_counts()
    print(f"\n📋 Distribusi Status Kartu:")
    for status, count in status_dist.items():
        percentage = (count / len(df_sorted)) * 100
        print(f"   {status}: {count} ({percentage:.1f}%)")
    
    print(f"\n✅ File berhasil dibuat: {filename}")
    print(f"📊 Total data: {len(df_sorted)} baris")
    
    # Tampilkan 5 data pertama sebagai preview
    print(f"\n🔍 Preview Data (5 baris pertama):")
    print(df_sorted[['Username', 'Judul Kartu', 'Status Saat Ini', 'Jumlah Perpindahan']].head().to_string(index=False))
    
else:
    print("❌ Tidak ada data ditemukan dalam periode tersebut")

print(f"\n{'='*60}")
print(f"🎯 EKSPOR SELESAI")
print(f"📁 File: {filename if not df.empty else 'Tidak ada file'}")
print(f"🕐 Waktu: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
print(f"{'='*60}")

client.close()