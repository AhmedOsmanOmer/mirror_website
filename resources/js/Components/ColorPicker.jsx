import { useState, useEffect } from 'react';
import { isValidHexColor } from '../lib/contrastColor';
import { useT } from '../Context/LanguageContext';

export default function ColorPicker({ value, onChange, ariaLabel }) {
    const t = useT();
    const [text, setText] = useState(value);

    useEffect(() => setText(value), [value]);

    const commitText = (raw) => {
        const next = raw.startsWith('#') ? raw : `#${raw}`;
        setText(next);
        if (isValidHexColor(next)) {
            onChange(next);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <label className="relative h-9 w-9 shrink-0 cursor-pointer overflow-hidden rounded-full ring-2 ring-white shadow-[0_0_0_1.5px_rgba(0,0,0,0.1)]">
                <input
                    type="color"
                    value={isValidHexColor(text) ? text : value}
                    onChange={(e) => commitText(e.target.value)}
                    className="absolute -left-2 -top-2 h-14 w-14 cursor-pointer"
                    aria-label={ariaLabel || t('studio.toolbar.color')}
                />
            </label>
            <input
                type="text"
                value={text}
                onChange={(e) => commitText(e.target.value)}
                maxLength={7}
                className="w-24 rounded-lg border border-neutral-200 px-2.5 py-1.5 font-mono text-sm uppercase text-ink focus:border-[rgb(108,192,168)] focus:outline-none focus:ring-2 focus:ring-[rgb(108,192,168)]/30"
            />
        </div>
    );
}
