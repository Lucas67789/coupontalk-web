"use client";
import { Copy, ExternalLink, Calendar, CheckCircle2 } from 'lucide-react';
import { useToast } from './ToastProvider';
import React, { useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

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

export default function CouponCard({ coupon, storeName, storeId }: { coupon: any, storeName: string, storeId?: string }) {
    const { showToast } = useToast();
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
                    showToast(`'${coupon.code}' 蹂듭궗 ?꾨즺! 寃곗젣李쎌뿉???낅젰?섏꽭??`);
                })
                .catch(err => {
                    console.error("蹂듭궗?ㅽ뙣", err);
                    showToast("肄붾뱶 蹂듭궗???ㅽ뙣?덉뒿?덈떎. ?섎룞?쇰줈 蹂듭궗?댁＜?몄슂.");
                });
        } else {
            showToast(`${storeName} ?좎씤 ?섏씠吏濡??대룞?⑸땲??`);
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
            <div className={`absolute left-0 top-0 right-0 h-1 ${theme.accent}`}></div>

            <div className="flex-1 flex flex-col">
                <div>
                    <div className="flex items-center gap-2 mb-3 w-full min-w-0">
                        <span className={`${theme.badgeBg} ${theme.badgeText} px-3 py-1.5 rounded-full text-[11px] font-black tracking-wider truncate flex-1 min-w-0`}>
                            {coupon.discount}
                        </span>
                        <div className="flex items-center gap-1.5 ml-1 flex-shrink-0">
                            {storeName && (
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm flex-shrink-0 ${theme.accent}`}>
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

                    <h3 className="text-lg font-bold mb-3 text-gray-900 leading-tight line-clamp-2">
                        {coupon.title}
                    </h3>

                    <ul className="flex flex-col gap-2 mb-4 text-sm text-gray-600">
                        <li className="flex items-start gap-2">
                            <CheckCircle2 size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="line-clamp-2">議곌굔: <strong>{parsedConditionText}</strong></span>
                        </li>
                        <li className="flex items-center gap-2">
                            <Calendar size={16} className="text-gray-400 flex-shrink-0" />
                            <span>?좏슚湲곌컙: {formattedExpiry}</span>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="flex flex-col gap-3 mt-auto pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>

                <div className="w-full text-center">
                    <p className="text-xs text-gray-400 font-medium mb-1 uppercase tracking-wider">?꾨줈紐⑥뀡 肄붾뱶</p>
                    <div className={`border-2 border-dashed py-3 px-4 rounded-lg font-mono text-lg text-center tracking-wider bg-gray-50 w-full ${isNoCode ? 'text-gray-400 border-gray-200' : 'text-gray-800 border-gray-300'}`}>
                        {isNoCode ? '肄붾뱶 ?꾩슂?놁쓬' : coupon.code}
                    </div>
                </div>

                <button
                    onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleCopyAndRedirect(); }}
                    className={`btn-primary w-full mt-2 justify-center py-3 text-sm sm:text-base whitespace-nowrap ${copied ? 'bg-green-600 hover:bg-green-700 shadow-none' : ''}`}
                >
                    {copied ? (
                        <>蹂듭궗?꾨즺! ?대룞以?..</>
                    ) : isNoCode ? (
                        <>?좎씤 諛쏄린 <ExternalLink size={18} /></>
                    ) : (
                        <>肄붾뱶 蹂듭궗?섍린 <Copy size={18} /></>
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
