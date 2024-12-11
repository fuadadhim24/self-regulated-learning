from flask import jsonify, request
from models.board_model import Board
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity

def get_board():
    verify_jwt_in_request()
    user_id = get_jwt_identity()
    board = Board.get_board(user_id)

    if not board:
        return jsonify({"message": "Board not found"}), 404

    return jsonify({"lists": board["lists"]}), 200

def create_board():
    verify_jwt_in_request()
    user_id = get_jwt_identity()
    name = request.json.get("name")

    if not name:
        return jsonify({"message": "Missing board name"}), 400

    board_id = Board.create_board(user_id, name)
    return jsonify({"message": "Board created successfully", "board_id": board_id}), 201

def update_board():
    verify_jwt_in_request()
    user_id = get_jwt_identity()
    lists = request.json.get("lists")

    if not lists:
        return jsonify({"message": "Missing lists data"}), 400

    result = Board.update_board(user_id, lists)

    if result.modified_count == 0:
        return jsonify({"message": "Board not found or not modified"}), 404

    return jsonify({"message": "Board updated successfully"}), 200

def star_board():
    verify_jwt_in_request()
    user_id = get_jwt_identity()
    board_id = request.json.get("board_id")

    if not board_id:
        return jsonify({"message": "Missing board ID"}), 400

    result = Board.star_board(board_id, user_id)

    if result.modified_count == 0:
        return jsonify({"message": "Board not found or already starred"}), 404

    return jsonify({"message": "Board starred successfully"}), 200

def unstar_board():
    verify_jwt_in_request()
    user_id = get_jwt_identity()
    board_id = request.json.get("board_id")

    if not board_id:
        return jsonify({"message": "Missing board ID"}), 400

    result = Board.unstar_board(board_id, user_id)

    if result.modified_count == 0:
        return jsonify({"message": "Board not found or already unstarred"}), 404

    return jsonify({"message": "Board unstarred successfully"}), 200

def get_starred_boards():
    verify_jwt_in_request()
    user_id = get_jwt_identity()
    boards = Board.get_starred_boards(user_id)

    return jsonify({"starred_boards": boards}), 200

def update_card():
    verify_jwt_in_request()
    user_id = get_jwt_identity()
    card_id = request.json.get("card_id")
    description = request.json.get("description")
    difficulty = request.json.get("difficulty")

    if not card_id:
        return jsonify({"message": "Missing card ID"}), 400

    result, status_code = Board.update_card(user_id, card_id, description, difficulty)
    return jsonify(result), status_code
