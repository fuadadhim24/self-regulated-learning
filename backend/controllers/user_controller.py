from flask import jsonify, request
from bson import ObjectId
from utils.db import mongo
from models.user_model import User
from werkzeug.security import generate_password_hash

# Get all users
def get_all_users():
    users = list(mongo.db.users.find({}, {"password": 0}))  # Exclude password from response
    for user in users:
        user["_id"] = str(user["_id"])  # Convert ObjectId to string for JSON compatibility
    return jsonify(users), 200

# Get user by username
def get_user_by_username(username):
    user = User.find_user_by_username(username)
    if not user:
        return jsonify({"message": "User not found"}), 404
    user["_id"] = str(user["_id"])  # Convert ObjectId to string
    user.pop("password", None)  # Exclude password from response
    return jsonify(user), 200

# Update user details
def update_user(user_id):
    user_data = request.json
    if not user_data:
        return jsonify({"message": "No data provided"}), 400

    allowed_updates = {"first_name", "last_name", "email", "username", "password"}
    updates = {key: value for key, value in user_data.items() if key in allowed_updates}

    if "password" in updates:
        updates["password"] = generate_password_hash(updates["password"])  # Hash the new password

    result = mongo.db.users.update_one({"_id": ObjectId(user_id)}, {"$set": updates})

    if result.modified_count == 0:
        return jsonify({"message": "User not found or no changes made"}), 404

    return jsonify({"message": "User updated successfully"}), 200

# Delete user
def delete_user(user_id):
    result = mongo.db.users.delete_one({"_id": ObjectId(user_id)})
    if result.deleted_count == 0:
        return jsonify({"message": "User not found"}), 404
    return jsonify({"message": "User deleted successfully"}), 200

# Get user by ID (helper for JWT identity)
def get_user_by_id(user_id):
    user = mongo.db.users.find_one({"_id": ObjectId(user_id)}, {"password": 0})  # Exclude password
    if not user:
        return jsonify({"message": "User not found"}), 404
    user["_id"] = str(user["_id"])  # Convert ObjectId to string
    return jsonify(user), 200
