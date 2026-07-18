// Mirrors config('cards.width_mm'/'height_mm') on the backend — the physical
// card is a fixed product constant, not user input.
export const CARD_WIDTH_MM = 85;
export const CARD_HEIGHT_MM = 50;

// Fixed print-accurate scale: 10px per mm, independent of the viewer's
// screen/zoom, so the on-screen canvas always represents true relative size.
export const PX_PER_MM = 10;

export function dimensionsForOrientation(orientation) {
    const widthMm = orientation === 'vertical' ? CARD_HEIGHT_MM : CARD_WIDTH_MM;
    const heightMm = orientation === 'vertical' ? CARD_WIDTH_MM : CARD_HEIGHT_MM;

    return {
        widthMm,
        heightMm,
        widthPx: widthMm * PX_PER_MM,
        heightPx: heightMm * PX_PER_MM,
    };
}
