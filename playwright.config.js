import { defineConfig } from '@playwright/test';
import os from 'os';
import path from 'path';

const playwrightOutputDir = process.env.PLAYWRIGHT_TEST_OUTPUT_DIR || path.join(os.tmpdir(), 'bitovi-shop-playwright-test-results');

export default defineConfig({
  testDir: './shared/e2e',
  outputDir: playwrightOutputDir,
  fullyParallel: false,
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:5173',
    browserName: 'chromium',
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm start',
    url: 'http://127.0.0.1:5173',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
