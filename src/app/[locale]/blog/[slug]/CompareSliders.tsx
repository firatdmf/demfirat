'use client';

import { useEffect } from 'react';

// Turns every <figure class="compare" data-compare> in the post's body
// (two images: before, then after) into a before/after slider. The body is
// HTML from the ERP, so this finishes it in the browser rather than
// asking the post to carry a script.
export default function CompareSliders({ label }: { label: string }) {
    useEffect(() => {
        const figures = document.querySelectorAll<HTMLElement>('.blog-body figure[data-compare]');
        figures.forEach((figure) => {
            if (figure.dataset.ready) return;
            const images = figure.querySelectorAll('img');
            if (images.length < 2) return;
            figure.dataset.ready = '1';

            const range = document.createElement('input');
            range.type = 'range';
            range.min = '0';
            range.max = '100';
            range.value = '50';
            range.className = 'compare-range';
            range.setAttribute('aria-label', label);
            range.addEventListener('input', () => figure.style.setProperty('--pos', `${range.value}%`));

            const line = document.createElement('span');
            line.className = 'compare-line';
            line.setAttribute('aria-hidden', 'true');

            figure.append(range, line);
            images.forEach((image, i) => {
                if (!image.alt || i > 1) return;
                const tag = document.createElement('span');
                tag.className = `compare-label ${i === 0 ? 'is-before' : 'is-after'}`;
                tag.textContent = image.alt;
                tag.setAttribute('aria-hidden', 'true');
                figure.append(tag);
            });
        });
    }, [label]);

    return null;
}
