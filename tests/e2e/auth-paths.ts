import path from 'node:path';

export const AUTH_DIR = path.join(__dirname, '..', '..', 'playwright', '.auth');

/** Written when a login to the account fails, so other tests don't retry it (lockout risk). */
export function loginFailedMarker(account: 'shared' | 'own') {
  return path.join(AUTH_DIR, `${account}-login-failed`);
}
