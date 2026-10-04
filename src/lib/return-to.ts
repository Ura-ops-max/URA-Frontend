// Remembers the page a visitor was on when we asked them to sign in, so we can
// send them straight back there afterwards (instead of dropping them on the
// dashboard). Kept in sessionStorage so it survives the Google/Microsoft
// OAuth round-trip but not a closed tab.

const KEY = 'ura_return_to';

// Only same-site paths, never auth pages, never protocol-relative URLs.
const isSafe = (path: string | null): path is string =>
  !!path && path.startsWith('/') && !path.startsWith('//') && !path.startsWith('/auth');

export const rememberReturnTo = (path: string): void => {
  try {
    if (isSafe(path)) sessionStorage.setItem(KEY, path);
  } catch {
    /* storage unavailable — fall back to the dashboard */
  }
};

/** Read without clearing (for redirects that may run more than once). */
export const peekReturnTo = (fallback = '/dashboard'): string => {
  try {
    const value = sessionStorage.getItem(KEY);
    return isSafe(value) ? value : fallback;
  } catch {
    return fallback;
  }
};

/** Read and clear — use once the user has actually signed in. */
export const consumeReturnTo = (fallback = '/dashboard'): string => {
  const value = peekReturnTo(fallback);
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
  return value;
};
