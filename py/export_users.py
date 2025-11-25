from pymongo import MongoClient
import pandas as pd
import os
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

MONGO_URI = os.getenv('MONGO_URI')
DB = os.getenv('MONGO_DB')

if not MONGO_URI or not DB:
    raise ValueError("Environment variables for MongoDB are not set properly.")

client = MongoClient(MONGO_URI)
db = client[DB]

users = list(db.users.find({}, {"password": 0})) 

df = pd.DataFrame(users)

if df.empty:
    print("Tidak ada data user ditemukan.")
else:
    if '_id' in df.columns:
        df['_id'] = df['_id'].astype(str)
    
    if 'created_at' in df.columns:
        df['created_at'] = pd.to_datetime(df['created_at']).dt.strftime('%Y-%m-%d %H:%M:%S')
    
    columns_to_include = ['_id', 'username', 'first_name', 'last_name', 'email', 'role', 'created_at']
    existing_columns = [col for col in columns_to_include if col in df.columns]
    df = df[existing_columns]
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"export_users_{timestamp}.csv"
    df.to_csv(filename, index=False)
    
    print("=== Data Users ===")
    print(df)
    
    print(f"\nSelesai! File '{filename}' sudah dibuat.")