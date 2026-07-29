import axios from 'axios';
import type { Player, Game, MatchStat, LeaderboardRow } from './types';

const API_URL = import.meta.env.VITE_API_URL;

const API = axios.create({
  baseURL: `${API_URL}/api`,
});

export const playerAPI = {
  getAll: async (): Promise<Player[]> => {
    const response = await API.get<Player[]>('/players');
    return response.data;
  },
  get: async (playerId: number): Promise<Player> => {
    const response = await API.get<Player>(`/players/${playerId}`);
    return response.data;
  },
  create: async (playerData: Player): Promise<Player> => {
    const response = await API.post<Player>('/players', playerData);
    return response.data;
  },
  update: async (playerId: number, playerData: Partial<Player>): Promise<Player> => {
    const response = await API.patch<Player>(`/players/${playerId}`, playerData);
    return response.data;
  },
  delete: async (playerId: number): Promise<void> => {
    await API.delete(`/players/${playerId}`);
  },
  getLeaderboard: async (): Promise<LeaderboardRow[]> => {
    const response = await API.get<LeaderboardRow[]>('/leaderboard');
    return response.data;
  }
};

export const gameAPI = {
  create: async (gameData: Game): Promise<Game> => {
    const response = await API.post<Game>('/games', gameData);
    return response.data;
  },
  logStat: async (statData: MatchStat): Promise<MatchStat> => {
    const response = await API.post<MatchStat>('/stats', statData);
    return response.data;
  },
  getAll: async (): Promise<Game[]> => {
    const response = await API.get<Game[]>('/games');
    return response.data;
  }
};
