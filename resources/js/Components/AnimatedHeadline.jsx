import { motion, useReducedMotion } from 'framer-motion';

/**
 * Splits `text` into words and staggers them in on mount. The full string is
 * still exposed to assistive tech via aria-label; the per-word spans are
 * hidden from the accessibility tree to avoid word-by-word announcement.
 */
export default function AnimatedHeadline({ text, className, as: Component = 'h1', wordDelay = 0.06, startDelay = 0 }) {
    const shouldReduceMotion = useReducedMotion();
    const words = text.split(' ');

    if (shouldReduceMotion) {
        return <Component className={className}>{text}</Component>;
    }

    return (
        <Component className={className} aria-label={text}>
            <span aria-hidden="true" className="inline">
                {words.map((word, i) => (
                    <span key={i} className="inline-block overflow-hidden pb-[0.15em] align-bottom">
                        <motion.span
                            className="inline-block"
                            initial={{ y: '110%', opacity: 0 }}
                            animate={{ y: '0%', opacity: 1 }}
                            transition={{
                                duration: 0.7,
                                delay: startDelay + i * wordDelay,
                                ease: [0.16, 1, 0.3, 1],
                            }}
                        >
                            {word}
                            {i < words.length - 1 ? ' ' : ''}
                        </motion.span>
                    </span>
                ))}
            </span>
        </Component>
    );
}
