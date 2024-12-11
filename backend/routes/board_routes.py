from flask import Blueprint
from controllers.board_controller import get_board, update_board, update_card, create_board, star_board, unstar_board, get_starred_boards

board_bp = Blueprint("board_bp", __name__)

board_bp.route("/board", methods=["GET"])(get_board)
board_bp.route("/update-board", methods=["POST"])(update_board)
board_bp.route("/update-card", methods=["POST"])(update_card)
board_bp.route("/create-board", methods=["POST"])(create_board)
board_bp.route("/star-board", methods=["POST"])(star_board)
board_bp.route("/unstar-board", methods=["POST"])(unstar_board)
board_bp.route("/starred-boards", methods=["GET"])(get_starred_boards)