import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PresenceToggle } from '@/components/dashboard/PresenceToggle';

describe('PresenceToggle', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders the initial presence label', () => {
    render(<PresenceToggle initial="in_office" />);
    expect(screen.getByText('In the Office')).toBeInTheDocument();
  });

  it('optimistically flips and POSTs to /api/metrics on toggle', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true });
    render(<PresenceToggle initial="in_office" />);

    fireEvent.click(screen.getByLabelText('Toggle work-from-home presence'));

    expect(screen.getByText('Working From Home')).toBeInTheDocument();
    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith('/api/metrics', expect.objectContaining({ method: 'POST' })));
  });

  it('rolls back and shows an error if the save fails', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false });
    render(<PresenceToggle initial="in_office" />);

    fireEvent.click(screen.getByLabelText('Toggle work-from-home presence'));

    await waitFor(() => expect(screen.getByText('In the Office')).toBeInTheDocument());
    expect(screen.getByRole('alert')).toHaveTextContent(/couldn't save/i);
  });
});
