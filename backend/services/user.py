from werkzeug.security import generate_password_hash, check_password_hash
from utils.db import mongo
from bson.objectid import ObjectId
from datetime import datetime
import logging

class User:
    @staticmethod
    def create_user(first_name, last_name, email, username, password, role="user"):
        hashed_password = generate_password_hash(password)
        user_data = {
            "first_name": first_name,
            "last_name": last_name,
            "email": email,
            "username": username,
            "password": hashed_password,
            "role": role,
            "created_at": datetime.utcnow()
        }
        user_id = mongo.db.users.insert_one(user_data).inserted_id
        return user_id

    @staticmethod
    def find_user_by_username(username):
        return mongo.db.users.find_one({"username": username})
    
    @staticmethod
    def find_user_by_email(email):
        try:
            user = mongo.db.users.find_one({"email": email})
            return user
        except Exception as e:
            logging.error(f"Error finding user by email: {str(e)}")
            return None

    @staticmethod
    def validate_password(user, password):
        try:
            print(f"Validating password for user: {user['username']}")
            print(f"Input password: {password}")
            print(f"Stored hash: {user['password']}")
            result = check_password_hash(user['password'], password)
            print(f"Password validation result: {result}")
            return result
        except Exception as e:
            print(f"Error validating password: {str(e)}")
            return False

    @staticmethod
    def find_user_by_id(user_id):
        try:
            # First try to find the user directly
            user = mongo.db.users.find_one({"_id": ObjectId(user_id)})
            
            if not user:
                # If not found, try to find by string ID
                user = mongo.db.users.find_one({"_id": user_id})
            
            if not user:
                return None
                
            return user
        except Exception as e:
            print(f"Error finding user by ID: {str(e)}")
            return None

    @staticmethod
    def find_by_email(email):
        """Find user by email."""
        try:
            user = mongo.db.users.find_one({"email": email})
            return user
        except Exception as e:
            logging.error(f"Error finding user by email: {str(e)}")
            return None

    @staticmethod
    def find_by_reset_token(token):
        """Find user by reset token."""
        try:
            user = mongo.db.users.find_one({
                "reset_token": token,
                "reset_token_expiry": {"$gt": datetime.utcnow()}
            })
            return user
        except Exception as e:
            logging.error(f"Error finding user by reset token: {str(e)}")
            return None

    @staticmethod
    def update_reset_token(user_id, token, expiry):
        """Update user's reset token."""
        try:
            result = mongo.db.users.update_one(
                {"_id": ObjectId(user_id)},
                {
                    "$set": {
                        "reset_token": token,
                        "reset_token_expiry": expiry
                    }
                }
            )
            return result.modified_count > 0
        except Exception as e:
            logging.error(f"Error updating reset token: {str(e)}")
            return False

    @staticmethod
    def clear_reset_token(user_id):
        """Clear user's reset token."""
        try:
            result = mongo.db.users.update_one(
                {"_id": ObjectId(user_id)},
                {
                    "$unset": {
                        "reset_token": "",
                        "reset_token_expiry": ""
                    }
                }
            )
            return result.modified_count > 0
        except Exception as e:
            logging.error(f"Error clearing reset token: {str(e)}")
            return False

    @staticmethod
    def update_password(user_id, new_password):
        """Update user's password."""
        try:
            hashed_password = generate_password_hash(new_password)
            result = mongo.db.users.update_one(
                {"_id": ObjectId(user_id)},
                {"$set": {"password": hashed_password}}
            )
            return result.modified_count > 0
        except Exception as e:
            logging.error(f"Error updating password: {str(e)}")
            return False

    @staticmethod
    def update_existing_users():
        # Update all existing users that don't have created_at
        current_time = datetime.utcnow()
        result = mongo.db.users.update_many(
            {"created_at": {"$exists": False}},
            {"$set": {"created_at": current_time}}
        )
        return result.modified_count

    @staticmethod
    def get_all_users():
        users = list(mongo.db.users.find({}, {"password": 0}))
        for user in users:
            user["_id"] = str(user["_id"])
        return users

    @staticmethod
    def update_user(user_id, user_data):
        allowed_updates = {"first_name", "last_name", "email", "username"}
        updates = {key: value for key, value in user_data.items() if key in allowed_updates}
        result = mongo.db.users.update_one({"_id": ObjectId(user_id)}, {"$set": updates})
        return result

    @staticmethod
    def update_user_password(user_id, current_password, new_password):
        user = mongo.db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            return False, "User not found"
        if not check_password_hash(user["password"], current_password):
            return False, "Current password is incorrect"
        hashed = generate_password_hash(new_password)
        mongo.db.users.update_one({"_id": ObjectId(user_id)}, {"$set": {"password": hashed}})
        return True, None

    @staticmethod
    def delete_user(user_id):
        result = mongo.db.users.delete_one({"_id": ObjectId(user_id)})
        return result

    @staticmethod
    def debug_list_users():
        users = list(mongo.db.users.find({}, {"password": 0}))
        for user in users:
            user["_id"] = str(user["_id"])
        return users

    @staticmethod
    def send_reset_email(email: str, token: str, smtp_server, smtp_port, smtp_username, smtp_password, logger):
        import smtplib
        from email.mime.text import MIMEText
        from email.mime.multipart import MIMEMultipart
        try:
            if not all([smtp_username, smtp_password]):
                logger.error("SMTP credentials not configured")
                return False
            msg = MIMEMultipart('alternative')
            msg['From'] = smtp_username
            msg['To'] = email
            msg['Subject'] = "Password Reset Confirmation"
            reset_link = f"gamatutor.id/reset-password?token={token}"
            html = f"""
            <html><body>Reset your password: <a href='{reset_link}'>Reset Link</a></body></html>
            """
            text = f"Reset your password: {reset_link}"
            part1 = MIMEText(text, 'plain')
            part2 = MIMEText(html, 'html')
            msg.attach(part1)
            msg.attach(part2)
            with smtplib.SMTP(smtp_server, smtp_port) as server:
                server.starttls()
                server.login(smtp_username, smtp_password)
                server.sendmail(smtp_username, email, msg.as_string())
            return True
        except Exception as e:
            logger.error(f"Error sending reset email: {str(e)}")
            return False

