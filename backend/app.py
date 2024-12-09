from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_pymongo import PyMongo
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from bson import ObjectId
import os

app = Flask(__name__)
CORS(app)

# MongoDB configuration
app.config["MONGO_URI"] = "mongodb://localhost:27017/srl_db"
mongo = PyMongo(app)

# JWT configuration
app.config["JWT_SECRET_KEY"] = os.environ.get("JWT_SECRET_KEY", "your-secret-key")
jwt = JWTManager(app)


@app.route("/register", methods=["POST"])
def register():
    username = request.json.get("username")
    password = request.json.get("password")

    if not username or not password:
        return jsonify({"message": "Missing username or password"}), 400

    existing_user = mongo.db.users.find_one({"username": username})
    if existing_user:
        return jsonify({"message": "Username already exists"}), 400

    hashed_password = generate_password_hash(password)
    user_id = mongo.db.users.insert_one({"username": username, "password": hashed_password}).inserted_id

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


@app.route("/login", methods=["POST"])
def login():
    username = request.json.get("username")
    password = request.json.get("password")

    user = mongo.db.users.find_one({"username": username})
    if not user or not check_password_hash(user["password"], password):
        return jsonify({"message": "Invalid username or password"}), 401

    access_token = create_access_token(identity=str(user["_id"]))
    return jsonify({"token": access_token}), 200


@app.route("/board", methods=["GET"])
@jwt_required()
def get_board():
    user_id = get_jwt_identity()
    board = mongo.db.boards.find_one({"user_id": ObjectId(user_id)})

    if not board:
        return jsonify({"message": "Board not found"}), 404

    return jsonify({"lists": board["lists"]}), 200


@app.route("/update-board", methods=["POST"])
@jwt_required()
def update_board():
    user_id = get_jwt_identity()
    lists = request.json.get("lists")

    if not lists:
        return jsonify({"message": "Missing lists data"}), 400

    result = mongo.db.boards.update_one(
        {"user_id": ObjectId(user_id)},
        {"$set": {"lists": lists}}
    )

    if result.modified_count == 0:
        return jsonify({"message": "Board not found or not modified"}), 404

    return jsonify({"message": "Board updated successfully"}), 200


@app.route("/update-card", methods=["POST"])
@jwt_required()
def update_card():
    user_id = get_jwt_identity()
    card_id = request.json.get("card_id")
    description = request.json.get("description")
    difficulty = request.json.get("difficulty")

    if not card_id:
        return jsonify({"message": "Missing card ID"}), 400

    board = mongo.db.boards.find_one({"user_id": ObjectId(user_id)})
    if not board:
        return jsonify({"message": "Board not found"}), 404

    updated = False
    for list_ in board["lists"]:
        for card in list_["cards"]:
            if card["id"] == card_id:
                if description is not None:
                    card["description"] = description
                if difficulty is not None:
                    if difficulty not in ["easy", "medium", "hard"]:
                        return jsonify({"message": "Invalid difficulty"}), 400
                    card["difficulty"] = difficulty
                updated = True
                break
        if updated:
            break

    if not updated:
        return jsonify({"message": "Card not found"}), 404

    mongo.db.boards.update_one(
        {"user_id": ObjectId(user_id)},
        {"$set": {"lists": board["lists"]}}
    )

    return jsonify({"message": "Card updated successfully"}), 200


if __name__ == "__main__":
    app.run(debug=True)