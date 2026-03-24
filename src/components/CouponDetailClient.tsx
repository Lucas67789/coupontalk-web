"use client";

import { Copy, ExternalLink } from 'lucide-react';
import { useToast } from './ToastProvider';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

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

    const isNoCode = coupon.code === 'NO_CODE_REQUIRED';

    const handleCopyAndRedirect = async () => {
        // Track click
        if (coupon.id) {
            try {
                await supabase.rpc('increment_coupon_click', { coupon_id: coupon.id });
            } catch (err) {
                console.error('Failed to register click', err);
            }
        }

        // Copy code
        if (!isNoCode) {
            try {
                await navigator.clipboard.writeText(coupon.code);
                setCopied(true);
                showToast(`'${coupon.code}' 복사 완료! 결제창에서 입력하세요.`);
            } catch (err) {
                console.error("복사실패", err);
                showToast("코드 복사에 실패했습니다. 수동으로 복사해주세요.");
            }
        } else {
            showToast(`${storeName} 할인 페이지로 이동합니다.`);
        }

        // Open affiliate link
        setTimeout(() => {
            window.open(affiliateUrl, '_blank');
            setCopied(false);
        }, 1000);
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
            {/* Coupon Code Display */}
            <div className="text-center mb-6">
                <p className="text-xs text-gray-400 font-medium mb-2 uppercase tracking-wider">프로모션 코드</p>
                <div className={`border-2 border-dashed py-4 px-6 rounded-xl font-mono text-2xl text-center tracking-wider bg-gray-50 ${isNoCode ? 'text-gray-400 border-gray-200' : 'text-gray-800 border-blue-300'}`}>
                    {isNoCode ? '코드 필요없음' : coupon.code}
                </div>
            </div>

            {/* CTA Button */}
            <button
                onClick={handleCopyAndRedirect}
                className={`btn-primary w-full justify-center py-4 text-lg font-bold ${copied ? 'bg-green-600 hover:bg-green-700 shadow-none' : ''}`}
            >
                {copied ? (
                    <>복사완료! 이동중...</>
                ) : isNoCode ? (
                    <>할인 받기 <ExternalLink size={20} /></>
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
                    <p className="text-xs text-gray-500 font-medium mb-1">조건</p>
                    <p className="text-sm font-semibold text-gray-700">{coupon.condition}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <p className="text-xs text-gray-500 font-medium mb-1">유효기간</p>
                    <p className="text-sm font-semibold text-gray-700">{coupon.expiry}</p>
                </div>
            </div>
        </div>
    );
}
