import os
import sys
from datetime import date
from pathlib import Path

import pytest
from fastapi import HTTPException
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR))

os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

import main
import schemas


@pytest.fixture()
def db_session():
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    main.models.Base.metadata.create_all(bind=engine)
    SessionLocal = sessionmaker(bind=engine)
    session = SessionLocal()

    try:
        yield session
    finally:
        session.close()


def test_create_player_persists_the_new_player(db_session):
    created = main.create_player(
        schemas.PlayerCreate(name="Mia", jersey_number=10, position="Forward"),
        db=db_session,
    )

    assert created.id is not None
    assert created.name == "Mia"
    assert created.jersey_number == 10
    assert created.position == "Forward"


def test_update_player_changes_only_supplied_fields(db_session):
    created = main.create_player(
        schemas.PlayerCreate(name="Jordan", jersey_number=7, position="Midfielder"),
        db=db_session,
    )

    updated = main.update_player(
        created.id,
        schemas.PlayerUpdate(name="Jordy", position="Defender"),
        db=db_session,
    )

    assert updated.id == created.id
    assert updated.name == "Jordy"
    assert updated.position == "Defender"
    assert updated.jersey_number == 7


def test_delete_player_removes_the_player_from_the_database(db_session):
    created = main.create_player(
        schemas.PlayerCreate(name="Alex", jersey_number=3, position="Defender"),
        db=db_session,
    )

    main.delete_player(created.id, db=db_session)

    players = main.get_players(db=db_session)
    assert players == []


def test_log_match_stats_raises_for_unknown_player(db_session):
    with pytest.raises(HTTPException) as exc_info:
        main.log_match_stats(
            schemas.MatchStatCreate(
                game_id=1,
                player_id=999,
                goals=2,
                assists=0,
                yellow_cards=0,
                minutes_played=90,
            ),
            db=db_session,
        )

    assert exc_info.value.status_code == 404
    assert exc_info.value.detail == "Player not found"


def test_get_leaderboard_sorts_players_by_goals_and_points(db_session):
    player_one = main.create_player(
        schemas.PlayerCreate(name="Lina", jersey_number=8, position="Forward"),
        db=db_session,
    )
    player_two = main.create_player(
        schemas.PlayerCreate(name="Noah", jersey_number=11, position="Winger"),
        db=db_session,
    )

    game = main.create_game(
        schemas.GameCreate(
            date=date(2024, 5, 10),
            opponent="Rivals",
            goals_for=3,
            goals_against=1,
            outcome="Win",
        ),
        db=db_session,
    )

    main.log_match_stats(
        schemas.MatchStatCreate(
            game_id=game.id,
            player_id=player_one.id,
            goals=2,
            assists=1,
            yellow_cards=0,
            minutes_played=90,
        ),
        db=db_session,
    )
    main.log_match_stats(
        schemas.MatchStatCreate(
            game_id=game.id,
            player_id=player_two.id,
            goals=1,
            assists=2,
            yellow_cards=1,
            minutes_played=89,
        ),
        db=db_session,
    )

    leaderboard = main.get_leaderboard(db=db_session)

    assert [entry["name"] for entry in leaderboard] == ["Lina", "Noah"]
    assert leaderboard[0]["goals"] == 2
    assert leaderboard[0]["assists"] == 1
    assert leaderboard[0]["points"] == 3
    assert leaderboard[1]["goals"] == 1
    assert leaderboard[1]["assists"] == 2
    assert leaderboard[1]["points"] == 3
