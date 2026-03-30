import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useOutletContext, Link } from 'react-router-dom';
import { ChevronLeft, Send, Plus, Smile, Check, CheckCheck, Clock, X } from 'lucide-react';
import { chatAPI } from '@/lib/chat-api';
import { socketService } from '@/services/socket.service';
import { format, formatDistanceToNow } from 'date-fns';
import { uploadMediaToCloudinary } from '@/services/cloudinary.service';
import EmojiPicker, { Theme } from 'emoji-picker-react';
import { generateAvatarUrl } from '@/utils/avatar-generator';

const MessageWindow = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { chatData, activeProfileId, activeTab } = useOutletContext<any>();
  const { conversations } = chatData;

  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [partnerLastSeen, _setPartnerLastSeen] = useState<string | null>(null);


  const [pendingFile, setPendingFile] = useState<{ file: File; preview: string; type: 'image' | 'video' } | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const currentChat = conversations?.find((c: any) => c._id === conversationId);
  const other = currentChat?.participants.find((p: any) => {
    const pId = typeof p.participantId === 'object' ? p.participantId._id : p.participantId;
    return pId !== activeProfileId;
  });
  const isBusiness = other?.participantModel === 'Business'
  const details = other?.participantId;
  const partnerName = other?.participantModel === 'User'
    ? `${details?.firstName} ${details?.lastName}`
    : details?.businessName || 'Chat';
  const partnerAvatar = details?.profilePicture || details?.businessLogo;
  const partnerId = typeof details === 'object' ? details._id : details;

  const profileRoute = isBusiness ? `/dashboard/profile/business/${partnerId}` : `/dashboard/profile/user/${partnerId}`;


  const [isOnline, setIsOnline] = useState(details?.isOnline || false);

  // --- EFFECT 1: STATUS SYNC ---
  useEffect(() => {
    if (!partnerId) return;

    // Listen for status changes
    const handleStatus = (data: { userId: string; status: 'online' | 'offline' }) => {
      if (data.userId === partnerId) {
        setIsOnline(data.status === 'online');
      }
    };

    // Use your specific socket service methods
    socketService.onStatusChange(handleStatus);

    // IMMEDIATE CHECK: Force a check for this partner on mount
    socketService.emit("check_online_status", partnerId);

    return () => {
      socketService.off('user_status_changed', handleStatus);
    };
  }, [partnerId]);



  // This ensures the server knows you are online and who you are
  useEffect(() => {
    if (activeProfileId) {
      // 1. Identify yourself to the server immediately
      socketService.emit('setup', activeProfileId);

      // 2. Re-identify if the connection drops and comes back
      const handleReconnect = () => {
        socketService.emit('setup', activeProfileId);
      };

      socketService.on('connect', handleReconnect);

      return () => {
        socketService.off('connect', handleReconnect);
      };
    }
  }, [activeProfileId]);

  // --- EFFECT 2: MESSAGES & SOCKETS ---
  useEffect(() => {
    const loadMessages = async () => {
      if (!conversationId || !activeProfileId) return;
      setIsLoading(true);
      try {
        const { data } = await chatAPI.getMessages(conversationId, activeProfileId);
        setMessages(data.data);
      } catch (err) {
        console.error("Failed to load messages", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
    socketService.joinChat(conversationId!);

    // Named functions to satisfy socketService.off(event, callback)
    const handleReceived = (newMessage: any) => {
      if (newMessage.conversation === conversationId) {
        setMessages((prev) => {
          const exists = prev.some((m) => (m._id || m.id) === (newMessage._id || newMessage.id));
          if (exists) return prev;
          const pendingIndex = prev.findIndex(m => m.status === 'pending' && m.content === newMessage.content);
          if (pendingIndex !== -1) {
            const updated = [...prev];
            updated[pendingIndex] = { ...newMessage, status: newMessage.status || 'sent' };
            return updated;
          }
          return [...prev, newMessage];
        });

        const msgSenderId = typeof newMessage.senderId === 'object' ? newMessage.senderId?._id : (newMessage.senderId || newMessage.sender);
        if (msgSenderId !== activeProfileId) {
          chatAPI.getMessages(conversationId!, activeProfileId);
        }
      }
    };

    const handleSeen = ({ seenBy }: any) => {
      if (seenBy !== activeProfileId) {
        setMessages(prev => prev.map(m => m.status !== 'seen' ? { ...m, status: 'seen' } : m));
      }
    };

    const handleDelivered = ({ messageId }: any) => {
      setMessages(prev => prev.map(m => (m._id === messageId && m.status !== 'seen') ? { ...m, status: 'delivered' } : m));
    };

    socketService.on('message:received', handleReceived);
    socketService.on('messages_seen', handleSeen);
    socketService.on('message:delivered', handleDelivered);

    return () => {
      socketService.off('message:received', handleReceived);
      socketService.off('messages_seen', handleSeen);
      socketService.off('message:delivered', handleDelivered);
    };
  }, [conversationId, activeProfileId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (pendingFile?.preview) URL.revokeObjectURL(pendingFile.preview);
      const type = file.type.startsWith('video') ? 'video' : 'image';
      setPendingFile({ file, type, preview: URL.createObjectURL(file) });
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputText.trim() && !pendingFile) || !activeProfileId) return;

    const tempId = `temp-${Date.now()}`;
    const textToSend = inputText;
    const fileToUpload = pendingFile;

    setInputText('');
    setPendingFile(null);
    setShowEmojiPicker(false);

    const optimisticMsg = {
      _id: tempId,
      content: textToSend,
      senderId: activeProfileId,
      media: fileToUpload ? { url: fileToUpload.preview, type: fileToUpload.type } : null,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };

    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      let mediaData = null;
      if (fileToUpload) {
        const cloudinaryUrl = await uploadMediaToCloudinary(fileToUpload.file);
        mediaData = { url: cloudinaryUrl, type: fileToUpload.type };
      }

      await chatAPI.sendMessage({
        conversationId: conversationId!,
        content: textToSend,
        senderId: activeProfileId,
        senderModel: (activeTab === 'PERSONAL' ? 'User' : 'Business'),
        media: mediaData
      } as any);

      if (fileToUpload) URL.revokeObjectURL(fileToUpload.preview);
    } catch (err) {
      console.error("Failed to send", err);
      setMessages((prev) => prev.map(m => m._id === tempId ? { ...m, status: 'error' } : m));
    }
  };

  const renderStatus = (msg: any) => {
    if (msg.status === 'pending') return <Clock size={10} className="animate-pulse" />;
    if (msg.status === 'seen') return <CheckCheck size={14} className="text-blue-500" />;
    if (msg.status === 'delivered') return <CheckCheck size={14} className="text-white/60" />;
    return <Check size={14} className="text-white/60" />;
  };

  if (isLoading) return <div className="flex-1 flex items-center justify-center">Loading...</div>;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950">
      <header className="flex items-center justify-between p-4 border-b dark:border-slate-800 bg-white dark:bg-slate-900 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard/chat')} className="md:hidden p-2 text-slate-500"><ChevronLeft size={24} /></button>
          <div className="relative shrink-0">
            <div className={`
                    p-[2px] rounded-full transition-all duration-500
                    ${isOnline ? 'bg-gradient-to-tr from-emerald-400 to-emerald-500' : 'bg-transparent'}
                  `}>
              <div className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-900 overflow-hidden bg-slate-100">
                <img
                  src={partnerAvatar || generateAvatarUrl(partnerName)}
                  className="w-full h-full object-cover"
                  alt=""
                />
              </div>
            </div>
            {/* The small floating dot */}
            {isOnline && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
            )}
          </div>

          <Link
            to={profileRoute}>
            <div className="flex flex-col">
              <h3 className="font-bold text-sm dark:text-white leading-none">{partnerName}</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                {isOnline ? (
                  <div className="flex items-center gap-1.5">
                    {/* Small, solid green dot without the distracting ping */}
                    <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></span>
                    <span className="text-[11px] md:text-xs text-emerald-600 font-medium">
                      Online
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    {/* Subtle grey dot for offline */}
                    <span className="h-2 w-2 rounded-full bg-slate-300"></span>
                    <span className="text-[11px] md:text-xs text-slate-500 font-normal">
                      {partnerLastSeen ? (
                        // Custom formatter for a cleaner "last seen" string
                        `Last seen ${formatDistanceToNow(new Date(partnerLastSeen), {
                          addSuffix: true
                        }).replace('about ', '')}`
                      ) : (
                        'Offline'
                      )}
                    </span>
                  </div>
                )}
              </div>

            </div>
          </Link>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-base scrollbar-large bg-[#F5F1EE] dark:bg-slate-950">
        {messages.map((msg, index) => {
          const msgSenderId = typeof msg.senderId === 'object' ? msg.senderId?._id : (msg.senderId || msg.sender?._id || msg.sender);
          const isMe = msgSenderId === activeProfileId;
          return (
            <div key={msg._id || index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`relative max-w-[75%] shadow-sm overflow-hidden ${isMe
                ? 'bg-[#FF6B35] text-white rounded-2xl rounded-tr-none'
                : 'bg-white text-[#4A3F35] rounded-2xl rounded-tl-none border border-gray-100'
                }`}>
                {msg.media?.url && (
                  <div className="p-1 bg-black/5 rounded-xl mb-1">
                    {msg.media.type === 'video' ? (
                      <video src={msg.media.url} controls muted playsInline className="rounded-lg max-h-64 w-full object-contain bg-black" />
                    ) : (
                      <img src={msg.media.url} alt="Shared media" className="rounded-lg max-h-64 w-full object-cover cursor-pointer" onClick={() => window.open(msg.media.url, '_blank')} />
                    )}
                  </div>
                )}
                {msg.content && <p className="leading-relaxed text-[15px] px-4 py-2">{msg.content}</p>}
                <div className={`flex items-center gap-1 pb-1.5 px-3 opacity-80 text-[10px] ${isMe ? 'justify-end' : 'justify-start'}`}>
                  {msg.createdAt && format(new Date(msg.createdAt), 'HH:mm')}
                  {isMe && renderStatus(msg)}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      <footer className="relative p-2 md:p-4 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 shrink-0">
        {/* PENDING FILE PREVIEW */}
        {pendingFile && (
          <div className="absolute bottom-full left-0 right-0 p-3 bg-white dark:bg-slate-800 border-t flex gap-3 border-b z-20">
            <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border bg-black shrink-0">
              {pendingFile.type === 'video' ? (
                <video src={pendingFile.preview} className="w-full h-full object-cover" muted />
              ) : (
                <img src={pendingFile.preview} className="w-full h-full object-cover" alt="preview" />
              )}
              <button
                onClick={() => setPendingFile(null)}
                className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5"
              >
                <X size={14} />
              </button>
            </div>
            <div className="flex-1 flex flex-col justify-center min-w-0">
              <p className="text-sm font-medium dark:text-white truncate">Media attached</p>
              <p className="text-xs text-gray-400 truncate">Add a message or press send</p>
            </div>
          </div>
        )}

        {/* EMOJI PICKER - Responsive positioning */}
        {showEmojiPicker && (
          <div className="absolute bottom-20 right-2 left-2 md:left-auto md:right-4 z-50 shadow-2xl flex justify-center md:block">
            <div className="max-w-full overflow-hidden rounded-2xl border border-gray-200 dark:border-slate-700">
              <EmojiPicker
                width="100%"
                height={350}
                theme={Theme.AUTO}
                onEmojiClick={(emojiData) => setInputText(prev => prev + emojiData.emoji)}
              />
            </div>
          </div>
        )}

        <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*,video/*" />

        {/* FORM CONTAINER */}
        <form
          onSubmit={handleSendMessage}
          className="flex items-center gap-2 md:gap-3 max-w-6xl mx-auto w-full"
        >
          {/* PLUS BUTTON */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-[#4A3F35] dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors shrink-0"
          >
            <Plus className="w-5 h-5 md:w-6 md:h-6" />
          </button>

          {/* INPUT WRAPPER */}
          <div className="relative flex-1 min-w-0 flex items-center bg-[#F5F1EE] dark:bg-slate-800 rounded-2xl px-3 md:px-4 py-0.5 md:py-1">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Message..."
              className="flex-1 py-2.5 md:py-3 bg-transparent border-none text-base outline-none text-[#4A3F35] dark:text-white min-w-0"
            />

            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className={`p-1.5 md:p-2 shrink-0 transition-colors ${showEmojiPicker ? 'text-[#FF6B35]' : 'text-[#4A3F35] dark:text-gray-400'}`}
            >
              <Smile className="w-5 h-5 md:w-[22px] md:h-[22px]" />
            </button>
          </div>

          {/* SEND BUTTON */}
          <button
            type="submit"
            disabled={!inputText.trim() && !pendingFile}
            className="p-2.5 md:p-3 bg-[#FF6B35] text-white rounded-xl md:rounded-2xl hover:bg-[#E85A24] disabled:opacity-50 transition-all shadow-md shrink-0 flex items-center justify-center"
          >
            <Send className="w-4 h-4 md:w-5 md:h-5 ml-0.5" />
          </button>
        </form>
      </footer>
    </div>
  );
};

export default MessageWindow;