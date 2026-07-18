/**
 * Slow-breathing gradient-mesh backdrop built from blurred, animated blobs
 * in the three brand colors. Pure CSS (GPU-composited transform loops) so it
 * stays smooth on mobile without pulling in a WebGL dependency.
 */
export default function AuroraBackground({ className = '', intensity = 1, noise = true }) {
    return (
        <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
            <div
                className="aurora-blob aurora-blob-a absolute -left-[10%] -top-[15%] h-[55%] w-[55%] rounded-full blur-3xl"
                style={{ backgroundColor: 'rgb(108,192,168)', opacity: 0.6 * intensity }}
            />
            <div
                className="aurora-blob aurora-blob-b absolute -right-[15%] top-[5%] h-[60%] w-[60%] rounded-full blur-3xl"
                style={{ backgroundColor: 'rgb(229,182,164)', opacity: 0.5 * intensity }}
            />
            <div
                className="aurora-blob aurora-blob-c absolute bottom-[-20%] left-[20%] h-[50%] w-[50%] rounded-full blur-3xl"
                style={{ backgroundColor: 'rgb(229,217,219)', opacity: 0.6 * intensity }}
            />
            {noise && <div className="noise-overlay absolute inset-0 opacity-[0.035] mix-blend-overlay" />}
        </div>
    );
}
