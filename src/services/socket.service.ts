import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_ROOT_URL || 'http://localhost:5000';

class SocketService {
  private socket: Socket | null = null;
  private currentProfileId: string | null = null;
  public connect() {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        transports: ['websocket'],
      });

      this.socket.on('connect', () => {
        console.log('Connected to Socket Server:', this.socket?.id);
        // CRITICAL: Re-setup if we have a profileId saved
        if (this.currentProfileId) {
          this.setup(this.currentProfileId);
        }
      });

      window.addEventListener('beforeunload', () => {
        this.disconnect();
      });
    }
    return this.socket;
  }

  // Matches backend 'setup' listener
  public setup(profileId: string) {
    this.currentProfileId = profileId;
    this.socket?.emit('setup', profileId);
  }

  // Matches backend 'join_chat' listener
  public joinChat(conversationId: string) {
    this.socket?.emit('join_chat', conversationId);
  }

  public on(event: string, callback: (data: any) => void) {
    this.socket?.on(event, callback);
  }

  public emit(event: string, data: any) {
    this.socket?.emit(event, data);
  }

  // Matches backend 'user_status_changed' emitter
  public onStatusChange(
    callback: (data: { userId: string; status: 'online' | 'offline'; lastSeen?: string }) => void,
  ) {
    this.socket?.on('user_status_changed', callback);
  }

  // Properly removes listeners to prevent memory leaks in ChatPage
  public off(event: string, callback?: (data: any) => void) {
    this.socket?.off(event, callback);
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketService = new SocketService();
