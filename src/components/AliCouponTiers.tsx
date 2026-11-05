"use client";
import AliCouponHowTo from './AliCouponHowTo';
import { useState } from 'react';
import { Copy, ArrowUpRight } from 'lucide-react';
import { aliCouponTiers } from '@/lib/ali-coupon-tiers';
import { openCouponLink } from '@/lib/coupon-action';
import { safeAffiliateUrl } from '@/lib/affiliate';
import { isCouponExpired } from '@/lib/utils';
import { useToast } from './ToastProvider';

export default function AliCouponTiers({ coupon, affiliateUrl, compact = false }: {
  coupon: { id: string; title: string; expiry: string; content_body?: string | null };
  affiliateUrl: string; compact?: boolean;
}) {
  const { showToast } = useToast();
  const [copied, setCopied] = useState('');
  const tiers = aliCouponTiers(coupon);
  const expired = isCouponExpired(coupon.expiry, coupon.title);
  const ready = !!safeAffiliateUrl(affiliateUrl);
  return <section aria-label="알리 금액별 할인코드" className="min-w-0">
    <div className="mb-2 sm:mb-4">
      <p className="hidden sm:block text-sm font-bold text-red-600">알리익스프레스 광군제</p>
      <h2 className="mt-1 text-base sm:text-2xl font-extrabold text-slate-900">내 구매 금액에 맞는 쿠폰 선택</h2>
      <p className="hidden sm:block mt-2 text-sm text-slate-600">버튼 한 번으로 코드 복사 + 알리 새 창 열기</p>
      <p className="mt-1 text-xs text-slate-500">11월 1일 ~ {coupon.expiry} · 일부 상품 제외 · 결제 시 적용 확인</p>
    </div>
    <div className={`grid gap-3 ${compact ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
      {tiers.map(tier => <article key={tier.code} className="grid grid-cols-[1fr_auto] items-center gap-x-3 p-3 min-w-0 overflow-hidden rounded-xl border border-orange-200 bg-white shadow-sm">
        <div className="min-w-0">
          <div><p className="text-xs font-semibold text-slate-700">US${tier.minimum} 이상 구매 시</p><p className="mt-1 text-2xl font-black text-red-600">${tier.discount} 할인</p></div>

        </div>
        <div className="w-28 sm:w-40">
          <p className="mb-2 rounded-lg border border-dashed border-orange-300 bg-orange-50/50 py-2 text-center font-mono text-sm font-bold tracking-wide text-slate-900">{tier.code}</p>
          <button disabled={expired || !ready} onClick={async () => {
            const message = await openCouponLink({ id: coupon.id, code: tier.code }, affiliateUrl, '알리익스프레스');
            if (message.includes('복사 완료')) setCopied(tier.code);
            showToast(message);
          }} className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-2 py-3 text-xs font-bold text-white hover:bg-red-700 disabled:bg-slate-300">
            <Copy size={14} className="shrink-0" />{expired ? '기간 만료' : !ready ? '링크 확인 중' : '복사하고 사용'}
          </button>
          {copied === tier.code && <p role="status" className="mt-2 text-center text-xs text-green-700">{tier.code} 복사 완료 · 결제창에 붙여넣으세요</p>}
        </div>
      </article>)}
    </div>
    <div id="quick-how-to" className="scroll-mt-24"><AliCouponHowTo code={copied || tiers[0]?.code} compact={compact} /></div>
  </section>;
}

