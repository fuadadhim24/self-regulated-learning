import logging
from functools import wraps
from flask import jsonify

def handle_exceptions(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except Exception as e:
            logger = logging.getLogger(func.__module__)
            logger.exception(f"Exception in {func.__name__}: {e}")
            return jsonify({"error": "Internal server error"}), 500
    return wrapper 