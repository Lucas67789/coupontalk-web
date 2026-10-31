"use client";
import type { CouponRow } from '@/lib/models';
import React, { useState, useMemo } from 'react';
import { Copy, ExternalLink, Calendar, CheckCircle2 } from 'lucide-react';
import { useToast } from './ToastProvider';
import { openCouponLink } from '@/lib/coupon-action';
import { hasCouponCode } from '@/lib/affiliate';
import { couponStatus } from '@/lib/utils';
import { latestGuideTitle } from '@/lib/latest-guide';
import Link from 'next/link';
import Image from 'next/image';
import { couponImages } from '@/lib/content-images';

const getStoreTheme = (name: string) => {
    const themes = [
        { accent: 'bg-blue-500', badgeBg: 'bg-blue-50', badgeText: 'text-blue-700' },
        { accent: 'bg-emerald-500', badgeBg: 'bg-emerald-50', badgeText: 'text-emerald-700' },
        { accent: 'bg-rose-500', badgeBg: 'bg-rose-50', badgeText: 'text-rose-700' },
        { accent: 'bg-purple-500', badgeBg: 'bg-purple-50', badgeText: 'text-purple-700' },
        { accent: 'bg-orange-500', badgeBg: 'bg-orange-50', badgeText: 'text-orange-700' },
        { accent: 'bg-indigo-500', badgeBg: 'bg-indigo-50', badgeText: 'text-indigo-700' },
        { accent: 'bg-cyan-500', badgeBg: 'bg-cyan-50', badgeText: 'text-cyan-700' },
        { accent: 'bg-teal-500', badgeBg: 'bg-teal-50', badgeText: 'text-teal-700' },
        { accent: 'bg-pink-500', badgeBg: 'bg-pink-50', badgeText: 'text-pink-700' },
        { accent: 'bg-amber-500', badgeBg: 'bg-amber-50', badgeText: 'text-amber-700' },
        { accent: 'bg-violet-500', badgeBg: 'bg-violet-50', badgeText: 'text-violet-700' },
        { accent: 'bg-fuchsia-500', badgeBg: 'bg-fuchsia-50', badgeText: 'text-fuchsia-700' },
    ];
    if (!name) return themes[0];
    let hash = 5381;
    for (let i = 0; i < name.length; i++) {
        hash = ((hash << 5) + hash) + name.charCodeAt(i); /* hash * 33 + c */
    }
    return themes[Math.abs(hash) % themes.length];
};

export default function CouponCard({ coupon, storeName, storeId, isExpired }: { coupon: CouponRow, storeName: string, storeId?: string, isExpired?: boolean }) {
    const { showToast } = useToast();
    const upcoming = couponStatus(coupon, new Date().getTime()) === 'upcoming';
    const [copied, setCopied] = useState(false);
    const theme = getStoreTheme(storeName);

    // Parse packed JSON condition
    const parsedConditionText = React.useMemo(() => {
        try {
            if (coupon.condition && coupon.condition.startsWith('{')) {
                return JSON.parse(coupon.condition).text || coupon.condition;
            }
            return coupon.condition;
        } catch {
            return coupon.condition;
        }
    }, [coupon.condition]);

    const formattedExpiry = React.useMemo(() => {
        if (!coupon.expiry) return '';
        if (coupon.expiry.includes('T') && coupon.expiry.endsWith('Z')) {
            return coupon.expiry.split('T')[0];
        }
        return coupon.expiry;
    }, [coupon.expiry]);

    let parsedAffiliateUrl = coupon.affiliate_url || coupon.affiliateUrl || '';
    try {
        if (coupon.condition && coupon.condition.startsWith('{')) {
            const p = JSON.parse(coupon.condition);
            if (p.url !== undefined) {
                parsedAffiliateUrl = p.url;
            }
        }
    } catch (e) { }

    const handleCopyAndRedirect = async () => {
        if (isExpired) return;
        showToast(await openCouponLink(coupon, parsedAffiliateUrl, storeName));
    };

    const isNoCode = !hasCouponCode(coupon.code);

    const detailHref = storeId ? `/store/${storeId}/coupon/${coupon.id}` : undefined;

    const cardContent = (
        <>
            <div className="relative aspect-square overflow-hidden rounded-lg bg-slate-50">
                <Image src={couponImages(coupon.content_body)[0]} alt={isExpired ? latestGuideTitle(storeName, coupon.title) : coupon.title} fill sizes="(max-width: 768px) 90vw, 400px" className="object-contain" />
            </div>
            {/* Decorative top accent */}
            <div className={`absolute left-0 top-0 right-0 h-1 ${isExpired ? 'bg-gray-300' : theme.accent}`}></div>

            <div className="flex-1 flex flex-col">
                <div>
                    <div className="flex items-center gap-2 mb-3 w-full min-w-0">
                        {upcoming && <span className="rounded-md bg-amber-50 px-3 py-2 text-sm font-bold text-amber-800">시작 예정</span>}
                        {isExpired && (
                            <span className="bg-gray-200 text-gray-600 px-3 py-1.5 rounded-full text-[11px] font-black tracking-wider flex-shrink-0">
                                만료
                            </span>
                        )}
                        <span className={`${isExpired ? 'bg-gray-100 text-gray-500' : theme.badgeBg + ' ' + theme.badgeText} px-3 py-1.5 rounded-full text-base font-bold flex-1 min-w-0`}>
                            {coupon.discount}
                        </span>
                        <div className="flex items-center gap-1.5 ml-1 flex-shrink-0">
                            {storeName && (
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm flex-shrink-0 ${isExpired ? 'bg-gray-400' : theme.accent}`}>
                                    {storeName.charAt(0)}
                                </div>
                            )}
                            {storeName && (
                                <span className="text-[13px] text-gray-600 font-semibold tracking-tight truncate max-w-[70px]">
                                    {storeName}
                                </span>
                            )}
                        </div>
                    </div>

                    <h3 className={`text-lg font-bold mb-3 leading-tight ${isExpired ? 'text-gray-500 line-through group-hover:text-gray-900 group-hover:no-underline' : 'text-gray-900'}`}>
                        {detailHref ? <Link href={detailHref} className="hover:underline">{isExpired ? latestGuideTitle(storeName, coupon.title) : coupon.title}</Link> : coupon.title}
                    </h3>

                    <ul className={`flex flex-col gap-2 mb-4 text-sm ${isExpired ? 'text-gray-400' : 'text-gray-600'}`}>
                        <li className="flex items-start gap-2">
                            <CheckCircle2 size={16} className={`${isExpired ? 'text-gray-400' : 'text-green-500'} flex-shrink-0 mt-0.5`} />
                            <span className="leading-6">조건: <strong>{parsedConditionText}</strong></span>
                        </li>
                        <li className="flex items-center gap-2">
                            <Calendar size={16} className="text-gray-400 flex-shrink-0" />
                            <span className={isExpired ? 'line-through' : ''}>유효기간: {formattedExpiry || '판매처에서 확인'}</span>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="flex flex-col gap-3 mt-auto pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>

                <div className="w-full text-center">
                    <p className={`text-xs font-medium mb-1 uppercase tracking-wider ${isExpired ? 'text-gray-300' : 'text-gray-400'}`}>프로모션 코드</p>
                    <div className={`border-2 border-dashed py-3 px-4 rounded-lg font-mono text-lg text-center tracking-wider bg-gray-50 w-full ${isExpired ? 'text-gray-400 border-gray-200' : isNoCode ? 'text-gray-400 border-gray-200' : 'text-gray-800 border-gray-300'}`}>
                        {isNoCode ? '코드 필요없음' : coupon.code}
                    </div>
                </div>

                <button
                    disabled={isExpired && !detailHref}
                    onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        if (isExpired) {
                            if (detailHref) window.location.href = detailHref;
                            return;
                        }
                        handleCopyAndRedirect();
                    }}
                    className={`w-full mt-2 justify-center py-3 text-sm sm:text-base whitespace-nowrap rounded-xl font-bold transition-colors flex items-center gap-2 ${
                        copied 
                        ? 'bg-green-600 hover:bg-green-700 text-white shadow-none' 
                        : isExpired
                        ? 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                    }`}
                >
                    {copied ? (
                        <>복사완료! 이동중...</>
                    ) : isExpired ? (
                        <>최신 혜택·이전 행사 기록 <ExternalLink size={18} /></>
                    ) : isNoCode ? (
                        <>할인 페이지로 이동 <ExternalLink size={18} /></>
                    ) : (
                        <>복사하고 할인받기 <Copy size={18} /></>
                    )}
                </button>
            </div>
        </>
    );

    return (
        <div className="card p-5 flex flex-col gap-4 relative overflow-hidden h-full">
            {cardContent}
        </div>
    );
}
