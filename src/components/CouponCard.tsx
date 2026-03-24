"use client";
import { Copy, ExternalLink, Calendar, CheckCircle2 } from 'lucide-react';
import { useToast } from './ToastProvider';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function CouponCard({ coupon, storeName, storeId }: { coupon: any, storeName: string, storeId?: string }) {
    const { showToast } = useToast();
    const [copied, setCopied] = useState(false);

    // Parse packed JSON condition
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

    const handleCopyAndRedirect = async () => {
        // Track the click silently in the background
        if (coupon.id) {
            try {
                await supabase.rpc('increment_coupon_click', { coupon_id: coupon.id });
            } catch (err) {
                console.error('Failed to register click', err);
            }
        }
        // 1. Copy to clipboard
        if (coupon.code !== 'NO_CODE_REQUIRED') {
            navigator.clipboard.writeText(coupon.code)
                .then(() => {
                    setCopied(true);
                    showToast(`'${coupon.code}' 복사 완료! 결제창에서 입력하세요.`);
                })
                .catch(err => {
                    console.error("복사실패", err);
                    showToast("코드 복사에 실패했습니다. 수동으로 복사해주세요.");
                });
        } else {
            showToast(`${storeName} 할인 페이지로 이동합니다.`);
        }

        // 2. Open Affiliate link in new tab after slightly delay
        setTimeout(() => {
            window.open(parsedAffiliateUrl, '_blank');
            setCopied(false); // Reset after a while
        }, 1000);
    };

    const isNoCode = coupon.code === 'NO_CODE_REQUIRED';

    const detailHref = storeId ? `/store/${storeId}/coupon/${coupon.id}` : undefined;

    const cardContent = (
        <>
            {/* Decorative top accent */}
            <div className="absolute left-0 top-0 right-0 h-1 bg-blue-500"></div>

            <div className="flex-1 flex flex-col">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold tracking-wider">
                            {coupon.discount}
                        </span>
                        <span className="text-sm text-gray-500 font-medium">
                            {storeName}
                        </span>
                    </div>

                    <h3 className="text-lg font-bold mb-3 text-gray-900 leading-tight line-clamp-2">
                        {coupon.title}
                    </h3>

                    <ul className="flex flex-col gap-2 mb-4 text-sm text-gray-600">
                        <li className="flex items-start gap-2">
                            <CheckCircle2 size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                            <span>조건: <strong>{parsedConditionText}</strong></span>
                        </li>
                        <li className="flex items-center gap-2">
                            <Calendar size={16} className="text-gray-400 flex-shrink-0" />
                            <span>유효기간: {coupon.expiry}</span>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="flex flex-col gap-3 mt-auto pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>

                <div className="w-full text-center">
                    <p className="text-xs text-gray-400 font-medium mb-1 uppercase tracking-wider">프로모션 코드</p>
                    <div className={`border-2 border-dashed py-3 px-4 rounded-lg font-mono text-lg text-center tracking-wider bg-gray-50 w-full ${isNoCode ? 'text-gray-400 border-gray-200' : 'text-gray-800 border-gray-300'}`}>
                        {isNoCode ? '코드 필요없음' : coupon.code}
                    </div>
                </div>

                <button
                    onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleCopyAndRedirect(); }}
                    className={`btn-primary w-full mt-2 justify-center py-3 text-base ${copied ? 'bg-green-600 hover:bg-green-700 shadow-none' : ''}`}
                >
                    {copied ? (
                        <>복사완료! 이동중...</>
                    ) : isNoCode ? (
                        <>할인 받기 <ExternalLink size={18} /></>
                    ) : (
                        <>코드 복사하기 <Copy size={18} /></>
                    )}
                </button>
            </div>
        </>
    );

    return detailHref ? (
        <Link href={detailHref} className="card p-5 flex flex-col gap-4 relative overflow-hidden h-full hover:shadow-lg transition-shadow cursor-pointer block">
            {cardContent}
        </Link>
    ) : (
        <div className="card p-5 flex flex-col gap-4 relative overflow-hidden h-full">
            {cardContent}
        </div>
    );
}
