// Which in-app pages a signed-out visitor may view. Browsing is open; acting
// (like, comment, cart, follow, message, post) asks them to sign in.
// Everything else under /dashboard (chat, wallet, orders, cart, checkout,
// settings, notifications, create post…) still needs an account.

const GUEST_PATHS: RegExp[] = [
  /^\/dashboard\/?$/, // the main feed
  /^\/dashboard\/product\/(?!cart\/?$)[^/]+\/?$/, // a single product (not the cart)
];

export const isGuestAllowedPath = (path: string): boolean => GUEST_PATHS.some((re) => re.test(path));
