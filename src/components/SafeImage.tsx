"use client";

import { useState } from 'react';

export default function SafeImage({ src, alt, className, lazyLoad }: { src: string, alt: string, className?: string, lazyLoad?: boolean }) {
    const [error, setError] = useState(false);

    if (error || !src) {
        const initialStr = alt ? alt.substring(0, 2) : '?';
        return (
            <div className={`flex items-center justify-center w-full h-full bg-gray-50 text-gray-500 font-bold text-sm md:text-xl tracking-tighter break-keep text-center ${className || ''}`}>
                {initialStr}
            </div>
        );
    }

    return (
        <img 
            src={src} 
            alt={alt} 
            className={`max-w-full max-h-full object-contain ${className || ''}`}
            onError={() => setError(true)} 
            loading={lazyLoad ? "lazy" : undefined}
            decoding={lazyLoad ? "async" : undefined}
        />
    );
}
