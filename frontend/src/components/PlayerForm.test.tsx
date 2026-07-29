import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PlayerForm from './PlayerForm';
import type { Player } from '../types';

const { createMock, updateMock } = vi.hoisted(() => ({
  createMock: vi.fn(),
  updateMock: vi.fn(),
}));

vi.mock('../api', () => ({
  playerAPI: {
    create: createMock,
    update: updateMock,
  },
}));

describe('PlayerForm', () => {
  beforeEach(() => {
    createMock.mockReset();
    createMock.mockResolvedValue({ id: 42, name: 'Mia', jersey_number: 10, position: 'Forward' });

    updateMock.mockReset();
    updateMock.mockResolvedValue({ id: 42, name: 'Mia123', jersey_number: 11, position: 'Defender' });
  });

  it('submits a new player and shows a success message', async () => {
    const user = userEvent.setup();
    const onPlayerAdded = vi.fn();

    render(<PlayerForm onPlayerAdded={onPlayerAdded} />);

    await user.type(screen.getByPlaceholderText(/lionel messi/i), 'Mia');
    await user.type(screen.getByPlaceholderText(/e\.g\., 10/i), '10');
    await user.selectOptions(screen.getByRole('combobox'), 'Forward');
    await user.click(screen.getByRole('button', { name: /add to roster/i }));

    await waitFor(() => expect(createMock).toHaveBeenCalledTimes(1));

    expect(createMock).toHaveBeenCalledWith({
      name: 'Mia',
      jersey_number: 10,
      position: 'Forward',
    });
    expect(onPlayerAdded).toHaveBeenCalledTimes(1);
    expect(screen.getByText(/player added to roster successfully/i)).toBeInTheDocument();
  });

  it('submits player update and shows a success message', async () => {
    const user = userEvent.setup();
    const onPlayerUpdated = vi.fn();
    const playerData: Player = {
      id: 42,
      name: 'Mia',
      jersey_number: 10,
      position: 'Forward'
    }

    // provide initialData for edit mode
    render(<PlayerForm onPlayerUpdated={onPlayerUpdated} initialData={playerData} />);

    // verify initalData is displayed
    expect(screen.getByPlaceholderText(/lionel messi/i)).toHaveValue('Mia');
    expect(screen.getByPlaceholderText(/e\.g\., 10/i)).toHaveValue(10);
    expect(screen.getByRole('combobox')).toHaveValue('Forward');

    // make updates
    await user.clear(screen.getByPlaceholderText(/lionel messi/i));
    await user.type(screen.getByPlaceholderText(/lionel messi/i), 'Mia123');
    await user.clear(screen.getByPlaceholderText(/e\.g\., 10/i));
    await user.type(screen.getByPlaceholderText(/e\.g\., 10/i), '11');
    await user.selectOptions(screen.getByRole('combobox'), 'Defender');
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => expect(updateMock).toHaveBeenCalledTimes(1));

    expect(updateMock).toHaveBeenCalledWith(42, {
      name: 'Mia123',
      jersey_number: 11,
      position: 'Defender',
    });
    expect(onPlayerUpdated).toHaveBeenCalledTimes(1);
    expect(screen.getByText(/player updated successfully/i)).toBeInTheDocument();
  })
});
