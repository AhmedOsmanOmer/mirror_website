export default function FontSelector({ value, onChange, fonts }) {
    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm text-ink focus:border-[rgb(108,192,168)] focus:outline-none focus:ring-2 focus:ring-[rgb(108,192,168)]/30"
            style={{ fontFamily: value }}
        >
            {fonts.map((font) => (
                <option key={font} value={font} style={{ fontFamily: font }}>
                    {font}
                </option>
            ))}
        </select>
    );
}
