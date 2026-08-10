// JWT plumbing for the hardened API endpoints (audit logs, ticket detail/update).
// The token is minted by the backend (POST /api/auth/demo-login) and stored
// alongside the auth user. A global fetch interceptor attaches it to every
// request; the backend also keeps honoring the legacy x-user-role header for the
// self-service surface, so removing this module only degrades security, not UI.

export const TOKEN_STORAGE_KEY = 'civic_smart_auth_token';

export function getAuthToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setAuthToken(token: string | null) {
  try {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch {
    /* storage unavailable — auth still works header-only */
  }
  // Token minting is async (demo-login round-trip), so consumers that race it
  // (notification feed, SSE stream) re-sync when the token finally lands.
  window.dispatchEvent(new CustomEvent('civic:auth-token', { detail: token }));
}

/** Mint a JWT for the given demo role from the backend (public endpoint). */
export async function mintTokenForRole(role: string): Promise<string | null> {
  try {
    const res = await fetch('/api/auth/demo-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.token ?? null;
  } catch {
    return null;
  }
}

/** Attaches `Authorization: Bearer <token>` to every fetch when a token exists. */
export function installAuthFetchInterceptor() {
  const originalFetch = window.fetch.bind(window);
  window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    const token = getAuthToken();
    if (!token) return originalFetch(input, init);
    const headers = new Headers(init?.headers);
    if (!headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return originalFetch(input, { ...init, headers });
  };
}
