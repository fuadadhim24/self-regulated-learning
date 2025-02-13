from bson import ObjectId
from flask_pymongo import PyMongo
from utils.db import mongo

class Board:
    @staticmethod
    def create_initial_board(user_id):
        initial_board = {
            "user_id": user_id,
            "name": "Self-Regulated Learning",
            "lists": [
                {"id": "list1", "title": "Planning (To Do)", "cards": []},
                {"id": "list2", "title": "Monitoring (In Progress)", "cards": []},
                {"id": "list3", "title": "Controlling (Review)", "cards": []},
                {"id": "list4", "title": "Reflection (Done)", "cards": []}
            ]
        }
        mongo.db.boards.insert_one(initial_board)

    @staticmethod
    def find_board_by_user_id(user_id):
        return mongo.db.boards.find_one({"user_id": ObjectId(user_id)})

    @staticmethod
    def update_board(board_id, user_id, lists):
        result = mongo.db.boards.update_one(
            {"_id": ObjectId(board_id), "user_id": ObjectId(user_id)},
            {"$set": {"lists": lists}}
        )
        return result

    @staticmethod
    def update_card(user_id, card_id, title=None, sub_title=None, description=None, difficulty=None):
        board = mongo.db.boards.find_one({"user_id": ObjectId(user_id)})
        updated = False

        # Iterate through lists and cards to find the card by ID
        for list_ in board["lists"]:
            for card in list_["cards"]:
                if card["id"] == card_id:
                    # Update the fields if provided
                    if title is not None:
                        card["title"] = title
                    if sub_title is not None:
                        card["sub_title"] = sub_title
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

        # Update the board in the database
        mongo.db.boards.update_one(
            {"user_id": ObjectId(user_id)},
            {"$set": {"lists": board["lists"]}}
        )

        return {"message": "Card updated successfully"}, 200
