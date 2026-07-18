import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { dimensionsForOrientation } from '../lib/cardDimensions';
import { useCardDisplaySize } from '../lib/useCardDisplaySize';

export default function MirrorSidePreview({ orientation }) {
    const shimmerRef = useRef(null);
    const { widthPx, heightPx } = dimensionsForOrientation(orientation);
    const { containerRef, width: displayWidth, height: displayHeight } = useCardDisplaySize(widthPx, heightPx);

    useGSAP(() => {
        gsap.to(shimmerRef.current, {
            backgroundPositionX: '220%',
            duration: 2.8,
            repeat: -1,
            repeatDelay: 1.2,
            ease: 'power1.inOut',
        });
    }, [orientation]);

    return (
        <div
            ref={containerRef}
            className="mx-auto overflow-hidden rounded-2xl shadow-xl ring-1 ring-black/10"
            style={{ width: displayWidth, height: displayHeight }}
        >
            <div className="relative h-full w-full">
                <div className="absolute inset-0 bg-gradient-to-br from-[#c9ccd1] via-[#eef0f2] to-[#a9adb3]" />
                <div
                    ref={shimmerRef}
                    className="absolute inset-0"
                    style={{
                        backgroundImage:
                            'linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.85) 45%, rgba(255,255,255,0.2) 55%, transparent 70%)',
                        backgroundSize: '250% 100%',
                        backgroundPositionX: '-40%',
                    }}
                />
            </div>
        </div>
    );
}
