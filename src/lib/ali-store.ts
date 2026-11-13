import type { CouponRow } from './models';
import { aliCouponTiers } from './ali-coupon-tiers';
import { hasCouponCode, safeAffiliateUrl } from './affiliate';

export function aliOfferInfo(coupon: CouponRow) {
  let condition = coupon.condition || '';
  let url = coupon.affiliate_url || coupon.affiliateUrl || '';
  try {
    const parsed = JSON.parse(condition);
    if (typeof parsed.text === 'string') condition = parsed.text;
    if (typeof parsed.url === 'string' && parsed.url) url = parsed.url;
  } catch { /* Plain text conditions are also supported. */ }
  return { condition, url: safeAffiliateUrl(url) };
}

export function aliOfferRows(coupon: CouponRow) {
  const tiers = aliCouponTiers(coupon);
  if (tiers.length) return tiers.map(t => ({ code: t.code, minimum: `US$${t.minimum} 이상`, discount: `US$${t.discount} 할인` }));
  const { condition } = aliOfferInfo(coupon);
  return (hasCouponCode(coupon.code) ? coupon.code.split(/\r?\n/).map(s => s.trim()).filter(Boolean) : [''])
    .map(code => ({ code, minimum: condition || '행사별 적용 조건 확인', discount: coupon.discount }));
}

// Read payment sections from the same published article used by the detail page.
// Unrecognised formats stay available in the complete event conditions below.
export function aliPaymentContent(content: string) {
  return content.split(/(?=^#{2,3} )/m)
    .filter(section => /^#{2,3} .*?(?:결제 할인|카드 할인|카드.*할인|결제.*혜택)/.test(section))
    .join('\n').trim();
}

export function aliEventLabel(title: string) {
  if (/광군제/.test(title)) return '광군제';
  if (/블랙\s*프라이데이/.test(title)) return '블랙프라이데이';
  if (/초이스데이/.test(title)) return '초이스데이';
  if (/알급날/.test(title)) return '알급날';
  return title.replace(/^알리익스프레스\s*/, '') || '알리 프로모션';
}
