from flask import jsonify, request
from bson.objectid import ObjectId
from utils.db import mongo
from models.user_model import User
from werkzeug.security import generate_password_hash, check_password_hash
import logging
from datetime import datetime, timedelta
import jwt
import secrets
import smtplib
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
    users = list(mongo.db.users.find({}, {"password": 0}))  # Exclude password from response
    for user in users:
        user["_id"] = str(user["_id"])  # Convert ObjectId to string for JSON compatibility
    return jsonify(users), 200

# Get user by username
def get_user_by_username(username):
    user = User.find_user_by_username(username)
    if not user:
        return jsonify({"message": "User not found"}), 404
    user["_id"] = str(user["_id"])  # Convert ObjectId to string
    user.pop("password", None)  # Exclude password from response
    return jsonify(user), 200

# Update user details
def update_user():
    auth_header = request.headers.get("Authorization", "")
    user_id = get_user_id_from_token(auth_header)

    user_data = request.json
    if not user_data:
        return jsonify({"message": "No data provided"}), 400

    allowed_updates = {"first_name", "last_name", "email", "username"}
    updates = {key: value for key, value in user_data.items() if key in allowed_updates}

    result = mongo.db.users.update_one({"_id": ObjectId(user_id)}, {"$set": updates})

    if result.modified_count == 0:
        return jsonify({"message": "User not found or no changes made"}), 404

    return jsonify({"message": "Profile updated successfully"}), 200

def update_user_password():
    # Get token from headers
    auth_header = request.headers.get("Authorization", "")
    user_id = get_user_id_from_token(auth_header)

    if not user_id:
        return jsonify({"message": "Invalid or missing token"}), 401

    data = request.get_json()
    current_password = data.get("current_password")
    new_password = data.get("new_password")

    if not current_password or not new_password:
        return jsonify({"message": "Both current and new passwords are required"}), 400

    user = mongo.db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        return jsonify({"message": "User not found"}), 404

    if not check_password_hash(user["password"], current_password):
        return jsonify({"message": "Current password is incorrect"}), 400

    hashed = generate_password_hash(new_password)
    mongo.db.users.update_one({"_id": ObjectId(user_id)}, {"$set": {"password": hashed}})

    return jsonify({"message": "Password updated successfully"}), 200
# Delete user
def delete_user(user_id):
    result = mongo.db.users.delete_one({"_id": ObjectId(user_id)})
    if result.deleted_count == 0:
        return jsonify({"message": "User not found"}), 404
    return jsonify({"message": "User deleted successfully"}), 200

# Get user by ID (helper for JWT identity)
def get_user_by_id(user_id):
    try:
        user = User.find_user_by_id(user_id)
        if not user:
            return jsonify({"message": "User not found"}), 404
        user["_id"] = str(user["_id"])  # Convert ObjectId to string for JSON compatibility
        user.pop("password", None)  # Exclude password from response
        return jsonify(user), 200
    except Exception as e:
        return jsonify({"message": "An error occurred", "error": str(e)}), 500

# Debug function to list all users with their IDs
def debug_list_users():
    users = list(mongo.db.users.find({}, {"password": 0}))  # Exclude password from response
    for user in users:
        user["_id"] = str(user["_id"])  # Convert ObjectId to string
    return jsonify({
        "message": "Debug: All users in database",
        "users": users
    }), 200

def send_reset_email(email: str, token: str) -> bool:
    """Send password reset email."""
    try:
        if not all([SMTP_USERNAME, SMTP_PASSWORD]):
            logger.error("SMTP credentials not configured")
            return False

        # Create message
        msg = MIMEMultipart()
        msg['From'] = SMTP_USERNAME
        msg['To'] = email
        msg['Subject'] = "Password Reset Request"

        reset_link = f"gamatutor.id/reset-password?token={token}"
        
        # Email body
        body = f"""
        Hello,

        You have requested to reset your password. Click the link below to reset it:

        {reset_link}

        If you did not request this reset, please ignore this email.

        This link will expire in 1 hour.

        Best regards,
        GAMATUTOR.ID Team
        """
        
        msg.attach(MIMEText(body, 'plain'))

        # Send email
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.send_message(msg)
            
        logger.info(f"Reset email sent to {email}")
        return True
        
    except Exception as e:
        logger.error(f"Error sending reset email: {str(e)}")
        return False

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
