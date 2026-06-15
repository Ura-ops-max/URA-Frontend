import { useNavigate, useLocation, NavLink, Outlet } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { walletsGroups } from '@/components/wallets/wallets.configs';

const WalletPage = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isMenuRoot = pathname === '/dashboard/wallet' || pathname === '/dashboard/wallet/';

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50/30 pb-20 md:pb-0">
      {/* LEFT COLUMN: Always visible on Desktop. On Mobile, hide if a sub-page is open */}
      <div
        className={cn(
          'w-full md:w-80 bg-white border-r border-gray-100 flex-shrink-0 flex flex-col transition-all',
          !isMenuRoot ? 'hidden md:flex' : 'flex',
        )}
      >
        <div className="p-6 border-b border-gray-50">
          <h1 className="text-2xl font-bold">Wallet</h1>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-8">
          {walletsGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-2">
              <h3 className="px-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                {group.label}
              </h3>
              {group.items.map((item) => (
                <NavLink
                  key={item.id}
                  to={`/dashboard/wallet/${item.id}`}
                  className={({ isActive }) =>
                    cn(
                      'w-full flex items-center justify-between p-3 rounded-xl transition-all',
                      isActive
                        ? 'bg-orange-50 text-orange-600 shadow-sm'
                        : 'hover:bg-gray-50 text-gray-700',
                    )
                  }
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-current/10">
                      <item.icon size={18} />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-sm">{item.title}</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="opacity-30" />
                </NavLink>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT COLUMN: The Content Area */}
      <div
        className={cn(
          'flex-1 bg-white flex flex-col overflow-y-auto',
          isMenuRoot ? 'hidden md:flex' : 'flex',
        )}
      >
        {/* Mobile Header: Back button and Title */}
        {!isMenuRoot && (
          <div className="md:hidden p-4 flex items-center border-b sticky top-0 bg-white z-10">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/dashboard/wallet')}
              className="mr-2"
            >
              <ChevronLeft size={24} />
            </Button>
            <h1 className="font-bold text-lg">Wallet</h1>
          </div>
        )}

        <div className="w-full max-w-4xl mx-auto p-6 md:p-10">
          {/* THE OUTLET: This renders ProfileSettings, ActivityLog, etc. */}
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default WalletPage;
