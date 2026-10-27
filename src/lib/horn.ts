// Car-horn alert for new notifications, made with the Web Audio API (no sound
// file, so no licence needed): two tones at 420 Hz and 520 Hz together for
// about half a second, with a fast fade in and out.
//
// Rules: at most one horn every 3 seconds (across all URA tabs), never twice
// for the same notification, never looped, and never throws: if the browser
// blocks sound, it fails silently and the pop-up still shows.

export type HornMode = 'all' | 'orders' | 'off';

export interface AlertPrefs {
  /** The person tapped "Turn on alerts" on this device (sound allowed). */
  unlocked: boolean;
  /** "Horn for new notifications": All notifications, Orders only, Off. */
  mode: HornMode;
}

const PREFS_KEY = 'ura.alerts.v1';
const LAST_HORN_KEY = 'ura.alerts.lastHornAt';
export const HORN_GAP_MS = 3_000;
export const DEFAULT_PREFS: AlertPrefs = { unlocked: false, mode: 'all' };

export const HORN_MODE_LABELS: Record<HornMode, string> = {
  all: 'All notifications',
  orders: 'Orders only',
  off: 'Off',
};

// ─── Settings (this device) ──────────────────────────────────────────────────

export function readPrefs(): AlertPrefs {
  try {
    const v = JSON.parse(window.localStorage.getItem(PREFS_KEY) ?? 'null');
    return {
      unlocked: v?.unlocked === true,
      mode: v?.mode === 'orders' || v?.mode === 'off' ? v.mode : 'all',
    };
  } catch {
    return { ...DEFAULT_PREFS };
  }
}

export function savePrefs(p: AlertPrefs): void {
  try {
    window.localStorage.setItem(PREFS_KEY, JSON.stringify(p));
  } catch {
    // Storage blocked (private window): the choice lasts until the tab closes.
  }
}

// ─── Which notifications honk ────────────────────────────────────────────────

export interface HornNotification {
  _id?: string;
  modelType?: string | null;
}

/** Does this notification honk with this setting? */
export function hornAllowed(n: HornNotification, mode: HornMode): boolean {
  if (mode === 'off') return false;
  if (mode === 'orders') return n.modelType === 'Order';
  return true;
}

/**
 * Remembers what already honked. `take(id)` is true only when the horn may
 * play now: a new id, and at least 3 seconds since the last horn in any tab.
 * A repeated id never honks; one that arrives inside the 3 seconds is simply
 * covered by the horn that just played.
 */
export function createHornGate({
  gapMs = HORN_GAP_MS,
  now = () => Date.now(),
  shared = true,
}: { gapMs?: number; now?: () => number; shared?: boolean } = {}) {
  const seen = new Set<string>();
  let lastAt = -Infinity;

  const lastShared = (): number => {
    if (!shared) return -Infinity;
    try {
      return Number(window.localStorage.getItem(LAST_HORN_KEY)) || -Infinity;
    } catch {
      return -Infinity;
    }
  };

  return {
    take(id: string | undefined): boolean {
      if (id) {
        if (seen.has(id)) return false;
        seen.add(id);
      }
      const t = now();
      if (t - Math.max(lastAt, lastShared()) < gapMs) return false;
      lastAt = t;
      if (shared) {
        try {
          window.localStorage.setItem(LAST_HORN_KEY, String(t));
        } catch {
          // Other tabs may honk too; still at most one per tab every 3 seconds.
        }
      }
      return true;
    },
  };
}

// ─── The sound ───────────────────────────────────────────────────────────────

let ctx: AudioContext | null = null;

function audioContext(): AudioContext | null {
  try {
    if (!ctx) {
      const AC = window.AudioContext ?? (window as any).webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    return ctx;
  } catch {
    return null;
  }
}

/**
 * Play one short horn. Returns false (never throws) when sound is blocked or
 * not supported. Call `unlockSound()` from a tap first: browsers keep sound
 * off until the person has tapped the page.
 */
export function playHorn(): boolean {
  try {
    const ac = audioContext();
    if (!ac || ac.state !== 'running') return false;
    const t0 = ac.currentTime;
    const length = 0.5;

    const gain = ac.createGain();
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(0.18, t0 + 0.015); // fast fade in
    gain.gain.setValueAtTime(0.18, t0 + length - 0.06);
    gain.gain.linearRampToValueAtTime(0, t0 + length); // fast fade out

    // A gentle low-pass keeps the sawtooth brassy rather than harsh.
    const tone = ac.createBiquadFilter();
    tone.type = 'lowpass';
    tone.frequency.value = 1800;
    tone.connect(gain).connect(ac.destination);

    for (const f of [420, 520]) {
      const osc = ac.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = f;
      osc.connect(tone);
      osc.start(t0);
      osc.stop(t0 + length); // never loops
    }
    return true;
  } catch {
    return false;
  }
}

/** From a tap: switch sound on, then play a test horn. False if still blocked. */
export async function unlockSound(): Promise<boolean> {
  try {
    const ac = audioContext();
    if (!ac) return false;
    if (ac.state !== 'running') await ac.resume();
    return playHorn();
  } catch {
    return false;
  }
}

/** For tests. */
export function resetAudioForTests(): void {
  ctx = null;
}

// ─── Tab title: "(1) URA" ────────────────────────────────────────────────────

/** "(3) Feed | URA" from "Feed | URA"; removes the count when there is none. */
export function titleWithUnread(title: string, unread: number): string {
  const base = title.replace(/^\(\d+\+?\)\s*/, '');
  if (unread <= 0) return base;
  return `(${unread > 99 ? '99+' : unread}) ${base}`;
}

// ─── iPhone hint ─────────────────────────────────────────────────────────────

/** iPhone/iPad Safari, not opened from the home screen. */
export function needsHomeScreenHint(
  ua: string = navigator.userAgent,
  standalone: boolean = Boolean((navigator as any).standalone) ||
    window.matchMedia?.('(display-mode: standalone)').matches,
): boolean {
  return /iPhone|iPad|iPod/i.test(ua) && !standalone;
}
