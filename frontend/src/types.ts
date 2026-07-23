export interface Player {
  id?: number; // Optional because the backend assigns this on creation
  name: string;
  jersey_number: number | null;
  position: string;
}

export interface Game {
  id?: number;
  date: string;
  opponent: string;
  goals_for: number;
  goals_against: number;
  outcome: 'Win' | 'Loss' | 'Draw';
}

export interface MatchStat {
  id?: number;
  game_id: number;
  player_id: number;
  goals: number;
  assists: number;
  yellow_cards: number;
  minutes_played: number;
}

export interface LeaderboardRow {
  id: number;
  name: string;
  jersey_number: number | null;
  position: string;
  goals: number;
  assists: number;
  points: number;
}