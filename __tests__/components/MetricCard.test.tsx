import { render, screen } from '@testing-library/react';
import { MetricCard } from '@/components/dashboard/MetricCard';

describe('MetricCard', () => {
  it('renders the label and value', () => {
    render(<MetricCard label="Office Utilization" value="72%" icon="apartment" />);
    expect(screen.getByText('72%')).toBeInTheDocument();
    expect(screen.getByText('Office Utilization')).toBeInTheDocument();
  });

  it('exposes an accessible figure label', () => {
    render(<MetricCard label="Engagement Score" value="84" icon="favorite" />);
    expect(screen.getByRole('figure', { name: 'Engagement Score: 84' })).toBeInTheDocument();
  });

  it('shows a positive delta with an up trend', () => {
    render(<MetricCard label="Focus Hours" value="5.2h" icon="trending_up" delta={4.2} />);
    expect(screen.getByText('4.2%')).toBeInTheDocument();
  });

  it('shows a negative delta with a down trend', () => {
    render(<MetricCard label="Focus Hours" value="5.2h" icon="trending_up" delta={-2.5} />);
    expect(screen.getByText('2.5%')).toBeInTheDocument();
  });

  it('renders optional help text when provided', () => {
    render(<MetricCard label="Active Employees" value="128" icon="group" helpText="Signed in this week" />);
    expect(screen.getByText('Signed in this week')).toBeInTheDocument();
  });

  it('renders as a working link when href is provided', () => {
    render(<MetricCard label="Engagement Score" value="84" icon="favorite" href="/engagement" />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/engagement');
  });

  it('renders as a non-interactive figure when no href is provided', () => {
    render(<MetricCard label="Engagement Score" value="84" icon="favorite" />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByRole('figure')).toBeInTheDocument();
  });
});
