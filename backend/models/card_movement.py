from datetime import datetime
from bson import ObjectId
from typing import Optional

class CardMovement:
    def __init__(self, card_id: str, from_column: str, to_column: str, timestamp: datetime = None):
        self.card_id = card_id
        self.from_column = from_column
        self.to_column = to_column
        self.timestamp = timestamp or datetime.utcnow()

    def to_dict(self):
        return {
            "card_id": self.card_id,
            "from_column": self.from_column,
            "to_column": self.to_column,
            "timestamp": self.timestamp
        }

    @classmethod
    def from_dict(cls, data: dict):
        return cls(
            card_id=data["card_id"],
            from_column=data["from_column"],
            to_column=data["to_column"],
            timestamp=data["timestamp"]
        ) 