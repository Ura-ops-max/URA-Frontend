import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

/** Fade + slide up when scrolled into view. */
export const FadeIn = ({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-80px' }}
    transition={{ duration: 0.5, delay, ease: 'easeOut' }}
  >
    {children}
  </motion.div>
);

/** Container that staggers its FadeItem children into view. */
export const Stagger = ({ children, className }: { children: ReactNode; className?: string }) => (
  <motion.div
    className={className}
    initial="hidden"
    whileInView="show"
    viewport={{ once: true, margin: '-80px' }}
    variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
  >
    {children}
  </motion.div>
);

export const FadeItem = ({ children, className }: { children: ReactNode; className?: string }) => (
  <motion.div
    className={className}
    variants={{
      hidden: { opacity: 0, y: 24 },
      show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
    }}
  >
    {children}
  </motion.div>
);
