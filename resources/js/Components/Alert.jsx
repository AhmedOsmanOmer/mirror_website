import { AnimatePresence, motion } from 'framer-motion';
import clsx from 'clsx';

const styles = {
    error: 'bg-rose-50 text-rose-700 border-rose-200',
    success: 'bg-[rgb(108,192,168)]/10 text-[rgb(60,120,101)] border-[rgb(108,192,168)]/30',
    info: 'bg-neutral-50 text-neutral-700 border-neutral-200',
};

export default function Alert({ type = 'info', children, className }) {
    return (
        <AnimatePresence>
            {children && (
                <motion.div
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    className={clsx('overflow-hidden rounded-xl border px-4 py-3 text-sm font-medium', styles[type], className)}
                    role="alert"
                >
                    {children}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
