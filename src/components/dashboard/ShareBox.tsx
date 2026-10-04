// src/components/feed/ShareBox.tsx
import { useState, useRef, useEffect } from 'react';
import { ImageIcon, Video, Tag, SendHorizonal, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useCreatePost } from '@/hooks/api/use-feed';
import { useAuthContext } from '@/context/auth-provider';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { TagInput } from '../shared/TagInput';
import { cn } from '@/lib/utils';
import { generateAvatarUrl } from '@/utils/avatar-generator';

const ShareBox = ({ onRequireAuth }: { onRequireAuth?: () => void } = {}) => {
  const { user } = useAuthContext();
  const { mutate, isPending } = useCreatePost();

  const [content, setContent] = useState('');
  const [rawFiles, setRawFiles] = useState<File[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);

  const isVideo = rawFiles[0]?.type.startsWith('video/');

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setRawFiles([file]);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handlePost = () => {
    if (!content.trim() && rawFiles.length === 0) return;
    mutate(
      {
        data: { type: 'POST', caption: content, tags },
        files: rawFiles,
      },
      {
        onSuccess: () => {
          setContent('');
          setRawFiles([]);
          setPreviewUrl(null);
          setTags([]);
          setShowTagInput(false);
        },
      },
    );
  };

  return (
    <div
      className="rounded-[32px] bg-white/40 backdrop-blur-2xl p-4 border border-white/50 shadow-[0_10px_30px_rgba(0,0,0,0.02)] w-full"
      // Signed-out visitors: any tap on the composer opens the sign-in prompt.
      onPointerDownCapture={
        onRequireAuth
          ? (e) => {
              e.preventDefault();
              e.stopPropagation();
              onRequireAuth();
            }
          : undefined
      }
    >
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-4">
          <Avatar className="h-11 w-11 shrink-0 border-2 border-white shadow-sm">
            <AvatarImage
              src={
                user
                  ? user.profilePicture || generateAvatarUrl(`${user.firstName} ${user.lastName}`)
                  : undefined
              }
              className="object-cover"
            />
            <AvatarFallback className="bg-[#FF6B35] text-white font-bold text-xs">
              {user?.firstName?.[0]}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 flex items-center gap-2">
            <Input
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              className="h-12 rounded-[20px] bg-white/60 border-white/30 text-[14px] font-medium placeholder:text-gray-400 focus-visible:ring-[#FF6B35]/20 focus-visible:border-[#FF6B35]/40 transition-all outline-none"
            />

            <Button
              onClick={handlePost}
              disabled={isPending || (!content.trim() && rawFiles.length === 0)}
              className={cn(
                'h-12 w-12 rounded-[20px] shrink-0 shadow-lg transition-all flex items-center justify-center active:scale-90',
                'bg-[#FF6B35] hover:bg-[#e85a20] text-white shadow-[#FF6B35]/20',
                'disabled:bg-gray-200 disabled:shadow-none',
              )}
            >
              {isPending ? (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <SendHorizonal size={20} strokeWidth={2.5} />
              )}
            </Button>
          </div>
        </div>

        {/* Previews */}
        {previewUrl && (
          <div className="relative rounded-[24px] overflow-hidden border border-white/60 bg-white/20 animate-in zoom-in-95 duration-300">
            <button
              onClick={() => {
                setRawFiles([]);
                setPreviewUrl(null);
              }}
              className="absolute top-3 right-3 p-2 bg-black/40 backdrop-blur-xl rounded-full text-white z-20 hover:bg-[#FF0000] transition-colors"
            >
              <X size={16} />
            </button>
            {isVideo ? (
              <video
                src={previewUrl}
                className="w-full max-h-80 object-contain bg-black/5"
                controls
                muted
              />
            ) : (
              <img src={previewUrl} className="w-full object-cover max-h-80" alt="preview" />
            )}
          </div>
        )}

        {showTagInput && (
          <div className="animate-in slide-in-from-top-2 duration-300">
            <TagInput tags={tags} setTags={setTags} tagInput={tagInput} setTagInput={setTagInput} />
          </div>
        )}

        {/* Tools Section */}
        <div className="flex items-center gap-6 px-1 pt-2 border-t border-white/20">
          <input
            type="file"
            hidden
            ref={fileInputRef}
            accept="image/*,video/*"
            onChange={handleFileChange}
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2.5 text-[11px] font-black uppercase tracking-widest text-gray-500 hover:text-[#006D32] group transition-colors"
          >
            <div className="p-2.5 rounded-[14px] bg-green-50 text-[#006D32] group-hover:bg-green-100 transition-all group-hover:scale-110">
              <ImageIcon size={19} />
            </div>
            <span className="hidden sm:inline">Photo</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2.5 text-[11px] font-black uppercase tracking-widest text-gray-500 hover:text-[#FF0000] group transition-colors"
          >
            <div className="p-2.5 rounded-[14px] bg-red-50 text-[#FF0000] group-hover:bg-red-100 transition-all group-hover:scale-110">
              <Video size={19} />
            </div>
            <span className="hidden sm:inline">Video</span>
          </button>

          <button
            onClick={() => setShowTagInput(!showTagInput)}
            className={cn(
              'flex items-center gap-2.5 text-[11px] font-black uppercase tracking-widest transition-all group',
              showTagInput ? 'text-[#FF6B35]' : 'text-gray-500 hover:text-[#FF6B35]',
            )}
          >
            <div
              className={cn(
                'p-2.5 rounded-[14px] group-hover:scale-110 transition-all',
                showTagInput
                  ? 'bg-[#FF6B35]/10 text-[#FF6B35]'
                  : 'bg-orange-50 text-[#FF6B35] group-hover:bg-orange-100',
              )}
            >
              <Tag size={19} />
            </div>
            <span className="hidden sm:inline">Tag</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareBox;
