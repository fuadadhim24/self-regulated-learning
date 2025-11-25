from pymongo import MongoClient
import pandas as pd
import os
from dotenv import load_dotenv
from datetime import datetime
from bson.objectid import ObjectId

load_dotenv()

MONGO_URI = os.getenv('MONGO_URI')
DB = os.getenv('MONGO_DB')

if not MONGO_URI or not DB:
    raise ValueError("Environment variables for MongoDB are not set properly.")

client = MongoClient(MONGO_URI)
db = client[DB]

boards = list(db.boards.find({}))

difficulty_data = []

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
        
        for card in list_data.get("cards", []):
            if card.get("archived") or card.get("deleted"):
                continue
                
            card_id = card.get("id", "")
            card_title = card.get("title", "")
            
            course_name = ""
            if "[" in card_title:
                course_name = card_title.split("[")[0].strip()
            else:
                course_name = card_title
            
            difficulty = card.get("difficulty", "")
            
            learning_strategy = card.get("learning_strategy", "")
            
            if difficulty and difficulty.strip():
                difficulty_value = None
                if difficulty == "easy":
                    difficulty_value = 1
                elif difficulty == "medium":
                    difficulty_value = 2
                elif difficulty == "hard":
                    difficulty_value = 3
                
                difficulty_data.append({
                    "user_id": str(user_id),
                    "username": username,
                    "first_name": first_name,
                    "last_name": last_name,
                    "email": email,
                    "card_id": card_id,
                    "card_title": card_title,
                    "course_name": course_name,
                    "list_name": list_name,
                    "difficulty_level": difficulty,
                    "difficulty_value": difficulty_value,
                    "learning_strategy": learning_strategy
                })

df = pd.DataFrame(difficulty_data)

if df.empty:
    print("Tidak ada data difficulty rating ditemukan.")
else:
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"export_difficulty_ratings_{timestamp}.csv"
    df.to_csv(filename, index=False)
    
    print("=== Statistik Difficulty Rating ===")
    print(f"Total data difficulty: {len(df)}")
    print(f"Jumlah mahasiswa: {df['username'].nunique()}")
    print(f"Jumlah mata kuliah: {df['course_name'].nunique()}")
    
    difficulty_dist = df['difficulty_level'].value_counts().sort_index()
    print("\n=== Distribusi Difficulty Level ===")
    for level, count in difficulty_dist.items():
        percentage = (count / len(df)) * 100
        print(f"{level}: {count} ({percentage:.1f}%)")
    
    avg_difficulty_by_course = df.groupby('course_name')['difficulty_value'].agg(['count', 'mean']).round(2)
    avg_difficulty_by_course.columns = ['jumlah_tugas', 'rata_rata_difficulty']
    print("\n=== Rata-rata Difficulty per Mata Kuliah ===")
    print(avg_difficulty_by_course)
    
    print("\n=== 5 Data Teratas ===")
    print(df.head())
    
    print(f"\nSelesai! File '{filename}' sudah dibuat.")