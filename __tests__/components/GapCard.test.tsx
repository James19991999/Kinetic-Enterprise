import { render, screen } from '@testing-library/react';
import { GapCard, type Gap } from '@/components/dashboard/GapCard';

const gap: Gap = {
  id: '1',
  icon: 'sync_problem',
  title: 'Missed Team Sync',
  description: 'Frontend architecture review from 09:00 AM.',
  actionLabel: 'Catch up on recording',
  severity: 'critical',
};

describe('GapCard', () => {
  it('renders the title, description, and action', () => {
    render(<GapCard gap={gap} />);
    expect(screen.getByText('Missed Team Sync')).toBeInTheDocument();
    expect(screen.getByText('Frontend architecture review from 09:00 AM.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Catch up on recording/i })).toBeInTheDocument();
  });

  it('links to the provided actionHref when present', () => {
    render(<GapCard gap={{ ...gap, actionHref: '/analytics/123' }} />);
    expect(screen.getByRole('link', { name: /Catch up on recording/i })).toHaveAttribute(
      'href',
      '/analytics/123'
    );
  });

  it('falls back to a working mailto: link when no actionHref is given', () => {
    render(<GapCard gap={gap} />);
    const link = screen.getByRole('link', { name: /Catch up on recording/i });
    expect(link.getAttribute('href')).toMatch(/^mailto:.+\?subject=/);
  });
});
