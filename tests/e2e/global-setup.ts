import fs from 'node:fs';
import { AUTH_DIR } from './auth-paths';

// Start every run without stale sessions or a failed-login marker from a previous run.
export default function globalSetup() {
  fs.rmSync(AUTH_DIR, { recursive: true, force: true });
  fs.mkdirSync(AUTH_DIR, { recursive: true });
}
