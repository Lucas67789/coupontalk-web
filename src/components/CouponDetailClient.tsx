"use client";

import { Copy, ExternalLink } from 'lucide-react';
import { useToast } from './ToastProvider';
import { openCouponLink } from '@/lib/coupon-action';
import { isCouponExpired } from '@/lib/utils';
import { hasCouponCode } from '@/lib/affiliate';

interface CouponDetailClientProps {
    coupon: {
        id: string;
        code: string;
        title: string;
        discount: string;
        condition: string;
        expiry: string;
        affiliate_url?: string;
    };
    storeName: string;
    affiliateUrl: string;
}

export default function CouponDetailClient({ coupon, storeName, affiliateUrl }: CouponDetailClientProps) {
    const { showToast } = useToast();

    const expired = isCouponExpired(coupon.expiry, coupon.title);
    const isNoCode = !hasCouponCode(coupon.code);

    const handleCopyAndRedirect = async () => {
        if (expired) return;
        showToast(await openCouponLink(coupon, affiliateUrl, storeName));
    };

    return (
        <div className="bg-white rounded-2xl border border-blue-200 p-4 md:p-6">
            {expired && <p role="status" className="mb-4 rounded-lg bg-gray-100 p-4 text-gray-700">이 프로모션은 종료되었습니다. 다른 할인 혜택을 확인해주세요.</p>}
            <p className="text-2xl md:text-3xl font-bold text-blue-700 mb-3">{coupon.discount}</p>
            <p className="text-sm text-gray-700 leading-6 mb-3">{coupon.condition}</p>
            <p className="text-sm text-gray-500 mb-4">사용·예약 기간: {coupon.expiry || '판매처에서 확인'}</p>
            {/* Coupon Code Display */}
            {!isNoCode && (
                <div className="text-center mb-4">
                    <p className="text-xs text-gray-400 font-medium mb-2 uppercase tracking-wider">프로모션 코드</p>
                    <div className="border-2 border-dashed border-blue-300 py-3 px-4 rounded-xl font-mono break-all text-xl text-center tracking-wider bg-gray-50 text-gray-800">
                        {coupon.code}
                    </div>
                </div>
            )}

            {/* CTA Button */}
            <button
                onClick={handleCopyAndRedirect}
                disabled={expired}
                className="flex items-center justify-center gap-2 w-full rounded-xl bg-blue-600 text-white hover:bg-blue-700 py-4 text-base font-bold disabled:bg-gray-300"
            >
                {expired ? "기간 만료" : isNoCode ? (
                    <>할인 페이지로 이동 <ExternalLink size={20} /></>
                ) : (
                    <>코드 복사하고 할인 받기 <Copy size={20} /></>
                )}
            </button>

            {!expired && <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white p-3 md:hidden">
                <button onClick={handleCopyAndRedirect} className="w-full rounded-xl bg-blue-600 py-3 px-4 font-bold text-white">{isNoCode ? '할인 페이지로 이동' : '복사하고 할인받기'}</button>
            </div>}
        </div>
    );
}
