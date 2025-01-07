from flask import jsonify, request
from utils.db import mongo
from models.user_model import User
from flask_jwt_extended import create_access_token
from werkzeug.security import check_password_hash

def register():
    first_name = request.json.get("firstName")
    last_name = request.json.get("lastName")
    email = request.json.get("email")
    username = request.json.get("username")
    password = request.json.get("password")

    if not all([first_name, last_name, email, username, password]):
        return jsonify({"message": "Missing required fields"}), 400

    existing_user = User.find_user_by_username(username)
    if existing_user:
        return jsonify({"message": "Username already exists"}), 400

    existing_email = User.find_user_by_email(email)
    if existing_email:
        return jsonify({"message": "Email already exists"}), 400
    
    user_id = User.create_user(first_name, last_name, email, username, password)

    # Create initial board for the user
    initial_board = {
        "user_id": user_id,
        "name": "Default Board",
        "lists": [
            {"id": "list1", "title": "To Do", "cards": []},
            {"id": "list2", "title": "In Progress", "cards": []},
            {"id": "list3", "title": "Done", "cards": []}
        ]
    }
    mongo.db.boards.insert_one(initial_board)

    return jsonify({"message": "User registered successfully"}), 201


def login():
    try:
        username = request.json.get("username")
        password = request.json.get("password")

        # Debugging statement
        print("MongoDB instance:", mongo)
        print("MongoDB database:", mongo.db)

        user = User.find_user_by_username(username)
        if not user or not User.validate_password(user, password):
            return jsonify({"message": "Invalid username or password"}), 401

        access_token = create_access_token(identity=str(user["_id"]))
        return jsonify({"token": access_token}), 200
    except Exception as e:
        print("Error during login:", str(e))
        return jsonify({"message": "An error occurred", "error": str(e)}), 500