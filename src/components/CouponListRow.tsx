"use client";
import type { CouponRow } from '@/lib/models';
import { Copy, ExternalLink, CheckCircle2 } from 'lucide-react';
import { useToast } from './ToastProvider';
import { openCouponLink } from '@/lib/coupon-action';
import { hasCouponCode } from '@/lib/affiliate';
import { couponStatus } from '@/lib/utils';
import { latestGuideTitle } from '@/lib/latest-guide';
import Link from 'next/link';
import Image from 'next/image';
import { couponImages as contentImages } from '@/lib/content-images';

export default function CouponListRow({ coupon, storeName, storeId, isExpired }: { coupon: CouponRow, storeName: string, storeId: string, storeLogo: string, isExpired?: boolean }) {
    const { showToast } = useToast();
    const upcoming = couponStatus(coupon, new Date().getTime()) === 'upcoming';

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
    } catch { }

    const handleCopyAndRedirect = async (e: React.MouseEvent) => {
        e.preventDefault(); e.stopPropagation();
        if (isExpired || upcoming) return;
        showToast(await openCouponLink(coupon, parsedAffiliateUrl, storeName));
    };

    const isNoCode = !hasCouponCode(coupon.code);
    const thumbnail = contentImages(coupon.content_body)[0];
    const detailHref = `/store/${encodeURIComponent(storeId)}/coupon/${encodeURIComponent(coupon.id)}`;

    return (
        <article className={`grid grid-cols-1 md:grid-cols-[180px_1fr] gap-x-5 min-w-0 bg-white border rounded-2xl p-4 md:p-5 group relative overflow-hidden ${isExpired ? 'border-gray-200 text-gray-500' : 'border-gray-200'}`}>
            {thumbnail && <Link href={detailHref} className="relative mb-4 md:mb-0 md:row-span-5 block aspect-[3/2] overflow-hidden rounded-xl bg-slate-50">
                <Image src={thumbnail} alt={isExpired ? latestGuideTitle(storeName, coupon.title) : coupon.title} fill sizes="(max-width: 768px) 90vw, 400px" className="object-contain" />
            </Link>}
            
            {/* Top: Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
                {upcoming && <span className="rounded-md bg-amber-50 px-3 py-2 text-sm font-bold text-amber-800">시작 예정</span>}
                        {isExpired && (
                    <span className="bg-gray-200 text-gray-600 px-3 py-1.5 rounded-md text-sm font-black tracking-wide">
                        기간 만료
                    </span>
                )}
                <span className={`px-3 py-1.5 rounded-md text-xl font-bold tracking-tight ${isExpired ? 'bg-gray-100 text-gray-500' : 'bg-blue-100 text-blue-700'}`}>
                    {coupon.discount}
                </span>
                <span className={`text-xs font-medium px-2 py-1 rounded-md ${isExpired ? 'text-gray-400 bg-gray-50 line-through' : 'text-gray-500 bg-gray-100'}`}>
                    기간: {coupon.expiry || "판매처에서 확인"}
                </span>
            </div>

            {/* Title */}
            <h3 className={`text-base font-bold leading-snug transition-colors mb-4 ${isExpired ? 'text-gray-500 line-through group-hover:text-gray-900 group-hover:no-underline' : 'text-gray-900 hover:text-blue-700'}`}>
                <Link href={detailHref} className="hover:underline">{isExpired ? latestGuideTitle(storeName, coupon.title) : coupon.title}</Link>
            </h3>

            {/* Condition Bullet */}
            <div className={`flex items-start gap-2 text-sm mb-3 p-3 rounded-xl ${isExpired ? 'text-gray-400 bg-gray-50/50' : 'text-gray-700 bg-gray-50'}`}>
                <CheckCircle2 size={20} className={`${isExpired ? 'text-gray-400' : 'text-blue-600'} flex-shrink-0 mt-0.5`} />
                <span className="font-medium whitespace-pre-wrap leading-relaxed">{parsedConditionText}</span>
            </div>

            {/* Full Width Button */}
            {!isNoCode && !isExpired && <p className="mb-4 break-all text-sm text-gray-600">할인코드 <strong className="font-mono text-blue-800">{coupon.code}</strong></p>}
            {isExpired ? <Link href={detailHref} className="text-sm text-gray-600 underline">최신 혜택·이전 행사 기록</Link> : <button
                onClick={upcoming ? () => { if (detailHref) window.location.href = detailHref; } : handleCopyAndRedirect}
                className="mt-auto w-full py-3 rounded-lg font-bold text-base flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white transition-colors"
            >
                {upcoming ? "예정 행사 조건 보기" : isNoCode ? (
                    <>할인 페이지로 이동 <ExternalLink size={20} /></>
                ) : (
                    <>복사하고 할인받기 <Copy size={20} /></>
                )}
            </button>}
        </article>
    );
}
