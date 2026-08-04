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
                showToast(`'${coupon.code}' 복사 완료! 결제창에 입력하세요`);
            });
        } else {
            showToast(`${storeName} 특가 페이지로 이동합니다`);
        }
        
        setTimeout(() => {
            window.open(parsedAffiliateUrl, '_blank');
            setCopied(false);
        }, 1000);
    };

    const isNoCode = coupon.code === 'NO_CODE_REQUIRED';
    const detailHref = `/store/${storeId}/coupon/${coupon.id}`;

    return (
        <Link href={detailHref} className="flex flex-col bg-white border border-gray-200 rounded-3xl p-6 hover:shadow-xl transition-all mb-6 group cursor-pointer relative overflow-hidden">
            
            {/* Top: Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-md text-sm font-black tracking-wide">
                    {coupon.discount}
                </span>
                <span className="text-gray-500 text-sm font-medium bg-gray-100 px-3 py-1.5 rounded-md">
                    유효기간: {coupon.expiry}
                </span>
            </div>

            {/* Title */}
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight group-hover:text-[#ff385c] transition-colors mb-4">
                {coupon.title}
            </h3>

            {/* Condition Bullet */}
            <div className="flex items-start gap-2 text-base text-gray-700 mb-6 bg-gray-50 p-4 rounded-xl">
                <CheckCircle2 size={20} className="text-[#ff385c] flex-shrink-0 mt-0.5" />
                <span className="font-medium whitespace-pre-wrap leading-relaxed">{parsedConditionText}</span>
            </div>

            {/* Full Width Button */}
            <button
                onClick={handleCopyAndRedirect}
                className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
                    copied 
                    ? 'bg-green-600 text-white shadow-lg' 
                    : 'bg-[#ff385c] hover:bg-[#e03150] text-white shadow-lg shadow-rose-200 hover:shadow-xl hover:-translate-y-1'
                }`}
            >
                {copied ? (
                    '복사완료!'
                ) : isNoCode ? (
                    <>특가 보러가기 <ExternalLink size={20} /></>
                ) : (
                    <>쿠폰 복사하기 <Copy size={20} /></>
                )}
            </button>
        </Link>
    );
}
