from pymongo import MongoClient
import os
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

MONGO_URI = os.getenv('MONGO_URI')
DB = os.getenv('MONGO_DB') or os.getenv('DB')
COLLECTION = os.getenv('MONGO_COLLECTION') or os.getenv('COLLECTION')

client = MongoClient(MONGO_URI)
db = client[DB]
collection = db[COLLECTION]

docs = list(collection.find().sort("created_at", -1).limit(5))

for d in docs:
    print(d)
