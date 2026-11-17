import { storePaymentBenefits } from '@/lib/store-payment-benefits';

export default function StorePaymentBenefits({ storeId, now, hasCouponBenefits }: { storeId: string; now: string; hasCouponBenefits: boolean }) {
  const benefits = storePaymentBenefits(storeId, now);
  if (!benefits.length) return hasCouponBenefits ? null : <p className="rounded-xl bg-slate-50 p-5 text-sm leading-7 text-slate-600">결제 혜택은 상품·회원·결제일에 따라 달라집니다. 주문서의 카드·간편결제 혜택을 확인하세요.</p>;
  return <div className="space-y-4" data-payment-catalog={storeId}>{benefits.map(b => <article key={b.id} data-payment-benefit={b.id} className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
    <div className="mb-3 flex flex-wrap gap-2 text-xs font-bold"><span className="rounded-full bg-[var(--store-soft)] px-3 py-1 text-[var(--store-accent)]">{b.kind}</span><span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">{b.activeToday ? '오늘 행사일 · 잔여 수량 확인' : '지정일 행사'}</span></div>
    <h3 className="text-lg font-extrabold text-slate-900">{b.title}</h3>
    <p className="mt-2 text-xs text-slate-500">{b.start} ~ {b.end} · 한국시간 · 공식 안내 확인 {b.checkedAt}</p>
    <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-600">{b.conditions.map(line => <li key={line}>{line}</li>)}</ul>
    {b.dedicatedRoute && <p className="mt-3 text-xs font-semibold text-slate-600">전용 경로 조건이 있는 혜택입니다. 위 할인코드와 자동 중복되지 않습니다.</p>}
    <a href={b.sourceUrl} target="_blank" rel="nofollow noopener noreferrer" className="mt-4 inline-block text-sm font-bold text-[var(--store-accent)] underline underline-offset-4">공식 행사 조건 확인 ↗</a>
  </article>)}</div>;
}
