// Production start: uvicorn serving the built frontend (dist/) + API.
// Requires: npm run build && python venv with backend/requirements.txt installed.
import { existsSync } from 'node:fs';
import { spawn } from 'node:child_process';

const python = existsSync('.venv/Scripts/python.exe') ? '.venv/Scripts/python.exe' : '.venv/bin/python';

const child = spawn(
  python,
  ['-m', 'uvicorn', 'backend.app.main:app', '--host', '0.0.0.0', '--port', process.env.PORT || '8000'],
  { stdio: 'inherit', env: { ...process.env, NODE_ENV: 'production' } },
);

child.on('exit', (code) => process.exit(code ?? 0));
