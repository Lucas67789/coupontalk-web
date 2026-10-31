import Link from 'next/link';
import { priceDifference, subscriptionPrices, subscriptionPriceCheckedAt, won } from '@/lib/subscription-prices';

export default function SubscriptionPriceComparison({ slug }: { slug?: string }) {
  const quote = slug ? subscriptionPrices[slug] : undefined;
  if (!quote) return <section className="my-6 rounded-2xl border bg-white p-4 md:p-7">
    <h2 className="text-2xl font-extrabold">구독료, 실제로 얼마나 줄어들까요?</h2>
    <p className="mt-2 text-sm text-gray-600">{subscriptionPriceCheckedAt} 확인 · 원화 표시 금액 · 상품별 계정·쿠폰 조건은 상세 비교에서 확인</p>
    <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{Object.entries(subscriptionPrices).map(([key, q]) => <Link key={key} href={`/subscriptions/${key}#price-comparison`} className="rounded-xl border p-4 hover:border-blue-500">
      <h3 className="font-bold">{q.service}{q.soldOut && <span className="ml-2 text-xs text-amber-800">품절 · 참고가</span>}</h3>
      <p className="mt-2 text-2xl font-extrabold text-blue-800">{won(q.total)}<span className="text-xs font-normal text-gray-600"> / {q.months}개월</span></p>
      <p className="mt-1 text-sm">월 환산 약 {won(q.total / q.months)}</p>
      <p className="mt-2 text-xs leading-5 text-gray-600">{q.plan}{q.listing ? ' · 판매 목록가' : ''}</p>
      <p className="mt-2 text-sm font-semibold text-blue-700">조건과 가격 차이 보기 →</p>
    </Link>)}</div>
    <p className="mt-4 text-xs leading-6 text-gray-500">실시간 최저가가 아닌 확인 시점의 선택 옵션 가격입니다. 월 환산가는 선결제 총액을 이용 개월 수로 나눈 값입니다.</p>
  </section>;
  const saving = quote.official ? priceDifference(quote.official.total, quote.total) : undefined;
  return <section id="price-comparison" className="my-5 scroll-mt-24 overflow-hidden rounded-2xl border border-blue-200 bg-white">
    <div className="p-4 md:p-7">
      <p className="text-xs font-bold text-blue-700">{subscriptionPriceCheckedAt} 직접 확인한 가격 · KRW</p>
      <h2 className="mt-2 text-2xl font-extrabold tracking-tight md:text-3xl">{quote.service}, {quote.months}개월에 얼마?</h2>
      {quote.soldOut && <p className="mt-3 rounded-lg bg-amber-100 p-3 font-bold text-amber-900">확인 시 품절 · 아래는 참고 가격입니다.</p>}
      <div className={`mt-5 grid gap-3 ${quote.official ? 'grid-cols-2' : ''}`}>
        {quote.official && <div className="min-w-0 rounded-xl bg-gray-100 p-3 md:p-6"><p className="text-sm font-bold text-gray-600">공식 구독</p><p className="mt-3 text-2xl font-extrabold tracking-tight md:text-4xl">{won(quote.official.total)}</p><p className="mt-1 text-xs text-gray-600">{quote.months}개월 합계</p><p className="mt-3 text-xs leading-5 md:text-sm">{quote.official.label}</p></div>}
        <div className="min-w-0 rounded-xl bg-blue-700 p-3 text-white md:p-6"><p className="text-sm font-bold">겜스고 {quote.listing ? '판매 목록가' : quote.soldOut ? '참고가' : '선택 옵션 결제액'}</p><p className="mt-3 text-2xl font-extrabold tracking-tight md:text-5xl">{won(quote.total)}</p><p className="mt-1 text-xs text-blue-100">{quote.months}개월 총액 · 월 환산 약 {won(quote.total / quote.months)}</p><p className="mt-3 text-xs font-semibold leading-5 md:text-sm">{quote.plan}</p></div>
      </div>
      {saving && <div className="mt-3 rounded-xl bg-emerald-50 p-4 text-emerald-950"><p className="text-sm font-semibold">위 두 상품의 {quote.months}개월 비용 차이</p><p className="mt-1 text-2xl font-extrabold md:text-3xl">{won(saving.amount)} 적게 <span className="inline-block rounded-full bg-emerald-700 px-3 py-1 text-base text-white">{saving.percent}% 낮음</span></p><p className="mt-2 text-xs leading-5">동일 권한 상품의 할인율이 아닌, 표시한 두 상품의 비용 비교입니다.</p></div>}
      <p className="mt-4 text-sm font-semibold leading-6">{quote.conditions}</p>
      <p className="mt-2 text-sm leading-6 text-gray-600">{quote.difference}</p>
      {slug === 'chatgpt-discount' && <div className="mt-5 rounded-xl border p-4"><h3 className="font-bold">챗GPT는 옵션에 따라 이렇게 달라집니다</h3><dl className="mt-3 space-y-3 text-sm"><div className="flex flex-wrap justify-between gap-2"><dt>공유형 · 자동 갱신 ON · UXA7C</dt><dd className="font-bold">6,613원 / 1개월</dd></div><div className="flex flex-wrap justify-between gap-2"><dt>공유형 · 자동 갱신 OFF · UXA7C</dt><dd className="font-bold">9,040원 / 1개월</dd></div><div className="flex flex-wrap justify-between gap-2"><dt>개인형 · 자동 갱신 OFF · UXA7C</dt><dd className="font-bold">37,882원 / 1개월</dd></div></dl><p className="mt-3 text-sm font-semibold text-amber-900">개인형은 공식 Plus 29,000원보다 8,882원 비쌌습니다.</p><p className="mt-2 text-xs leading-6 text-gray-600">기본 5% 쿠폰이 UXA7C보다 저렴할 수 있습니다. 같은 옵션에서 쿠폰별 최종 결제액을 비교하세요. 공유형 가격을 개인형 할인으로 안내하지 않습니다.</p></div>}
      <details className="mt-4 text-xs leading-6 text-gray-600"><summary className="cursor-pointer font-semibold">가격 출처·계산 기준</summary><p className="mt-2">확인 시점의 화면 표시액이며 실시간 가격이나 최저가 보장이 아닙니다. 월 환산 금액은 총액 ÷ 개월 수를 원 단위로 반올림했습니다. 카드 수수료·환율·선택 옵션·갱신 시점에 따라 실제 청구액이 달라질 수 있습니다. 기본 5% 쿠폰 가격을 UXA7C 혜택으로 계산하지 않았습니다.</p><div className="mt-2 flex flex-wrap gap-4">{quote.official && <a href={quote.official.source} target="_blank" rel="noopener noreferrer" className="underline">공식 가격 출처</a>}<a href={quote.source} target="_blank" rel="nofollow noopener noreferrer" className="underline">겜스고 가격 조사 출처 (구매는 아래 제휴 버튼)</a></div></details>
    </div>
  </section>;
}
