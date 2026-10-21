import { describe, expect, it } from 'vitest';
import {
  visibleDescription,
  PLACEHOLDER_COLOURS,
  placeholderColour,
  placeholderText,
  productPlaceholderDataUrl,
} from '../product-placeholder';

describe('placeholderText', () => {
  it('one word of 10 letters or fewer: the whole word, in capitals', () => {
    expect(placeholderText('Bread')).toBe('BREAD');
    expect(placeholderText('Toothpaste')).toBe('TOOTHPASTE'); // exactly 10
  });
  it('two or more words: first letters of the first two', () => {
    expect(placeholderText('Peak Milk 400g')).toBe('PM');
    expect(placeholderText('indomie chicken')).toBe('IC');
    expect(placeholderText('  Golden   Penny  Spaghetti ')).toBe('GP');
  });
  it('one long word: its first 3 letters', () => {
    expect(placeholderText('Paracetamol')).toBe('PAR'); // 11 letters
  });
  it('ignores punctuation and handles empty names', () => {
    expect(placeholderText('(New) Phone')).toBe('NP');
    expect(placeholderText('')).toBe('PRODUCT');
    expect(placeholderText(undefined)).toBe('PRODUCT');
    expect(placeholderText('!!!')).toBe('PRODUCT');
  });
});

describe('placeholderColour', () => {
  it('same name, same colour; always from the palette', () => {
    expect(placeholderColour('Peak Milk')).toEqual(placeholderColour('peak milk '));
    expect(PLACEHOLDER_COLOURS).toContainEqual(placeholderColour('Anything'));
  });
});

describe('productPlaceholderDataUrl', () => {
  it('is an SVG data URL with the text and colour, safely escaped', () => {
    const url = productPlaceholderDataUrl('Peak Milk 400g');
    expect(url.startsWith('data:image/svg+xml')).toBe(true);
    const svg = decodeURIComponent(url.split(',')[1]);
    expect(svg).toContain('>PM<');
    expect(svg).toContain(placeholderColour('Peak Milk 400g').bg);
    expect(decodeURIComponent(productPlaceholderDataUrl('<b>', { rounded: true }).split(',')[1])).toContain('rx="48"');
  });
});

describe('visibleDescription', () => {
  it('hides empty descriptions and ones that repeat the name', () => {
    expect(visibleDescription('', 'Bread')).toBe('');
    expect(visibleDescription(undefined, 'Bread')).toBe('');
    expect(visibleDescription('  bread ', 'Bread')).toBe('');
    expect(visibleDescription('Fresh sliced loaf', 'Bread')).toBe('Fresh sliced loaf');
  });
});
