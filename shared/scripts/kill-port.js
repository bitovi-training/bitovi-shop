/**
 * kill-port.js
 *
 * Kills any process currently occupying the given port(s) before the dev
 * servers start. Works on Mac, Linux, and Windows using only Node built-ins.
 *
 * Usage: node scripts/kill-port.js 3001 5173
 */

import { execSync } from 'child_process';

const ports = process.argv.slice(2).map(Number).filter(Boolean);

for (const port of ports) {
  try {
    if (process.platform === 'win32') {
      // Windows: parse netstat output to find the PID bound to this port.
      const output = execSync('netstat -ano', { encoding: 'utf8' });
      const pids = new Set();

      for (const line of output.split('\n')) {
        const match = line.match(/^\s*(TCP|UDP)\s+\S+:(\d+)\s+\S+\s+\S+\s+(\d+)/i);
        if (match && Number(match[2]) === port && match[3] !== '0') {
          pids.add(match[3]);
        }
      }

      for (const pid of pids) {
        try {
          execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
        } catch {
          // Process may have already exited.
        }
      }
    } else {
      // Mac / Linux: lsof gives us the PID(s) directly.
      const output = execSync(`lsof -ti:${port}`, { encoding: 'utf8' }).trim();

      for (const pid of output.split('\n')) {
        if (pid.trim()) {
          try {
            execSync(`kill -9 ${pid.trim()}`, { stdio: 'ignore' });
          } catch {
            // Process may have already exited.
          }
        }
      }
    }

    console.log(`[kill-port] Cleared port ${port}`);
  } catch {
    // lsof / netstat found nothing — port is free, nothing to do.
  }
}
