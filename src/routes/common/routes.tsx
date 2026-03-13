import { AUTH_ROUTES, BASE_ROUTE, PROTECTED_ROUTES } from './routePaths';

import Home from '@/pages/public/Home';
import GoogleOAuthFailure from '@/pages/auth/GoogleOAuthFailure';
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
import PaylukSetupPage from "@/pages/dashboard/PaylukSetupPage.tsx";

// --- Auth Routes ---
export const authenticationRoutePaths = [
  { path: AUTH_ROUTES.SIGN_IN, element: <LoginPage /> },
  { path: AUTH_ROUTES.SIGN_UP, element: <RegisterPage /> },
  { path: AUTH_ROUTES.GOOGLE_OAUTH_CALLBACK, element: <GoogleOAuthFailure /> },
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
    ]
  },
  {
    path: PROTECTED_ROUTES.CHAT, 
    element: <ChatsPage />, // This is your Layout Manager
    children: [
      { 
        index: true, 
        element: <ChatPlaceholder /> // Desktop: "Select a chat"; Mobile: (handled by CSS)
      },
      { 
        path: ':conversationId', 
        element: <MessageWindow /> // Shows the bubbles and input
      },
      { 
        path: 'new', 
        element: <NewChatSelector /> // Shows followers/following list
      },
    ]
  },
  { path: PROTECTED_ROUTES.USER_PROFILE, element: <ProfilePage /> },
  {path: PROTECTED_ROUTES.PAYLUK_SETUPPAGE, element: <PaylukSetupPage />},
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
];

// --- Public/Base Routes ---
export const baseRoutePaths = [
  { path: BASE_ROUTE.HOME, element: <Home /> },
  { path: BASE_ROUTE.ABOUT, element: <AboutPage /> },
];

// --- Utility ---
export const isAuthRoute = (pathname: string): boolean => {
  return Object.values(AUTH_ROUTES).includes(pathname);
};
