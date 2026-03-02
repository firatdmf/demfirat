'use client';

// ScrollSmoother is intentionally disabled.
// The wheel event interception was causing the sticky header to flicker
// by triggering extra scroll events at the hide/show boundary.

export default function ScrollSmoother() {
    return null;
}
