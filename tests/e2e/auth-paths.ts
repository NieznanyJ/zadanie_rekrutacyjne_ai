import path from 'node:path';

export const AUTH_DIR = path.join(__dirname, '..', '..', 'playwright', '.auth');

/** Written when the shared-account login fails, so other workers don't retry it (lockout risk). */
export const SHARED_LOGIN_FAILED_MARKER = path.join(AUTH_DIR, 'shared-login-failed');

export function sharedStorageStatePath(parallelIndex: number) {
  return path.join(AUTH_DIR, `shared-${parallelIndex}.json`);
}
