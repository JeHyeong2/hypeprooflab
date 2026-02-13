import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 1,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  timeout: 30_000,

  use: {
    baseURL: 'https://hypeproof-ai.xyz',
    trace: 'on-first-retry',
  },

  webServer: process.env.E2E_LOCAL ? {
    command: 'npm run dev -- -p 3099',
    url: 'http://127.0.0.1:3099',
    reuseExistingServer: true,
    timeout: 30_000,
  } : undefined,

  projects: [
    {
      name: 'desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
      grep: [/@desktop/, /@all/],
    },
    {
      name: 'mobile',
      use: {
        ...devices['Pixel 5'],
        viewport: { width: 375, height: 667 },
      },
      grep: [/@mobile/, /@all/],
    },
    {
      name: 'api',
      use: {
        baseURL: process.env.E2E_LOCAL ? 'http://127.0.0.1:3099' : 'https://hypeproof-ai.xyz',
      },
      grep: [/@api/],
    },
  ],
});
