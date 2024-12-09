from bson import ObjectId
from flask_pymongo import PyMongo

mongo = PyMongo()

class Board:
    @staticmethod
    def get_board(user_id):
        return mongo.db.boards.find_one({"user_id": ObjectId(user_id)})

    @staticmethod
    def update_board(user_id, lists):
        result = mongo.db.boards.update_one(
            {"user_id": ObjectId(user_id)},
            {"$set": {"lists": lists}}
        )
        return result

    @staticmethod
    def update_card(user_id, card_id, description, difficulty):
        board = mongo.db.boards.find_one({"user_id": ObjectId(user_id)})
        updated = False
        for list_ in board["lists"]:
            for card in list_["cards"]:
                if card["id"] == card_id:
                    if description is not None:
                        card["description"] = description
                    if difficulty is not None:
                        if difficulty not in ["easy", "medium", "hard"]:
                            return {"message": "Invalid difficulty"}, 400
                        card["difficulty"] = difficulty
                    updated = True
                    break
            if updated:
                break
        if not updated:
            return {"message": "Card not found"}, 404
        mongo.db.boards.update_one(
            {"user_id": ObjectId(user_id)},
            {"$set": {"lists": board["lists"]}}
        )
        return {"message": "Card updated successfully"}, 200
