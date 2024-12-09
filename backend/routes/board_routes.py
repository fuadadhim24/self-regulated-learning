from flask import Blueprint
from controllers.board_controller import get_board, update_board, update_card

board_bp = Blueprint("board_bp", __name__)

board_bp.route("/board", methods=["GET"])(get_board)
board_bp.route("/update-board", methods=["POST"])(update_board)
board_bp.route("/update-card", methods=["POST"])(update_card)
