import { NavBar } from '@/components/nav/NavBar';
import Footer from '@/components/shared/Footer';
import { AuthProvider } from '@/context/auth-provider';
import { CartProvider } from '@/context/cart-provider';
import { Outlet, useLocation } from 'react-router-dom';

// The general website pages that live at a single path segment. Anything else
// that is a single segment (e.g. /xtreme-food-truck) is a business link page,
// which is the ONLY place the shop-style bar (Home + Cart) should appear.
const STATIC_PUBLIC_PATHS = new Set(['about', 'contact', 'terms', 'privacy', 'faq', 'products', 'welcome']);

const PublichLayout = () => {
  const { pathname } = useLocation();
  const segments = pathname.split('/').filter(Boolean);
  const isBusinessLinkPage = segments.length === 1 && !STATIC_PUBLIC_PATHS.has(segments[0]);

  return (
    <AuthProvider>
      <CartProvider>
        <div>
          <NavBar variant={isBusinessLinkPage ? 'shop' : 'site'} />
          <div className="min-h-dvh">
            <Outlet />
          </div>
          <Footer />
        </div>
      </CartProvider>
    </AuthProvider>
  );
};

export default PublichLayout;
