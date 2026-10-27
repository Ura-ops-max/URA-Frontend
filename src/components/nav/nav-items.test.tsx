import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { Bell, X } from 'lucide-react';
import { BOTTOM_NAV, SIDEBAR_BUSINESS, SIDEBAR_MAIN, SIDEBAR_SETTINGS, SIDEBAR_SHOPPING, isActiveEntry } from './nav-items';
import { NavItem } from './NavItem';
import { IconButton } from '@/components/ui/icon-button';

const ALL = [...SIDEBAR_MAIN, ...SIDEBAR_SHOPPING, ...SIDEBAR_BUSINESS, SIDEBAR_SETTINGS, ...BOTTOM_NAV];

describe('main menu', () => {
  it('every item has a word to show', () => {
    for (const e of ALL) {
      expect(e.title.trim().length).toBeGreaterThan(1);
      if (e.short) expect(e.short.length).toBeLessThanOrEqual(8); // fits under an icon
    }
  });

  it('the phone bottom menu is Home, Orders, Wallet, Chats, More', () => {
    expect(BOTTOM_NAV.map((e) => e.title)).toEqual(['Home', 'Orders', 'Wallet', 'Chats', 'More']);
  });

  it('one icon means one thing: each icon opens one place', () => {
    const placeOf = new Map<unknown, string>();
    for (const e of ALL) {
      const base = e.url.split('?')[0];
      const seen = placeOf.get(e.icon);
      if (seen) expect(`${e.title}: ${base}`).toBe(`${e.title}: ${seen}`);
      placeOf.set(e.icon, base);
    }
  });

  it('marks the right bottom-menu item as selected', () => {
    const orders = BOTTOM_NAV.find((e) => e.title === 'Orders')!;
    const home = BOTTOM_NAV.find((e) => e.title === 'Home')!;
    expect(isActiveEntry(orders, '/dashboard/my-orders')).toBe(true);
    expect(isActiveEntry(home, '/dashboard/my-orders')).toBe(false);
    expect(isActiveEntry(home, '/dashboard')).toBe(true);
  });
});

describe('shared components', () => {
  it('NavItem always shows its word', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <NavItem icon={Bell} label="Alerts" to="/dashboard/notifications" />
      </MemoryRouter>,
    );
    expect(html).toContain('>Alerts</span>');
  });

  it('IconButton gives the icon a name (aria-label) and a tooltip (title)', () => {
    const html = renderToStaticMarkup(
      <IconButton label="Close notification">
        <X />
      </IconButton>,
    );
    expect(html).toContain('aria-label="Close notification"');
    expect(html).toContain('title="Close notification"');
  });
});
