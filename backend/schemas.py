from pydantic import BaseModel
from datetime import date
from typing import Optional

# player validation
class PlayerCreate(BaseModel):
    name: str
    jersey_number: Optional[int] = None
    position: Optional[str] = None

class PlayerUpdate(BaseModel):
    name: Optional[str] = None
    jersey_number: Optional[int] = None
    position: Optional[str] = None

# game validation
class GameCreate(BaseModel):
    date: date
    opponent: str
    goals_for: int
    goals_against: int
    outcome: str

# stats validation
class MatchStatCreate(BaseModel):
    game_id: int
    player_id: int
    goals: int
    assists: int
    yellow_cards: int
    minutes_played: int
