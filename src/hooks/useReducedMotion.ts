import { useEffect, useState } from 'react';

/**
 * Subscribe to the user's `prefers-reduced-motion` setting.
 * Used to gate non-essential motion (confetti). WCAG 2.3.3.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return reduced;
}