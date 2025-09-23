from pymongo import MongoClient
import pandas as pd
from datetime import datetime, timedelta
import pytz
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv('MONGO_URI')
DB = os.getenv('MONGO_DB')
COLLECTION = os.getenv('MONGO_COLLECTION')

client = MongoClient(MONGO_URI)
db = client[DB]          
collection = db[COLLECTION]           

end_date = datetime(2025, 9, 23)
start_date = end_date - timedelta(days=7)

query = {"created_at": {"$gte": start_date, "$lte": end_date}}
docs = list(collection.find(query, {"_id": 0}))

df = pd.DataFrame(docs)

if not df.empty:
    df['created_at'] = pd.to_datetime(df['created_at'])
    df['created_at'] = df['created_at'].dt.tz_localize('UTC').dt.tz_convert('Asia/Jakarta')
    df['created_at'] = df['created_at'].dt.tz_localize(None)  # opsional, supaya plain datetime

df.to_csv("srl_db_v2_logs_23sept_minggu_terakhir.csv", index=False)
print("Selesai! File CSV sudah dibuat dengan waktu WIB")

