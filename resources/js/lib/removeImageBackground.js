// Lightweight chroma-key style background removal: samples the four corner
// pixels (the backdrop, for a typical logo export) and makes every pixel
// close to that color transparent. Works well for logos on a flat/solid
// background; not a full subject-segmentation model, but needs no extra
// dependency and runs entirely client-side.
export function removeImageBackground(dataUrl, tolerance = 32) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);

            let imageData;
            try {
                imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            } catch (err) {
                reject(err);
                return;
            }

            const { data, width, height } = imageData;
            const corners = [
                [0, 0],
                [width - 1, 0],
                [0, height - 1],
                [width - 1, height - 1],
            ];

            let r = 0;
            let g = 0;
            let b = 0;
            corners.forEach(([x, y]) => {
                const i = (y * width + x) * 4;
                r += data[i];
                g += data[i + 1];
                b += data[i + 2];
            });
            r /= corners.length;
            g /= corners.length;
            b /= corners.length;

            const thresholdSq = tolerance * tolerance * 3;
            for (let i = 0; i < data.length; i += 4) {
                const dr = data[i] - r;
                const dg = data[i + 1] - g;
                const db = data[i + 2] - b;
                if (dr * dr + dg * dg + db * db <= thresholdSq) {
                    data[i + 3] = 0;
                }
            }

            ctx.putImageData(imageData, 0, 0);
            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = () => reject(new Error('Failed to load image for background removal.'));
        img.src = dataUrl;
    });
}
