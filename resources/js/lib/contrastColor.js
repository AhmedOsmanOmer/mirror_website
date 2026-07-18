// Mirrors the relative-luminance formula the backend previously used for its
// server-rendered text (App\Services\CardDesignPdfService), so on-canvas
// default text color previews match what a legible design would look like.
export function contrastingTextColor(hex) {
    const clean = hex.replace('#', '');
    const full =
        clean.length === 3
            ? clean
                  .split('')
                  .map((c) => c + c)
                  .join('')
            : clean;

    const r = parseInt(full.substring(0, 2), 16) / 255;
    const g = parseInt(full.substring(2, 4), 16) / 255;
    const b = parseInt(full.substring(4, 6), 16) / 255;

    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

    return luminance > 0.6 ? '#1a1a1a' : '#ffffff';
}

export function isValidHexColor(value) {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value);
}
