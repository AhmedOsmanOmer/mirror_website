import { motion, useReducedMotion } from 'framer-motion';

export default function ScrollReveal({
    children,
    className,
    delay = 0,
    y = 24,
    scale,
    once = true,
    amount = 0.2,
    as: Component = motion.div,
    ...props
}) {
    const shouldReduceMotion = useReducedMotion();

    if (shouldReduceMotion) {
        return (
            <Component className={className} {...props}>
                {children}
            </Component>
        );
    }

    return (
        <Component
            initial={{ opacity: 0, y, ...(scale ? { scale } : {}) }}
            whileInView={{ opacity: 1, y: 0, ...(scale ? { scale: 1 } : {}) }}
            viewport={{ once, amount }}
            transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
            className={className}
            {...props}
        >
            {children}
        </Component>
    );
}
