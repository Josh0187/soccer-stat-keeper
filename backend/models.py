from sqlalchemy import Column, Integer, String, ForeignKey, Date
from sqlalchemy.orm import relationship, declarative_base

Base = declarative_base()

class Player(Base):
    __tablename__ = "players"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    jersey_number = Column(Integer, nullable=True)
    position = Column(String, nullable=True)
    
    # Player -> Match Stat
    stats = relationship("MatchStat", back_populates="player", cascade="all, delete", passive_deletes=True)

class Game(Base):
    __tablename__ = "games"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False)
    opponent = Column(String, nullable=False)
    goals_for = Column(Integer, default=0)
    goals_against = Column(Integer, default=0)
    outcome = Column(String, default="Draw")

    # Game -> MatchStat
    stats = relationship("MatchStat", back_populates="game")

class MatchStat(Base):
    __tablename__ = "match_stats"

    id = Column(Integer, primary_key=True, index=True)
    game_id = Column(Integer, ForeignKey("games.id"), nullable=False)
    player_id = Column(Integer, ForeignKey("players.id", ondelete="CASCADE"), nullable=False)
    
    # soccer specific stats
    goals = Column(Integer, default=0)
    assists = Column(Integer, default=0)
    yellow_cards = Column(Integer, default=0)
    minutes_played = Column(Integer, default=90)

    # MatchStat -> game
    game = relationship("Game", back_populates="stats")
    # MatchStat -> player
    player = relationship("Player", back_populates="stats")
