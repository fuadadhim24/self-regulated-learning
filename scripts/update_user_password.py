import sys, os
# Add the project root and backend directory to the Python path
sys.path.append(os.getcwd())
sys.path.append(os.path.join(os.getcwd(), "backend"))

from backend.app import app
from werkzeug.security import generate_password_hash

with app.app_context():
    from utils.db import mongo
    user = mongo.db.users.find_one({"username": "User"})
    if not user:
        print("User 'User' not found.")
        sys.exit(1)
    new_hash = generate_password_hash("Asmarini@13", method="pbkdf2:sha256")
    result = mongo.db.users.update_one({"_id": user["_id"]}, {"$set": {"password": new_hash}})
    print("Password updated. Matched:", result.matched_count, "Modified:", result.modified_count)