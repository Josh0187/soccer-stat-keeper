import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import MatchLogger from './MatchLogger';

const { createMock, logStatMock } = vi.hoisted(() => ({
  createMock: vi.fn(),
  logStatMock: vi.fn(),
}));

vi.mock('../api', () => ({
  gameAPI: {
    create: createMock,
    logStat: logStatMock,
  },
}));

describe('MatchLogger', () => {
  beforeEach(() => {
    createMock.mockReset();
    logStatMock.mockReset();
    createMock.mockResolvedValue({ id: 7, opponent: 'Rivals', date: '2024-05-10', goals_for: 2, goals_against: 1, outcome: 'Win' });
    logStatMock.mockResolvedValue({ id: 9, game_id: 7, player_id: 2, goals: 1, assists: 0, yellow_cards: 0, minutes_played: 90 });
  });

  it('records a match and player stats after the form is submitted', async () => {
    const user = userEvent.setup();
    const onMatchLogged = vi.fn();
    const players = [{ id: 2, name: 'Mia', jersey_number: 10, position: 'Forward' }];

    const { container } = render(<MatchLogger players={players} onMatchLogged={onMatchLogged} />);

    await user.type(screen.getByPlaceholderText(/e\.g\. fc barcelona/i), 'Rivals');
    const dateInput = container.querySelector('input[type="date"]') as HTMLInputElement;
    await user.clear(dateInput);
    await user.type(dateInput, '2024-05-10');

    await user.click(screen.getByRole('button', { name: /add contributor/i }));

    const playerSelect = Array.from(container.querySelectorAll('select')).find((select) =>
      Array.from(select.options).some((option) => option.textContent?.includes('Select Player'))
    );

    expect(playerSelect).toBeTruthy();
    if (playerSelect) {
      await user.selectOptions(playerSelect, '2');
    }

    await user.click(screen.getByRole('button', { name: /save complete match card/i }));

    await waitFor(() => expect(createMock).toHaveBeenCalledTimes(1));

    expect(createMock).toHaveBeenCalledWith({
      opponent: 'Rivals',
      date: '2024-05-10',
      goals_for: 0,
      goals_against: 0,
      outcome: 'Draw',
    });
    expect(logStatMock).toHaveBeenCalledWith({
      game_id: 7,
      player_id: 2,
      goals: 0,
      assists: 0,
      yellow_cards: 0,
      minutes_played: 90,
    });
    expect(onMatchLogged).toHaveBeenCalledTimes(1);
    expect(screen.getByText(/game and player statistics saved successfully/i)).toBeInTheDocument();
  });
});
