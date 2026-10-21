// Credentials come from .env (loaded in playwright.config.ts). Never log these values.
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable ${name} – see .env.example`);
  }
  return value;
}

export const accounts = {
  /** Shared account used by all candidates – never use it for failed-login tests. */
  get shared() {
    return { user: requireEnv('SHARED_USER'), password: requireEnv('SHARED_PASSWORD') };
  },
  /** Candidate's own account – the only one allowed for wrong-password tests. */
  get own() {
    return {
      user: requireEnv('OWN_USER'),
      password: requireEnv('OWN_PASSWORD'),
      pesel: requireEnv('NR_PESEL'),
    };
  },
};
