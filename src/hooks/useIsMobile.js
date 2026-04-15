import { useState, useEffect } from 'react'

/*
 * useIsMobile — reactive breakpoint hook
 *
 * Returns true when the viewport is narrower than 600px, and updates
 * automatically on window resize. This project uses inline styles throughout
 * (no CSS files), so there are no @media queries. This hook replaces them —
 * components read isMobile and swap padding/font-size/layout accordingly.
 */
export function useIsMobile() {
  // Seed state from the current window width immediately, so the very first render
  // has the correct layout. Without this, the component would always render desktop
  // on the first paint, then flicker to mobile after the effect fires.
  const [isMobile, setIsMobile] = useState(window.innerWidth < 600)

  useEffect(() => {
    // Re-evaluate on every resize event. No debounce is needed — setting the
    // same boolean value twice is a React no-op (no re-render triggered).
    const handler = () => setIsMobile(window.innerWidth < 600)
    window.addEventListener('resize', handler)

    // Cleanup: remove the listener when the component using this hook unmounts.
    // Without this, stale handlers would accumulate in memory across navigations.
    return () => window.removeEventListener('resize', handler)
  }, []) // Empty deps array → the effect runs once on mount and cleans up on unmount.

  return isMobile
}
