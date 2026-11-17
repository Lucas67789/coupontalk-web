import { paymentBenefits } from './store-payment-data';

export type PaymentBenefit = {
  storeId: string; id: string; title: string; kind: string;
  start: string; end: string; checkedAt: string; conditions: readonly string[];
  sourceUrl: string; dates?: readonly string[]; dedicatedRoute?: boolean;
};

export function koreaDate(now: string) {
  return new Date(Date.parse(now) + 9 * 3600_000).toISOString().slice(0, 10);
}

export function validatePaymentBenefit(b: PaymentBenefit) {
  for (const value of [b.start, b.end, b.checkedAt, ...(b.dates || [])]) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(Date.parse(value))) throw new Error('결제 혜택 날짜 오류: ' + b.id);
  }
  if (!b.storeId || !b.id || !b.title || !b.kind || b.conditions.length < 2 || b.start > b.end) throw new Error('결제 혜택 필수 조건 누락: ' + b.id);
  const source = new URL(b.sourceUrl);
  if (source.protocol !== 'https:' || source.username || source.password) throw new Error('공식 근거 URL 오류: ' + b.id);
  const officialHosts = ['www.hyundaicard.com', 'event.ssg.com', 'www.kkday.com', 'www.agoda.com', 'origin-apac.mastercard.com', 'travel.rakuten.com', 'pay.naver.com', 'www.myrealtrip.com', 'content.yanolja.com', 'posty.kr', 'shop.pulmuone.co.kr'];
  if (!officialHosts.includes(source.hostname)) throw new Error('검증된 공식 출처 필요: ' + b.id);
  if (b.dates?.some(d => d < b.start || d > b.end)) throw new Error('행사 날짜 범위 오류: ' + b.id);
}

for (const benefit of paymentBenefits) validatePaymentBenefit(benefit);

export function storePaymentBenefits(storeId: string, now: string) {
  const day = koreaDate(now);
  return (paymentBenefits as readonly PaymentBenefit[]).filter(b => b.storeId === storeId && b.end >= day && (!b.dates || b.dates.some(d => d >= day)))
    .map(b => ({ ...b, activeToday: b.start <= day && (!b.dates || b.dates.includes(day)) }));
}
