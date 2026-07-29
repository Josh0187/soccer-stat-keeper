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

describe('App empty state', () => {
  beforeEach(() => {
    getAllMock.mockReset();
    getLeaderboardMock.mockReset();
    getGamesMock.mockReset();

    getAllMock.mockResolvedValue([]);
    getLeaderboardMock.mockResolvedValue([]);
    getGamesMock.mockResolvedValue([]);
  });

  it('shows the empty-state messaging when there is no roster or match data', async () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText(/log match stats to calculate leaderboards/i)).toBeInTheDocument());
    expect(screen.getByText(/no matches logged yet/i)).toBeInTheDocument();
  });
});
