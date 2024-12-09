from flask import jsonify, request
from utils.db import mongo
from models.user_model import User
from flask_jwt_extended import create_access_token
from werkzeug.security import check_password_hash

def register():
    username = request.json.get("username")
    password = request.json.get("password")

    if not username or not password:
        return jsonify({"message": "Missing username or password"}), 400

    existing_user = User.find_user_by_username(username)
    if existing_user:
        return jsonify({"message": "Username already exists"}), 400

    user_id = User.create_user(username, password)

    # Create initial board for the user
    initial_board = {
        "user_id": user_id,
        "lists": [
            {"id": "list1", "title": "To Do", "cards": []},
            {"id": "list2", "title": "In Progress", "cards": []},
            {"id": "list3", "title": "Done", "cards": []}
        ]
    }
    mongo.db.boards.insert_one(initial_board)

    return jsonify({"message": "User registered successfully"}), 201


def login():
    username = request.json.get("username")
    password = request.json.get("password")

    user = User.find_user_by_username(username)
    if not user or not User.validate_password(user, password):
        return jsonify({"message": "Invalid username or password"}), 401

    access_token = create_access_token(identity=str(user["_id"]))
    return jsonify({"token": access_token}), 200
