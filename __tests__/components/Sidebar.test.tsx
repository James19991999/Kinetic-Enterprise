import { render, screen } from '@testing-library/react';
import { Sidebar } from '@/components/layout/Sidebar';

jest.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
}));

describe('Sidebar', () => {
  it('renders the base nav items for an employee', () => {
    render(<Sidebar displayName="Alex Morgan" role="employee" officeLocation="London HQ" />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
    expect(screen.getByText('Equity & Fairness')).toBeInTheDocument();
    expect(screen.getByText('Engagement')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('hides the Admin item for an employee', () => {
    render(<Sidebar displayName="Alex Morgan" role="employee" />);
    expect(screen.queryByText('Admin')).not.toBeInTheDocument();
  });

  it('shows the Admin item for an admin role', () => {
    render(<Sidebar displayName="Jamie Lee" role="admin" />);
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('shows the Admin item for an owner role', () => {
    render(<Sidebar displayName="Jamie Lee" role="owner" />);
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('marks the active route with aria-current', () => {
    render(<Sidebar displayName="Alex Morgan" role="employee" />);
    expect(screen.getByRole('link', { name: /Home/i })).toHaveAttribute('aria-current', 'page');
  });
});
