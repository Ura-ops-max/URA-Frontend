import { Camera, Send, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { uploadImageToS3 } from '@/services/s3.service';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  onSendMedia: (data: any) => void;
  onTyping: () => void;
}

export const ChatInput = ({ onSendMessage, onSendMedia, onTyping }: ChatInputProps) => {
  const [text, setText] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleSend = () => {
    if (!text.trim()) return;
    onSendMessage(text);
    setText("");
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const url = await uploadImageToS3(file);
      onSendMedia({ url, type: file.type.startsWith('video') ? 'video' : 'image', fileName: file.name });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    // 1. Adjusted padding for mobile (p-2 on mobile, p-4 on desktop)
    <div className="p-2 md:p-4 bg-white border-t border-gray-100 w-full">
      {/* 2. Added min-w-0 to the container and gap-2 for tighter mobile fit */}
      <div className="flex items-center gap-2 md:gap-3 bg-gray-50 rounded-2xl px-3 py-1 md:px-4 md:py-2 border border-gray-200/50 w-full">
        
        <input type="file" id="chat-file" hidden onChange={handleFile} />
        <label 
          htmlFor="chat-file" 
          className="cursor-pointer text-gray-400 hover:text-orange-600 transition-colors shrink-0"
        >
          {isUploading ? <Loader2 className="animate-spin" size={18} /> : <Camera size={20} />}
        </label>

        {/* 3. min-w-0 is CRITICAL here to prevent the input from pushing the button off-screen */}
        <Input 
          value={text}
          onChange={(e) => { setText(e.target.value); onTyping(); }}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Message..."
          className="bg-transparent border-none focus-visible:ring-0 text-gray-800 flex-1 min-w-0 h-10 text-[16px]" 
        />
        {/* Note: text-[16px] prevents iOS from auto-zooming on focus */}

        {/* 4. shrink-0 ensures the button never loses its shape or width */}
        <Button 
          onClick={handleSend}
          disabled={!text.trim() && !isUploading}
          className={cn(
            "bg-orange-600 hover:bg-orange-700 text-white rounded-xl h-9 w-9 p-0 shrink-0 shadow-sm transition-transform active:scale-95",
            (!text.trim() && !isUploading) && "opacity-50"
          )}
        >
          <Send size={16} className="ml-0.5" />
        </Button>
      </div>
    </div>
  );
};