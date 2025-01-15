from flask import jsonify, request
from utils.db import mongo
from models.user_model import User
from models.board_model import Board
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

    try:
        Board.create_initial_board(user_id)
    except Exception as e:
        print("Error creating default board:", e)
        return jsonify({"message": "User registered, but failed to create default board"}), 500

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