import { Menu, X, ShoppingCart, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import React from 'react';
import Logo from '../shared/Logo';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { menuItems } from '@/lib/data';
import { useAuthContext } from '@/context/auth-provider';
import { useCartContext } from '@/context/cart-provider';
import { PROTECTED_ROUTES } from '@/routes/common/routePaths';

/**
 * Top bar for the public pages.
 *
 * `variant="shop"` is used ONLY on a business's own link page
 * (ura.com.ng/<slug>). On that page a signed-in customer sees Home + Cart
 * instead of Login / Sign Up / Get Started. Every other public page keeps the
 * default "site" bar exactly as before.
 */
export const NavBar = ({ variant = 'site' }: { variant?: 'site' | 'shop' }) => {
  const [menuState, setMenuState] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const location = useLocation();
  const { isAuthenticated } = useAuthContext();
  const { totalItems } = useCartContext();

  // Show the Home + Cart bar only on a business link page, for signed-in customers.
  const showShop = variant === 'shop' && isAuthenticated;
  const cartCount = showShop ? totalItems : 0;

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, to: string) => {
    if (to.startsWith('#')) {
      e.preventDefault(); // Stop React Router from trying to change the URL path
      const element = document.getElementById(to.replace('#', ''));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
      setMenuState(false); // Close mobile menu if open
    }
  };
  return (
    <header>
      <nav data-state={menuState && 'active'} className="fixed z-20 w-full px-2">
        <div
          className={cn(
            'mx-auto mt-2 max-w-6xl px-6 transition-all duration-300 lg:px-12',
            isScrolled && 'bg-background/50 max-w-4xl rounded-2xl border backdrop-blur-lg lg:px-5',
          )}
        >
          <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
            {/* Logo */}
            <div className="flex w-full justify-between lg:w-auto">
              <div aria-label="home" className="flex items-center space-x-2">
                <Logo url="/" />
              </div>

              {/* Shop mode (phone): Home + Cart always visible next to the menu button. */}
              {showShop && (
                <div className="ml-auto mr-4 flex items-center gap-2 lg:hidden">
                  <Link
                    to="/dashboard"
                    aria-label="Home"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md border bg-white text-gray-800"
                  >
                    <LayoutDashboard size={18} />
                  </Link>
                  <CartButton count={cartCount} compact />
                </div>
              )}

              <button
                onClick={() => setMenuState(!menuState)}
                aria-label={menuState ? 'Close Menu' : 'Open Menu'}
                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden"
              >
                <Menu className="in-data-[state=active]:rotate-180 in-data-[state=active]:scale-0 in-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
                <X className="in-data-[state=active]:rotate-0 in-data-[state=active]:scale-100 in-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
              </button>
            </div>

            {/* Desktop Nav */}
            <div className="absolute inset-0 m-auto hidden size-fit lg:block">
              <ul className="flex gap-8 text-sm">
                {menuItems.map(({ name, to, icon: Icon }) => {
                  const isActive = location.pathname === to;
                  return (
                    <li key={to}>
                      <Link
                        to={to}
                        onClick={(e) => handleNavClick(e, to)}
                        className={cn(
                          'flex items-center gap-1 duration-150',
                          isActive
                            ? 'text-foreground font-semibold'
                            : 'text-muted-foreground hover:text-accent-foreground',
                        )}
                      >
                        <Icon size={16} />
                        <span>{name}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Mobile Menu */}
            <div className="bg-background in-data-[state=active]:block lg:in-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent">
              <div className="lg:hidden">
                <ul className="space-y-6 text-base">
                  {menuItems.map(({ name, to, icon: Icon }) => {
                    const isActive = location.pathname === to;
                    return (
                      <li key={to}>
                        <Link
                          to={to}
                          className={cn(
                            'flex items-center gap-2 duration-150',
                            isActive
                              ? 'text-foreground font-semibold'
                              : 'text-muted-foreground hover:text-accent-foreground',
                          )}
                        >
                          <Icon size={18} />
                          <span>{name}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {showShop ? (
                // Business link page, signed in: Home (the URA feed) + Cart.
                <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit">
                  <Button asChild variant="outline" size="sm">
                    <Link to="/dashboard" onClick={() => setMenuState(false)}>
                      <LayoutDashboard size={16} className="mr-1" /> Home
                    </Link>
                  </Button>
                  <CartButton count={cartCount} onClick={() => setMenuState(false)} />
                </div>
              ) : (
                <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className={cn(isScrolled && 'lg:hidden')}
                  >
                    <Link to="/auth/login">Login</Link>
                  </Button>
                  <Button asChild size="sm" className={cn(isScrolled && 'lg:hidden')}>
                    <Link to="/auth/register">Sign Up</Link>
                  </Button>
                  <Button asChild size="sm" className={cn(isScrolled ? 'lg:inline-flex' : 'hidden')}>
                    <Link to="/auth/register">Get Started</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

/** Cart button with a live item count — opens the cart, then checkout. */
function CartButton({
  count,
  compact = false,
  onClick,
}: {
  count: number;
  compact?: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      to={PROTECTED_ROUTES.CART}
      onClick={onClick}
      aria-label={`Cart, ${count} item${count === 1 ? '' : 's'}`}
      className={cn(
        'relative inline-flex items-center justify-center gap-1.5 rounded-md bg-orange-500 font-medium text-white transition hover:bg-orange-600',
        compact ? 'h-9 w-9' : 'h-8 px-3 text-sm',
      )}
    >
      <ShoppingCart size={compact ? 18 : 16} />
      {!compact && <span>Cart</span>}
      {count > 0 && (
        <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-gray-900 px-1 text-[10px] font-bold text-white">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  );
}
