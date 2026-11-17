'use client';

import { useState } from 'react';

// Keep the reserved thumbnail space even when a remote image fails to load.
export default function CouponThumbnail({ src, fallback, alt, className = '' }: {
    src?: string; fallback?: string; alt: string; className?: string;
}) {
    const [failed, setFailed] = useState<string[]>([]);
    const image = [src, fallback].find(url => url && !failed.includes(url));
    return <div className={`relative aspect-square w-full shrink-0 overflow-hidden rounded-xl bg-slate-50 ${className}`}>
        {image ? <img src={image} alt={alt} width={1200} height={1200} loading="lazy"
            onError={() => setFailed(previous => [...previous, image])}
            className="absolute inset-0 h-full w-full object-contain" />
            : <div className="flex h-full items-center justify-center p-6 text-center text-xl font-bold text-slate-700">{alt}</div>}
    </div>;
}
