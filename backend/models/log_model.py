from utils.db import mongo
from bson.objectid import ObjectId
from datetime import datetime

class Log:
    @staticmethod
    def create_log(username, action_type, description):
        """
        Create a new log entry
        
        Args:
            username (str): The username of the user
            action_type (str): The type of action (login, logout)
            description (str): Description of the log
            
        Returns:
            str: The ID of the created log
        """
        log = {
            "username": username,
            "action_type": action_type,
            "description": description,
            "created_at": datetime.utcnow()
        }
        
        result = mongo.db.logs.insert_one(log)
        return str(result.inserted_id)
    
    @staticmethod
    def get_all_logs(limit=100):
        """
        Get all logs, sorted by creation date (newest first)
        
        Args:
            limit (int): Maximum number of logs to return
            
        Returns:
            list: List of log objects
        """
        logs = list(mongo.db.logs.find().sort("created_at", -1).limit(limit))
        
        # Convert ObjectId to string and format dates
        for log in logs:
            log["id"] = str(log.pop("_id"))
            if isinstance(log.get("created_at"), datetime):
                log["created_at"] = log["created_at"].isoformat()
                
        return logs