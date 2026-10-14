import { useState, type ImgHTMLAttributes } from 'react';

// Neutral "No photo yet" picture, inline so it never 404s.
export const NO_PHOTO_URL = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
    <rect width="400" height="400" fill="#f3f4f6"/>
    <g fill="none" stroke="#d1d5db" stroke-width="10" stroke-linecap="round" stroke-linejoin="round">
      <rect x="130" y="125" width="140" height="110" rx="14"/>
      <circle cx="170" cy="162" r="12"/>
      <path d="M140 225l40-38 30 26 22-18 38 30"/>
    </g>
    <text x="200" y="285" text-anchor="middle" font-family="system-ui, sans-serif" font-size="24" font-weight="600" fill="#9ca3af">No photo yet</text>
  </svg>`,
)}`;

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> & { src?: string | null };

/** Product photo that shows "No photo yet" instead of a broken image. */
export default function ProductImage({ src, alt = '', ...rest }: Props) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const usable = src && src !== failedSrc ? src : NO_PHOTO_URL;
  return (
    <img
      {...rest}
      src={usable}
      alt={alt}
      onError={(e) => {
        if (src && usable === src) setFailedSrc(src);
        rest.onError?.(e);
      }}
    />
  );
}
