import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { ActiveSelection, Canvas, FabricImage, Path, Textbox } from 'fabric';
import { dimensionsForOrientation } from '../lib/cardDimensions';
import { contrastingTextColor } from '../lib/contrastColor';
import { useCardDisplaySize } from '../lib/useCardDisplaySize';
import { removeImageBackground } from '../lib/removeImageBackground';

const CardCanvasEditor = forwardRef(function CardCanvasEditor(
    {
        orientation,
        backgroundColor,
        defaultFontFamily,
        defaultTextColor,
        onSelectionFontChange,
        onSelectionColorChange,
        onSelectionImageChange,
    },
    ref,
) {
    const canvasElRef = useRef(null);
    const fabricRef = useRef(null);
    const orientationRef = useRef(orientation);
    const defaultFontRef = useRef(defaultFontFamily);
    const defaultTextColorRef = useRef(defaultTextColor);

    // Initialize the Fabric canvas once.
    useEffect(() => {
        const { widthPx, heightPx } = dimensionsForOrientation(orientation);

        const canvas = new Canvas(canvasElRef.current, {
            width: widthPx,
            height: heightPx,
            backgroundColor,
            preserveObjectStacking: true,
        });

        fabricRef.current = canvas;

        const syncSelection = () => {
            const active = canvas.getActiveObject();
            // Only Textbox objects have a meaningful fontFamily/fill for our
            // purposes — `fill` also exists on images (base object property)
            // but tinting a logo isn't what the text color picker is for.
            // Icon paths share the same recolorable fill as text, though.
            const isText = Boolean(active && 'fontFamily' in active);
            const isIcon = Boolean(active && active.type === 'path');
            onSelectionFontChange?.(isText ? active.fontFamily : null);
            onSelectionColorChange?.(isText || isIcon ? active.fill : null);

            const isImage = Boolean(active && active.type === 'image');
            onSelectionImageChange?.(isImage ? { bgRemoved: Boolean(active.data?.bgRemoved) } : null);
        };

        canvas.on('selection:created', syncSelection);
        canvas.on('selection:updated', syncSelection);
        canvas.on('selection:cleared', syncSelection);

        return () => {
            canvas.dispose();
            fabricRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Keep background color in sync without rebuilding the canvas.
    useEffect(() => {
        const canvas = fabricRef.current;
        if (!canvas) return;
        canvas.backgroundColor = backgroundColor;
        canvas.renderAll();
    }, [backgroundColor]);

    useEffect(() => {
        defaultFontRef.current = defaultFontFamily;
    }, [defaultFontFamily]);

    useEffect(() => {
        defaultTextColorRef.current = defaultTextColor;
    }, [defaultTextColor]);

    // Rotate existing content 90° and resize the canvas when orientation
    // changes, keeping the fixed print scale and re-centering the group.
    useEffect(() => {
        const canvas = fabricRef.current;
        if (!canvas || orientationRef.current === orientation) {
            orientationRef.current = orientation;
            return;
        }

        const oldDims = dimensionsForOrientation(orientationRef.current);
        const newDims = dimensionsForOrientation(orientation);
        const objects = canvas.getObjects();

        if (objects.length > 0) {
            const selection = new ActiveSelection(objects, { canvas });
            canvas.setActiveObject(selection);
            selection.rotate((selection.angle || 0) + 90);
            canvas.discardActiveObject();

            const dx = newDims.widthPx / 2 - oldDims.widthPx / 2;
            const dy = newDims.heightPx / 2 - oldDims.heightPx / 2;

            objects.forEach((obj) => {
                obj.set({ left: obj.left + dx, top: obj.top + dy });
                obj.setCoords();
            });
        }

        canvas.setDimensions({ width: newDims.widthPx, height: newDims.heightPx });
        canvas.renderAll();
        orientationRef.current = orientation;
    }, [orientation]);

    useImperativeHandle(ref, () => ({
        addText() {
            const canvas = fabricRef.current;
            if (!canvas) return;

            const text = new Textbox('Your text', {
                left: canvas.width / 2 - 60,
                top: canvas.height / 2 - 12,
                width: 160,
                fontSize: 22,
                fontFamily: defaultFontRef.current,
                fill: defaultTextColorRef.current || contrastingTextColor(backgroundColor),
                editable: true,
            });

            canvas.add(text);
            canvas.setActiveObject(text);
            text.enterEditing();
            text.selectAll();
            canvas.renderAll();
        },
        async addLogo(dataUrl) {
            const canvas = fabricRef.current;
            if (!canvas) return;

            const image = await FabricImage.fromURL(dataUrl);

            // Default to a modest size (at most ~35% of the shorter card
            // edge) so a freshly-added logo doesn't swamp the design —
            // still freely resizable afterwards via the normal handles.
            const maxDimension = Math.min(canvas.width, canvas.height) * 0.35;
            const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));

            image.set({
                left: canvas.width / 2,
                top: canvas.height / 2,
                originX: 'center',
                originY: 'center',
                scaleX: scale,
                scaleY: scale,
                data: { originalSrc: dataUrl, noBgSrc: null, bgRemoved: false },
            });

            canvas.add(image);
            canvas.setActiveObject(image);
            canvas.renderAll();
            onSelectionImageChange?.({ bgRemoved: false });
        },
        addIcon(pathData) {
            const canvas = fabricRef.current;
            if (!canvas) return;

            const icon = new Path(pathData, {
                originX: 'center',
                originY: 'center',
                fill: defaultTextColorRef.current || contrastingTextColor(backgroundColor),
            });

            const targetSize = Math.min(canvas.width, canvas.height) * 0.18;
            const scale = targetSize / Math.max(icon.width, icon.height);

            icon.set({
                left: canvas.width / 2,
                top: canvas.height / 2,
                scaleX: scale,
                scaleY: scale,
            });

            canvas.add(icon);
            canvas.setActiveObject(icon);
            canvas.renderAll();
        },
        async toggleLogoBackground() {
            const canvas = fabricRef.current;
            if (!canvas) return;

            const active = canvas.getActiveObject();
            if (!active || active.type !== 'image') return;

            const data = active.data || {};

            if (!data.bgRemoved) {
                if (!data.noBgSrc) {
                    data.noBgSrc = await removeImageBackground(data.originalSrc);
                }
                await active.setSrc(data.noBgSrc);
                data.bgRemoved = true;
            } else {
                await active.setSrc(data.originalSrc);
                data.bgRemoved = false;
            }

            active.set('data', data);
            canvas.renderAll();
            onSelectionImageChange?.({ bgRemoved: data.bgRemoved });
        },
        deleteSelected() {
            const canvas = fabricRef.current;
            if (!canvas) return;
            const active = canvas.getActiveObjects();
            active.forEach((obj) => canvas.remove(obj));
            canvas.discardActiveObject();
            canvas.renderAll();
        },
        applyFontToSelection(font) {
            const canvas = fabricRef.current;
            if (!canvas) return;
            const active = canvas.getActiveObject();
            if (active && 'fontFamily' in active) {
                active.set('fontFamily', font);
                canvas.renderAll();
            }
        },
        applyColorToSelection(color) {
            const canvas = fabricRef.current;
            if (!canvas) return;
            const active = canvas.getActiveObject();
            if (active && ('fontFamily' in active || active.type === 'path')) {
                active.set('fill', color);
                canvas.renderAll();
            }
        },
        hasSelection() {
            return Boolean(fabricRef.current?.getActiveObject());
        },
        exportDataURL() {
            const canvas = fabricRef.current;
            if (!canvas) return null;
            canvas.discardActiveObject();
            canvas.renderAll();
            return canvas.toDataURL({ format: 'png', multiplier: 3 });
        },
        isEmpty() {
            return (fabricRef.current?.getObjects().length ?? 0) === 0;
        },
    }));

    const { widthPx, heightPx } = dimensionsForOrientation(orientation);
    const { containerRef, width: displayWidth, height: displayHeight } = useCardDisplaySize(widthPx, heightPx);

    return (
        <div
            ref={containerRef}
            className="card-canvas-wrapper mx-auto overflow-hidden rounded-2xl shadow-xl ring-1 ring-black/10"
            style={{ width: displayWidth, height: displayHeight }}
        >
            <canvas ref={canvasElRef} />
        </div>
    );
});

export default CardCanvasEditor;
