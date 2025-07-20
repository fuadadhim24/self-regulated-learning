from utils.db import mongo
from bson.objectid import ObjectId
from datetime import datetime

class LearningStrat:
    @staticmethod
    def add_learning_strat(learning_strat_name, description):
        learning_strat_data = {
            "learning_strat_name": learning_strat_name,
            "description": description,
            "created_at": datetime.utcnow()
        }
        learning_strat_id = mongo.db.learning_strats.insert_one(learning_strat_data).inserted_id
        return learning_strat_id
    
    @staticmethod
    def get_learning_strat(learning_strat_id):
        try:
            object_id = ObjectId(learning_strat_id)
        except:
            return None
        strat = mongo.db.learning_strats.find_one({"_id": object_id})
        if strat:
            strat["_id"] = str(strat["_id"])
        return strat
    
    @staticmethod
    def get_all_learning_strats():
        strats = list(mongo.db.learning_strats.find({}))
        for strat in strats:
            strat["_id"] = str(strat["_id"])
        return strats
    
    @staticmethod
    def update_learning_strat(learning_strat_id, updates):
        try:
            object_id = ObjectId(learning_strat_id)
        except:
            return None, "Invalid learning strategy ID"
        allowed_updates = {"learning_strat_name", "description"}
        filtered_updates = {key: value for key, value in updates.items() if key in allowed_updates}
        if not filtered_updates:
            return None, "No valid fields to update"
        result = mongo.db.learning_strats.update_one({"_id": object_id}, {"$set": filtered_updates})
        return result, None
    
    @staticmethod
    def delete_learning_strat(learning_strat_id):
        try:
            object_id = ObjectId(learning_strat_id)
        except:
            return None
        
        result = mongo.db.learning_strats.delete_one({"_id": object_id})
        return result

    @staticmethod
    def update_existing_strategies():
        # Update all existing strategies that don't have created_at
        current_time = datetime.utcnow()
        result = mongo.db.learning_strats.update_many(
            {"created_at": {"$exists": False}},
            {"$set": {"created_at": current_time}}
        )
        return result.modified_count