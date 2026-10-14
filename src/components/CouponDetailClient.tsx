"use client";

import { Copy, ExternalLink } from 'lucide-react';
import { useToast } from './ToastProvider';
import { useState } from 'react';
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
    const [copied, setCopied] = useState(false);

    const expired = isCouponExpired(coupon.expiry, coupon.title);
    const isNoCode = !hasCouponCode(coupon.code);

    const handleCopyAndRedirect = async () => {
        showToast(await openCouponLink(coupon, affiliateUrl, storeName));
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
            {expired && <p role="status" className="mb-4 rounded-lg bg-gray-100 p-4 text-gray-700">이 프로모션은 종료되었습니다. 다른 할인 혜택을 확인해주세요.</p>}
            {/* Coupon Code Display */}
            {!isNoCode && (
                <div className="text-center mb-6">
                    <p className="text-xs text-gray-400 font-medium mb-2 uppercase tracking-wider">프로모션 코드</p>
                    <div className="border-2 border-dashed border-blue-300 py-4 px-6 rounded-xl font-mono text-2xl text-center tracking-wider bg-gray-50 text-gray-800">
                        {coupon.code}
                    </div>
                </div>
            )}

            {/* CTA Button */}
            <button
                onClick={handleCopyAndRedirect}
                disabled={expired}
                className={`btn-primary w-full justify-center py-4 text-lg font-bold ${copied ? 'bg-green-600 hover:bg-green-700 shadow-none' : ''}`}
            >
                {expired ? "기간 만료" : copied ? (
                    <>복사완료! 이동중...</>
                ) : isNoCode ? (
                    <>특가 바로가기 <ExternalLink size={20} /></>
                ) : (
                    <>코드 복사하고 할인 받기 <Copy size={20} /></>
                )}
            </button>

            {/* Coupon Info */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-xl p-4 text-center">
                    <p className="text-xs text-blue-600 font-medium mb-1">할인</p>
                    <p className="text-lg font-bold text-blue-800">{coupon.discount}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <p className="text-xs text-gray-500 font-medium mb-1">{isNoCode ? '적용 대상' : '조건'}</p>
                    <p className="text-sm font-semibold text-gray-700">{coupon.condition}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <p className="text-xs text-gray-500 font-medium mb-1">{isNoCode ? '진행 기간' : '유효기간'}</p>
                    <p className="text-sm font-semibold text-gray-700">{coupon.expiry}</p>
                </div>
            </div>
        </div>
    );
}
