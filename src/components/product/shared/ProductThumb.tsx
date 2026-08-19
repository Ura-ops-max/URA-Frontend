import { Play } from 'lucide-react';

/** True when a media URL points to a video file rather than an image. */
export const isVideoUrl = (u?: string) => !!u && /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(u);

/**
 * Renders a product's first media as a thumbnail — an image, or a video's
 * freeze-frame (first frame) with a play badge. Keeps old image-only products
 * working while letting video posts show a proper still instead of a blank box.
 */
export function ProductThumb({
  url,
  alt,
  imgClassName = 'h-full w-full object-cover',
}: {
  url: string;
  alt?: string;
  imgClassName?: string;
}) {
  if (isVideoUrl(url)) {
    return (
      <div className="relative h-full w-full">
        <video
          src={`${url}#t=0.1`}
          preload="metadata"
          muted
          playsInline
          className="h-full w-full object-cover"
        />
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/15">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm">
            <Play size={16} className="text-white fill-white" />
          </span>
        </span>
      </div>
    );
  }
  return (
    <img
      src={url}
      alt={alt}
      className={imgClassName}
      onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
    />
  );
}
