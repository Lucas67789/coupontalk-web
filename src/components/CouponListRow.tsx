"use client";
import type { CouponRow } from '@/lib/models';
import { Copy, ExternalLink, CheckCircle2 } from 'lucide-react';
import { useToast } from './ToastProvider';
import { openCouponLink } from '@/lib/coupon-action';
import { hasCouponCode } from '@/lib/affiliate';
import Link from 'next/link';
import Image from 'next/image';
import { contentImages } from '@/lib/content-images';

export default function CouponListRow({ coupon, storeName, storeId, isExpired }: { coupon: CouponRow, storeName: string, storeId: string, storeLogo: string, isExpired?: boolean }) {
    const { showToast } = useToast();

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
        if (isExpired) return;
        showToast(await openCouponLink(coupon, parsedAffiliateUrl, storeName));
    };

    const isNoCode = !hasCouponCode(coupon.code);
    const thumbnail = contentImages(coupon.content_body)[0];
    const detailHref = `/store/${encodeURIComponent(storeId)}/coupon/${encodeURIComponent(coupon.id)}`;

    return (
        <article className={`flex min-w-0 flex-col bg-white border rounded-xl p-5 group relative overflow-hidden ${isExpired ? 'border-gray-200 text-gray-500' : 'border-gray-200'}`}>
            {thumbnail && <Link href={detailHref} className="relative mb-4 block aspect-[4/3] overflow-hidden rounded-lg bg-slate-50">
                <Image src={thumbnail} alt={coupon.title} fill sizes="(max-width: 768px) 90vw, 400px" className="object-contain" />
            </Link>}
            
            {/* Top: Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
                {isExpired && (
                    <span className="bg-gray-200 text-gray-600 px-3 py-1.5 rounded-md text-sm font-black tracking-wide">
                        기간 만료
                    </span>
                )}
                <span className={`px-3 py-1.5 rounded-md text-sm font-black tracking-wide ${isExpired ? 'bg-gray-100 text-gray-500' : 'bg-blue-100 text-blue-700'}`}>
                    {coupon.discount}
                </span>
                <span className={`text-sm font-medium px-3 py-1.5 rounded-md ${isExpired ? 'text-gray-400 bg-gray-50 line-through' : 'text-gray-500 bg-gray-100'}`}>
                    유효기간: {coupon.expiry}
                </span>
            </div>

            {/* Title */}
            <h3 className={`text-xl font-bold leading-snug transition-colors mb-4 ${isExpired ? 'text-gray-500 line-through group-hover:text-gray-900 group-hover:no-underline' : 'text-gray-900 hover:text-blue-700'}`}>
                <Link href={detailHref} className="hover:underline">{coupon.title}</Link>
            </h3>

            {/* Condition Bullet */}
            <div className={`flex items-start gap-2 text-base mb-6 p-4 rounded-xl ${isExpired ? 'text-gray-400 bg-gray-50/50' : 'text-gray-700 bg-gray-50'}`}>
                <CheckCircle2 size={20} className={`${isExpired ? 'text-gray-400' : 'text-blue-600'} flex-shrink-0 mt-0.5`} />
                <span className="font-medium whitespace-pre-wrap leading-relaxed">{parsedConditionText}</span>
            </div>

            {/* Full Width Button */}
            {!isNoCode && !isExpired && <p className="mb-4 break-all text-sm text-gray-600">할인코드 <strong className="font-mono text-blue-800">{coupon.code}</strong></p>}
            {isExpired ? <Link href={detailHref} className="text-sm text-gray-600 underline">만료된 혜택 보기</Link> : <button
                onClick={handleCopyAndRedirect}
                className="mt-auto w-full py-3 rounded-lg font-bold text-base flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white transition-colors"
            >
                {isNoCode ? (
                    <>특가 보러가기 <ExternalLink size={20} /></>
                ) : (
                    <>쿠폰 복사하기 <Copy size={20} /></>
                )}
            </button>}
        </article>
    );
}
