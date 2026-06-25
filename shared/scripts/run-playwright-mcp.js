import { spawn } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';
import { chromium } from '@playwright/test';

const homeDir = process.env.HOME || process.cwd();
const browsersPath = process.env.PLAYWRIGHT_BROWSERS_PATH || path.join(homeDir, '.cache', 'ms-playwright');
const mcpOutputDir = process.env.PLAYWRIGHT_MCP_OUTPUT_DIR || '/tmp/bitovi-shop-playwright-mcp';
const executablePath = chromium.executablePath();
const extraArgs = process.argv.slice(2);
const isInfoCommand = extraArgs.includes('--help') || extraArgs.includes('-h') || extraArgs.includes('--version');

if (!isInfoCommand && !existsSync(executablePath)) {
  console.error('Playwright Chromium executable not found.');
  console.error('Run: npm run e2e:setup');
  process.exit(1);
}

const child = spawn(
  'playwright-mcp',
  [
    '--headless',
    '--no-sandbox',
    '--output-dir',
    mcpOutputDir,
    '--executable-path',
    executablePath,
    ...extraArgs,
  ],
  {
    stdio: 'inherit',
    env: {
      ...process.env,
      PLAYWRIGHT_BROWSERS_PATH: browsersPath,
    },
  },
);

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});
