from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class CardMovementBase(BaseModel):
    card_id: str
    from_column: str
    to_column: str
    timestamp: datetime

class CardMovementCreate(CardMovementBase):
    pass

class CardMovement(CardMovementBase):
    id: str

    class Config:
        from_attributes = True 