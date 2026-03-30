// src/components/feed/VideoPlayer.tsx
import { useState, useRef } from "react";
import { Play, Pause, Volume2, VolumeX, FastForward, Rewind } from "lucide-react";

export const VideoPlayer = ({ url, className }: { url: string; className: string }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0); // For the progress bar
  const [feedback, setFeedback] = useState<'play' | 'pause' | 'rewind' | 'forward' | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastClickTime = useRef(0);

  // Update progress bar
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const percentage = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(percentage);
    }
  };

  console.log(isPlaying);

  const handleInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    const now = Date.now();
    const DOUBLE_CLICK_DELAY = 300;
    const clickX = ('clientX' in e) ? e.clientX : (e as React.TouchEvent).touches[0].clientX;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = clickX - rect.left;

    if (now - lastClickTime.current < DOUBLE_CLICK_DELAY) {
      if (videoRef.current) {
        if (x < rect.width / 2) {
          videoRef.current.currentTime -= 5;
          showFeedback('rewind');
        } else {
          videoRef.current.currentTime += 5;
          showFeedback('forward');
        }
      }
    } else {
      // Toggle play/pause on single tap
      if (videoRef.current) {
        if (videoRef.current.paused) {
          videoRef.current.play();
          setIsPlaying(true);
          showFeedback('play');
        } else {
          videoRef.current.pause();
          setIsPlaying(false);
          showFeedback('pause');
        }
      }
    }
    lastClickTime.current = now;
  };

  const showFeedback = (type: 'play' | 'pause' | 'rewind' | 'forward') => {
    setFeedback(type);
    setTimeout(() => setFeedback(null), 800);
  };

  return (
    <div className="relative w-full h-full group bg-black overflow-hidden cursor-pointer" onClick={handleInteraction}>
      <video 
        ref={videoRef} 
        src={url} 
        className={className} 
        loop 
        muted={isMuted} 
        playsInline 
        onTimeUpdate={handleTimeUpdate}
      />
      
      {/* Feedback Icons */}
      {feedback && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <div className="bg-black/40 p-5 rounded-full animate-ping">
            {feedback === 'play' && <Play className="text-white fill-white" />}
            {feedback === 'pause' && <Pause className="text-white fill-white" />}
            {feedback === 'forward' && <FastForward className="text-white fill-white" />}
            {feedback === 'rewind' && <Rewind className="text-white fill-white" />}
          </div>
        </div>
      )}

      {/* Progress Bar Container */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20 z-30">
        <div 
          className="h-full bg-orange-500 transition-all duration-100 ease-linear" 
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Mute Button */}
      <button 
        onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
        className="absolute bottom-4 right-4 p-2.5 bg-black/60 backdrop-blur-md rounded-full text-white z-40 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity"
      >
        {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
      </button>
    </div>
  );
};