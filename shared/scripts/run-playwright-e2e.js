import os from 'os';
import path from 'path';
import { spawnSync } from 'child_process';

const npxCommand = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const browserCachePath = process.env.PLAYWRIGHT_BROWSERS_PATH || path.join(os.homedir(), '.cache', 'ms-playwright');
const forwardedArgs = process.argv.slice(2);
const installOnly = forwardedArgs.includes('--install-only');
const testArgs = forwardedArgs.filter((arg) => arg !== '--install-only');

const env = {
  ...process.env,
  PLAYWRIGHT_BROWSERS_PATH: browserCachePath,
};

function run(args) {
  const result = spawnSync(npxCommand, args, {
    stdio: 'inherit',
    env,
  });

  if (result.error) {
    console.error(result.error.message || 'Failed to execute Playwright command.');
    return 1;
  }

  return result.status ?? 1;
}

const installCode = run(['playwright', 'install', 'chromium']);
if (installCode !== 0) {
  process.exit(installCode);
}

if (installOnly) {
  process.exit(0);
}

const testCode = run(['playwright', 'test', ...testArgs]);
process.exit(testCode);
