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

student_grades = []

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
            
            post_test_grade = card.get("post_test_grade", "")
            pre_test_grade = card.get("pre_test_grade", "")
            
            learning_strategy = card.get("learning_strategy", "")
            
            if post_test_grade and post_test_grade.strip():
                try:
                    grade_value = float(post_test_grade)
                    student_grades.append({
                        "user_id": str(user_id),
                        "username": username,
                        "first_name": first_name,
                        "last_name": last_name,
                        "email": email,
                        "card_id": card_id,
                        "card_title": card_title,
                        "course_name": course_name,
                        "list_name": list_name,
                        "pre_test_grade": pre_test_grade if pre_test_grade and pre_test_grade.strip() else None,
                        "post_test_grade": grade_value,
                        "learning_strategy": learning_strategy
                    })
                except ValueError:
                    continue

df = pd.DataFrame(student_grades)

if df.empty:
    print("Tidak ada data nilai mahasiswa ditemukan.")
else:
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"export_student_grades_{timestamp}.csv"
    df.to_csv(filename, index=False)
    
    print("=== Statistik Nilai Mahasiswa ===")
    print(f"Total data nilai: {len(df)}")
    print(f"Jumlah mahasiswa: {df['username'].nunique()}")
    print(f"Jumlah mata kuliah: {df['course_name'].nunique()}")
    
    avg_by_course = df.groupby('course_name')['post_test_grade'].agg(['count', 'mean', 'min', 'max']).round(2)
    print("\n=== Rata-rata Nilai per Mata Kuliah ===")
    print(avg_by_course)
    
    print("\n=== 5 Data Teratas ===")
    print(df.head())
    
    print(f"\nSelesai! File '{filename}' sudah dibuat.")