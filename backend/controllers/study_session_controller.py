from flask import request, jsonify
from services.study_session import StudySession
from utils.auth import get_user_id_from_token

def start_session():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({"error": "No authorization header"}), 401
        user_id = get_user_id_from_token(auth_header)
        if not user_id:
            return jsonify({"error": "Invalid token"}), 401
        card_id = request.json.get('card_id')
        if not card_id:
            return jsonify({"error": "Missing card_id"}), 400
        session = StudySession.create_session(user_id, card_id)
        return jsonify(session), 201
    except Exception as e:
        print(f"Error starting study session: {str(e)}")
        return jsonify({"error": str(e)}), 500

def end_session():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({"error": "No authorization header"}), 401
        user_id = get_user_id_from_token(auth_header)
        if not user_id:
            return jsonify({"error": "Invalid token"}), 401
        session_id = request.json.get('session_id')
        if not session_id:
            return jsonify({"error": "Missing session_id"}), 400
        success = StudySession.end_session(session_id)
        if not success:
            return jsonify({"error": "Session not found"}), 404
        return jsonify({"message": "Session ended successfully"}), 200
    except Exception as e:
        print(f"Error ending study session: {str(e)}")
        return jsonify({"error": str(e)}), 500

def get_card_sessions(card_id):
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({"error": "No authorization header"}), 401
        user_id = get_user_id_from_token(auth_header)
        if not user_id:
            return jsonify({"error": "Invalid token"}), 401
        sessions = StudySession.get_sessions_by_card(card_id)
        total_time = StudySession.get_total_study_time(card_id)
        return jsonify({
            "sessions": sessions,
            "total_study_time_minutes": total_time
        }), 200
    except Exception as e:
        print(f"Error fetching study sessions: {str(e)}")
        return jsonify({"error": str(e)}), 500 