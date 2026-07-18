import { useMemo } from 'react';

const COLORS = ['rgb(108,192,168)', 'rgb(229,182,164)', 'rgb(229,217,219)'];

function randomBetween(min, max) {
    return min + Math.random() * (max - min);
}

/**
 * A drifting field of light glints, evoking a mirror surface catching the
 * light. Count is kept low and animation is pure CSS so it stays cheap on
 * mobile scroll.
 */
export default function Sparkles({ count = 18, className = '' }) {
    const particles = useMemo(
        () =>
            Array.from({ length: count }, (_, i) => ({
                id: i,
                top: randomBetween(2, 96),
                left: randomBetween(2, 96),
                size: randomBetween(2, 5),
                duration: randomBetween(3.5, 7),
                delay: randomBetween(0, 5),
                maxOpacity: randomBetween(0.35, 0.85),
                color: COLORS[i % COLORS.length],
            })),
        [count],
    );

    return (
        <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
            {particles.map((p) => (
                <span
                    key={p.id}
                    className="sparkle-dot absolute rounded-full"
                    style={{
                        top: `${p.top}%`,
                        left: `${p.left}%`,
                        width: p.size,
                        height: p.size,
                        backgroundColor: p.color,
                        boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
                        animationDuration: `${p.duration}s`,
                        animationDelay: `${p.delay}s`,
                        '--sparkle-max-opacity': p.maxOpacity,
                    }}
                />
            ))}
        </div>
    );
}
