from flask import jsonify, request
from models.board_model import Board
from flask_jwt_extended import get_jwt_identity

def get_board():
    user_id = get_jwt_identity()
    board = Board.get_board(user_id)

    if not board:
        return jsonify({"message": "Board not found"}), 404

    return jsonify({"lists": board["lists"]}), 200


def update_board():
    user_id = get_jwt_identity()
    lists = request.json.get("lists")

    if not lists:
        return jsonify({"message": "Missing lists data"}), 400

    result = Board.update_board(user_id, lists)

    if result.modified_count == 0:
        return jsonify({"message": "Board not found or not modified"}), 404

    return jsonify({"message": "Board updated successfully"}), 200


def update_card():
    user_id = get_jwt_identity()
    card_id = request.json.get("card_id")
    description = request.json.get("description")
    difficulty = request.json.get("difficulty")

    if not card_id:
        return jsonify({"message": "Missing card ID"}), 400

    result, status_code = Board.update_card(user_id, card_id, description, difficulty)
    return jsonify(result), status_code
