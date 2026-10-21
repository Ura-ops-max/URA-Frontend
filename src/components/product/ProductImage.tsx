import { useState, type ImgHTMLAttributes } from 'react';
import { Play } from 'lucide-react';
import { productPlaceholderDataUrl } from '@/lib/product-placeholder';
import { isVideoUrl } from '@/components/product/shared/ProductThumb';

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  src?: string | null;
  /** The product's name: shown on the tile when there is no photo. */
  name?: string | null;
};

/**
 * The one component for a product photo, everywhere (cards, shop, search,
 * cart, checkout, orders, inventory, product page). A video shows its first
 * frame with a play badge. No photo, or a photo that fails to load, shows a
 * tile with the product's name initials (see lib/product-placeholder).
 */
export default function ProductImage({ src, name, alt, className, ...rest }: Props) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const label = name ?? alt ?? '';

  if (src && isVideoUrl(src) && src !== failedSrc) {
    return (
      <div className={`relative ${className ?? ''}`}>
        <video
          src={`${src}#t=0.1`}
          preload="metadata"
          muted
          playsInline
          className="h-full w-full object-cover"
          onError={() => setFailedSrc(src)}
        />
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/15">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm">
            <Play size={16} className="text-white fill-white" />
          </span>
        </span>
      </div>
    );
  }

  const usable = src && src !== failedSrc ? src : productPlaceholderDataUrl(label);
  return (
    <img
      {...rest}
      className={className}
      src={usable}
      alt={alt ?? label}
      onError={(e) => {
        if (src && usable === src) setFailedSrc(src);
        rest.onError?.(e);
      }}
    />
  );
}
