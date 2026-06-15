import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import React from 'react';
import Logo from '../shared/Logo';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { menuItems } from '@/lib/data';

export const NavBar = () => {
  const [menuState, setMenuState] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const location = useLocation();

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
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};
