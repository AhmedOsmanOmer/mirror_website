import { motion } from 'framer-motion';
import clsx from 'clsx';

const variants = {
    primary:
        'bg-[rgb(108,192,168)] text-white hover:bg-[rgb(93,175,151)] focus-visible:outline-[rgb(108,192,168)]',
    secondary:
        'bg-white text-ink border border-neutral-200 hover:bg-neutral-50 focus-visible:outline-neutral-400',
    ghost: 'bg-transparent text-ink hover:bg-black/5 focus-visible:outline-neutral-400',
    dark: 'bg-ink text-white hover:bg-neutral-800 focus-visible:outline-ink',
};

const sizes = {
    sm: 'px-3.5 py-2 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base',
};

export default function Button({
    as: Component = 'button',
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    className,
    children,
    ...props
}) {
    return (
        <motion.div
            whileHover={disabled || loading ? undefined : { scale: 1.02 }}
            whileTap={disabled || loading ? undefined : { scale: 0.97 }}
            className="inline-block"
        >
            <Component
                disabled={disabled || loading}
                className={clsx(
                    'inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors',
                    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
                    'disabled:cursor-not-allowed disabled:opacity-60',
                    variants[variant],
                    sizes[size],
                    className,
                )}
                {...props}
            >
                {loading && (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                )}
                {children}
            </Component>
        </motion.div>
    );
}
