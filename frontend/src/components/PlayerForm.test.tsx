import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PlayerForm from './PlayerForm';

const { createMock } = vi.hoisted(() => ({
  createMock: vi.fn(),
}));

vi.mock('../api', () => ({
  playerAPI: {
    create: createMock,
    update: vi.fn(),
  },
}));

describe('PlayerForm', () => {
  beforeEach(() => {
    createMock.mockReset();
    createMock.mockResolvedValue({ id: 42, name: 'Mia', jersey_number: 10, position: 'Forward' });
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
});
