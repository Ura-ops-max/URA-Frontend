import { useState } from 'react';
import { EllipsisIcon, Loader, LogOut, Plus, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarRail,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthContext } from '@/context/auth-provider';
import Logo from './Logo';
import LogoutDialog from './LogoutDialog';
import { NavMain } from '../nav/NavMain';
import { Button } from '../ui/button';
import { generateAvatarUrl } from '@/utils/avatar-generator';

const AppSideBar = () => {
  const { isLoading, user } = useAuthContext();
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <Sidebar
        collapsible="icon"
        className="border-r border-gray-100/50 bg-white/40 backdrop-blur-xl hidden lg:flex"
      >
        <SidebarHeader className="h-auto flex flex-col p-6 space-y-6">
          <div className="flex items-center justify-center group-data-[collapsible=icon]:justify-center">
            <Logo url={`/dashboard`} />
          </div>

          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild className="h-auto p-0 hover:bg-transparent">
                <Button
                  onClick={() => navigate('/dashboard/post/create?type=post')}
                  className="bg-gray-950 text-white hover:bg-black cursor-pointer shadow-lg shadow-gray-200 transition-all active:scale-[0.97] border-none h-11 w-full rounded-xl gap-2 flex items-center justify-center"
                >
                  <Plus size={18} strokeWidth={2.5} className="text-white" />
                  <span className="text-sm font-semibold tracking-tight group-data-[collapsible=icon]:hidden">
                    Create Post
                  </span>
                </Button>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        {/* Applied custom scrollbar here too */}
        <SidebarContent className="bg-transparent px-3 scrollbar-base scrollbar-main">
          <NavMain />
        </SidebarContent>

        <SidebarFooter className="bg-transparent p-4">
          <SidebarMenu>
            <SidebarMenuItem>
              {isLoading ? (
                <div className="flex justify-center py-2">
                  <Loader className="animate-spin text-orange-500" size={18} />
                </div>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton
                      size="lg"
                      className="bg-white/60 backdrop-blur-sm border border-white/40 hover:bg-white hover:shadow-md transition-all rounded-2xl h-14 group px-3"
                    >
                      <Avatar className="h-9 w-9 border-2 border-white shadow-sm ring-1 ring-gray-100">
                        <AvatarImage
                          src={
                            user?.profilePicture ||
                            generateAvatarUrl(`${user?.firstName} ${user?.lastName}`)
                          }
                        />
                        <AvatarFallback className="bg-gray-900 text-white text-xs font-bold">
                          {user?.firstName?.charAt(0)}
                          {user?.lastName?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left ml-2 group-data-[collapsible=icon]:hidden">
                        {/* Text size reduced for a more "designed" look */}
                        <span className="truncate font-bold text-gray-900 text-sm tracking-tight leading-none mb-1">
                          {user?.firstName} {user?.lastName}
                        </span>
                        <span className="truncate text-[11px] text-gray-400 font-medium leading-none uppercase tracking-widest">
                          {user?.email?.split('@')[0]}
                        </span>
                      </div>
                      <EllipsisIcon className="ml-auto size-3.5 text-gray-400 group-data-[collapsible=icon]:hidden" />
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>

                  {/* Dropdown Menu matches the Geist Typography */}
                  <DropdownMenuContent
                    className="w-60 mb-4 rounded-3xl p-2 shadow-2xl border-white/20 backdrop-blur-2xl bg-white/95"
                    side="right"
                    align="end"
                    sideOffset={12}
                  >
                    <DropdownMenuItem
                      className="cursor-pointer rounded-2xl py-3 px-4 focus:bg-gray-50 text-sm font-semibold"
                      onClick={() => navigate(`/dashboard/profile/user/${user?._id}`)}
                    >
                      <User className="mr-3 h-4 w-4 text-gray-400" /> My Profile
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="my-1 bg-gray-50" />
                    <DropdownMenuItem
                      className="text-red-500 font-semibold focus:text-red-600 focus:bg-red-50 cursor-pointer rounded-2xl py-3 px-4 text-sm"
                      onClick={() => setIsLogoutOpen(true)}
                    >
                      <LogOut className="mr-3 h-4 w-4" /> Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <LogoutDialog isOpen={isLogoutOpen} setIsOpen={setIsLogoutOpen} />
    </>
  );
};

export default AppSideBar;
