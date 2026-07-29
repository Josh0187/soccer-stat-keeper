import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PlayerDetail from './PlayerDetail';

const { getMock, deleteMock, navigateMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
  deleteMock: vi.fn(),
  navigateMock: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock('../api', () => ({
  playerAPI: {
    get: getMock,
    delete: deleteMock,
    update: vi.fn(),
  },
}));

describe('PlayerDetail', () => {
  beforeEach(() => {
    getMock.mockReset();
    deleteMock.mockReset();
    navigateMock.mockReset();
    window.confirm = vi.fn(() => true);
    window.alert = vi.fn();

    getMock.mockResolvedValue({ id: 1, name: 'Mia', jersey_number: 10, position: 'Forward' });
    deleteMock.mockResolvedValue(undefined);
  });

  it('deletes a player and navigates back to the dashboard', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/player/1']}>
        <Routes>
          <Route path="/player/:id" element={<PlayerDetail />} />
          <Route path="/" element={<div>Dashboard</div>} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText(/delete player/i)).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: /delete player/i }));

    await waitFor(() => expect(deleteMock).toHaveBeenCalledWith(1));
    expect(navigateMock).toHaveBeenCalledWith('/');
  });
});
