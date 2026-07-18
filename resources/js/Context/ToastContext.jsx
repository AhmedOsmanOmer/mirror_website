import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const ToastContext = createContext(null);
let idCounter = 0;

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const dismiss = useCallback((id) => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
    }, []);

    const push = useCallback(
        (message, { type = 'info', duration = 5000 } = {}) => {
            const id = ++idCounter;
            setToasts((current) => [...current, { id, message, type }]);

            if (duration) {
                window.setTimeout(() => dismiss(id), duration);
            }

            return id;
        },
        [dismiss],
    );

    const toast = useMemo(
        () => ({
            push,
            dismiss,
            success: (message, opts) => push(message, { ...opts, type: 'success' }),
            error: (message, opts) => push(message, { ...opts, type: 'error' }),
            info: (message, opts) => push(message, { ...opts, type: 'info' }),
        }),
        [push, dismiss],
    );

    return (
        <ToastContext.Provider value={toast}>
            {children}

            <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4 sm:top-6">
                <AnimatePresence>
                    {toasts.map((item) => (
                        <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, y: -16, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -12, scale: 0.95 }}
                            transition={{ duration: 0.25, ease: 'easeOut' }}
                            className={
                                'pointer-events-auto w-full max-w-sm rounded-xl px-4 py-3 text-sm font-medium shadow-lg backdrop-blur ' +
                                (item.type === 'success'
                                    ? 'bg-[rgb(108,192,168)]/95 text-white'
                                    : item.type === 'error'
                                      ? 'bg-rose-600/95 text-white'
                                      : 'bg-neutral-900/95 text-white')
                            }
                            onClick={() => dismiss(item.id)}
                            role="status"
                        >
                            {item.message}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);

    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }

    return context;
}
