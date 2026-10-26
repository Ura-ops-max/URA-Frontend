import { useEffect } from 'react';
import { socketService } from '@/services/socket.service';
import { useAuthContext } from './auth-provider';
import { toast } from 'sonner';

export const SocketSync = () => {
  const { user, isAuthenticated } = useAuthContext();

  useEffect(() => {
    if (isAuthenticated && user) {
      const profileId = user._id || (user as any).userId;

      // 1. Establish Connection
      socketService.connect();

      // 2. Identity Setup
      socketService.setup(profileId.toString());

      // 3. Listen for Live Notifications
      socketService.on('notification_received', (data) => {
        toast.info(data.message || 'You have a new notification');
      });

      // 4. Listen for Real-time Messages
      socketService.on('message:received', (newMessage) => {
        // You can add logic here to check if the user is already on the chat page
        toast(`New message from ${newMessage.sender?.firstName || 'User'}`);
      });

      // Cleanup on logout or unmount
      return () => {
        // Optional: you can choose not to disconnect if you want the
        // socket to stay alive during brief state flickers
        // socketService.disconnect();
      };
    }
  }, [isAuthenticated, user]);

  return null; // Logic only, no UI impact
};
