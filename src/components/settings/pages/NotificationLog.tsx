import { useState } from 'react';
import { Bell, Trash2, CheckCircle2, ArchiveX, CheckSquare, Square, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { useNotificationContext } from '@/context/notification-provider';
import DashboardContainer from '@/layout/DashboardContainer';
import ProfileCard from '@/components/dashboard/ProfileCard';
import SidebarWidget from '@/components/dashboard/SidebarWidget';
import ChatList from '@/components/dashboard/ChatList';
import { useAuthContext } from '@/context/auth-provider';
import { useIsDesktop } from '@/hooks/use-is-desktop';
import { useChat } from '@/hooks/use-chat';
import { cn } from '@/lib/utils';
import { Navigate } from 'react-router-dom';

const NotificationsPage = () => {
  const { user, related } = useAuthContext();
  const isDesktop = useIsDesktop();
  const { notifications, markAllAsRead, clearAll, markAsRead, deleteNotification } =
    useNotificationContext();

  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const activeProfileId = user?._id;
  const { conversations, isError: chatError } = useChat(activeProfileId!);

  if (!user || !related) return <Navigate to="/auth/login" replace />;

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'read') return n.isRead;
    return true;
  });

  // Logic: Check if any selected item is currently unread
  const hasUnreadInSelection = selectedIds.some((id) => {
    const notif = notifications.find((n) => n._id === id);
    return notif && !notif.isRead;
  });

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handleBulkDelete = () => {
    selectedIds.forEach((id) => deleteNotification(id));
    resetSelection();
  };

  const handleBulkRead = () => {
    selectedIds.forEach((id) => {
      const notif = notifications.find((n) => n._id === id);
      if (notif && !notif.isRead) markAsRead(id);
    });
    resetSelection();
  };

  const resetSelection = () => {
    setSelectedIds([]);
    setIsSelectionMode(false);
  };

  return (
    <DashboardContainer
      leftColumn={
        <div className="hidden lg:block sticky top-8 space-y-6">
          <ProfileCard user={user} related={related} />
          <SidebarWidget isDesktop={isDesktop} isError={chatError} errorTitle="Messages">
            <ChatList chatList={conversations} activeProfileId={activeProfileId!} />
          </SidebarWidget>
        </div>
      }
    >
      <div className="flex flex-col lg:flex-row gap-6 md:gap-8 min-h-screen lg:min-h-[calc(100vh-120px)]">
        {/* SIDE NAV - Improved Mobile Responsiveness */}
        <div className="w-full lg:w-64 shrink-0 px-2 md:px-0">
          <div className="lg:sticky lg:top-8">
            <div className="mb-4 md:mb-6">
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                Activity
              </h1>
              <p className="text-xs md:text-sm text-slate-500 font-medium">Updates & Alerts</p>
            </div>

            <div className="flex lg:flex-col gap-2 overflow-x-auto no-scrollbar pb-2 lg:pb-0">
              <button
                onClick={markAllAsRead}
                className="whitespace-nowrap flex items-center gap-2 md:gap-3 p-3 md:p-4 bg-white hover:bg-emerald-50 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 shadow-sm transition-all border border-slate-50"
              >
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                <span>Mark All Read</span>
              </button>

              <button
                onClick={() => {
                  setIsSelectionMode(!isSelectionMode);
                  setSelectedIds([]);
                }}
                className={cn(
                  'whitespace-nowrap flex items-center gap-2 md:gap-3 p-3 md:p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm transition-all border',
                  isSelectionMode
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-600 border-slate-50',
                )}
              >
                {isSelectionMode ? (
                  <X size={16} className="shrink-0" />
                ) : (
                  <CheckSquare size={16} className="shrink-0" />
                )}
                <span>{isSelectionMode ? 'Cancel' : 'Select'}</span>
              </button>

              <button
                onClick={clearAll}
                className="whitespace-nowrap flex items-center gap-2 md:gap-3 p-3 md:p-4 bg-white hover:bg-red-50 rounded-2xl text-[10px] font-black uppercase tracking-widest text-red-500 shadow-sm transition-all border border-slate-50"
              >
                <Trash2 size={16} className="shrink-0" />
                <span>Clear All</span>
              </button>
            </div>
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 min-w-0 px-2 md:px-0">
          {/* DYNAMIC ACTION BAR */}
          <div className="flex items-center justify-between mb-6 border-b border-slate-100 min-h-[48px]">
            <div className="flex gap-4 md:gap-8">
              {['all', 'unread', 'read'].map((t) => (
                <button
                  key={t}
                  onClick={() => setFilter(t as any)}
                  className={cn(
                    'pb-4 text-[10px] md:text-xs font-black uppercase tracking-[0.1em] transition-all relative',
                    filter === t ? 'text-orange-600' : 'text-slate-400 hover:text-slate-600',
                  )}
                >
                  {t}
                  {filter === t && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600"
                    />
                  )}
                </button>
              ))}
            </div>

            <AnimatePresence>
              {isSelectionMode && selectedIds.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex gap-2 mb-3"
                >
                  {hasUnreadInSelection && (
                    <button
                      onClick={handleBulkRead}
                      className="px-3 py-1.5 bg-emerald-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg shadow-emerald-100"
                    >
                      <CheckCircle2 size={12} /> Mark Read
                    </button>
                  )}
                  <button
                    onClick={handleBulkDelete}
                    className="px-3 py-1.5 bg-red-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg shadow-red-100"
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="max-w-3xl space-y-3 pb-24">
            <AnimatePresence mode="popLayout">
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map((notif: any) => (
                  <motion.div
                    key={notif._id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex items-center gap-2 md:gap-4 group"
                  >
                    {isSelectionMode && (
                      <button
                        onClick={() => toggleSelect(notif._id)}
                        className="p-1 md:p-2 shrink-0 transition-transform active:scale-90"
                      >
                        {selectedIds.includes(notif._id) ? (
                          <CheckSquare size={22} className="text-orange-600" />
                        ) : (
                          <Square size={22} className="text-slate-300 hover:text-slate-400" />
                        )}
                      </button>
                    )}

                    <div
                      onClick={() => {
                        if (isSelectionMode) toggleSelect(notif._id);
                        else if (!notif.isRead) markAsRead(notif._id);
                      }}
                      className={cn(
                        'flex-1 relative p-4 md:p-5 bg-white rounded-[24px] border transition-all duration-300 cursor-pointer overflow-hidden',
                        !notif.isRead
                          ? 'border-orange-100 shadow-sm border-l-4 border-l-orange-500 bg-white'
                          : 'border-slate-100 opacity-70 bg-slate-50/30',
                      )}
                    >
                      <div className="flex items-start gap-3 md:gap-4">
                        <div
                          className={cn(
                            'p-2.5 md:p-3 rounded-xl shrink-0 transition-colors',
                            !notif.isRead
                              ? 'bg-orange-50 text-orange-600'
                              : 'bg-slate-100 text-slate-400',
                          )}
                        >
                          <Bell size={18} fill={!notif.isRead ? 'currentColor' : 'none'} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-0.5">
                            <h4
                              className={cn(
                                'text-xs md:text-sm font-bold truncate pr-2',
                                !notif.isRead ? 'text-slate-900' : 'text-slate-600',
                              )}
                            >
                              {notif.title}
                            </h4>
                            <span className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-tighter shrink-0">
                              {format(new Date(notif.createdAt), 'MMM dd')}
                            </span>
                          </div>
                          <p className="text-xs md:text-sm text-slate-500 leading-relaxed line-clamp-2">
                            {notif.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="py-24 flex flex-col items-center text-center opacity-40">
                  <ArchiveX size={40} className="text-slate-300 mb-3" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Inbox Clean</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </DashboardContainer>
  );
};

export default NotificationsPage;
