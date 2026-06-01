'use client';

/**
 * Live scroll-progress reporter for the home page season carousel.
 * Binds to every `.cat-grid` on the page and writes a `--scroll-pos`
 * CSS variable (0–1) onto the carousel's parent `.bel-container` as
 * the user swipes. The static indicator below the carousel reads
 * this variable to slide its dark thumb left→right in step with
 * actual scroll position — like a real loading bar.
 *
 * Pure CSS scroll-timeline can't reach a sibling pseudo-element, so
 * a tiny rAF-throttled scroll listener does the job in ~30 lines.
 */

import { useEffect } from 'react';

export default function CarouselScrollProgress() {
  useEffect(() => {
    const grids = document.querySelectorAll<HTMLElement>('.cat-grid');
    if (grids.length === 0) return;

    const cleanups: Array<() => void> = [];

    grids.forEach((grid) => {
      const target = grid.closest('.bel-container') as HTMLElement | null;
      if (!target) return;

      let ticking = false;
      const update = () => {
        const max = grid.scrollWidth - grid.clientWidth;
        const pos = max > 0 ? grid.scrollLeft / max : 0;
        target.style.setProperty('--scroll-pos', String(pos));
      };

      const onScroll = () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          ticking = false;
          update();
        });
      };

      update();
      grid.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', update);

      cleanups.push(() => {
        grid.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', update);
      });
    });

    return () => cleanups.forEach((c) => c());
  }, []);

  return null;
}
