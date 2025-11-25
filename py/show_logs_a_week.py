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

if not MONGO_URI or not DB or not COLLECTION:
    raise ValueError("Environment variables for MongoDB are not set properly.")


client = MongoClient(MONGO_URI)
db = client[DB]          
collection = db[COLLECTION]           

start_date = datetime(2025, 10, 20)
end_date = datetime(2025, 11, 4)

query = {"created_at": {"$gte": start_date, "$lte": end_date}}
docs = list(collection.find(query, {"_id": 0}))

df = pd.DataFrame(docs)

if not df.empty:
    df['created_at'] = pd.to_datetime(df['created_at'])
    df['created_at'] = df['created_at'].dt.tz_localize('UTC').dt.tz_convert('Asia/Jakarta')
    df['created_at'] = df['created_at'].dt.tz_localize(None)  

df.to_csv("srl_db_v2_20_okt_hingga_04_nov.csv", index=False)
print("Selesai! File CSV sudah dibuat dengan waktu WIB")
