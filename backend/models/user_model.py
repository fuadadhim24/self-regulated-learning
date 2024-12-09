from flask_pymongo import PyMongo
from werkzeug.security import generate_password_hash, check_password_hash

mongo = PyMongo()

class User:
    @staticmethod
    def create_user(username, password):
        hashed_password = generate_password_hash(password)
        user_id = mongo.db.users.insert_one({"username": username, "password": hashed_password}).inserted_id
        return user_id

    @staticmethod
    def find_user_by_username(username):
        return mongo.db.users.find_one({"username": username})

    @staticmethod
    def validate_password(user, password):
        return check_password_hash(user["password"], password)
