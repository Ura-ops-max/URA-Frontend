import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { rememberReturnTo } from '@/lib/return-to';
import { User, LogOut, Settings } from 'lucide-react';
import { useAuthContext } from '@/context/auth-provider';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { generateAvatarUrl } from '@/utils/avatar-generator'; // Adjust path if needed
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import LogoutDialog from '../shared/LogoutDialog';

export const DashboardAvatar = () => {
  const { isLoading, user } = useAuthContext();
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const navigate = useNavigate();

  if (isLoading) return null;
  if (!user)
    return (
      <button
        onClick={() => {
          rememberReturnTo(window.location.pathname + window.location.search);
          navigate('/auth/login');
        }}
        className="rounded-full bg-[#FF6B35] px-4 py-2 text-sm font-bold text-white hover:bg-[#e85a20]"
      >
        Sign in
      </button>
    );

  return (
    <>
      <DropdownMenu>
        {/* Removed <Link>. The Trigger handles the click now. */}
        <DropdownMenuTrigger asChild>
          <button className="outline-none block rounded-full hover:ring-2 hover:ring-orange-100 transition-all">
            <Avatar className="h-9 w-9 border border-gray-200">
              <AvatarImage
                src={
                  user.profilePicture || generateAvatarUrl(`${user?.firstName} ${user?.lastName}`)
                }
                alt={user.firstName}
              />
              <AvatarFallback className="p-0">
                <img src={generateAvatarUrl(`${user?.firstName} ${user?.lastName}`)} alt="avatar" />
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-56" align="end" sideOffset={10}>
          <div className="px-2 py-1.5 text-sm font-semibold text-gray-900">My Account</div>
          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="cursor-pointer flex items-center gap-2"
            onClick={() => navigate(`/dashboard/profile/user/${user._id}`)}
          >
            <User size={16} />
            <span>Profile</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            className="cursor-pointer flex items-center gap-2"
            onClick={() => navigate('/dashboard/settings')}
          >
            <Settings size={16} />
            <span>Settings</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="cursor-pointer flex items-center gap-2 text-red-600 focus:text-red-600 focus:bg-red-50"
            onClick={() => setIsLogoutOpen(true)}
          >
            <LogOut size={16} />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* The Dialog that pops up when 'Log out' is clicked */}
      <LogoutDialog isOpen={isLogoutOpen} setIsOpen={setIsLogoutOpen} />
    </>
  );
};
