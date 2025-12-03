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

# Filter berdasarkan tanggal 19 Agustus - 19 November 2025
# Gunakan UTC timezone untuk konsistensi
import pytz
utc = pytz.UTC
start_date = utc.localize(datetime(2025, 1, 1))
end_date = utc.localize(datetime(2025, 11, 19, 23, 59, 59))

print(f"Mengambil data aktivitas kartu dari {start_date.strftime('%Y-%m-%d')} hingga {end_date.strftime('%Y-%m-%d')}...")

# Ambil semua boards dan filter di Python untuk lebih fleksibel
# Query MongoDB tidak bisa menangani nested array filtering dengan baik
boards = list(db.boards.find({}))
print(f"Ditemukan {len(boards)} boards total, melakukan filter berdasarkan tanggal...")

# Filter boards yang memiliki aktivitas dalam rentang tanggal
filtered_boards = []
for board in boards:
    has_activity_in_range = False
    
    # Cek board creation date
    board_created = board.get("created_at")
    if board_created:
        if isinstance(board_created, datetime):
            if board_created.tzinfo is None:
                board_created = utc.localize(board_created)
            if start_date <= board_created <= end_date:
                has_activity_in_range = True
    
    # Cek cards dalam board
    if not has_activity_in_range:
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
                        if start_date <= card_date <= end_date:
                            has_activity_in_range = True
                            break
                    except:
                        pass
                
                # Cek movement timestamps
                if not has_activity_in_range:
                    movements = card.get("column_movements", [])
                    for movement in movements:
                        timestamp = movement.get("timestamp")
                        if timestamp:
                            try:
                                movement_dt = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
                                if movement_dt.tzinfo is None:
                                    movement_dt = utc.localize(movement_dt)
                                if start_date <= movement_dt <= end_date:
                                    has_activity_in_range = True
                                    break
                            except:
                                pass
                
                if has_activity_in_range:
                    break
            if has_activity_in_range:
                break
    
    if has_activity_in_range:
        filtered_boards.append(board)

boards = filtered_boards
print(f"Setelah filter: {len(boards)} boards memiliki aktivitas dalam rentang tanggal")

card_activities = []
movement_details = []

for board in boards:
    user_id = board.get("user_id")
    
    user = db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        continue
        
    username = user.get("username", "")
    first_name = user.get("first_name", "")
    last_name = user.get("last_name", "")
    email = user.get("email", "")
    
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
                        
                        if start_date <= movement_dt <= end_date:
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
                                "is_initial_movement": from_column == "initial",
                                "is_to_reflection": to_column == "list4"
                            }
                            
                            movement_details.append(movement_detail)
                    except (ValueError, AttributeError):
                        continue

# Buat DataFrame untuk data kartu
df_cards = pd.DataFrame(card_activities)

# Buat DataFrame untuk detail perpindahan
df_movements = pd.DataFrame(movement_details)

# Export data kartu
if not df_cards.empty:
    # Sort data kartu
    df_cards_sorted = df_cards.sort_values(['username', 'course_name', 'card_title'])
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    cards_filename = f"export_card_activities_{timestamp}.csv"
    df_cards_sorted.to_csv(cards_filename, index=False)
    
    print(f"\n=== Statistik Data Kartu ===")
    print(f"Total kartu: {len(df_cards_sorted)}")
    print(f"Jumlah user: {df_cards_sorted['username'].nunique()}")
    print(f"Jumlah mata kuliah: {df_cards_sorted['course_name'].nunique()}")
    
    # Distribusi kartu per list
    list_dist = df_cards_sorted['current_list'].value_counts()
    print(f"\n=== Distribusi Kartu per List ===")
    for list_name, count in list_dist.items():
        percentage = (count / len(df_cards_sorted)) * 100
        print(f"{list_name}: {count} ({percentage:.1f}%)")
    
    # Distribusi difficulty
    if 'difficulty' in df_cards_sorted.columns:
        diff_dist = df_cards_sorted['difficulty'].value_counts()
        print(f"\n=== Distribusi Difficulty ===")
        for diff, count in diff_dist.items():
            if diff:
                percentage = (count / len(df_cards_sorted[df_cards_sorted['difficulty'].notna()])) * 100
                print(f"{diff}: {count} ({percentage:.1f}%)")
    
    # Top 10 user dengan kartu terbanyak
    top_users = df_cards_sorted['username'].value_counts().head(10)
    print(f"\n=== Top 10 User dengan Kartu Terbanyak ===")
    for username, count in top_users.items():
        print(f"{username}: {count} kartu")
    
    print(f"\nFile '{cards_filename}' sudah dibuat.")
else:
    print("Tidak ada data kartu ditemukan dalam rentang tanggal tersebut.")

# Export detail perpindahan
if not df_movements.empty:
    # Convert timestamp dan sort
    df_movements['movement_timestamp'] = pd.to_datetime(df_movements['movement_timestamp'])
    df_movements_sorted = df_movements.sort_values(['username', 'movement_timestamp', 'card_title'])
    
    movements_filename = f"export_card_movements_{timestamp}.csv"
    df_movements_sorted.to_csv(movements_filename, index=False)
    
    print(f"\n=== Statistik Perpindahan Kartu ===")
    print(f"Total perpindahan: {len(df_movements_sorted)}")
    print(f"Jumlah user yang memindahkan kartu: {df_movements_sorted['username'].nunique()}")
    print(f"Jumlah kartu yang dipindahkan: {df_movements_sorted['card_id'].nunique()}")
    
    # Distribusi perpindahan per kolom tujuan
    to_col_dist = df_movements_sorted['to_column_name'].value_counts()
    print(f"\n=== Distribusi Perpindahan per Kolom Tujuan ===")
    for col_name, count in to_col_dist.items():
        percentage = (count / len(df_movements_sorted)) * 100
        print(f"{col_name}: {count} ({percentage:.1f}%)")
    
    # Perpindahan per hari
    df_movements_sorted['movement_date_only'] = df_movements_sorted['movement_timestamp'].dt.date
    daily_moves = df_movements_sorted.groupby('movement_date_only').size().reset_index(name='movements_count')
    most_active_day = daily_moves.loc[daily_moves['movements_count'].idxmax()]
    
    print(f"\n=== Hari Paling Aktif ===")
    print(f"{most_active_day['movement_date_only']}: {most_active_day['movements_count']} perpindahan")
    
    # Top 10 user dengan perpindahan terbanyak
    top_movers = df_movements_sorted['username'].value_counts().head(10)
    print(f"\n=== Top 10 User dengan Perpindahan Terbanyak ===")
    for username, count in top_movers.items():
        print(f"{username}: {count} perpindahan")
    
    print(f"\nFile '{movements_filename}' sudah dibuat.")
else:
    print("Tidak ada data perpindahan kartu ditemukan dalam rentang tanggal tersebut.")

# Summary report
print(f"\n{'='*60}")
print("SUMMARY EKSPOR DATA AKTIVITAS KARTU")
print(f"{'='*60}")
print(f"Periode: {start_date.strftime('%d %B %Y')} - {end_date.strftime('%d %B %Y')}")
print(f"Waktu eksekusi: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
print(f"Total kartu diekspor: {len(df_cards) if not df_cards.empty else 0}")
print(f"Total perpindahan diekspor: {len(df_movements) if not df_movements.empty else 0}")
print(f"File yang dihasilkan:")
if not df_cards.empty:
    print(f"  - {cards_filename}")
if not df_movements.empty:
    print(f"  - {movements_filename}")
print(f"{'='*60}")

client.close()