import { describe, expect, it } from 'vitest';
import { urlBase64ToUint8Array } from './web-push';

describe('urlBase64ToUint8Array', () => {
  it('decodes base64url without padding', () => {
    // "hello?" in base64 is aGVsbG8/ ; base64url turns "/" into "_".
    expect(Array.from(urlBase64ToUint8Array('aGVsbG8_'))).toEqual([104, 101, 108, 108, 111, 63]);
    // "hi" is aGk= ; the "=" padding is dropped in base64url.
    expect(Array.from(urlBase64ToUint8Array('aGk'))).toEqual([104, 105]);
  });

  it('gives the 65 bytes of a VAPID public key', () => {
    const key = 'B' + 'A'.repeat(86);
    expect(urlBase64ToUint8Array(key)).toHaveLength(65);
  });
});
