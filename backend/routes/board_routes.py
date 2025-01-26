from flask import Blueprint
from controllers import board_controller

board_bp = Blueprint("board_bp", __name__)

board_bp.route("/board", methods=["GET"])(board_controller.get_board)
board_bp.route("/update-board", methods=["POST"])(board_controller.update_board)
board_bp.route("/create-board", methods=["POST"])(board_controller.create_board)
board_bp.route("/update-card", methods=["POST"])(board_controller.update_card)
board_bp.route("/progress-report", methods=["GET"])(board_controller.get_progress_report)
