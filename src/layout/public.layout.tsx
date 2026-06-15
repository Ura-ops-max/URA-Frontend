import { NavBar } from '@/components/nav/NavBar';
import Footer from '@/components/shared/Footer';
import { AuthProvider } from '@/context/auth-provider';
import { CartProvider } from '@/context/cart-provider';
import { Outlet } from 'react-router-dom';

const PublichLayout = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <div>
          <NavBar />
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
