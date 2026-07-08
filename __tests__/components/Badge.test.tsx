import { render, screen } from '@testing-library/react';
import { Badge } from '@/components/ui/Badge';

describe('Badge', () => {
  it('renders children text', () => {
    render(<Badge>Manager</Badge>);
    expect(screen.getByText('Manager')).toBeInTheDocument();
  });

  it('applies the neutral tone by default', () => {
    render(<Badge>Default</Badge>);
    expect(screen.getByText('Default')).toHaveClass('bg-surface-container');
  });

  it('applies the danger tone when specified', () => {
    render(<Badge tone="danger">3 alerts</Badge>);
    expect(screen.getByText('3 alerts')).toHaveClass('bg-error-container');
  });
});
