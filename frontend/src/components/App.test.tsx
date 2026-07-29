import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../App';

const { getAllMock, getLeaderboardMock, getGamesMock } = vi.hoisted(() => ({
  getAllMock: vi.fn(),
  getLeaderboardMock: vi.fn(),
  getGamesMock: vi.fn(),
}));

vi.mock('../api', () => ({
  playerAPI: {
    getAll: getAllMock,
    getLeaderboard: getLeaderboardMock,
  },
  gameAPI: {
    getAll: getGamesMock,
  },
}));

describe('App dashboard', () => {
  beforeEach(() => {
    getAllMock.mockReset();
    getLeaderboardMock.mockReset();
    getGamesMock.mockReset();

    getAllMock.mockResolvedValue([{ id: 1, name: 'Mia', jersey_number: 10, position: 'Forward' }]);
    getLeaderboardMock.mockResolvedValue([{ id: 1, name: 'Mia', jersey_number: 10, position: 'Forward', goals: 3, assists: 1, points: 4 }]);
    getGamesMock.mockResolvedValue([{ id: 5, date: '2024-05-10', opponent: 'Rivals', goals_for: 2, goals_against: 1, outcome: 'Win' }]);
  });

  it('renders leaderboard and match history from the API', async () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText('Player Leaderboard')).toBeInTheDocument());
    expect(screen.getByText('Mia')).toBeInTheDocument();
    expect(screen.getByText('Recent Match History')).toBeInTheDocument();
    expect(screen.getByText('vs Rivals')).toBeInTheDocument();
  });
});
