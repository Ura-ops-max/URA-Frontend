import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import { AUTH_ROUTES, BASE_ROUTE, PROTECTED_ROUTES } from './routePaths';
import BusinessPage from '@/pages/public/BusinessPage';

// Pages load on demand (code splitting). The shop link page stays in the main
// bundle because it's the first page many visitors see.
// Named exports need a small wrapper for React.lazy.
const lazyNamed = <T extends Record<string, unknown>, K extends keyof T>(
  load: () => Promise<T>,
  name: K,
) => lazy(() => load().then((m) => ({ default: m[name] as React.ComponentType<any> })));

const Home = lazy(() => import('@/pages/public/Home'));
const GoogleOAuthFailure = lazy(() => import('@/pages/auth/GoogleOAuthFailure'));
const OAuthSuccessPage = lazy(() => import('@/pages/auth/OAuthSuccessPage'));
const VerifyEmail = lazy(() => import('@/pages/auth/VerifyEmail'));
const ResetPassword = lazy(() => import('@/pages/auth/ResetPassword'));
const PostDetail = lazy(() => import('@/pages/public/PostDetail'));
const ProductsPage = lazy(() => import('@/pages/public/Products'));
const TermsOfService = lazy(() => import('@/pages/public/TermsOfService'));
const PrivacyPolicy = lazy(() => import('@/pages/public/PrivacyPolicy'));
const FAQ = lazy(() => import('@/pages/public/FAQ'));
const Dashboard = lazy(() => import('@/pages/dashboard/Dashboard'));
const SettingsPage = lazy(() => import('@/pages/dashboard/Settings'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgetPassword'));
const LoginPage = lazy(() => import('@/pages/auth/SignIn'));
const RegisterPage = lazy(() => import('@/pages/auth/SignUp'));
const CreateProduct = lazy(() => import('@/pages/dashboard/CreateProduct'));
const MenuPage = lazy(() => import('@/pages/dashboard/MenuPage'));
const ChatsPage = lazy(() => import('@/pages/dashboard/ChatPage'));
const ProfilePage = lazy(() => import('@/pages/dashboard/Profile'));
const ProfileSettings = lazyNamed(
  () => import('@/components/settings/pages/ProfileSettings'),
  'ProfileSettings',
);
const ActivityLog = lazyNamed(
  () => import('@/components/settings/pages/ActivityLog'),
  'ActivityLog',
);
const SettingsHome = lazyNamed(
  () => import('@/components/settings/pages/SettingsHome'),
  'SettingsHome',
);
const MessageWindow = lazy(() => import('@/components/chat/WindowMessage'));
const NewChatSelector = lazy(() => import('@/components/chat/NewChatSelector'));
const ChatPlaceholder = lazy(() => import('@/components/chat/ChatPlaceholder'));
const DealsAndOffers = lazy(() => import('@/pages/dashboard/Deals&Offer'));
const CartPage = lazy(() => import('@/pages/dashboard/CartPage'));
const CheckoutPage = lazy(() => import('@/pages/dashboard/CheckoutPage'));
const OrdersPage = lazy(() => import('@/pages/dashboard/Orders'));
const OrderDetailsPage = lazy(() => import('@/pages/dashboard/OrderDetails'));
const ProductDetailsPage = lazy(() => import('@/pages/dashboard/ProductDetails'));
const BookmarkPage = lazy(() => import('@/pages/dashboard/BookmarkPage'));
const PasswordSecurity = lazy(() => import('@/components/settings/pages/Password&Security'));
const NotificationsPage = lazy(() => import('@/components/settings/pages/NotificationLog'));
const AboutPage = lazy(() => import('@/pages/public/About'));
const ContactPage = lazy(() => import('@/pages/public/Contact'));
const PaylukSetupPage = lazy(() => import('@/pages/dashboard/PaylukSetupPage'));
const ImageSearch = lazyNamed(() => import('@/pages/dashboard/ImageSearch'), 'ImageSearch');
const PaymentCompletePage = lazy(() => import('@/pages/dashboard/PaymentCompletePage'));
const WalletPage = lazy(() => import('@/pages/dashboard/Wallet'));
const WalletOverviewPage = lazy(() => import('@/components/wallets/pages/WalletOverviewPage'));
const TransactionHistoryPage = lazy(
  () => import('@/components/wallets/pages/TransactionHistoryPage'),
);
const HeldOrdersPage = lazy(() => import('@/components/wallets/pages/HeldOrdersPage'));
const WithdrawalPage = lazy(() => import('@/components/wallets/pages/WithdrawalPage'));
const InventoryPage = lazy(() => import('@/pages/dashboard/Inventory'));

// --- Auth Routes ---
export const authenticationRoutePaths = [
  { path: AUTH_ROUTES.SIGN_IN, element: <LoginPage /> },
  { path: AUTH_ROUTES.SIGN_UP, element: <RegisterPage /> },
  { path: AUTH_ROUTES.GOOGLE_OAUTH_CALLBACK, element: <GoogleOAuthFailure /> },
  { path: AUTH_ROUTES.OAUTH_SUCCESS, element: <OAuthSuccessPage /> },
  { path: AUTH_ROUTES.FORGET_PASSWORD, element: <ForgotPasswordPage /> },
];

// --- Protected Routes ---
export const protectedRoutePaths = [
  { path: PROTECTED_ROUTES.DASHBOARD, element: <Dashboard /> },
  {
    path: PROTECTED_ROUTES.SETTINGS, // This is "/dashboard/settings"
    element: <SettingsPage />,
    children: [
      { index: true, element: <SettingsHome /> },
      { path: 'profile', element: <ProfileSettings /> },
      { path: 'activities', element: <ActivityLog activities={[]} /> },
      { path: 'security', element: <PasswordSecurity /> },
    ],
  },
  {
    path: PROTECTED_ROUTES.WALLET,
    element: <WalletPage />,
    children: [
      { index: true, element: <WalletOverviewPage /> },
      { path: 'overview', element: <WalletOverviewPage /> },
      { path: 'transactions', element: <TransactionHistoryPage /> },
      { path: 'held', element: <HeldOrdersPage /> },
      { path: 'withdraw', element: <WithdrawalPage /> },
      // Old wallet pages: orders now live in My Orders and Shop Orders.
      ...['activities', 'seller-transactions', 'buyer-transactions', 'claim-funds', 'respond-to-dispute', 'open-dispute', 'confirm-payment'].map(
        (path) => ({ path, element: <Navigate to="/dashboard/wallet/overview" replace /> }),
      ),
    ],
  },
  {
    path: PROTECTED_ROUTES.CHAT,
    element: <ChatsPage />,
    children: [
      {
        index: true,
        element: <ChatPlaceholder />, // Desktop: "Select a chat"; Mobile: (handled by CSS)
      },
      {
        path: ':conversationId',
        element: <MessageWindow />, // Shows the bubbles and input
      },
      {
        path: 'new',
        element: <NewChatSelector />, // Shows followers/following list
      },
    ],
  },
  { path: PROTECTED_ROUTES.USER_PROFILE, element: <ProfilePage /> },
  { path: PROTECTED_ROUTES.SETTINGS_PAYLUK_SETUPPAGE, element: <PaylukSetupPage /> },
  { path: PROTECTED_ROUTES.BUSINESS_PROFILE, element: <ProfilePage /> },
  { path: PROTECTED_ROUTES.MENU, element: <MenuPage /> },
  { path: PROTECTED_ROUTES.PRODUCT_DETAIL, element: <ProductDetailsPage /> },
  { path: PROTECTED_ROUTES.BOOKMARK, element: <BookmarkPage /> },
  { path: PROTECTED_ROUTES.CREATE_PRODUCT, element: <CreateProduct /> },
  { path: PROTECTED_ROUTES.DEALS_OFFER, element: <DealsAndOffers /> },
  { path: PROTECTED_ROUTES.NOTIFICATION, element: <NotificationsPage /> },
  { path: PROTECTED_ROUTES.CART, element: <CartPage /> },
  { path: PROTECTED_ROUTES.CHECKOUT, element: <CheckoutPage /> },
  { path: PROTECTED_ROUTES.ORDER, element: <OrdersPage /> },
  // Checkout and the payment page send buyers here; details link to /:orderId.
  { path: '/dashboard/orders', element: <OrdersPage /> },
  { path: '/dashboard/orders/:orderId', element: <OrderDetailsPage /> },
  { path: PROTECTED_ROUTES.IMAGE_SEARCH, element: <ImageSearch /> },
  { path: PROTECTED_ROUTES.INVENTORY, element: <InventoryPage /> },
  { path: BASE_ROUTE.PAYLUK_PAYMENT_COMPLETE, element: <PaymentCompletePage /> },
  { path: BASE_ROUTE.PAYMENT_COMPLETE, element: <PaymentCompletePage /> },
];

// --- Public/Base Routes ---
export const baseRoutePaths = [
  // ura.com.ng opens straight into the feed (browsable without signing in).
  { path: BASE_ROUTE.HOME, element: <Navigate to="/dashboard" replace /> },
  // The old welcome page is kept here for marketing links.
  { path: '/welcome', element: <Home /> },
  { path: BASE_ROUTE.ABOUT, element: <AboutPage /> },
  { path: BASE_ROUTE.CONTACT, element: <ContactPage /> },
  { path: BASE_ROUTE.TERMS, element: <TermsOfService /> },
  { path: BASE_ROUTE.PRIVACY, element: <PrivacyPolicy /> },
  { path: BASE_ROUTE.FAQ, element: <FAQ /> },
  // Public post permalink so shared links resolve (and work for logged-out users).
  { path: '/posts/:id', element: <PostDetail /> },
  // Public marketplace so visitors can browse products before signing in.
  { path: '/products', element: <ProductsPage /> },
  // Public so the email link works whether or not the user is logged in,
  // and so the "Verify Now" banner isn't bounced by the auth-redirect guard.
  { path: AUTH_ROUTES.VERIFY_EMAIL, element: <VerifyEmail /> },
  { path: AUTH_ROUTES.RESET_PASSWORD, element: <ResetPassword /> },
  // Business vanity URL — ura.com.ng/<slug> — e.g. ura.com.ng/extreme-shawarma.
  // React Router ranks static paths (e.g. /about) above this dynamic one, so
  // it can never shadow the routes above regardless of list order; the
  // backend's RESERVED_SLUGS list is the actual guard against a business
  // claiming one of those names as its slug.
  { path: '/:businessSlug', element: <BusinessPage /> },
];

// --- Utility ---
export const isAuthRoute = (pathname: string): boolean => {
  return Object.values(AUTH_ROUTES).includes(pathname);
};
