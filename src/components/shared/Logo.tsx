import { forwardRef } from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  /** Destination URL (internal or external) */
  url?: string;
  /** Logo image source path */
  imgSrc?: string;
  /** Image alt text for accessibility */
  alt?: string;
  /** Logo size preset */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Display text alongside the logo */
  showText?: boolean;
  /** Brand text (defaults to 'Ura') */
  text?: string;
  /** Additional CSS classes for the container */
  className?: string;
  /** Additional CSS classes for the image */
  imageClassName?: string;
  /** Additional CSS classes for the text */
  textClassName?: string;
  /** Hover animation effect */
  hoverEffect?: 'none' | 'scale' | 'spin' | 'glow';
  /** Whether the link opens in a new tab */
  external?: boolean;
  /** Click handler */
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
}

const sizeConfig = {
  xs: { img: 'h-5 w-auto', text: 'text-base', gap: 'gap-1' },
  sm: { img: 'h-6 w-auto', text: 'text-lg', gap: 'gap-1.5' },
  md: { img: 'h-8 w-auto', text: 'text-xl', gap: 'gap-2' },
  lg: { img: 'h-10 w-auto', text: 'text-2xl', gap: 'gap-2.5' },
  xl: { img: 'h-12 w-auto', text: 'text-3xl', gap: 'gap-3' },
};

const hoverEffects = {
  none: '',
  scale: 'hover:scale-105 transition-transform duration-200',
  spin: 'hover:rotate-6 transition-transform duration-300',
  glow: 'hover:drop-shadow-[0_0_8px_rgba(249,115,22,0.5)] transition-all duration-200',
};

const Logo = forwardRef<HTMLAnchorElement, LogoProps>(
  (
    {
      url = '/',
      imgSrc = '/images/newlogo.png',
      alt = 'Ura Logo',
      size = 'md',
      showText = false,
      text = 'Ura',
      className = '',
      imageClassName = '',
      textClassName = '',
      hoverEffect = 'scale',
      external = false,
      onClick,
    },
    ref,
  ) => {
    const sizes = sizeConfig[size];
    const hoverClass = hoverEffects[hoverEffect];

    const containerClasses = `
      flex items-center
      ${sizes.gap}
      focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2
      rounded
      ${className}
    `.trim();

    const imageClasses = `
      ${sizes.img}
      object-contain
      ${hoverClass}
      ${imageClassName}
    `.trim();

    const content = (
      <>
        <img
          src={imgSrc}
          alt={alt}
          className={imageClasses}
          loading="lazy"
          onError={(e) => {
            // Fallback if image fails to load
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        {showText && (
          <span
            className={`
              font-bold text-orange-500
              ${sizes.text}
              ${hoverClass}
              ${textClassName}
            `.trim()}
          >
            {text}
          </span>
        )}
      </>
    );

    const commonProps = {
      className: containerClasses,
      onClick,
      ref,
      'aria-label': `${text} logo`,
    };

    if (external) {
      return (
        <a href={url} target="_blank" rel="noopener noreferrer" {...commonProps}>
          {content}
        </a>
      );
    }

    return (
      <Link to={url} {...commonProps}>
        {content}
      </Link>
    );
  },
);

Logo.displayName = 'Logo';

export default Logo;
