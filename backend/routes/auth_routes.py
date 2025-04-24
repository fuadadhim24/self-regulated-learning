from flask import Blueprint
from controllers import auth_controller, user_controller

auth_bp = Blueprint("auth_bp", __name__)

auth_bp.route("/api/register", methods=["POST"])(auth_controller.register)
auth_bp.route("/api/login", methods=["POST"])(auth_controller.login)
auth_bp.route("/api/request-reset", methods=["POST"])(user_controller.request_password_reset)
auth_bp.route("/api/reset-password", methods=["POST"])(user_controller.reset_password)
auth_bp.route("/api/refresh", methods=["POST"])(auth_controller.refresh)
auth_bp.route("/api/logout", methods=["POST"])(auth_controller.logout)