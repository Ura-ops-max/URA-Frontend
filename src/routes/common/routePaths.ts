export const AUTH_ROUTES = {
  SIGN_IN: '/auth/login',
  SIGN_UP: '/auth/register',
  GOOGLE_OAUTH_CALLBACK: '/google/oauth/callback',
  VERIFY_EMAIL: '/auth/verify-email',
  FORGET_PASSWORD: '/auth/forget-password',
};

export const PROTECTED_ROUTES = {
  DASHBOARD: '/dashboard',
  DEALS_OFFER: '/dashboard/deal-offer',
  SETTINGS: '/dashboard/settings',
  SETTINGS_PROFILE: '/dashboard/settings/profile',
  SETTINGS_SECURITY: '/dashboard/settings/security',
  SETTINGS_ACTIVITY: '/dashboard/settings/activities',
  NOTIFICATION: '/dashboard/notifications',
  BOOKMARK: '/dashboard/bookmarks',
  USER_PROFILE: '/dashboard/profile/user/:userId',
  BUSINESS_PROFILE: '/dashboard/profile/business/:userId',
  CREATE_PRODUCT: 'dashboard/post/create',
  MENU: '/dashboard/menu',
  CHAT: '/dashboard/chat',
  CART: '/dashboard/product/cart',
  CHECKOUT: '/dashboard/checkout',
  ORDER: '/dashboard/my-orders',
  PAYLUK_SETUPPAGE: '/dashboard/payments/setup',
  CHAT_CONVERSATION: '/dashboard/chat/:conversationId',
  PRODUCT_DETAIL: '/dashboard/product/:productId',
};

export const BASE_ROUTE = {
  HOME: '/',
  ABOUT: '/about',
  INVITE_URL: '/invite/workspace/:inviteCode/join',
} as const;
