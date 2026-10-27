// A button that shows only an icon. `label` is required: it becomes the
// aria-label (screen readers, all devices) and the tooltip (title, desktop).
// Use this for every icon-only button so new screens follow the rule.
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label' | 'title'> {
  /** What the button does, in plain words, e.g. "Close notification". */
  label: string;
  children: ReactNode;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, children, className, type = 'button', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      title={label}
      className={cn('inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', className)}
      {...props}
    >
      {children}
    </button>
  );
});
