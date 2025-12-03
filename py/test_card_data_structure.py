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

print("=== ANALISIS STRUKTUR DATA DATABASE ===")

# 1. Cek semua collections
collections = db.list_collection_names()
print(f"\n📁 Collections yang tersedia:")
for collection in collections:
    print(f"  - {collection}")

# 2. Analisis collection users
print(f"\n👥 Analisis Collection Users:")
users_count = db.users.count_documents({})
print(f"  Total users: {users_count}")

if users_count > 0:
    # Sample user
    sample_user = db.users.find_one()
    print(f"  Struktur data user:")
    for key, value in sample_user.items():
        if key != 'password':  # Skip password field
            print(f"    {key}: {type(value).__name__} = {str(value)[:50]}...")
    
    # Cek rentang tanggal user creation
    oldest_user = list(db.users.find().sort("created_at", 1).limit(1))
    newest_user = list(db.users.find().sort("created_at", -1).limit(1))
    
    if oldest_user and newest_user:
        print(f"  User tertua: {oldest_user[0].get('created_at', 'N/A')}")
        print(f"  User terbaru: {newest_user[0].get('created_at', 'N/A')}")

# 3. Analisis collection boards
print(f"\n📋 Analisis Collection Boards:")
boards_count = db.boards.count_documents({})
print(f"  Total boards: {boards_count}")

if boards_count > 0:
    # Sample board
    sample_board = db.boards.find_one()
    print(f"  Struktur data board:")
    for key, value in sample_board.items():
        if key == 'lists':
            print(f"    {key}: {type(value).__name__} (length: {len(value)})")
            if value and len(value) > 0:
                print(f"      Sample list structure:")
                for list_key, list_value in value[0].items():
                    if list_key == 'cards':
                        print(f"        {list_key}: {type(list_value).__name__} (length: {len(list_value)})")
                        if list_value and len(list_value) > 0:
                            print(f"          Sample card structure:")
                            for card_key, card_value in list_value[0].items():
                                print(f"            {card_key}: {type(card_value).__name__} = {str(card_value)[:50]}...")
                    else:
                        print(f"        {list_key}: {type(list_value).__name__} = {str(list_value)[:30]}...")
        else:
            print(f"    {key}: {type(value).__name__} = {str(value)[:50]}...")
    
    # Cek rentang tanggal board creation
    oldest_board = list(db.boards.find().sort("created_at", 1).limit(1))
    newest_board = list(db.boards.find().sort("created_at", -1).limit(1))
    
    if oldest_board and newest_board:
        print(f"  Board tertua: {oldest_board[0].get('created_at', 'N/A')}")
        print(f"  Board terbaru: {newest_board[0].get('created_at', 'N/A')}")

# 4. Analisis cards dan movements
print(f"\n🃏 Analisis Cards dan Movements:")
total_cards = 0
total_movements = 0
cards_with_movements = 0
cards_with_created_at = 0

all_boards = db.boards.find({})
for board in all_boards:
    for list_data in board.get("lists", []):
        cards = list_data.get("cards", [])
        total_cards += len(cards)
        
        for card in cards:
            if card.get("created_at"):
                cards_with_created_at += 1
            
            movements = card.get("column_movements", [])
            if movements:
                cards_with_movements += 1
                total_movements += len(movements)

print(f"  Total cards: {total_cards}")
print(f"  Cards dengan created_at: {cards_with_created_at}")
print(f"  Cards dengan movements: {cards_with_movements}")
print(f"  Total movements: {total_movements}")

# 5. Cek rentang tanggal pada cards
print(f"\n📅 Analisis Tanggal pada Cards:")
card_dates = []
movement_dates = []

all_boards = db.boards.find({})
for board in all_boards:
    for list_data in board.get("lists", []):
        for card in list_data.get("cards", []):
            # Card created_at
            created_at = card.get("created_at")
            if created_at:
                try:
                    if isinstance(created_at, str):
                        card_date = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
                    else:
                        card_date = created_at
                    card_dates.append(card_date)
                except:
                    pass
            
            # Movement timestamps
            movements = card.get("column_movements", [])
            for movement in movements:
                timestamp = movement.get("timestamp")
                if timestamp:
                    try:
                        if isinstance(timestamp, str):
                            movement_date = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
                        else:
                            movement_date = timestamp
                        movement_dates.append(movement_date)
                    except:
                        pass

if card_dates:
    card_dates.sort()
    print(f"  Card creation dates:")
    print(f"    Earliest: {card_dates[0]}")
    print(f"    Latest: {card_dates[-1]}")

if movement_dates:
    movement_dates.sort()
    print(f"  Movement dates:")
    print(f"    Earliest: {movement_dates[0]}")
    print(f"    Latest: {movement_dates[-1]}")

# 6. Sample data untuk analisis lebih lanjut
print(f"\n🔍 Sample Data Lengkap:")
sample_board = db.boards.find_one()
if sample_board:
    user_id = sample_board.get("user_id")
    user = db.users.find_one({"_id": ObjectId(user_id)})
    
    print(f"  User: {user.get('username', 'N/A')} ({user.get('email', 'N/A')})")
    
    for i, list_data in enumerate(sample_board.get("lists", [])[:2]):  # Show first 2 lists
        print(f"  List {i+1}: {list_data.get('title', 'N/A')}")
        cards = list_data.get("cards", [])
        
        for j, card in enumerate(cards[:2]):  # Show first 2 cards
            print(f"    Card {j+1}: {card.get('title', 'N/A')}")
            print(f"      ID: {card.get('id', 'N/A')}")
            print(f"      Created: {card.get('created_at', 'N/A')}")
            print(f"      Difficulty: {card.get('difficulty', 'N/A')}")
            print(f"      Learning Strategy: {card.get('learning_strategy', 'N/A')}")
            
            movements = card.get("column_movements", [])
            print(f"      Movements: {len(movements)}")
            for k, movement in enumerate(movements[:2]):  # Show first 2 movements
                print(f"        Movement {k+1}: {movement.get('fromColumn', 'N/A')} -> {movement.get('toColumn', 'N/A')} at {movement.get('timestamp', 'N/A')}")

print(f"\n{'='*60}")
print("REKOMENDASI RENTANG TANGGAL")
print(f"{'='*60}")

if card_dates:
    print(f"Berdasarkan data cards:")
    print(f"  Gunakan rentang: {card_dates[0].strftime('%Y-%m-%d')} hingga {card_dates[-1].strftime('%Y-%m-%d')}")

if movement_dates:
    print(f"Berdasarkan data movements:")
    print(f"  Gunakan rentang: {movement_dates[0].strftime('%Y-%m-%d')} hingga {movement_dates[-1].strftime('%Y-%m-%d')}")

client.close()