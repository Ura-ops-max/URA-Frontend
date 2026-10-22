import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  bannerText,
  defaultSettings,
  firstTimeFor,
  playHorn,
  readSettings,
  resetPlayed,
  saveSettings,
} from './order-alerts';

const store = new Map<string, string>();
const fakeStorage = {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => void store.set(k, v),
};

beforeEach(() => {
  store.clear();
  resetPlayed();
  vi.stubGlobal('window', { localStorage: fakeStorage });
});
afterEach(() => vi.unstubAllGlobals());

describe('settings', () => {
  it('sound is on by default for sellers and off for buyers; alerts start off', () => {
    expect(defaultSettings(true)).toEqual({ enabled: false, sound: true });
    expect(readSettings(false)).toEqual({ enabled: false, sound: false });
  });

  it('saves and reads back', () => {
    saveSettings({ enabled: true, sound: false });
    expect(readSettings(true)).toEqual({ enabled: true, sound: false });
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
    expect(readSettings(true)).toEqual({ enabled: false, sound: true });
    expect(() => saveSettings({ enabled: true, sound: true })).not.toThrow();
  });
});

describe('played set', () => {
  it('alerts once per order', () => {
    expect(firstTimeFor('o1')).toBe(true);
    expect(firstTimeFor('o1')).toBe(false);
    expect(firstTimeFor('o2')).toBe(true);
    expect(firstTimeFor('')).toBe(false);
  });
});

describe('playHorn', () => {
  it('plays once and never loops', async () => {
    const made: { loop: boolean; play: () => Promise<void> }[] = [];
    vi.stubGlobal(
      'Audio',
      vi.fn(function (this: any) {
        this.loop = true;
        this.play = vi.fn(async () => undefined);
        made.push(this);
      }),
    );
    expect(await playHorn()).toBe(true);
    expect(made).toHaveLength(1);
    expect(made[0].loop).toBe(false);
    expect(made[0].play).toHaveBeenCalledTimes(1);
  });

  it('returns false when the browser blocks the sound', async () => {
    vi.stubGlobal(
      'Audio',
      vi.fn(function (this: any) {
        this.play = async () => {
          throw new Error('NotAllowedError');
        };
      }),
    );
    expect(await playHorn()).toBe(false);
  });
});

it('banner text', () => {
  expect(bannerText('UR-1042', 'Amaka')).toBe('New paid order UR-1042 from Amaka');
  expect(bannerText('UR-1042')).toBe('New paid order UR-1042');
});
