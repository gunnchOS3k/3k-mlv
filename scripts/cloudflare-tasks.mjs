import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pnpmBin = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
const nodeBin = process.execPath;

const cloudflareBuildEnv = {
  VITE_BASE_PATH: '/',
  NODE_ENV: 'production',
};

function run(command, args, extraEnv = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: root,
      stdio: 'inherit',
      env: { ...process.env, ...extraEnv },
    });
    child.on('error', reject);
    child.on('exit', (code, signal) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(' ')} failed (${signal || code})`));
    });
  });
}

async function buildAtRoot() {
  await run(pnpmBin, ['run', 'build'], cloudflareBuildEnv);
}

const tasks = {
  async build() {
    await buildAtRoot();
  },
  async deploy() {
    await buildAtRoot();
    await run(pnpmBin, ['exec', 'wrangler', 'deploy']);
  },
  async preview() {
    await buildAtRoot();
    await run(pnpmBin, ['exec', 'wrangler', 'preview']);
  },
  async check() {
    await buildAtRoot();
    await run(nodeBin, ['scripts/validate-hosting-outputs.mjs', '--base', '/']);
    await run(pnpmBin, ['exec', 'wrangler', 'deploy', '--dry-run']);
  },
};

const task = process.argv[2];
if (!tasks[task]) {
  console.error('usage: node scripts/cloudflare-tasks.mjs <build|deploy|preview|check>');
  process.exit(2);
}

await tasks[task]();
