// src/hooks/use-is-desktop.ts

import { useState, useEffect } from 'react';

// Tailwind's 'lg' breakpoint is typically 1024px
const LG_BREAKPOINT = 1024;
const query = `(min-width: ${LG_BREAKPOINT}px)`;

export const useIsDesktop = (): boolean => {
  // 1. Initialize state based on the current window size
  // Use a function call for initial state to avoid unnecessary checks
  const [isDesktop, setIsDesktop] = useState(() => {
    // Run only once on mount
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false; // Default to false if not in a browser environment
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQueryList = window.matchMedia(query);

    // 2. Handler function to update state on size change
    const handleChange = (e: MediaQueryListEvent) => {
      setIsDesktop(e.matches);
    };

    // 3. Set up listener
    mediaQueryList.addEventListener('change', handleChange);

    // 4. Clean up
    return () => {
      mediaQueryList.removeEventListener('change', handleChange);
    };
  }, []);

  return isDesktop;
};
