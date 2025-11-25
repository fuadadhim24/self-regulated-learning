from pymongo import MongoClient
import pandas as pd
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv('MONGO_URI')
DB = os.getenv('MONGO_DB') or os.getenv('DB')
COLLECTION = os.getenv('MONGO_COLLECTION') or os.getenv('COLLECTION')

if not MONGO_URI or not DB or not COLLECTION:
    raise ValueError("Environment variables for MongoDB are not set properly.")

client = MongoClient(MONGO_URI)
db = client[DB]
collection = db[COLLECTION]

start_date = datetime(2025, 10, 20)
end_date = datetime(2025, 11, 4)

query = {
    "action_type": "login",
    "created_at": {"$gte": start_date, "$lte": end_date}
}

docs = list(collection.find(query, {"_id": 0, "username": 1, "created_at": 1}))

df = pd.DataFrame(docs)

if df.empty:
    print("Tidak ada data login ditemukan pada rentang tanggal tersebut.")
else:
    login_counts = df.groupby('username').size().reset_index(name='login_count')

    login_counts = login_counts.sort_values(by='login_count', ascending=False)

    login_counts.to_csv("ranked_login_summary.csv", index=False)

    print("=== Jumlah Login per Username ===")
    print(login_counts)

    print("\nSelesai! File 'ranked_login_summary_20_okt_hingga_04_nov.csv' sudah dibuat.")
