import { motion } from 'framer-motion';
import { useT } from '../Context/LanguageContext';

export default function OrientationToggle({ value, onChange }) {
    const t = useT();
    const options = [
        { key: 'horizontal', label: t('studio.orientation.horizontal') },
        { key: 'vertical', label: t('studio.orientation.vertical') },
    ];

    return (
        <div className="inline-flex rounded-full border border-neutral-200 bg-white p-1 shadow-sm">
            {options.map((option) => (
                <button
                    key={option.key}
                    type="button"
                    onClick={() => onChange(option.key)}
                    className="relative rounded-full px-4 py-1.5 text-sm font-medium transition"
                >
                    {value === option.key && (
                        <motion.span
                            layoutId="orientation-pill"
                            className="absolute inset-0 rounded-full bg-[rgb(108,192,168)]"
                            transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                        />
                    )}
                    <span className={`relative z-10 ${value === option.key ? 'text-white' : 'text-ink-soft'}`}>
                        {option.label}
                    </span>
                </button>
            ))}
        </div>
    );
}
