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

rating_data = []

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
            
            rating = card.get("rating", 0)
            
            learning_strategy = card.get("learning_strategy", "")
            
            difficulty = card.get("difficulty", "")
            
            if rating and rating > 0:
                rating_data.append({
                    "user_id": str(user_id),
                    "username": username,
                    "first_name": first_name,
                    "last_name": last_name,
                    "email": email,
                    "card_id": card_id,
                    "card_title": card_title,
                    "course_name": course_name,
                    "list_name": list_name,
                    "rating": rating,
                    "learning_strategy": learning_strategy,
                    "difficulty": difficulty
                })

df = pd.DataFrame(rating_data)

if df.empty:
    print("Tidak ada data rating mahasiswa ditemukan.")
else:
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"export_course_ratings_{timestamp}.csv"
    df.to_csv(filename, index=False)
    
    print("=== Statistik Rating Mahasiswa ===")
    print(f"Total data rating: {len(df)}")
    print(f"Jumlah mahasiswa: {df['username'].nunique()}")
    print(f"Jumlah mata kuliah: {df['course_name'].nunique()}")
    
    rating_dist = df['rating'].value_counts().sort_index()
    print("\n=== Distribusi Rating (1-5) ===")
    for rating_val, count in rating_dist.items():
        percentage = (count / len(df)) * 100
        print(f"{rating_val} bintang: {count} ({percentage:.1f}%)")
    
    avg_rating_by_course = df.groupby('course_name')['rating'].agg(['count', 'mean', 'min', 'max']).round(2)
    avg_rating_by_course.columns = ['jumlah_rating', 'rata_rata_rating', 'rating_min', 'rating_max']
    print("\n=== Rata-rata Rating per Mata Kuliah ===")
    print(avg_rating_by_course)
    
    if 'difficulty' in df.columns and df['difficulty'].notna().any():
        print("\n=== Analisis Rating berdasarkan Difficulty ===")
        difficulty_rating = df.groupby('difficulty')['rating'].agg(['count', 'mean']).round(2)
        difficulty_rating.columns = ['jumlah', 'rata_rata_rating']
        print(difficulty_rating)
    
    print("\n=== 5 Data Teratas ===")
    print(df.head())
    
    print(f"\nSelesai! File '{filename}' sudah dibuat.")