import { defineConfig, devices } from '@playwright/test';

/**
 * Isolated browser test server with deliberately fake Supabase credentials.
 * Every request to the fake Supabase origin is mocked by auth.spec.ts.
 * No real user registration, emails, or database writes are made.
 */
export default defineConfig({
  testDir: './e2e',
  testMatch: '**/auth.spec.ts',
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:5173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium-auth-mocked', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run dev:e2e',
    url: 'http://127.0.0.1:5173',
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      VITE_SUPABASE_URL: 'https://goacadio-e2e.invalid',
      VITE_SUPABASE_PUBLISHABLE_KEY: 'goacadio_e2e_fake_publishable_key',
    },
  },
});
