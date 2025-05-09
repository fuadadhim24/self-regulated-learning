from datetime import datetime
from typing import List, Optional
from models.card_movement import CardMovement
from schemas.card_movement import CardMovementCreate
from utils.db import mongo

def create_card_movement(movement: CardMovementCreate) -> CardMovement:
    movement_dict = movement.model_dump()
    movement_dict["timestamp"] = datetime.utcnow()
    
    result = mongo.db.card_movements.insert_one(movement_dict)
    movement_dict["_id"] = str(result.inserted_id)
    
    return CardMovement.from_dict(movement_dict)

def get_card_movements(card_id: str) -> List[CardMovement]:
    movements = list(mongo.db.card_movements.find({"card_id": card_id}).sort("timestamp", 1))
    
    return [CardMovement.from_dict({**movement, "_id": str(movement["_id"])}) for movement in movements]

def get_latest_movement(card_id: str) -> Optional[CardMovement]:
    movement = mongo.db.card_movements.find_one(
        {"card_id": card_id},
        sort=[("timestamp", -1)]
    )
    
    if movement:
        return CardMovement.from_dict({**movement, "_id": str(movement["_id"])})
    return None 