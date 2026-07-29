from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Response, status
from sqlalchemy.orm import Session
import os

# load env vars
from dotenv import load_dotenv
load_dotenv()


# custon database util
import models
import schemas
from database import engine, get_db

# auto-create tables (from models.py) in the database if they dont already exist
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Soccer StatKeeper API")

# configure CORS
FRONTEND_URL = os.getenv("FRONTEND_URL")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API ENDPOINTS

# health check route
@app.get("/")
def read_root():
    return {"status": "Soccer API is running smoothly"}


# add a new player to the team
@app.post("/api/players", status_code=status.HTTP_201_CREATED)
def create_player(player: schemas.PlayerCreate, db: Session = Depends(get_db)):
    db_player = models.Player(
        name=player.name, 
        jersey_number=player.jersey_number, 
        position=player.position
    )
    db.add(db_player)
    db.commit()
    db.refresh(db_player)
    return db_player

# update a player on the team
@app.patch("/api/players/{player_id}", status_code=status.HTTP_200_OK)
def update_player(player_id: int, player_data: schemas.PlayerUpdate, db: Session = Depends(get_db)):
    # check if player exists
    player = db.query(models.Player).filter(models.Player.id == player_id).first()
    if not player:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Player not found")

    # update player attributes
    update_data = player_data.model_dump(exclude_unset=True)

    for key, val in update_data.items():
        setattr(player, key, val)

    db.commit()
    db.refresh(player)
    return player

# delete a player from the team
@app.delete("/api/players/{player_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_player(player_id: int, db: Session = Depends(get_db)):
    # check if player exists
    player = db.query(models.Player).filter(models.Player.id == player_id).first()
    if not player:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Player not found")
    
    db.delete(player)
    db.commit()

    return Response(status_code=status.HTTP_204_NO_CONTENT)

# get all players on the team
@app.get("/api/players")
def get_players(db: Session = Depends(get_db)):
    return db.query(models.Player).all()

# get single player on team
@app.get("/api/players/{player_id}")
def get_player(player_id: int, db: Session = Depends(get_db)):
    # player should exist
    player = db.query(models.Player).filter(models.Player.id == player_id).first()
    
    if not player:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"Player with ID {player_id} not found"
        )
        
    return player

# log a new game and match score
@app.post("/api/games", status_code=status.HTTP_201_CREATED)
def create_game(game: schemas.GameCreate, db: Session = Depends(get_db)):
    db_game = models.Game(
        date=game.date,
        opponent=game.opponent,
        goals_for=game.goals_for,
        goals_against=game.goals_against,
        outcome=game.outcome
    )
    db.add(db_game)
    db.commit()
    db.refresh(db_game)
    return db_game


# log stats for a player
@app.post("/api/stats", status_code=status.HTTP_201_CREATED)
def log_match_stats(stat: schemas.MatchStatCreate, db: Session = Depends(get_db)):
    # check that player exists first
    player_exists = db.query(models.Player).filter(models.Player.id == stat.player_id).first()
    if not player_exists:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Player not found")
        
    db_stat = models.MatchStat(
        game_id=stat.game_id,
        player_id=stat.player_id,
        goals=stat.goals,
        assists=stat.assists,
        yellow_cards=stat.yellow_cards,
        minutes_played=stat.minutes_played
    )
    db.add(db_stat)
    db.commit()
    db.refresh(db_stat)
    return db_stat

# get leaderboard data
@app.get("/api/leaderboard")
def get_leaderboard(db: Session = Depends(get_db)):
    players = db.query(models.Player).all()
    leaderboard = []

    for player in players:
        total_goals = 0
        total_assists = 0
        
        # get total goals and assists
        for stat in player.stats:
            total_goals += stat.goals
            total_assists += stat.assists
            
        leaderboard.append({
            "id": player.id,
            "name": player.name,
            "jersey_number": player.jersey_number,
            "position": player.position,
            "goals": total_goals,
            "assists": total_assists,
            "points": total_goals + total_assists
        })
        
    # sort by goals
    leaderboard.sort(key=lambda x: x["goals"], reverse=True)
    return leaderboard

# get recent match history
@app.get("/api/games")
def get_recent_games(db: Session = Depends(get_db)):
    return db.query(models.Game).order_by(models.Game.date.desc()).all()

