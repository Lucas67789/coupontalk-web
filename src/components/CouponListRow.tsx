"use client";
import { Copy, ExternalLink, CheckCircle2 } from 'lucide-react';
import { useToast } from './ToastProvider';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import SafeImage from './SafeImage';
import Link from 'next/link';

export default function CouponListRow({ coupon, storeName, storeId, storeLogo }: { coupon: any, storeName: string, storeId: string, storeLogo: string }) {
    const { showToast } = useToast();
    const [copied, setCopied] = useState(false);

    let parsedConditionText = coupon.condition;
    let parsedAffiliateUrl = coupon.affiliate_url || coupon.affiliateUrl || '';
    try {
        if (coupon.condition && coupon.condition.startsWith('{')) {
            const p = JSON.parse(coupon.condition);
            if (p.text !== undefined) {
                parsedConditionText = p.text;
                parsedAffiliateUrl = p.url;
            }
        }
    } catch (e) { }

    const handleCopyAndRedirect = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (coupon.id) {
            try { await supabase.rpc('increment_coupon_click', { coupon_id: coupon.id }); } catch (err) {}
        }
        
        if (coupon.code !== 'NO_CODE_REQUIRED') {
            navigator.clipboard.writeText(coupon.code).then(() => {
                setCopied(true);
                showToast(`'${coupon.code}' 복사 완료! 결제창에서 입력하세요.`);
            });
        } else {
            showToast(`${storeName} 할인 페이지로 이동합니다.`);
        }
        
        setTimeout(() => {
            window.open(parsedAffiliateUrl, '_blank');
            setCopied(false);
        }, 1000);
    };

    const isNoCode = coupon.code === 'NO_CODE_REQUIRED';
    const detailHref = `/store/${storeId}/coupon/${coupon.id}`;

    return (
        <Link href={detailHref} className="flex flex-col md:flex-row items-center gap-4 md:gap-8 bg-white border border-gray-100 rounded-2xl p-4 md:p-6 hover:shadow-lg transition-all mb-4 group cursor-pointer relative overflow-hidden">
            {/* Left: Store Logo */}
            <div className="w-16 h-16 md:w-24 md:h-24 rounded-2xl overflow-hidden border border-gray-100 flex items-center justify-center bg-white p-2 shadow-sm flex-shrink-0">
                <SafeImage src={storeLogo} alt={storeName} />
            </div>

            {/* Middle: Content */}
            <div className="flex-1 flex flex-col gap-2 w-full text-center md:text-left">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-1">
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold tracking-wider">
                        {coupon.discount}
                    </span>
                    <span className="text-gray-400 text-xs font-medium bg-gray-100 px-2 py-1 rounded-full">유효기간: {coupon.expiry}</span>
                </div>
                <h3 className="text-lg md:text-xl font-bold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">
                    {coupon.title}
                </h3>
                <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-gray-600 mt-1">
                    <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />
                    <span className="line-clamp-1">{parsedConditionText}</span>
                </div>
            </div>

            {/* Right: CTA Button */}
            <div className="w-full md:w-auto flex-shrink-0 flex flex-col items-center gap-2 mt-4 md:mt-0">
                <button
                    onClick={handleCopyAndRedirect}
                    className={`w-full md:w-56 py-3.5 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all ${
                        copied 
                        ? 'bg-green-600 text-white' 
                        : 'bg-[#ff385c] hover:bg-[#e03150] text-white shadow-md hover:shadow-lg'
                    }`}
                >
                    {copied ? (
                        '복사완료!'
                    ) : isNoCode ? (
                        <>할인 받기 <ExternalLink size={18} /></>
                    ) : (
                        <>쿠폰 복사하기 <Copy size={18} /></>
                    )}
                </button>
            </div>
        </Link>
    );
}
