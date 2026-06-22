import { AUTH_ROUTES, BASE_ROUTE, PROTECTED_ROUTES } from './routePaths';

import Home from '@/pages/public/Home';
import GoogleOAuthFailure from '@/pages/auth/GoogleOAuthFailure';
import OAuthSuccessPage from '@/pages/auth/OAuthSuccessPage';
import VerifyEmail from '@/pages/auth/VerifyEmail';
import Dashboard from '@/pages/dashboard/Dashboard';
import SettingsPage from '@/pages/dashboard/Settings';
import ForgotPasswordPage from '@/pages/auth/ForgetPassword';
import LoginPage from '@/pages/auth/SignIn';
import RegisterPage from '@/pages/auth/SignUp';
import CreateProduct from '@/pages/dashboard/CreateProduct';
import MenuPage from '@/pages/dashboard/MenuPage';
import ChatsPage from '@/pages/dashboard/ChatPage';
import ProfilePage from '@/pages/dashboard/Profile';
import { ProfileSettings } from '@/components/settings/pages/ProfileSettings';
import { ActivityLog } from '@/components/settings/pages/ActivityLog';
import { SettingsHome } from '@/components/settings/pages/SettingsHome';
import MessageWindow from '@/components/chat/WindowMessage';
import NewChatSelector from '@/components/chat/NewChatSelector';
import ChatPlaceholder from '@/components/chat/ChatPlaceholder';
import DealsAndOffers from '@/pages/dashboard/Deals&Offer';
import CartPage from '@/pages/dashboard/CartPage';
import CheckoutPage from '@/pages/dashboard/CheckoutPage';
import OrdersPage from '@/pages/dashboard/Orders';
import ProductDetailsPage from '@/pages/dashboard/ProductDetails';
import BookmarkPage from '@/pages/dashboard/BookmarkPage';
import PasswordSecurity from '@/components/settings/pages/Password&Security';
import NotificationsPage from '@/components/settings/pages/NotificationLog';
import AboutPage from '@/pages/public/About';
import ContactPage from '@/pages/public/Contact';
import PaylukSetupPage from '@/pages/dashboard/PaylukSetupPage.tsx';
import { ImageSearch } from '@/pages/dashboard/ImageSearch';
import PaymentCompletePage from '@/pages/dashboard/PaymentCompletePage.tsx';
import WalletPage from '@/pages/dashboard/Wallet';
import WalletOverviewPage from '@/components/wallets/pages/WalletOverviewPage';
import TransactionHistoryPage from '@/components/wallets/pages/TransactionHistoryPage';
import SellerTransactionsPage from '@/components/wallets/pages/SellerTransactionsPage';
import ClaimFundsPage from '@/components/wallets/pages/ClaimFundsPage';
import RespondToDisputePage from '@/components/wallets/pages/RespondToDisputePage';
import BuyerTransactionsPage from '@/components/wallets/pages/BuyerTransactionsPage';
import OpenDisputePage from '@/components/wallets/pages/OpenDisputePage';
import ConfirmPaymentPage from '@/components/wallets/pages/ConfirmPaymentPage';
import WithdrawalPage from '@/components/wallets/pages/WithdrawalPage';

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
      { path: 'seller-transactions', element: <SellerTransactionsPage /> },
      { path: 'claim-funds', element: <ClaimFundsPage /> },
      { path: 'respond-to-dispute', element: <RespondToDisputePage /> },
      { path: 'buyer-transactions', element: <BuyerTransactionsPage /> },
      { path: 'open-dispute', element: <OpenDisputePage /> },
      { path: 'confirm-payment', element: <ConfirmPaymentPage /> },
      { path: 'withdraw', element: <WithdrawalPage /> },
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
  { path: PROTECTED_ROUTES.IMAGE_SEARCH, element: <ImageSearch /> },
  { path: BASE_ROUTE.PAYLUK_PAYMENT_COMPLETE, element: <PaymentCompletePage /> },
  //   {path: PROTECTED_ROUTES.STORE_MANAGEMENT, element: <StoreManagement /> },
];

// --- Public/Base Routes ---
export const baseRoutePaths = [
  { path: BASE_ROUTE.HOME, element: <Home /> },
  { path: BASE_ROUTE.ABOUT, element: <AboutPage /> },
  { path: BASE_ROUTE.CONTACT, element: <ContactPage /> },
  // Public so the email link works whether or not the user is logged in,
  // and so the "Verify Now" banner isn't bounced by the auth-redirect guard.
  { path: AUTH_ROUTES.VERIFY_EMAIL, element: <VerifyEmail /> },
];

// --- Utility ---
export const isAuthRoute = (pathname: string): boolean => {
  return Object.values(AUTH_ROUTES).includes(pathname);
};
