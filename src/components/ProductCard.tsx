"use client";

import SafeImage from './SafeImage';
import { ExternalLink, ShoppingCart, MessageCircleHeart } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

// Store theme configuration
const getStoreTheme = (name: string) => {
    const themes = [
        { badgeBg: 'bg-blue-100', badgeText: 'text-blue-700', accent: 'bg-blue-500' },
        { badgeBg: 'bg-purple-100', badgeText: 'text-purple-700', accent: 'bg-purple-500' },
        { badgeBg: 'bg-green-100', badgeText: 'text-green-700', accent: 'bg-green-500' },
        { badgeBg: 'bg-rose-100', badgeText: 'text-rose-700', accent: 'bg-rose-500' },
        { badgeBg: 'bg-amber-100', badgeText: 'text-amber-700', accent: 'bg-amber-500' },
        { badgeBg: 'bg-indigo-100', badgeText: 'text-indigo-700', accent: 'bg-indigo-500' },
    ];
    if (!name) return themes[0];
    let hash = 5381;
    for (let i = 0; i < name.length; i++) {
        hash = ((hash << 5) + hash) + name.charCodeAt(i);
    }
    return themes[Math.abs(hash) % themes.length];
};

export default function ProductCard({ product, storeName }: { product: any, storeName: string }) {
    const [clicked, setClicked] = useState(false);
    const theme = getStoreTheme(storeName);

    const handleRedirect = () => {
        setClicked(true);
        window.open(product.affiliate_url, '_blank', 'noopener,noreferrer');
        setTimeout(() => setClicked(false), 2000);
    };

    return (
        <div className="card flex flex-col h-full bg-white rounded-3xl overflow-hidden hover-card border border-gray-100 hover:border-transparent group">
            {/* Thumbnail Area */}
            <div className="relative w-full aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
                {product.image_url ? (
                    <SafeImage src={product.image_url} alt={product.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                    <div className="text-gray-300">
                        <ShoppingCart size={48} />
                    </div>
                )}
                {product.discount_badge && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1.5 rounded-full text-xs font-black tracking-wider shadow-md">
                        {product.discount_badge}
                    </div>
                )}
            </div>

            {/* Content Area */}
            <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center gap-1.5 mb-3">
                    {storeName && (
                        <>
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm flex-shrink-0 ${theme.accent}`}>
                                {storeName.charAt(0)}
                            </div>
                            <span className="text-[13px] text-gray-500 font-semibold tracking-tight truncate">
                                {storeName}
                            </span>
                        </>
                    )}
                </div>
                
                <h3 className="text-base font-bold text-gray-900 leading-snug line-clamp-2 mb-3">
                    {product.title}
                </h3>

                {product.description && (
                    <div className="mb-4 text-sm text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100 line-clamp-3">
                        <div className="flex items-start gap-2">
                            <MessageCircleHeart size={16} className="text-blue-400 shrink-0 mt-0.5" />
                            <span className="leading-relaxed">{product.description}</span>
                        </div>
                    </div>
                )}

                <div className="mt-auto pt-4 flex flex-col gap-1 border-t border-gray-50">
                    {product.original_price && (
                        <div className="text-sm text-gray-400 line-through font-medium">
                            {product.original_price}
                        </div>
                    )}
                    <div className="text-xl font-extrabold text-gray-900 mb-4">
                        {product.price}
                    </div>
                    
                    <button
                        onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleRedirect(); }}
                        className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                            clicked 
                                ? 'bg-green-600 text-white shadow-md shadow-green-200' 
                                : 'bg-slate-900 text-white hover:bg-slate-800 shadow-md shadow-slate-200 hover:shadow-lg hover:-translate-y-0.5'
                        }`}
                    >
                        {clicked ? (
                            <>이동 중입니다...</>
                        ) : (
                            <>최저가 확인하기 <ExternalLink size={16} /></>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
