from flask import Blueprint
from controllers import study_session_controller

study_sessions_bp = Blueprint('study_sessions', __name__)

study_sessions_bp.route('/api/study-sessions/start', methods=['POST'])(study_session_controller.start_session)
study_sessions_bp.route('/api/study-sessions/end', methods=['POST'])(study_session_controller.end_session)
study_sessions_bp.route('/api/study-sessions/card/<card_id>', methods=['GET'])(study_session_controller.get_card_sessions) 