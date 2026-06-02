"use client";

import { useState, useEffect } from 'react';

export default function SafeImage({ src, alt, className, lazyLoad }: { src: string, alt: string, className?: string, lazyLoad?: boolean }) {
    const [error, setError] = useState(false);
    const [isZoomed, setIsZoomed] = useState(false);

    useEffect(() => {
        if (isZoomed) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isZoomed]);

    if (error || !src) {
        const initialStr = alt ? alt.substring(0, 2) : '?';
        return (
            <div className={`flex items-center justify-center w-full h-full bg-gray-50 text-gray-500 font-bold text-sm md:text-xl tracking-tighter break-keep text-center ${className || ''}`}>
                {initialStr}
            </div>
        );
    }

    if (src.trim().startsWith('<')) {
        return (
            <div 
                className={`flex items-center justify-center w-full h-full [&>a]:flex [&>a]:items-center [&>a]:justify-center [&>a]:w-full [&>a]:h-full [&_img]:max-w-full [&_img]:max-h-full [&_img]:object-contain ${className || ''}`}
                dangerouslySetInnerHTML={{ __html: src }} 
            />
        );
    }

    return (
        <>
            <img 
                src={src} 
                alt={alt} 
                className={`max-w-full max-h-full object-contain cursor-zoom-in hover:opacity-95 transition-opacity ${className || ''}`}
                onError={() => setError(true)} 
                onClick={() => setIsZoomed(true)}
                loading={lazyLoad ? "lazy" : undefined}
                decoding={lazyLoad ? "async" : undefined}
            />
            {isZoomed && (
                <div 
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md cursor-zoom-out"
                    onClick={() => setIsZoomed(false)}
                >
                    <button 
                        className="absolute top-4 right-4 md:top-8 md:right-8 text-white/80 hover:text-white bg-black/50 hover:bg-black/80 p-2 rounded-full transition-colors z-[101]"
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsZoomed(false);
                        }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                    <img 
                        src={src} 
                        alt={alt} 
                        className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl cursor-default" 
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </>
    );
}
