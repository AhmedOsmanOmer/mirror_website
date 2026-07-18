import { useLayoutEffect, useRef, useState } from 'react';

// Max share of the viewport height a card preview may occupy on screen.
const HEIGHT_BUDGET_RATIO = 0.55;

/**
 * Computes the on-screen pixel size for a card preview so it fits within
 * both the container's width AND a viewport-height budget while preserving
 * its aspect ratio — plain CSS (aspect-ratio + max-width + max-height) can't
 * reconcile two independent max constraints at once, since only one axis is
 * ever "auto" at a time, so we compute both dimensions explicitly here.
 */
export function useCardDisplaySize(widthPx, heightPx) {
    const containerRef = useRef(null);
    const [size, setSize] = useState({ width: widthPx, height: heightPx });

    useLayoutEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const recalculate = () => {
            const containerWidth = container.parentElement?.clientWidth || container.clientWidth || widthPx;
            const heightBudget = window.innerHeight * HEIGHT_BUDGET_RATIO;
            const scale = Math.min(1, containerWidth / widthPx, heightBudget / heightPx);

            setSize({ width: widthPx * scale, height: heightPx * scale });
        };

        recalculate();

        const resizeObserver = new ResizeObserver(recalculate);
        if (container.parentElement) resizeObserver.observe(container.parentElement);
        window.addEventListener('resize', recalculate);

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener('resize', recalculate);
        };
    }, [widthPx, heightPx]);

    return { containerRef, ...size };
}
