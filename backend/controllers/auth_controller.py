from flask import jsonify, request
from utils.db import mongo
from models.user_model import User
from models.board_model import Board
from flask_jwt_extended import create_access_token
from werkzeug.security import check_password_hash, generate_password_hash

def register():
    try:
        data = request.json
        first_name = data.get("firstName")
        last_name = data.get("lastName")
        email = data.get("email")
        username = data.get("username")
        password = data.get("password")

        print(f"Registration attempt for username: {username}")

        # Validate required fields
        if not all([first_name, last_name, email, username, password]):
            return jsonify({"message": "All fields are required"}), 400

        if User.find_user_by_username(username):
            print(f"Username already exists: {username}")
            return jsonify({"message": "Username already exists"}), 400

        if User.find_user_by_email(email):
            print(f"Email already exists: {email}")
            return jsonify({"message": "Email already exists"}), 400

        # Create user with all fields
        user_id = User.create_user(first_name, last_name, email, username, password)
        print(f"User created successfully with ID: {user_id}")

        # Create initial board for the user
        try:
            board_id = Board.create_initial_board(str(user_id))
            print(f"Initial board created for user {username} with ID: {board_id}")
        except Exception as e:
            print(f"Error creating initial board for user {username}: {str(e)}")
            # Don't fail registration if board creation fails
            # The board can be created later when needed

        return jsonify({"message": "User registered successfully"}), 201
    except Exception as e:
        print(f"Error during registration: {str(e)}")
        return jsonify({"message": "An error occurred", "error": str(e)}), 500


def login():
    try:
        username = request.json.get("username")
        password = request.json.get("password")

        print(f"Login attempt for username: {username}")

        user = User.find_user_by_username(username)
        if not user:
            print(f"User not found: {username}")
            return jsonify({"message": "Invalid username or password"}), 401

        print(f"User found: {username}")
        print(f"Stored password hash: {user['password']}")
        
        is_valid = User.validate_password(user, password)
        print(f"Password validation result: {is_valid}")

        if not is_valid:
            print(f"Invalid password for user: {username}")
            return jsonify({"message": "Invalid username or password"}), 401

        access_token = create_access_token(identity=str(user["_id"]))
        
        # Ensure role is included in response
        user_role = user.get("role", "user")  # Default role is "user" if not set

        print(f"Login successful for user: {username}")
        return jsonify({"token": access_token, "role": user_role}), 200
    except Exception as e:
        print(f"Error during login: {str(e)}")
        return jsonify({"message": "An error occurred", "error": str(e)}), 500
