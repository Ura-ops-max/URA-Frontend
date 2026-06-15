import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { useEffect, useRef } from 'react';

export const MessageList = ({
  messages,
  currentUserId,
}: {
  messages: any[];
  currentUserId: string;
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <ScrollArea className="flex-1 bg-white/50">
      <div className="p-6 flex flex-col gap-4">
        {messages.map((msg, i) => {
          const isMe = msg.sender === currentUserId || msg.sender?._id === currentUserId;
          return (
            <div
              key={msg._id || i}
              className={`flex ${isMe ? 'justify-end' : 'justify-start'} group animate-in slide-in-from-bottom-2`}
            >
              <div className="max-w-[70%] relative">
                <div
                  className={`p-3.5 rounded-2xl text-[14.5px] shadow-sm ${
                    isMe
                      ? 'bg-orange-600 text-white rounded-br-none'
                      : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'
                  }`}
                >
                  {msg.media?.url && (
                    <div className="mb-2 rounded-lg overflow-hidden border border-black/5">
                      {msg.media.type === 'video' ? (
                        <video
                          src={msg.media.url}
                          controls
                          className="max-h-72 w-full object-cover"
                        />
                      ) : (
                        <img
                          src={msg.media.url}
                          className="max-h-72 w-full object-cover"
                          alt="sent"
                        />
                      )}
                    </div>
                  )}
                  <p className="leading-relaxed">{msg.content}</p>
                </div>
                <p
                  className={`text-[9px] mt-1.5 font-medium text-gray-400 uppercase tracking-wider ${isMe ? 'text-right' : 'text-left'}`}
                >
                  {msg.createdAt && format(new Date(msg.createdAt), 'p')}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} className="h-2" />
      </div>
    </ScrollArea>
  );
};
