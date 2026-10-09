import { useEffect, useRef } from 'react';
import type { Direction } from './useSnakeGame';

export function useSwipe(
  ref: React.RefObject<HTMLElement | null>,
  onSwipe: (direction: Direction) => void
) {
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const touchEnd = useRef<{ x: number; y: number } | null>(null);
  const onSwipeRef = useRef(onSwipe);
  
  // Keep ref in sync
  useEffect(() => {
    onSwipeRef.current = onSwipe;
  }, [onSwipe]);

  const minSwipeDistance = 30;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleTouchStart = (e: TouchEvent) => {
      touchEnd.current = null;
      touchStart.current = {
        x: e.targetTouches[0].clientX,
        y: e.targetTouches[0].clientY,
      };
    };

    const handleTouchMove = (e: TouchEvent) => {
      touchEnd.current = {
        x: e.targetTouches[0].clientX,
        y: e.targetTouches[0].clientY,
      };
    };

    const handleTouchEnd = () => {
      if (!touchStart.current || !touchEnd.current) return;

      const deltaX = touchEnd.current.x - touchStart.current.x;
      const deltaY = touchEnd.current.y - touchStart.current.y;
      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);

      if (Math.max(absDeltaX, absDeltaY) < minSwipeDistance) return;

      if (absDeltaX > absDeltaY) {
        onSwipeRef.current(deltaX > 0 ? 'RIGHT' : 'LEFT');
      } else {
        onSwipeRef.current(deltaY > 0 ? 'DOWN' : 'UP');
      }
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: true });
    element.addEventListener('touchend', handleTouchEnd);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [ref]);
}
