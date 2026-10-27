import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createHornGate,
  hornAllowed,
  needsHomeScreenHint,
  playHorn,
  readPrefs,
  resetAudioForTests,
  savePrefs,
  titleWithUnread,
  unlockSound,
} from './horn';

const store = new Map<string, string>();
beforeEach(() => {
  store.clear();
  resetAudioForTests();
  vi.stubGlobal('window', {
    localStorage: { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => void store.set(k, v) },
  });
});
afterEach(() => vi.unstubAllGlobals());

describe('throttle and duplicates', () => {
  it('plays at most one horn every 3 seconds', () => {
    let t = 0;
    const gate = createHornGate({ now: () => t, shared: false });
    expect(gate.take('a')).toBe(true);
    t = 1000;
    expect(gate.take('b')).toBe(false); // several at once: one horn
    t = 2999;
    expect(gate.take('c')).toBe(false);
    t = 3000;
    expect(gate.take('d')).toBe(true);
  });

  it('never plays twice for the same notification id', () => {
    let t = 0;
    const gate = createHornGate({ now: () => t, shared: false });
    expect(gate.take('a')).toBe(true);
    t = 60_000;
    expect(gate.take('a')).toBe(false);
  });

  it('shares the 3-second gap across tabs', () => {
    let t = 10_000;
    const tab1 = createHornGate({ now: () => t });
    const tab2 = createHornGate({ now: () => t });
    expect(tab1.take('a')).toBe(true);
    t = 11_000;
    expect(tab2.take('b')).toBe(false);
    t = 13_000;
    expect(tab2.take('c')).toBe(true);
  });
});

describe('the switch', () => {
  const order = { modelType: 'Order' };
  const social = { modelType: 'Post' };
  it('All notifications honks for everything', () => {
    expect(hornAllowed(order, 'all')).toBe(true);
    expect(hornAllowed(social, 'all')).toBe(true);
    expect(hornAllowed({}, 'all')).toBe(true);
  });
  it('Orders only honks for orders', () => {
    expect(hornAllowed(order, 'orders')).toBe(true);
    expect(hornAllowed(social, 'orders')).toBe(false);
  });
  it('Off never honks', () => {
    expect(hornAllowed(order, 'off')).toBe(false);
  });
  it('defaults to All notifications, and saves the choice', () => {
    expect(readPrefs()).toEqual({ unlocked: false, mode: 'all' });
    savePrefs({ unlocked: true, mode: 'orders' });
    expect(readPrefs()).toEqual({ unlocked: true, mode: 'orders' });
  });
  it('never throws when storage is blocked', () => {
    vi.stubGlobal('window', {
      localStorage: {
        getItem: () => {
          throw new Error('blocked');
        },
        setItem: () => {
          throw new Error('blocked');
        },
      },
    });
    expect(readPrefs()).toEqual({ unlocked: false, mode: 'all' });
    expect(() => savePrefs({ unlocked: true, mode: 'off' })).not.toThrow();
    expect(createHornGate().take('x')).toBe(true);
  });
});

describe('sound failure never throws', () => {
  it('no Web Audio in this browser', async () => {
    expect(playHorn()).toBe(false);
    expect(await unlockSound()).toBe(false);
  });

  it('sound still blocked after the tap', async () => {
    class Blocked {
      state = 'suspended';
      resume = async () => {
        throw new Error('NotAllowedError');
      };
    }
    vi.stubGlobal('window', { AudioContext: Blocked, localStorage: { getItem: () => null, setItem: () => undefined } });
    expect(await unlockSound()).toBe(false);
    expect(playHorn()).toBe(false);
  });

  it('plays two tones once, for about half a second, never looped', async () => {
    const oscs: any[] = [];
    const node = () => ({ connect: (n: any) => n ?? node(), gain: { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() }, frequency: { value: 0 } });
    class Running {
      state = 'running';
      currentTime = 5;
      destination = {};
      resume = async () => undefined;
      createGain = () => node();
      createBiquadFilter = () => ({ ...node(), type: '' });
      createOscillator = () => {
        const o = { ...node(), type: '', start: vi.fn(), stop: vi.fn(), loop: undefined };
        oscs.push(o);
        return o;
      };
    }
    vi.stubGlobal('window', { AudioContext: Running, localStorage: { getItem: () => null, setItem: () => undefined } });
    expect(await unlockSound()).toBe(true);
    expect(oscs.map((o) => o.frequency.value)).toEqual([420, 520]);
    for (const o of oscs) {
      expect(o.start).toHaveBeenCalledWith(5);
      expect(o.stop).toHaveBeenCalledWith(5.5);
    }
  });
});

describe('tab title and iPhone hint', () => {
  it('adds and removes the unread count', () => {
    expect(titleWithUnread('Feed | URA', 1)).toBe('(1) Feed | URA');
    expect(titleWithUnread('(1) Feed | URA', 4)).toBe('(4) Feed | URA');
    expect(titleWithUnread('(4) Feed | URA', 0)).toBe('Feed | URA');
    expect(titleWithUnread('URA', 120)).toBe('(99+) URA');
  });
  it('shows the home-screen hint on iPhone Safari only', () => {
    const iphone = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)';
    expect(needsHomeScreenHint(iphone, false)).toBe(true);
    expect(needsHomeScreenHint(iphone, true)).toBe(false);
    expect(needsHomeScreenHint('Mozilla/5.0 (Linux; Android 14)', false)).toBe(false);
  });
});
