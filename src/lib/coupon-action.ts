import { safeAffiliateUrl, hasCouponCode } from './affiliate';
import { trackEvent } from './analytics-client';

export async function openCouponLink(coupon: { id: string; code?: string }, url: string, storeName: string) {
    const target = safeAffiliateUrl(url);
    if (!target) return '할인 링크가 준비되지 않았습니다.';
    // Open during the user gesture. Analytics must never delay navigation or copying.
    const copying = hasCouponCode(coupon.code) ? navigator.clipboard?.writeText(coupon.code!) : undefined;
    window.open(target, '_blank', 'noopener,noreferrer');
    void trackEvent('affiliate_click', { coupon_id: coupon.id, target_url: target, button_label: '쿠폰 할인 페이지' });
    if (!hasCouponCode(coupon.code)) return `${storeName} 할인 페이지를 열었습니다.`;
    try {
        if (!copying) throw new Error('Clipboard unavailable');
        await copying;
        void trackEvent('code_copy', { coupon_id: coupon.id, button_label: '쿠폰 코드 복사' });
        return `'${coupon.code}' 복사 완료! 결제창에서 입력하세요.`;
    } catch { return '코드를 자동 복사하지 못했습니다. 화면의 코드를 직접 복사해주세요.'; }
}
