import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CARD_ICONS } from '../lib/cardIcons';
import { useT } from '../Context/LanguageContext';

export default function IconPicker({ onSelect }) {
    const t = useT();
    const [open, setOpen] = useState(false);
    const rootRef = useRef(null);

    useEffect(() => {
        if (!open) return undefined;

        const handleClickOutside = (e) => {
            if (rootRef.current && !rootRef.current.contains(e.target)) {
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [open]);

    return (
        <div ref={rootRef} className="relative">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-neutral-200 bg-white px-3.5 py-2 text-sm font-medium text-ink transition-colors hover:bg-neutral-50"
            >
                + {t('studio.toolbar.add_icon')}
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                        className="absolute start-0 top-full z-20 mt-2 grid grid-cols-3 gap-1 rounded-xl border border-neutral-200 bg-white p-2 shadow-xl"
                    >
                        {CARD_ICONS.map((icon) => (
                            <button
                                key={icon.key}
                                type="button"
                                title={t(`studio.icon.${icon.key}`)}
                                aria-label={t(`studio.icon.${icon.key}`)}
                                onClick={() => {
                                    onSelect(icon.d);
                                    setOpen(false);
                                }}
                                className="flex h-10 w-10 items-center justify-center rounded-lg text-ink-soft transition hover:bg-neutral-100 hover:text-ink"
                            >
                                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
                                    <path d={icon.d} />
                                </svg>
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
