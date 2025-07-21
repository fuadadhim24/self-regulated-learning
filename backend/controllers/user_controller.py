from flask import jsonify, request
from bson.objectid import ObjectId
from services.user import User
from werkzeug.security import generate_password_hash, check_password_hash
import logging
from datetime import datetime, timedelta
import jwt
import secrets
import smtplib
import re
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from utils.auth import get_user_id_from_token
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)  # Changed from DEBUG to INFO
# Set PyMongo logger to WARNING level to reduce debug messages
logging.getLogger('pymongo').setLevel(logging.WARNING)
logger = logging.getLogger(__name__)



# Email configuration
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")

# Get all users
def get_all_users():
    users = User.get_all_users()
    return jsonify(users), 200

# Get user by username
def get_user_by_username(username):
    try:
        decoded_username = request.view_args.get('username')
        user = User.find_user_by_username(decoded_username)
        if not user:
            return jsonify({"message": "User not found"}), 404
        user["_id"] = str(user["_id"])
        user.pop("password", None)
        # Add is_admin field based on role
        user["is_admin"] = user.get("role", "user") == "admin"
        return jsonify(user), 200
    except Exception as e:
        logger.error(f"Error getting user by username: {str(e)}")
        return jsonify({"message": "An error occurred", "error": str(e)}), 500

# Get current user
def get_current_user():
    try:
        auth_header = request.headers.get("Authorization", "")
        user_id = get_user_id_from_token(auth_header)
        if not user_id:
            return jsonify({"message": "Invalid or missing token"}), 401
        
        user = User.find_user_by_id(user_id)
        if not user:
            return jsonify({"message": "User not found"}), 404
        
        # Convert ObjectId to string and remove password
        user["_id"] = str(user["_id"])
        user.pop("password", None)
        
        # Add is_admin field based on role
        user["is_admin"] = user.get("role", "user") == "admin"
        
        return jsonify(user), 200
    except Exception as e:
        logger.error(f"Error getting current user: {str(e)}")
        return jsonify({"message": "An error occurred", "error": str(e)}), 500

# Update user details
def update_user():
    auth_header = request.headers.get("Authorization", "")
    user_id = get_user_id_from_token(auth_header)
    user_data = request.json
    if not user_data:
        return jsonify({"message": "No data provided"}), 400
    result = User.update_user(user_id, user_data)
    if result.modified_count == 0:
        return jsonify({"message": "User not found or no changes made"}), 404
    return jsonify({"message": "Profile updated successfully"}), 200

def update_user_password():
    auth_header = request.headers.get("Authorization", "")
    user_id = get_user_id_from_token(auth_header)
    if not user_id:
        return jsonify({"message": "Invalid or missing token"}), 401
    data = request.get_json()
    current_password = data.get("current_password")
    new_password = data.get("new_password")
    if not current_password or not new_password:
        return jsonify({"message": "Both current and new passwords are required"}), 400
    if len(new_password) < 8:
        return jsonify({"message": "Password must be at least 8 characters long"}), 400
    if not re.search(r"[A-Z]", new_password):
        return jsonify({"message": "Password must contain at least one uppercase letter"}), 400
    if not re.search(r"[0-9]", new_password):
        return jsonify({"message": "Password must contain at least one number"}), 400
    success, error = User.update_user_password(user_id, current_password, new_password)
    if not success:
        return jsonify({"message": error}), 400
    return jsonify({"message": "Password updated successfully"}), 200

def delete_user(user_id):
    result = User.delete_user(user_id)
    if result.deleted_count == 0:
        return jsonify({"message": "User not found"}), 404
    return jsonify({"message": "User deleted successfully"}), 200

def get_user_by_id(user_id):
    try:
        user = User.find_user_by_id(user_id)
        if not user:
            return jsonify({"message": "User not found"}), 404
        user["_id"] = str(user["_id"])
        user.pop("password", None)
        # Add is_admin field based on role
        user["is_admin"] = user.get("role", "user") == "admin"
        return jsonify(user), 200
    except Exception as e:
        return jsonify({"message": "An error occurred", "error": str(e)}), 500

def make_user_admin(user_id):
    """Make a user an admin."""
    try:
        success = User.make_user_admin(user_id)
        if success:
            return jsonify({"message": "User role updated to admin successfully"}), 200
        else:
            return jsonify({"message": "Failed to update user role"}), 400
    except Exception as e:
        logger.error(f"Error making user admin: {str(e)}")
        return jsonify({"message": "An error occurred", "error": str(e)}), 500

def debug_list_users():
    users = User.debug_list_users()
    return jsonify({
        "message": "Debug: All users in database",
        "users": users
    }), 200

def send_reset_email(email: str, token: str) -> bool:
    return User.send_reset_email(email, token, SMTP_SERVER, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD, logger)

def request_password_reset():
    """Handle password reset request."""
    try:
        data = request.get_json()
        email = data.get('email')
        
        if not email:
            return jsonify({'error': 'Email is required'}), 400
            
        user = User.find_by_email(email)
        if not user:
            # Return success even if user not found to prevent email enumeration
            return jsonify({'message': 'If an account exists with this email, you will receive a password reset link'}), 200
            
        # Generate reset token
        token = secrets.token_urlsafe(32)
        expiry = datetime.utcnow() + timedelta(hours=1)
        
        # Update user with reset token
        if not User.update_reset_token(str(user['_id']), token, expiry):
            return jsonify({'error': 'Failed to update reset token'}), 500
            
        # Send reset email
        if not send_reset_email(email, token):
            # Don't expose SMTP errors to the client
            return jsonify({
                'message': 'If an account exists with this email, you will receive a password reset link'
            }), 200
            
        return jsonify({
            'message': 'If an account exists with this email, you will receive a password reset link'
        }), 200
        
    except Exception as e:
        logger.error(f"Error in request_password_reset: {str(e)}")
        return jsonify({'error': 'An error occurred processing your request'}), 500

def reset_password():
    """Handle password reset."""
    try:
        data = request.get_json()
        token = data.get('token')
        new_password = data.get('new_password')
        
        if not token or not new_password:
            return jsonify({'error': 'Token and new password are required'}), 400
        
        if len(new_password) < 8:
            return jsonify({"error": "Password must be at least 8 characters long"}), 400
        if not re.search(r"[A-Z]", new_password):
            return jsonify({"error": "Password must contain at least one uppercase letter"}), 400
        if not re.search(r"[0-9]", new_password):
            return jsonify({"error": "Password must contain at least one number"}), 400
            
        # Find user with valid reset token
        user = User.find_by_reset_token(token)
        if not user:
            return jsonify({'error': 'Invalid or expired reset token'}), 400
            
        # Update password
        if not User.update_password(str(user['_id']), new_password):
            return jsonify({'error': 'Failed to update password'}), 500
            
        # Clear reset token
        if not User.clear_reset_token(str(user['_id'])):
            return jsonify({'error': 'Failed to clear reset token'}), 500
            
        return jsonify({'message': 'Password reset successful'}), 200
        
    except Exception as e:
        logger.error(f"Error in reset_password: {str(e)}")
        return jsonify({'error': str(e)}), 500
