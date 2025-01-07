from flask import Blueprint
from controllers import user_controller

user_bp = Blueprint("user_bp", __name__)

user_bp.route("/users", methods=["GET"])(user_controller.get_all_users)
user_bp.route("/users/<username>", methods=["GET"])(user_controller.get_user_by_username)
user_bp.route("/update-user", methods=["POST"])(user_controller.update_user)
user_bp.route("/delete-user", methods=["DELETE"])(user_controller.delete_user)
user_bp.route("/users/<user_id>", methods=["GET"])(user_controller.get_user_by_id)