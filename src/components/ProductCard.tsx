"use client";

import SafeImage from './SafeImage';
import { ExternalLink, ShoppingCart, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

export default function ProductCard({ product, storeName }: { product: any, storeName: string }) {
    const [clicked, setClicked] = useState(false);

    const handleRedirect = () => {
        setClicked(true);
        window.open(product.affiliate_url, '_blank', 'noopener,noreferrer');
        setTimeout(() => setClicked(false), 2000);
    };

    return (
        <div className="flex flex-col bg-white border border-gray-200 rounded-3xl p-6 hover:shadow-xl transition-all mb-6 group cursor-pointer relative overflow-hidden" onClick={handleRedirect}>
            
            {/* Title & Badge */}
            <div className="mb-4">
                {product.discount_badge && (
                    <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1.5 rounded-md text-sm font-black tracking-wide mb-3">
                        {product.discount_badge}
                    </span>
                )}
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">
                    {product.title}
                </h3>
            </div>

            {/* Thumbnail Area - Full Width in Blog Style */}
            <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] bg-gray-50 rounded-2xl flex items-center justify-center overflow-hidden mb-6">
                {product.image_url ? (
                    <SafeImage src={product.image_url} alt={product.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                    <div className="text-gray-300">
                        <ShoppingCart size={48} />
                    </div>
                )}
            </div>

            {/* Price & Description */}
            <div className="flex flex-col gap-4 mb-6">
                {product.description && (
                    <div className="flex items-start gap-2 text-base text-gray-700 bg-gray-50 p-4 rounded-xl">
                        <CheckCircle2 size={20} className="text-blue-500 flex-shrink-0 mt-0.5" />
                        <span className="font-medium whitespace-pre-wrap leading-relaxed">{product.description}</span>
                    </div>
                )}
                
                <div className="flex flex-col mt-2">
                    <div className="text-sm font-bold text-blue-600 mb-1">
                        최대 할인 적용 예상가
                    </div>
                    <div className="flex items-end gap-3">
                        <div className="text-2xl font-black text-gray-900">
                            {product.price}
                        </div>
                        {product.original_price && (
                            <div className="text-base text-gray-400 line-through font-medium mb-0.5">
                                {product.original_price}
                            </div>
                        )}
                    </div>
                    <p className="text-[11px] sm:text-xs text-gray-500 mt-3 leading-relaxed bg-gray-50 p-2 sm:p-3 rounded-lg border border-gray-100">
                        ※ 최종 구매가는 선택 옵션 및 카드사 혜택 등 추가 할인이 적용될 수 있으며, 정확한 최종 구매 가격은 <strong>{storeName} 공식 사이트</strong>에서 확인 가능합니다.
                    </p>
                </div>
            </div>

            {/* Full Width CTA */}
            <button
                onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleRedirect(); }}
                className={`w-full py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
                    clicked 
                        ? 'bg-green-600 text-white shadow-lg' 
                        : 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-200 hover:shadow-xl hover:-translate-y-1'
                }`}
            >
                {clicked ? (
                    '이동 중...'
                ) : (
                    <>특가 보러가기 <ExternalLink size={20} /></>
                )}
            </button>
        </div>
    );
}
