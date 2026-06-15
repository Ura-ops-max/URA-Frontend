// src/components/nav/DashboardNav.tsx
import { Link, useLocation } from 'react-router-dom';
import Logo from '../shared/Logo';
import { menuItems } from '@/lib/data';
import { cn } from '@/lib/utils';
import { DashboardAvatar } from '../dashboard/DashboardAvatar';
import { Search, Settings } from 'lucide-react'; // Import Search icon

// Add props definition
interface DashboardNavProps {
  onSearchClick: () => void;
}

// Rename the component and accept the new prop
const DashboardNav: React.FC<DashboardNavProps> = ({ onSearchClick }) => {
  const location = useLocation(); // Use hook for location access

  // We'll filter the menuItems to find the Search item and give it special treatment
  // const searchItem = menuItems.find(item => item.name === 'Search');
  const visibleMenuItems = menuItems.filter(
    (item) => item.name !== 'Search' && item.name !== 'Picture Search',
  );

  return (
    <header className="sticky top-0 z-20 w-full bg-white shadow-md">
      <div className="container mx-auto flex items-center justify-between px-4 lg:px-16 py-4">
        <div aria-label="home" className="flex items-center space-x-2">
          <Logo url="/dashboard" />
        </div>

        {/* Desktop Nav - Using the provided structure */}
        <div className="absolute inset-0 m-auto hidden size-fit lg:block">
          <ul className="flex gap-8 text-sm">
            {visibleMenuItems.map(({ name, to, icon: Icon }) => {
              const isActive = location.pathname === to;
              return (
                <li key={to}>
                  <Link
                    to={to}
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
            {/* Custom Search Link for Desktop */}
            <li>
              <button
                onClick={onSearchClick}
                className="flex items-center gap-1 duration-150 text-muted-foreground hover:text-accent-foreground"
              >
                {/* Use the appropriate icon/text for your "Search" link */}
                <Search size={16} />
                <span>Search</span>
              </button>
            </li>
            {/* Assuming Picture Search is a separate button/link */}
            <li>
              <button className="flex items-center gap-1 duration-150 text-muted-foreground hover:text-accent-foreground">
                <Search size={16} />
                <span>Picture Search</span>
              </button>
            </li>
          </ul>
        </div>

        {/* Right Side Icons (Mobile and Desktop) */}
        <div className="flex w-fit items-center space-x-4">
          {/* Search Icon visible on Mobile, hidden on Desktop */}
          <button
            onClick={onSearchClick}
            className="p-2 lg:hidden text-gray-700 hover:text-orange-500"
            aria-label="Open Search"
          >
            <Search className="w-5 h-5" />
          </button>

          <Link to="/dashboard/settings">
            <Settings className="text-orange-400" />
          </Link>
          <DashboardAvatar />
        </div>
      </div>
    </header>
  );
};

export default DashboardNav;
