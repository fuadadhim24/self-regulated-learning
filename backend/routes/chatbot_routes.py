from flask import Blueprint
from controllers.chatbot_controller import chatbot_message

chatbot_bp = Blueprint("chatbot_bp", __name__)

chatbot_bp.route("/api/chatbot/message", methods=["POST"])(chatbot_message)