import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion';

const AUTO_FLIP_INTERVAL_MS = 2000;

export default function MirrorCardHero() {
    const stageRef = useRef(null);
    const shouldReduceMotion = useReducedMotion();

    const [flipped, setFlipped] = useState(false);
    const intervalRef = useRef(null);

    // Keep flipping between the mirror and colored faces every couple of
    // seconds so the card feels alive on its own — a click (or tap) flips it
    // immediately too, restarting the cycle from there.
    const restartAutoFlip = () => {
        clearInterval(intervalRef.current);
        if (shouldReduceMotion) return;
        intervalRef.current = setInterval(() => setFlipped((f) => !f), AUTO_FLIP_INTERVAL_MS);
    };

    useEffect(() => {
        restartAutoFlip();
        return () => clearInterval(intervalRef.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shouldReduceMotion]);

    const handleClick = () => {
        setFlipped((f) => !f);
        restartAutoFlip();
    };

    const rotateX = useMotionValue(0);
    const rotateY = useMotionValue(0);
    const springRotateX = useSpring(rotateX, { stiffness: 150, damping: 20, mass: 0.5 });
    const springRotateY = useSpring(rotateY, { stiffness: 150, damping: 20, mass: 0.5 });

    const handleMouseMove = (e) => {
        if (shouldReduceMotion) return;
        const rect = stageRef.current.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        rotateY.set(px * 16);
        rotateX.set(-py * 16);
    };

    const handleMouseLeave = () => {
        rotateX.set(0);
        rotateY.set(0);
    };

    return (
        <div
            ref={stageRef}
            className="cursor-pointer [perspective:1400px]"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
        >
            <motion.div
                className="relative mx-auto aspect-[50/85] w-full max-w-[260px]"
                style={{
                    rotateX: shouldReduceMotion ? 0 : springRotateX,
                    rotateY: shouldReduceMotion ? 0 : springRotateY,
                    transformStyle: 'preserve-3d',
                }}
                animate={shouldReduceMotion ? undefined : { y: [0, -10, 0] }}
                transition={
                    shouldReduceMotion
                        ? undefined
                        : { duration: 5, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' }
                }
            >
                {/* Ambient glow behind the card */}
                <div
                    className="absolute -inset-6 -z-10 rounded-[2rem] opacity-60 blur-2xl"
                    style={{
                        background:
                            'radial-gradient(closest-side, rgba(108,192,168,0.45), rgba(229,182,164,0.25), transparent)',
                    }}
                />

                <motion.div
                    className="relative h-full w-full"
                    style={{ transformStyle: 'preserve-3d' }}
                    animate={{ rotateY: flipped ? 180 : 0 }}
                    transition={
                        shouldReduceMotion
                            ? { duration: 0.3, ease: 'easeOut' }
                            : { type: 'spring', stiffness: 90, damping: 14, mass: 1 }
                    }
                >
                    {/* Mirror face */}
                    <div
                        className="absolute inset-0 overflow-hidden rounded-2xl shadow-2xl"
                        style={{ backfaceVisibility: 'hidden' }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-[#c9ccd1] via-[#eef0f2] to-[#a9adb3]" />
                        {!shouldReduceMotion && (
                            <motion.div
                                className="absolute inset-0"
                                style={{
                                    backgroundImage:
                                        'linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.85) 45%, rgba(255,255,255,0.2) 55%, transparent 70%)',
                                    backgroundSize: '250% 100%',
                                }}
                                initial={{ backgroundPositionX: '-40%' }}
                                animate={{ backgroundPositionX: '220%' }}
                                transition={{
                                    duration: 2.2,
                                    delay: 0.4,
                                    repeat: Infinity,
                                    repeatDelay: 4.5,
                                    ease: [0.4, 0, 0.2, 1],
                                }}
                            />
                        )}
                        <div className="absolute inset-0 rounded-2xl ring-1 ring-black/10" />
                        <div className="absolute inset-x-8 bottom-6 flex items-center gap-2 text-white/70 mix-blend-overlay">
                            <span className="text-xs font-medium uppercase tracking-[0.3em]">mirror finish</span>
                        </div>
                    </div>

                    {/* Colored / branded face */}
                    <div
                        className="absolute inset-0 overflow-hidden rounded-2xl shadow-2xl"
                        style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-[rgb(108,192,168)] via-[rgb(150,196,182)] to-[rgb(229,182,164)]" />
                        <div className="absolute inset-0 rounded-2xl ring-1 ring-black/10" />
                        <div className="absolute inset-8 flex flex-col justify-between text-white">
                            <span className="text-[10px] font-semibold uppercase tracking-[0.35em] opacity-80">
                                mirror
                            </span>
                            <div>
                                <p className="text-lg font-semibold leading-tight sm:text-xl">Jane Doe</p>
                                <p className="text-xs font-medium opacity-80 sm:text-sm">
                                    Founder &amp; Creative Director
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}
