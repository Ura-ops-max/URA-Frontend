// src/components/feed/MediaCarousel.tsx
import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { VideoPlayer } from './VideoPlayer';
import { cn } from '@/lib/utils';

export const MediaCarousel = ({ media }: { media: string[] }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(1);
  const [showArrows, setShowArrows] = useState(false);
  const timerRef = useRef<any>(null);

  const handleMouseMove = () => {
    setShowArrows(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setShowArrows(false), 2500);
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const width = scrollRef.current.offsetWidth;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -width : width,
        behavior: 'smooth',
      });
    }
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const idx = Math.round(scrollRef.current.scrollLeft / scrollRef.current.offsetWidth) + 1;
      setIndex(idx);
    }
  };

  return (
    <div
      className="relative w-full overflow-hidden lg:rounded-xl group/carousel bg-black z-0" // Force a base z-index
      style={{ aspectRatio: '4/5', maxHeight: '600px' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setShowArrows(false)}
    >
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex h-full overflow-x-auto snap-x snap-mandatory no-scrollbar scrollbar-hide z-10"
      >
        {media.map((url, i) => {
          const isVideo = url.match(/\.(mp4|webm|mov|m4v)$/i);
          return (
            <div
              key={i}
              className="flex-shrink-0 w-full h-full snap-center relative flex items-center justify-center overflow-hidden"
            >
              {isVideo ? (
                <VideoPlayer url={url} className="w-full h-full object-contain z-20" />
              ) : (
                <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                  {/* Layer 1: Blurred Background */}
                  <img
                    src={url}
                    className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-40 scale-110 pointer-events-none z-0"
                    alt=""
                  />
                  {/* Layer 2: The Actual Image */}
                  <img
                    src={url}
                    className="relative w-full h-full object-contain z-10"
                    alt={`Post media ${i + 1}`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Navigation UI - Keep these high WITHIN the card, but below global app UI */}
      {media.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              scroll('left');
            }}
            className={cn(
              'hidden lg:flex absolute left-3 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-md p-2 rounded-full z-[30] text-white transition-all',
              showArrows ? 'opacity-100' : 'opacity-0 pointer-events-none',
            )}
          >
            <ChevronLeft size={20} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              scroll('right');
            }}
            className={cn(
              'hidden lg:flex absolute right-3 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-md p-2 rounded-full z-[30] text-white transition-all',
              showArrows ? 'opacity-100' : 'opacity-0 pointer-events-none',
            )}
          >
            <ChevronRight size={20} />
          </button>

          {/* Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-[30]">
            {media.map((_, i) => (
              <div
                key={i}
                className={cn(
                  'h-1.5 rounded-full transition-all',
                  index === i + 1 ? 'w-4 bg-orange-500' : 'w-1.5 bg-white/50',
                )}
              />
            ))}
          </div>

          {/* Counter */}
          <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-lg z-[30]">
            {index} / {media.length}
          </div>
        </>
      )}
    </div>
  );
};
