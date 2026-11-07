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
  const browse = async (position: string) => showToast(await openCouponLink(
    { id: coupon.id }, affiliateUrl, '알리익스프레스', false, `알리 상품 먼저 보기 · ${position}`
  ));
  const returnLink = <a href="#ali-code-options" className="mt-3 inline-flex text-sm font-bold text-red-700 underline underline-offset-4">내 금액에 맞는 쿠폰 보기 ↑</a>;
  return <section aria-label="알리 금액별 할인코드" className="min-w-0">
    <div className="mb-2 sm:mb-4">
      <p className="hidden sm:block text-sm font-bold text-red-600">알리익스프레스 광군제</p>
      <h2 className="mt-1 text-base sm:text-2xl font-extrabold text-slate-900">내 구매 금액에 맞는 쿠폰 선택</h2>
      <p className="mt-2 text-xs sm:text-sm text-slate-600">버튼 한 번으로 코드 복사 + 알리 새 창 열기</p>
      <p className="mt-1 text-xs text-slate-500">11월 1일 ~ {coupon.expiry} · 일부 상품 제외 · 결제 시 적용 확인</p>
    </div>
    <div className="mb-3 rounded-xl bg-orange-50 p-3 text-sm">
      <button disabled={expired || !ready} onClick={() => browse('상단')} className="flex min-h-11 items-center gap-1 font-bold text-red-700 underline underline-offset-4 disabled:text-slate-400">알리 상품 먼저 보기 <ArrowUpRight size={16} /></button>
      <p className="text-xs text-slate-600">금액을 모를 때 · 코드 복사 없이 새 창 열기</p>
    </div>
    <div id="ali-code-options" className={`scroll-mt-24 grid gap-3 ${compact ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
      {tiers.map(tier => <article key={tier.code} className="grid grid-cols-[1fr_auto] items-center gap-x-3 p-3 min-w-0 overflow-hidden rounded-xl border border-orange-200 bg-white shadow-sm">
        <div className="min-w-0">
          <div><p className="text-xs font-semibold text-slate-700">US${tier.minimum} 이상 구매 시</p><p className="mt-1 whitespace-nowrap text-xl sm:text-2xl font-black text-red-600">${tier.discount} 할인</p></div>

        </div>
        <div className="w-36 sm:w-44">
          <p className="mb-2 rounded-lg border border-dashed border-orange-300 bg-orange-50/50 py-2 text-center font-mono text-sm font-bold tracking-wide text-slate-900">{tier.code}</p>
          <button aria-label={`${tier.code} 복사하고 알리 가기`} disabled={expired || !ready} onClick={async () => {
            const message = await openCouponLink({ id: coupon.id, code: tier.code }, affiliateUrl, '알리익스프레스', true, `알리 ${tier.code} · 금액별 쿠폰`);
            if (message.includes('복사 완료')) setCopied(tier.code);
            showToast(message);
          }} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-2 py-3 text-xs font-bold text-white hover:bg-red-700 disabled:bg-slate-300">
            <Copy size={14} className="shrink-0" />{expired ? '기간 만료' : !ready ? '링크 확인 중' : '복사하고 알리 가기'}
          </button>
          {copied === tier.code && <p role="status" className="mt-2 text-center text-xs text-green-700">{tier.code} 복사 완료 · 결제창에 붙여넣으세요</p>}
        </div>
      </article>)}
    </div>
    <div className="mt-4 rounded-xl border border-orange-100 p-4">
      <h2 className="font-bold text-slate-900">알리 할인코드, 얼마부터 사용할 수 있나요?</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">위 카드의 US$ 최소 구매 금액과 할인액을 비교하세요. 선택한 코드의 적용 대상 금액은 알리 결제 화면에서 확인해야 합니다. 쿠폰을 쓰기 위해 불필요한 상품을 추가하기보다 최종 결제액을 비교하세요.</p>
      {returnLink}
    </div>
    <div id="quick-how-to" className="scroll-mt-24"><AliCouponHowTo code={copied || tiers[0]?.code} compact={compact} /></div>
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      <section className="rounded-xl border border-slate-200 p-4">
        <h2 className="font-bold text-slate-900">알리 쿠폰과 카드·간편결제 할인은 중복되나요?</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">상품·결제수단별 조건이 달라 중복 적용을 보장하지 않습니다. 코드를 입력한 뒤 결제수단을 선택하고, 두 할인액이 실제로 반영되는지 확인하세요.</p>
        {returnLink}
      </section>
      <section className="rounded-xl border border-slate-200 p-4">
        <h2 className="font-bold text-slate-900">알리 할인코드가 적용되지 않을 때는?</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-slate-600"><li>선택한 코드의 최소 구매 금액 충족 여부</li><li>상품 제외 조건과 행사 기간</li><li>코드 철자와 결제 화면의 오류 안내</li></ul>
        {returnLink}
      </section>
    </div>
    <div className="mt-4 rounded-xl bg-slate-50 p-4">
      <p className="text-sm text-slate-700">아직 구매 금액을 모르겠다면 상품부터 확인하세요.</p>
      <button disabled={expired || !ready} onClick={() => browse('본문 하단')} className="mt-2 flex min-h-11 items-center gap-1 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white disabled:bg-slate-300">알리 상품 먼저 보기 <ArrowUpRight size={16} /></button>
    </div>
  </section>;
}

