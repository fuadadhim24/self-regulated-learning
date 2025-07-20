import logging
from flask_jwt_extended import decode_token
from services.user import User

logger = logging.getLogger(__name__)

def get_user_id_from_token(token: str) -> str:
    """Extract user_id from JWT token"""
    try:
        logger.debug(f"Received token: {token[:20]}...")
        if token.startswith('Bearer '):
            token = token[7:]
            logger.debug("Removed 'Bearer ' prefix")
        logger.debug("Attempting to decode token...")
        decoded_token = decode_token(token)
        user_id = decoded_token.get('sub')
        logger.debug(f"Decoded user_id: {user_id}")
        user = User.find_user_by_id(user_id)
        if not user:
            logger.warning(f"User not found for id: {user_id}")
            return None
        logger.info(f"User found: {user.get('username')}")
        return user_id
    except Exception as e:
        logger.error(f"Error decoding token: {str(e)}")
        return None 