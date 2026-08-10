// Runs the FastAPI backend (uvicorn) using the project venv's Python.
// Cross-platform: picks .venv/Scripts/python.exe on Windows, .venv/bin/python elsewhere.
import { existsSync } from 'node:fs';
import { spawn } from 'node:child_process';

const python = existsSync('.venv/Scripts/python.exe') ? '.venv/Scripts/python.exe' : '.venv/bin/python';

const child = spawn(
  python,
  ['-m', 'uvicorn', 'backend.app.main:app', '--reload', '--host', '127.0.0.1', '--port', '8000'],
  { stdio: 'inherit' },
);

child.on('exit', (code) => process.exit(code ?? 0));
