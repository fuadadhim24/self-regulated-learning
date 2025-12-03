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
# Ubah tanggal sesuai kebutuhan Anda
utc = pytz.UTC
START_DATE = utc.localize(datetime(2025, 8, 19))  # 19 Agustus 2025
END_DATE = utc.localize(datetime(2025, 11, 19, 23, 59, 59))  # 19 November 2025

# Atau gunakan tanggal dinamis (hari ini ke belakang)
# END_DATE = utc.localize(datetime.now())
# START_DATE = utc.localize(datetime(2024, 8, 20))

print(f"Mengambil data aktivitas kartu dari {START_DATE.strftime('%d %B %Y')} hingga {END_DATE.strftime('%d %B %Y')}...")

# Query boards dengan filter tanggal yang lebih komprehensif
boards_query = {
    "$or": [
        # Boards yang dibuat dalam rentang tanggal
        {"created_at": {"$gte": START_DATE, "$lte": END_DATE}},
        # Boards yang memiliki cards yang dibuat dalam rentang tanggal
        {"lists.cards.created_at": {"$gte": START_DATE.isoformat(), "$lte": END_DATE.isoformat()}},
        # Boards yang memiliki perpindahan kartu dalam rentang tanggal
        {"lists.cards.column_movements.timestamp": {"$gte": START_DATE.isoformat(), "$lte": END_DATE.isoformat()}}
    ]
}

boards = list(db.boards.find(boards_query))

print(f"Ditemukan {len(boards)} boards untuk dianalisis...")

card_activities = []
movement_details = []
user_summaries = {}

for board in boards:
    user_id = board.get("user_id")
    
    user = db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        continue
        
    username = user.get("username", "")
    first_name = user.get("first_name", "")
    last_name = user.get("last_name", "")
    email = user.get("email", "")
    
    # Initialize user summary
    if username not in user_summaries:
        user_summaries[username] = {
            "user_id": str(user_id),
            "first_name": first_name,
            "last_name": last_name,
            "email": email,
            "total_cards": 0,
            "total_movements": 0,
            "cards_to_reflection": 0,
            "unique_courses": set(),
            "avg_difficulty": [],
            "total_pre_test": 0,
            "total_post_test": 0,
            "avg_rating": []
        }
    
    for list_data in board.get("lists", []):
        list_name = list_data.get("title", "")
        list_id = list_data.get("id", "")
        
        for card in list_data.get("cards", []):
            if card.get("archived") or card.get("deleted"):
                continue
                
            card_id = card.get("id", "")
            card_title = card.get("title", "")
            card_subtitle = card.get("sub_title", "")
            card_description = card.get("description", "")
            
            course_name = ""
            if "[" in card_title:
                course_name = card_title.split("[")[0].strip()
            else:
                course_name = card_title
            
            # Update user summary
            user_summaries[username]["total_cards"] += 1
            user_summaries[username]["unique_courses"].add(course_name)
            
            if list_name == "Reflection (Done)":
                user_summaries[username]["cards_to_reflection"] += 1
            
            # Data kartu utama
            card_data = {
                "user_id": str(user_id),
                "username": username,
                "first_name": first_name,
                "last_name": last_name,
                "email": email,
                "card_id": card_id,
                "card_title": card_title,
                "card_subtitle": card_subtitle,
                "card_description": card_description,
                "course_name": course_name,
                "current_list": list_name,
                "current_list_id": list_id,
                "difficulty": card.get("difficulty", ""),
                "priority": card.get("priority", ""),
                "learning_strategy": card.get("learning_strategy", ""),
                "pre_test_grade": card.get("pre_test_grade", ""),
                "post_test_grade": card.get("post_test_grade", ""),
                "rating": card.get("rating", 0),
                "notes": card.get("notes", ""),
                "created_at": card.get("created_at", ""),
                "total_movements": len(card.get("column_movements", [])),
                "has_checklist": len(card.get("checklists", [])) > 0,
                "checklist_count": len(card.get("checklists", [])),
                "has_links": len(card.get("links", [])) > 0,
                "links_count": len(card.get("links", [])),
                "completed_checklist_items": sum(1 for checklist in card.get("checklists", []) if checklist.get("completed", False))
            }
            
            # Update user summary dengan difficulty dan rating
            difficulty = card.get("difficulty", "")
            if difficulty:
                diff_values = {"easy": 1, "medium": 2, "hard": 3}
                if difficulty in diff_values:
                    user_summaries[username]["avg_difficulty"].append(diff_values[difficulty])
            
            rating = card.get("rating", 0)
            if rating > 0:
                user_summaries[username]["avg_rating"].append(rating)
            
            pre_test = card.get("pre_test_grade", "")
            if pre_test and pre_test.strip():
                try:
                    user_summaries[username]["total_pre_test"] += float(pre_test)
                except ValueError:
                    pass
            
            post_test = card.get("post_test_grade", "")
            if post_test and post_test.strip():
                try:
                    user_summaries[username]["total_post_test"] += float(post_test)
                except ValueError:
                    pass
            
            card_activities.append(card_data)
            
            # Detail perpindahan kartu
            movements = card.get("column_movements", [])
            for i, movement in enumerate(movements):
                movement_timestamp = movement.get("timestamp", "")
                
                # Filter perpindahan dalam rentang tanggal
                if movement_timestamp:
                    try:
                        movement_dt = datetime.fromisoformat(movement_timestamp.replace('Z', '+00:00'))
                        # Pastikan kedua datetime memiliki timezone
                        if movement_dt.tzinfo is None:
                            movement_dt = utc.localize(movement_dt)
                        
                        if START_DATE <= movement_dt <= END_DATE:
                            from_column = movement.get("fromColumn", "")
                            to_column = movement.get("toColumn", "")
                            
                            # Mapping column ID ke nama
                            column_names = {
                                "list1": "Planning (To Do)",
                                "list2": "Monitoring (In Progress)", 
                                "list3": "Controlling (Review)",
                                "list4": "Reflection (Done)",
                                "initial": "Initial"
                            }
                            
                            from_column_name = column_names.get(from_column, from_column)
                            to_column_name = column_names.get(to_column, to_column)
                            
                            movement_detail = {
                                "user_id": str(user_id),
                                "username": username,
                                "first_name": first_name,
                                "last_name": last_name,
                                "email": email,
                                "card_id": card_id,
                                "card_title": card_title,
                                "course_name": course_name,
                                "movement_number": i + 1,
                                "from_column": from_column,
                                "from_column_name": from_column_name,
                                "to_column": to_column,
                                "to_column_name": to_column_name,
                                "movement_timestamp": movement_timestamp,
                                "movement_date": movement_dt.strftime('%Y-%m-%d %H:%M:%S'),
                                "movement_date_only": movement_dt.strftime('%Y-%m-%d'),
                                "movement_time": movement_dt.strftime('%H:%M:%S'),
                                "is_initial_movement": from_column == "initial",
                                "is_to_reflection": to_column == "list4",
                                "day_of_week": movement_dt.strftime('%A'),
                                "week_number": movement_dt.isocalendar()[1]
                            }
                            
                            movement_details.append(movement_detail)
                            user_summaries[username]["total_movements"] += 1
                            
                    except (ValueError, AttributeError):
                        continue

# Buat DataFrame untuk data kartu
df_cards = pd.DataFrame(card_activities)

# Buat DataFrame untuk detail perpindahan
df_movements = pd.DataFrame(movement_details)

# Buat DataFrame untuk summary user
user_summary_data = []
for username, data in user_summaries.items():
    avg_diff = sum(data["avg_difficulty"]) / len(data["avg_difficulty"]) if data["avg_difficulty"] else 0
    avg_rating = sum(data["avg_rating"]) / len(data["avg_rating"]) if data["avg_rating"] else 0
    
    user_summary_data.append({
        "user_id": data["user_id"],
        "username": username,
        "first_name": data["first_name"],
        "last_name": data["last_name"],
        "email": data["email"],
        "total_cards": data["total_cards"],
        "total_movements": data["total_movements"],
        "cards_to_reflection": data["cards_to_reflection"],
        "unique_courses_count": len(data["unique_courses"]),
        "unique_courses": ", ".join(sorted(data["unique_courses"])),
        "avg_difficulty": round(avg_diff, 2),
        "total_pre_test_grade": round(data["total_pre_test"], 2),
        "total_post_test_grade": round(data["total_post_test"], 2),
        "avg_rating": round(avg_rating, 2),
        "completion_rate": round((data["cards_to_reflection"] / data["total_cards"]) * 100, 2) if data["total_cards"] > 0 else 0,
        "movement_per_card": round(data["total_movements"] / data["total_cards"], 2) if data["total_cards"] > 0 else 0
    })

df_user_summary = pd.DataFrame(user_summary_data)

# Export semua file
timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

if not df_cards.empty:
    # Sort data kartu
    df_cards_sorted = df_cards.sort_values(['username', 'course_name', 'card_title'])
    cards_filename = f"export_card_activities_{timestamp}.csv"
    df_cards_sorted.to_csv(cards_filename, index=False)
    print(f"✓ File kartu: {cards_filename}")

if not df_movements.empty:
    # Convert timestamp dan sort
    df_movements['movement_timestamp'] = pd.to_datetime(df_movements['movement_timestamp'])
    df_movements_sorted = df_movements.sort_values(['username', 'movement_timestamp', 'card_title'])
    movements_filename = f"export_card_movements_{timestamp}.csv"
    df_movements_sorted.to_csv(movements_filename, index=False)
    print(f"✓ File perpindahan: {movements_filename}")

if not df_user_summary.empty:
    df_user_summary_sorted = df_user_summary.sort_values(['username'])
    summary_filename = f"export_user_summary_{timestamp}.csv"
    df_user_summary_sorted.to_csv(summary_filename, index=False)
    print(f"✓ File summary user: {summary_filename}")

# Tampilkan statistik lengkap
print(f"\n{'='*80}")
print("STATISTIK LENGKAP EKSPOR DATA AKTIVITAS KARTU")
print(f"{'='*80}")

if not df_cards.empty:
    print(f"\n📊 STATISTIK KARTU")
    print(f"Total kartu: {len(df_cards_sorted)}")
    print(f"Jumlah user: {df_cards_sorted['username'].nunique()}")
    print(f"Jumlah mata kuliah: {df_cards_sorted['course_name'].nunique()}")
    
    # Distribusi kartu per list
    list_dist = df_cards_sorted['current_list'].value_counts()
    print(f"\n📋 Distribusi Kartu per List:")
    for list_name, count in list_dist.items():
        percentage = (count / len(df_cards_sorted)) * 100
        print(f"  {list_name}: {count} ({percentage:.1f}%)")
    
    # Distribusi difficulty
    if 'difficulty' in df_cards_sorted.columns:
        diff_dist = df_cards_sorted['difficulty'].value_counts()
        print(f"\n🎯 Distribusi Difficulty:")
        for diff, count in diff_dist.items():
            if diff:
                percentage = (count / len(df_cards_sorted[df_cards_sorted['difficulty'].notna()])) * 100
                print(f"  {diff}: {count} ({percentage:.1f}%)")

if not df_movements.empty:
    print(f"\n🔄 STATISTIK PERPINDAHAN KARTU")
    print(f"Total perpindahan: {len(df_movements_sorted)}")
    print(f"Jumlah user yang memindahkan kartu: {df_movements_sorted['username'].nunique()}")
    print(f"Jumlah kartu yang dipindahkan: {df_movements_sorted['card_id'].nunique()}")
    
    # Distribusi perpindahan per kolom tujuan
    to_col_dist = df_movements_sorted['to_column_name'].value_counts()
    print(f"\n📌 Distribusi Perpindahan per Kolom Tujuan:")
    for col_name, count in to_col_dist.items():
        percentage = (count / len(df_movements_sorted)) * 100
        print(f"  {col_name}: {count} ({percentage:.1f}%)")
    
    # Perpindahan per hari
    daily_moves = df_movements_sorted.groupby('movement_date_only').size().reset_index(name='movements_count')
    most_active_day = daily_moves.loc[daily_moves['movements_count'].idxmax()]
    
    print(f"\n📅 Hari Paling Aktif:")
    print(f"  {most_active_day['movement_date_only']}: {most_active_day['movements_count']} perpindahan")
    
    # Distribusi per hari dalam seminggu
    day_dist = df_movements_sorted['day_of_week'].value_counts()
    print(f"\n📆 Distribusi Perpindahan per Hari:")
    for day, count in day_dist.items():
        percentage = (count / len(df_movements_sorted)) * 100
        print(f"  {day}: {count} ({percentage:.1f}%)")

if not df_user_summary.empty:
    print(f"\n👥 STATISTIK USER")
    print(f"Total user: {len(df_user_summary_sorted)}")
    
    # Top users
    top_cards = df_user_summary_sorted.nlargest(5, 'total_cards')
    print(f"\n🏆 Top 5 User dengan Kartu Terbanyak:")
    for _, row in top_cards.iterrows():
        print(f"  {row['username']}: {row['total_cards']} kartu ({row['unique_courses_count']} mata kuliah)")
    
    top_movements = df_user_summary_sorted.nlargest(5, 'total_movements')
    print(f"\n🚀 Top 5 User dengan Perpindahan Terbanyak:")
    for _, row in top_movements.iterrows():
        print(f"  {row['username']}: {row['total_movements']} perpindahan")
    
    top_completion = df_user_summary_sorted.nlargest(5, 'completion_rate')
    print(f"\n✅ Top 5 User dengan Completion Rate Tertinggi:")
    for _, row in top_completion.iterrows():
        print(f"  {row['username']}: {row['completion_rate']}% ({row['cards_to_reflection']}/{row['total_cards']})")

print(f"\n{'='*80}")
print("SUMMARY EKSPOR")
print(f"{'='*80}")
print(f"Periode: {START_DATE.strftime('%d %B %Y')} - {END_DATE.strftime('%d %B %Y')}")
print(f"Waktu eksekusi: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
print(f"Total kartu diekspor: {len(df_cards) if not df_cards.empty else 0}")
print(f"Total perpindahan diekspor: {len(df_movements) if not df_movements.empty else 0}")
print(f"Total user summary: {len(df_user_summary) if not df_user_summary.empty else 0}")
print(f"\nFile yang dihasilkan:")
if not df_cards.empty:
    print(f"  📄 {cards_filename}")
if not df_movements.empty:
    print(f"  📄 {movements_filename}")
if not df_user_summary.empty:
    print(f"  📄 {summary_filename}")
print(f"{'='*80}")

client.close()