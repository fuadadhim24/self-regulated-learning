from flask import jsonify, request
from services.board import Board
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request

@jwt_required()
def get_board():
    verify_jwt_in_request()
    user_id = get_jwt_identity()
    board = Board.find_board_by_user_id(user_id)

    if not board:
        return jsonify({"message": "Board not found"}), 404

    return jsonify({
        "id": str(board["_id"]),
        "name": board["name"],
        "lists": board["lists"]
    }), 200

def get_all_boards():
    boards = Board.get_all_boards()
    return jsonify([
        {"id": str(board["_id"]), "name": board["name"], "lists": board["lists"]}
        for board in boards
    ]), 200

def get_board_by_user_id(user_id):
    board = Board.find_board_by_user_id(user_id)
    if not board:
        return jsonify({"message": "Board not found"}), 404

    return jsonify({
        "id": str(board["_id"]),
        "name": board["name"],
        "lists": board["lists"]
    }), 200

@jwt_required()
def update_board():
    verify_jwt_in_request()
    user_id = get_jwt_identity()
    board_id = request.json.get("boardId")
    lists = request.json.get("lists")

    if not board_id or not lists:
        return jsonify({"message": "Missing Board ID or lists data"}), 400

    result = Board.update_board(board_id, user_id, lists)

    if result.modified_count == 0:
        return jsonify({"message": "Board not found or not modified"}), 404

    return jsonify({"message": "Board updated successfully"}), 200

@jwt_required()
def search_boards():
    user_id = get_jwt_identity()
    query = request.args.get("q", "")
    
    if not query:
        return jsonify({"message": "Missing search query"}), 400
    
    boards = Board.search_boards(user_id, query)
    
    return jsonify([
        {"id": str(board["_id"]), "name": board["name"]}
        for board in boards
    ]), 200

def update_card():
    verify_jwt_in_request()
    user_id = get_jwt_identity()
    card_id = request.json.get("card_id")
    title = request.json.get("title")
    sub_title = request.json.get("sub_title")
    description = request.json.get("description")
    difficulty = request.json.get("difficulty")

    if not card_id:
        return jsonify({"message": "Missing card ID"}), 400

    result, status_code = Board.update_card(user_id, card_id, title, sub_title, description, difficulty)
    return jsonify(result), status_code

@jwt_required()
def get_progress_report():
    user_id = get_jwt_identity()
    report = Board.get_progress_report(user_id)
    if not report:
        return jsonify({"message": "Board not found"}), 404
    return jsonify(report), 200
