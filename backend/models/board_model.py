from bson import ObjectId
from utils.db import mongo
class Board:
    @staticmethod
    def get_board(user_id):
        return mongo.db.boards.find_one({"user_id": ObjectId(user_id)})
    
    # TODO: Implement the following methods:
    @staticmethod
    def get_all_boards(user_id):
        return mongo.db.boards.find({"user_id": ObjectId(user_id)})
    
    @staticmethod
    def create_board(user_id, name):
        board = {
            "user_id": ObjectId(user_id),
            "name": name,
            "lists": [],
            "starred": False
        }
        result = mongo.db.boards.insert_one(board)
        return str(result.inserted_id)

    @staticmethod
    def update_board(user_id, lists):
        result = mongo.db.boards.update_one(
            {"user_id": ObjectId(user_id)},
            {"$set": {"lists": lists}}
        )
        return result
    
    @staticmethod
    def star_board(board_id, user_id):
        result = mongo.db.boards.update_one(
            {"_id": ObjectId(board_id), "user_id": ObjectId(user_id)},
            {"$set": {"starred": True}}
        )
        return result
    
    @staticmethod
    def unstar_board(board_id, user_id):
        result = mongo.db.boards.update_one(
            {"_id": ObjectId(board_id), "user_id": ObjectId(user_id)},
            {"$set": {"starred": False}}
        )
        return result
    
    @staticmethod
    def get_starred_boards(user_id):
        boards = mongo.db.boards.find({"user_id": ObjectId(user_id), "starred": True})
        return list(boards)

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
