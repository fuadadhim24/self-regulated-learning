from pymongo import MongoClient
import pandas as pd
import os
from dotenv import load_dotenv
from datetime import datetime
import pytz

load_dotenv()

MONGO_URI = os.getenv('MONGO_URI')
DB = os.getenv('MONGO_DB')
COLLECTION = 'logs'  # Collection untuk logs

if not MONGO_URI or not DB:
    raise ValueError("Environment variables for MongoDB are not set properly.")

client = MongoClient(MONGO_URI)
db = client[DB]

# ===== KONFIGURASI TANGGAL =====
# Sesuai permintaan: 20 Agustus - 25 November 2025
utc = pytz.UTC
START_DATE = utc.localize(datetime(2025, 5, 15))
END_DATE = utc.localize(datetime(2025, 6, 17, 23, 59, 59))

print(f"🔍 Mengekspor data Login dan Logout User")
print(f"📅 Periode: {START_DATE.strftime('%d %B %Y')} - {END_DATE.strftime('%d %B %Y')}")
print(f"="*60)

# Query data logs untuk login dan logout
query = {
    "action_type": {"$in": ["login", "logout"]},
    "created_at": {"$gte": START_DATE, "$lte": END_DATE}
}

logs = list(db.logs.find(query).sort("created_at", 1))
print(f"📊 Ditemukan {len(logs)} aktivitas login/logout")

if not logs:
    print("❌ Tidak ada data login/logout dalam periode tersebut")
    client.close()
    exit()

# Siapkan data untuk CSV
login_logout_data = []

for log in logs:
    username = log.get("username", "")
    action_type = log.get("action_type", "")
    description = log.get("description", "")
    created_at = log.get("created_at")
    
    # Format timestamp ke WIB (UTC+7)
    if created_at:
        if isinstance(created_at, datetime):
            # Convert UTC to WIB
            wib = pytz.timezone('Asia/Jakarta')
            created_at_wib = created_at.astimezone(wib)
            timestamp_wib = created_at_wib.strftime('%Y-%m-%d %H:%M:%S')
            date_only = created_at_wib.strftime('%Y-%m-%d')
            time_only = created_at_wib.strftime('%H:%M:%S')
            day_of_week = created_at_wib.strftime('%A')
        else:
            timestamp_wib = str(created_at)
            date_only = ""
            time_only = ""
            day_of_week = ""
    else:
        timestamp_wib = ""
        date_only = ""
        time_only = ""
        day_of_week = ""
    
    login_logout_data.append({
        "Username": username,
        "Aksi": action_type,
        "Waktu (WIB)": timestamp_wib,
        "Tanggal": date_only,
        "Jam": time_only,
        "Hari": day_of_week,
        "Deskripsi": description
    })

# Buat DataFrame
df = pd.DataFrame(login_logout_data)

if not df.empty:
    # Sort berdasarkan Username, lalu Tanggal, lalu Jam
    df_sorted = df.sort_values(['Username', 'Waktu (WIB)'])
    
    # Generate filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"LOGIN_LOGOUT_USER_{timestamp}.csv"
    
    # Export ke CSV
    df_sorted.to_csv(filename, index=False, encoding='utf-8-sig')
    
    # Tampilkan statistik
    print(f"\n📈 STATISTIK LOGIN/LOGOUT:")
    print(f"👥 Total User yang Login: {df_sorted[df_sorted['Aksi'] == 'login']['Username'].nunique()}")
    print(f"🔑 Total Login: {len(df_sorted[df_sorted['Aksi'] == 'login'])}")
    print(f"🚪 Total Logout: {len(df_sorted[df_sorted['Aksi'] == 'logout'])}")
    print(f"📅 Total Hari Aktif: {df_sorted['Tanggal'].nunique()}")
    
    # Top 10 user dengan login terbanyak
    login_counts = df_sorted[df_sorted['Aksi'] == 'login']['Username'].value_counts().head(10)
    print(f"\n🏆 Top 10 User dengan Login Terbanyak:")
    for username, count in login_counts.items():
        print(f"   {username}: {count} kali login")
    
    # Distribusi login per hari
    daily_login = df_sorted[df_sorted['Aksi'] == 'login']['Hari'].value_counts()
    print(f"\n📆 Distribusi Login per Hari:")
    for day, count in daily_login.items():
        percentage = (count / len(df_sorted[df_sorted['Aksi'] == 'login'])) * 100
        print(f"   {day}: {count} ({percentage:.1f}%)")
    
    # Distribusi login per jam
    df_sorted['Jam_Angka'] = pd.to_datetime(df_sorted['Waktu (WIB)']).dt.hour
    hourly_login = df_sorted[df_sorted['Aksi'] == 'login']['Jam_Angka'].value_counts().sort_index()
    print(f"\n⏰ Distribusi Login per Jam (WIB):")
    for hour, count in hourly_login.items():
        print(f"   {hour:02d}:00-{hour:02d}:59: {count} login")
    
    # Cari user dengan aktivitas paling pagi dan paling malam
    early_logins = df_sorted[df_sorted['Aksi'] == 'login'].groupby('Username')['Jam_Angka'].min().sort_values()
    late_logins = df_sorted[df_sorted['Aksi'] == 'login'].groupby('Username')['Jam_Angka'].max().sort_values(ascending=False)
    
    print(f"\n🌅 User Paling Pagi Login:")
    for username, hour in early_logins.head(3).items():
        print(f"   {username}: {hour:02d}:00")
    
    print(f"\n🌙 User Paling Malam Login:")
    for username, hour in late_logins.head(3).items():
        print(f"   {username}: {hour:02d}:00")
    
    print(f"\n✅ File berhasil dibuat: {filename}")
    print(f"📊 Total data: {len(df_sorted)} baris")
    
    # Tampilkan 5 data pertama sebagai preview
    print(f"\n🔍 Preview Data (5 baris pertama):")
    preview_cols = ['Username', 'Aksi', 'Waktu (WIB)', 'Hari']
    print(df_sorted[preview_cols].head().to_string(index=False))
    
    # Tampilkan contoh aktivitas 1 user
    if len(df_sorted) > 0:
        sample_user = df_sorted['Username'].value_counts().index[0]
        sample_data = df_sorted[df_sorted['Username'] == sample_user].head(5)
        print(f"\n👤 Contoh Aktivitas User '{sample_user}':")
        print(sample_data[['Aksi', 'Waktu (WIB)', 'Deskripsi']].to_string(index=False))

else:
    print("❌ Tidak ada data login/logout yang bisa diproses")

print(f"\n{'='*60}")
print(f"🎯 EKSPOR SELESAI")
print(f"📁 File: {filename if not df.empty else 'Tidak ada file'}")
print(f"🕐 Waktu: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
print(f"{'='*60}")

client.close()