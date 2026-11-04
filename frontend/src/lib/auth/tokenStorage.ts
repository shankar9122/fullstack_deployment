const TOKEN_KEY = 'school_admin_token';

// In-memory fallback for when localStorage is blocked (private mode, strict browser settings)
let memoryToken: string | null = null;

// Next.js pre-renders client components on the server, where window does not exist.
// Module-level state on the server would also be shared between different users' requests,
// so on the server this module must never read or write anything.
function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

export const tokenStorage = {
  get(): string | null {
    if (!isBrowser()) return null;
    if (memoryToken) return memoryToken;

    try {
      memoryToken = window.localStorage.getItem(TOKEN_KEY);
    } catch {
      memoryToken = null; // storage unavailable
    }
    return memoryToken;
  },

  set(token: string): void {
    if (!isBrowser()) return;
    memoryToken = token;

    try {
      window.localStorage.setItem(TOKEN_KEY, token);
    } catch {
      // Storage unavailable: the session still works in memory, but is lost on reload
    }
  },

  clear(): void {
    if (!isBrowser()) return;
    memoryToken = null;

    try {
      window.localStorage.removeItem(TOKEN_KEY);
    } catch {
      // Nothing to clean up
    }
  },
};
