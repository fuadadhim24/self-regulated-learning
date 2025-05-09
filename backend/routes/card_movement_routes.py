from flask import Blueprint, jsonify, request
from controllers.card_movement_controller import create_card_movement, get_card_movements, get_latest_movement
from schemas.card_movement import CardMovementCreate
from flask_jwt_extended import jwt_required, get_jwt_identity

card_movement_bp = Blueprint('card_movement', __name__)

@card_movement_bp.route('/api/cards/<card_id>/movements', methods=['GET'])
@jwt_required()
def get_movements(card_id):
    try:
        movements = get_card_movements(card_id)
        return jsonify([movement.to_dict() for movement in movements]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@card_movement_bp.route('/api/cards/<card_id>/movements', methods=['POST'])
@jwt_required()
def create_movement(card_id):
    try:
        data = request.get_json()
        movement_data = CardMovementCreate(
            card_id=card_id,
            from_column=data['from_column'],
            to_column=data['to_column']
        )
        movement = create_card_movement(movement_data)
        return jsonify(movement.to_dict()), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@card_movement_bp.route('/api/cards/<card_id>/movements/latest', methods=['GET'])
@jwt_required()
def get_latest(card_id):
    try:
        movement = get_latest_movement(card_id)
        if movement:
            return jsonify(movement.to_dict()), 200
        return jsonify({"error": "No movements found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500 