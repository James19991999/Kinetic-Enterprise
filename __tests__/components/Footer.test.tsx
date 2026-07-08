import { render, screen } from '@testing-library/react';
import { Footer } from '@/components/layout/Footer';

describe('Footer', () => {
  it('links Product items to real in-app routes', () => {
    render(<Footer />);
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Analytics' })).toHaveAttribute('href', '/analytics');
    expect(screen.getByRole('link', { name: 'Equity & Fairness' })).toHaveAttribute('href', '/equity');
    expect(screen.getByRole('link', { name: 'Engagement' })).toHaveAttribute('href', '/engagement');
  });

  it('links Legal items to the privacy and terms pages', () => {
    render(<Footer />);
    expect(screen.getByRole('link', { name: 'Privacy Policy' })).toHaveAttribute('href', '/privacy');
    expect(screen.getByRole('link', { name: 'Terms of Service' })).toHaveAttribute('href', '/terms');
  });

  it('renders a working support email link', () => {
    render(<Footer />);
    expect(screen.getByRole('link', { name: /email workpulse support/i })).toHaveAttribute(
      'href',
      'mailto:support@workpulse.app'
    );
  });

  it('renders the current year in the copyright line', () => {
    render(<Footer />);
    expect(screen.getByText(new RegExp(String(new Date().getFullYear())))).toBeInTheDocument();
  });
});
