from werkzeug.security import generate_password_hash, check_password_hash
from utils.db import mongo
import pymongo
from bson.objectid import ObjectId

class User:
    @staticmethod
    def create_user(first_name, last_name, email, username, password, role="user"):
        hashed_password = generate_password_hash(password)
        user_data = {
            "first_name": first_name,
            "last_name": last_name,
            "email": email,
            "username": username,
            "password": hashed_password,
            "role": role
        }
        user_id = mongo.db.users.insert_one(user_data).inserted_id
        return user_id

    @staticmethod
    def find_user_by_username(username):
        return mongo.db.users.find_one({"username": username})
    
    @staticmethod
    def find_user_by_email(email):
        return mongo.db.users.find_one({"email": email})

    @staticmethod
    def validate_password(user, password):
        return check_password_hash(user["password"], password)

    @staticmethod
    def find_user_by_id(user_id):
        try:
            if not ObjectId.is_valid(user_id):
                raise ValueError("Invalid ObjectId format")
            
            user = mongo.db.users.find_one({"_id": ObjectId(user_id)})
            return user
        except Exception as e:
            print(f"Error finding user: {e}")
            return None
