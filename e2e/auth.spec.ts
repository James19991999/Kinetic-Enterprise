import { test, expect } from '@playwright/test';

// Covers what's testable without live Firebase credentials: the login
// page's static markup/mode-switching, and the middleware's redirect for
// signed-out visitors to a protected route. Actually signing in (real
// Firebase Auth + session cookie issuance) is out of scope here — see
// e2e/README.md.

test.describe('Login page', () => {
  test('renders the sign-in form by default', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
    // Signup-only fields shouldn't be present yet.
    await expect(page.getByLabel('Organization name')).toHaveCount(0);
  });

  test('switches to the sign-up form and shows org/name fields', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: 'Create Account' }).first().click();
    await expect(page.getByLabel('Your name')).toBeVisible();
    await expect(page.getByLabel('Organization name')).toBeVisible();
  });
});

test.describe('Protected routes', () => {
  test('redirect a signed-out visitor to /login with a next param', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login\?next=%2Fdashboard/);
  });
});
